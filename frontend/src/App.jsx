import emailjs from '@emailjs/browser';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';
import CustomerDashboard from './pages/CustomerDashboard';
import Checkout from './pages/Checkout';
import NotFound from './pages/NotFound';
import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import FloatingWhatsApp from './components/FloatingWhatsApp';

// Security: Robust frontend route protection to prevent unauthorized component rendering
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!token || !user || (requiredRole && user.role !== requiredRole)) {
    return <Navigate to={requiredRole === 'admin' ? '/abid' : '/signin'} replace />;
  }
  
  return children;
};

// Z+ Security: Secret Admin Gateway - accessible strictly via secret slug /abid
function SecretAdminGateway() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return { token, isAdmin: user?.role === 'admin' };
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      setAuth({ token, isAdmin: user?.role === 'admin' });
    };
    window.addEventListener('authChange', checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('authChange', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  if (auth.token && auth.isAdmin) {
    return <Admin />;
  }
  return (
    <AdminLogin 
      onSuccess={() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        setAuth({ token, isAdmin: user?.role === 'admin' });
      }} 
    />
  );
}

function LocationTracker() {
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    let user;
    try { user = JSON.parse(userStr); } catch { return; }
    if (!user || user.role !== 'customer') return;

    let watchId;
    // Check permission first to avoid intrusive prompt popups
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'granted' && 'geolocation' in navigator) {
          watchId = navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
            fetch(`${API}/api/user/location`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ lat: latitude, lng: longitude })
            }).catch(() => {});
          }, () => {}, { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 });
        }
      }).catch(() => {});
    }

    return () => {
      if (watchId && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
    };
  }, []);
  return null;
}

function AnalyticsTracker() {
  const location = useLocation();
  const [sessionId] = useState(() => {
    let sid = sessionStorage.getItem('analytics_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('analytics_session_id', sid);
    }
    return sid;
  });
  const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  // Track Page Views
  useEffect(() => {
    fetch(`${API}/api/track/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_url: location.pathname, session_id: sessionId })
    }).catch(() => {});
  }, [location.pathname, sessionId, API]);

  // Track Session Time
  useEffect(() => {
    const startTime = Date.now();
    const ping = setInterval(() => {
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
      fetch(`${API}/api/track/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, duration_seconds: durationSeconds })
      }).catch(() => {});
    }, 15000); // Ping every 15 seconds

    return () => clearInterval(ping);
  }, [sessionId, API]);

  return null;
}

function App() {
  useEffect(() => {
    const handleLowStock = (e) => {
      const product = e.detail;
      console.log('Sending Low Stock Alert for:', product.name);
      
      const serviceID = 'service_demo_123';
      const templateID = 'template_low_stock';
      const publicKey = 'demo_public_key';
      
      const templateParams = {
        to_email: 'earthyelectronics2026@gmail.com',
        product_name: product.name,
        current_stock: product.stock,
        product_id: product.id
      };

      try {
        emailjs.send(serviceID, templateID, templateParams, publicKey)
          .then(res => console.log('Email sent!', res.status))
          .catch(err => console.error('Email failed (expected without real keys):', err));
      } catch (e) {
        console.error('EmailJS Error:', e);
      }
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') {
        alert(`🚨 LOW STOCK ALERT: ${product.name} has only ${product.stock} items left! Email sent to admin.`);
      }
    };

    window.addEventListener('lowStockAlert', handleLowStock);
    return () => window.removeEventListener('lowStockAlert', handleLowStock);
  }, []);

  useEffect(() => {
    AOS.init({
      once: true,
      offset: 50,
      duration: 600,
      easing: 'ease-out-cubic',
    });
  }, []);

  return (
    <Router>
      <LocationTracker />
      <AnalyticsTracker />
      <Routes>
        {/* Z+ Security: Stealth redirects for public admin routes */}
        <Route path="/admin" element={<Navigate to="/" replace />} />
        <Route path="/admin-login" element={<Navigate to="/" replace />} />

        {/* Secret Admin Portal strictly on /abid */}
        <Route path="/abid" element={<SecretAdminGateway />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/*" element={
          <>
            <Header />
            <main>
              <Routes>
                <Route path="/"        element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/about"   element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute requiredRole="customer">
                    <CustomerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
      <FloatingWhatsApp />
      <Chatbot />
    </Router>
  );
}

export default App;

