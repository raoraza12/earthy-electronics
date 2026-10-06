import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Heart, LogOut, MapPin } from 'lucide-react';
import './CustomerDashboard.css';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!storedUser || !token) {
      navigate('/signin');
      return;
    }
    
    let parsedUser;
    try { parsedUser = JSON.parse(storedUser); } catch { navigate('/signin'); return; }
    if (!parsedUser || parsedUser.role !== 'customer') {
      navigate('/');
      return;
    }
    setUser(parsedUser);

    // Fetch user specific data with resilient local fallback
    const loadDashboardData = async () => {
      let apiOrders = [];
      let apiWishlist = [];
      
      try {
        const [ordersRes, wishlistRes] = await Promise.allSettled([
          fetch(`${API}/api/user/orders`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
          fetch(`${API}/api/user/wishlist`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null)
        ]);
        
        if (ordersRes.status === 'fulfilled' && ordersRes.value?.status === 'success' && Array.isArray(ordersRes.value.data)) {
          apiOrders = ordersRes.value.data;
        }
        if (wishlistRes.status === 'fulfilled' && wishlistRes.value?.status === 'success' && Array.isArray(wishlistRes.value.data)) {
          apiWishlist = wishlistRes.value.data;
        }
      } catch (err) {
        console.warn('API data fetch failed, using local backup');
      }

      // Merge with locally placed orders
      try {
        const rawLocal = localStorage.getItem('earthy_user_orders');
        const localOrders = rawLocal ? JSON.parse(rawLocal) : [];
        const userEmail = (parsedUser.email || '').toLowerCase();
        const relevantLocal = localOrders.filter(o => !o.user_email || o.user_email.toLowerCase() === userEmail);
        
        const combined = [...apiOrders];
        relevantLocal.forEach(lo => {
          if (!combined.some(o => String(o.id) === String(lo.id))) {
            combined.push(lo);
          }
        });
        setOrders(combined);
      } catch {
        setOrders(apiOrders);
      }

      setWishlist(apiWishlist);
      setLoading(false);
    };

    loadDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  if (loading || !user) return <div className="dashboard-loading">Loading your dashboard...</div>;

  return (
    <div className="customer-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome, {user.name}!</h1>
            <p>Manage your orders, wishlist, and account settings here.</p>
          </div>
          <button className="btn btn-outline" onClick={handleLogout}>
            <LogOut size={16}/> Logout
          </button>
        </div>

        <div className="dashboard-grid">
          {/* Orders Section */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3><Package size={20} className="inline-icon"/> My Orders</h3>
            </div>
            <div className="card-body">
              {orders.length === 0 ? (
                <div className="empty-state">You haven't placed any orders yet.</div>
              ) : (
                <div className="order-list">
                  {orders.map(o => (
                    <div key={o.id} className="order-item">
                      <div className="order-item-header">
                        <span className="order-id">Order #{o.id}</span>
                        <span className={`order-status status-${o.status.toLowerCase()}`}>{o.status}</span>
                      </div>
                      <div className="order-item-details">
                        <span>Date: {new Date(o.created_at).toLocaleDateString()}</span>
                        <span>Total: Rs. {o.total.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Wishlist Section */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3><Heart size={20} className="inline-icon"/> My Wishlist</h3>
            </div>
            <div className="card-body">
              {wishlist.length === 0 ? (
                <div className="empty-state">Your wishlist is empty.</div>
              ) : (
                <div className="wishlist-grid">
                  {wishlist.map(w => (
                    <div key={w.id} className="wishlist-item" onClick={() => navigate(`/products?search=${w.name}`)}>
                      <img src={w.image} alt={w.name} />
                      <div className="wishlist-info">
                        <h4>{w.name}</h4>
                        <div className="price">Rs. {w.price.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
