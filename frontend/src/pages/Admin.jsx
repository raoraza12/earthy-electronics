import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useInventory } from '../context/InventoryContext';
import { useCRM } from '../context/CRMContext';
import AdminChatbot from '../components/AdminChatbot';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  LayoutDashboard, Package, ShoppingCart, Users, TrendingUp,
  CreditCard, LogOut, Menu, X, Bell, Settings, Plus, Pencil,
  Trash2, AlertTriangle, Star, Zap, Banknote, Ticket, Image as ImageIcon, MapPin, Clock,
  ChevronDown, Check, Store, MessageSquare, Phone, Mail,
  Upload, ZoomIn, Eye, Search, Camera, RotateCcw
} from 'lucide-react';
import './Admin.css';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const PIE_COLORS = ['#10b981','#38bdf8','#34d399','#a855f7','#f43f5e','#facc15'];

export default function AdminDashboard() {
  const { themeConfig, updateTheme } = useTheme();
  
  const updateBanner = (index, field, value) => {
    const newSlides = [...(themeConfig.heroSlides || [])];
    newSlides[index] = { ...newSlides[index], [field]: value };
    updateTheme("heroSlides", newSlides);
  };

  const { inventory, updateStock, addProduct, deleteProduct, updateProduct, resetToDefaultInventory } = useInventory();
  const { stats, barChart, pieChart, users: crmUsers, updateStats, updateBarChart, updatePieChart } = useCRM();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = React.useRef(null);
  const [productForm, setProductForm] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [productSearch, setProductSearch] = useState('');
  const [imageZoomModal, setImageZoomModal] = useState({ open: false, imageUrl: '', title: '' });
  const [imageInputMode, setImageInputMode] = useState('gallery'); // 'gallery' | 'url'
  const fileInputRef = React.useRef(null);
  const [customBrandMode, setCustomBrandMode] = useState(false);
  const [customCategoryMode, setCustomCategoryMode] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Use inventory from context instead of fetching from MySQL for the local demo
  const products = inventory || [];
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Product Reviews Moderation State
  const [reviewFilter, setReviewFilter] = useState('all');
  const [adminReviews, setAdminReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('earthy_admin_reviews');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 1,
        customer: 'Ali Raza',
        product: 'Haier 1.5 Ton AC',
        rating: 5,
        review: 'Excellent cooling, very satisfied!',
        status: 'pending',
        date: '2026-10-05'
      },
      {
        id: 2,
        customer: 'Kamran',
        product: 'Dawlance Refrigerator',
        rating: 4,
        review: 'Good product but delivery was late.',
        status: 'pending',
        date: '2026-10-04'
      },
      {
        id: 3,
        customer: 'Zubair Sheikh',
        product: 'Gree 1.5 Ton Inverter AC',
        rating: 5,
        review: 'Super silent operation and very low electricity consumption.',
        status: 'approved',
        date: '2026-10-02'
      },
      {
        id: 4,
        customer: 'Tariq Mehmood',
        product: 'Dawlance Automatic Washer',
        rating: 5,
        review: 'Great washing performance. Highly recommended.',
        status: 'approved',
        date: '2026-09-28'
      }
    ];
  });

  const handleApproveReview = (id) => {
    setAdminReviews(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status: 'approved' } : r);
      localStorage.setItem('earthy_admin_reviews', JSON.stringify(updated));
      return updated;
    });
    alert('Review has been approved and published to the live store!');
  };

  const handleRejectReview = (id) => {
    setAdminReviews(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r);
      localStorage.setItem('earthy_admin_reviews', JSON.stringify(updated));
      return updated;
    });
    alert('Review has been rejected / declined.');
  };

  const handleDeleteReview = (id) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    setAdminReviews(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('earthy_admin_reviews', JSON.stringify(updated));
      return updated;
    });
  };

  // Customer Support Inquiries / Tickets State
  const [supportTickets, setSupportTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('earthy_support_tickets');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'TCK-948102',
        name: 'Muhammad Tariq',
        email: 'tariq.pk@gmail.com',
        phone: '0301-4458921',
        subject: 'Haier 1.5 Ton T3 AC Delivery Inquiry',
        message: 'Assalam-o-Alaikum, is the Haier 1.5 Ton T3 Pro Inverter AC currently in stock at Regal Market showroom for same-day delivery?',
        date: '2026-10-06 04:30 PM',
        status: 'new'
      },
      {
        id: 'TCK-882319',
        name: 'Adeel Khan',
        email: 'adeel.khan88@yahoo.com',
        phone: '0321-9876543',
        subject: 'Installment Plan for Dawlance Refrigerator',
        message: 'Can I purchase the Dawlance 91996 inverter refrigerator on 12-month installments? What documents are required?',
        date: '2026-10-05 07:15 PM',
        status: 'resolved'
      }
    ];
  });

  const handleResolveTicket = (id) => {
    setSupportTickets(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, status: t.status === 'resolved' ? 'new' : 'resolved' } : t);
      localStorage.setItem('earthy_support_tickets', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteTicket = (id) => {
    if (!confirm('Are you sure you want to delete this customer inquiry?')) return;
    setSupportTickets(prev => {
      const updated = prev.filter(t => t.id !== id);
      localStorage.setItem('earthy_support_tickets', JSON.stringify(updated));
      return updated;
    });
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // Redirect if not admin - using secret route /abid
  useEffect(() => {
    if (!token || user.role !== 'admin') {
      navigate('/abid');
    }
  }, []);

  const authFetch = (url, opts = {}) =>
    fetch(url, { ...opts, headers: { ...opts.headers, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });

  useEffect(() => {
    const handleReloadTickets = () => {
      try {
        const saved = localStorage.getItem('earthy_support_tickets');
        if (saved) setSupportTickets(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('ticketsUpdated', handleReloadTickets);
    window.addEventListener('storage', handleReloadTickets);
    return () => {
      window.removeEventListener('ticketsUpdated', handleReloadTickets);
      window.removeEventListener('storage', handleReloadTickets);
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    
    // Flagship showroom location
    setLocations([{ id: 1, name: 'Regal Market Flagship Showroom, Saddar, Karachi' }]);

    setLoading(false);

    authFetch(`${API}/api/admin/analytics`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setAnalytics(data);
        }
      })
      .catch(console.error);

    authFetch(`${API}/api/admin/users`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setUsers(data.data);
        }
      })
      .catch(console.error);

    setInstallments([{ id: 1, product_name: 'Haier 1.5 Ton AC', status: 'pending', months: 12 }]);
    
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  const STANDARD_BRANDS = [
    'Dawlance', 'Haier', 'PEL', 'Gree', 'Orient', 'EcoStar',
    'Kenwood', 'WestPoint', 'Super Asia', 'Philips', 'Samsung', 'TCL'
  ];
  const STANDARD_CATEGORIES = [
    'Air Conditioners', 'Refrigerators', 'Washing Machines',
    'Microwave Ovens', 'Water Dispensers', 'Kitchen Appliances',
    'LED TVs', 'Deep Freezers', 'Fans & Heaters'
  ];

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);

        setProductForm(prev => ({
          ...prev,
          image: compressedBase64
        }));
        setFormErrors(prev => ({ ...prev, image: null }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddProduct = () => {
    setProductForm({
      name: '',
      brand: 'Dawlance',
      category: 'Air Conditioners',
      price: '',
      discountPrice: '',
      stock: 100,
      stock_threshold: 5,
      image: '',
      description: '',
      specifications: ''
    });
    setCustomBrandMode(false);
    setCustomCategoryMode(false);
    setImageInputMode('gallery');
    setFormErrors({});
  };

  const handleOpenEditProduct = (p) => {
    const isCustomBrand = p.brand && !STANDARD_BRANDS.includes(p.brand);
    const isCustomCategory = p.category && !STANDARD_CATEGORIES.includes(p.category);
    setProductForm({
      ...p,
      price: p.price !== undefined ? p.price : '',
      discountPrice: p.discountPrice !== undefined && p.discountPrice !== null ? p.discountPrice : '',
      stock: p.stock !== undefined ? p.stock : 100,
      stock_threshold: p.stock_threshold !== undefined ? p.stock_threshold : 5,
      image: p.image || '',
      description: p.description || '',
      specifications: typeof p.specifications === 'string' ? p.specifications : (p.specifications ? JSON.stringify(p.specifications) : '')
    });
    setCustomBrandMode(Boolean(isCustomBrand));
    setCustomCategoryMode(Boolean(isCustomCategory));
    setImageInputMode(p.image && p.image.startsWith('http') ? 'url' : 'gallery');
    setFormErrors({});
  };

  const handleDeleteProduct = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name || 'this product'}"? This action will remove it from the catalog.`)) return;
    try {
      await authFetch(`${API}/api/admin/products/${id}`, { method: 'DELETE' });
    } catch {}
    deleteProduct(id);
    alert('Product deleted successfully!');
  };

  const handleResetInventory = async () => {
    if (!confirm("Are you sure you want to restore the default inventory catalog? Any manual changes stored in your browser will be reset.")) return;
    await resetToDefaultInventory();
    alert("Inventory reset to default catalog successfully!");
  };

  const handleToggleUserStatus = async (userId, currentStatus, userRole) => {
    if (userRole === 'admin') {
      alert("Cannot modify an admin account.");
      return;
    }
    const action = currentStatus === 1 ? 'block and force-logout' : 'reactivate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    
    try {
      const res = await authFetch(`${API}/api/admin/users/${userId}/toggle`, { method: 'PATCH' });
      const data = await res.json();
      if (data.status === 'success') {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: data.is_active } : u));
        alert(data.message);
      } else {
        alert(data.message || 'Failed to update user status');
      }
    } catch (err) {
      alert('Error updating user status');
    }
  };

  const navItems = [
    { id: 'dashboard',    icon: <LayoutDashboard size={18} color="#818cf8"/>, label: 'Dashboard' },
    { id: 'products',     icon: <Package size={18} color="#34d399"/>,          label: 'Inventory' },
    { id: 'orders',       icon: <ShoppingCart size={18} color="#10b981"/>,     label: 'Orders' },
    { id: 'installments', icon: <CreditCard size={18} color="#a78bfa"/>,       label: 'Installments' },
    { id: 'analytics',    icon: <TrendingUp size={18} color="#22d3ee"/>,       label: 'Analytics' },
    { id: 'users',        icon: <Users size={18} color="#fb923c"/>,            label: 'Customers' },
    { id: 'coupons',      icon: <Ticket size={18} color="#f43f5e"/>,           label: 'Promo Codes' },
    { id: 'reviews',      icon: <Star size={18} color="#facc15"/>,             label: 'Reviews' },
    { id: 'inquiries',    icon: <MessageSquare size={18} color="#06b6d4"/>,    label: 'Inquiries' },
    { id: 'banners',      icon: <ImageIcon size={18} color="#c084fc"/>,        label: 'Banners' },
    { id: 'site-settings',icon: <Settings size={18} color="#94a3b8"/>,         label: 'Site Editor' },
  ];

    const summary = analytics?.summary || {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: products.length,
      customers: users.length,
      totalViews: 0,
      avgSessionSeconds: 0
    };
    const brandData = analytics?.brandRevenue || [];
    const catData = analytics?.categoryPerformance || [];

  // Low stock alert products
  const lowStock = products.filter(p => (p.stock || 0) <= (p.stock_threshold || 5));

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

      {/* --- Sidebar --- */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-head">
          <div className="admin-logo-icon"><Zap size={24} color="#fff"/></div>
          {sidebarOpen && (
            <div>
              <div className="admin-logo-name">EarthyElectronics</div>
              <div className="admin-logo-sub">Admin Panel</div>
            </div>
          )}
        </div>

        <nav className="admin-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`admin-nav-item${activeView === item.id ? ' active' : ''}`}
              onClick={() => {
                setActiveView(item.id);
                if (window.innerWidth <= 768) {
                  setSidebarOpen(false);
                } else {
                  setSidebarOpen(true);
                }
              }}
              title={!sidebarOpen ? item.label : ''}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>


      </aside>

      {/* --- Main Content --- */}
      <div className="admin-main">

        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(p => !p)}>
              {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
            <h2 className="admin-page-title">
              {navItems.find(n => n.id === activeView)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="admin-topbar-right">
            {lowStock.length > 0 && (
              <div className="admin-alert-badge" title={`${lowStock.length} low stock items`}>
                <AlertTriangle size={16}/> {lowStock.length}
              </div>
            )}
            <div 
              ref={profileMenuRef}
              className={`admin-user-chip ${showProfileMenu ? 'active' : ''}`} 
              onClick={() => setShowProfileMenu(!showProfileMenu)} 
              style={{ cursor: 'pointer', position: 'relative', userSelect: 'none' }}
              title="Admin Menu"
            >
              <div className="admin-user-avatar">{user.name?.[0] || 'A'}</div>
              <span style={{ fontWeight: '700', fontSize: '13px' }}>{user.name || 'Admin'}</span>
              <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: showProfileMenu ? 'rotate(180deg)' : 'none', color: '#065f46' }} />
              
              {showProfileMenu && (
                <div 
                  className="admin-dropdown-menu"
                  style={{ 
                    position: 'absolute', 
                    top: 'calc(100% + 8px)', 
                    right: 0, 
                    background: '#ffffff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    boxShadow: '0 12px 28px rgba(0,0,0,0.12)', 
                    minWidth: '220px', 
                    zIndex: 9999, 
                    overflow: 'hidden',
                    animation: 'scaleUp 0.15s ease-out'
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Signed in as</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email || 'admin@earthyelectronics.pk'}</div>
                    <div style={{ display: 'inline-block', fontSize: '10px', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', marginTop: '4px' }}>SUPER ADMIN</div>
                  </div>

                  <button 
                    onClick={() => { setShowProfileMenu(false); navigate('/'); }} 
                    style={{ width: '100%', padding: '12px 16px', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <Store size={16} color="#059669" /> Go to Website / Store
                  </button>

                  <button 
                    onClick={() => { setActiveView('dashboard'); setShowProfileMenu(false); }} 
                    style={{ width: '100%', padding: '12px 16px', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <LayoutDashboard size={16} color="#6366f1" /> Admin Dashboard
                  </button>

                  <button 
                    onClick={() => { setShowProfileMenu(false); handleLogout(); }} 
                    style={{ width: '100%', padding: '12px 16px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <LogOut size={16} color="#dc2626" /> Logout / Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-content">
          {loading ? (
            <div className="admin-loading">
              <div className="admin-spinner"></div>
              <p>Loading dashboard data...</p>
            </div>
          ) : (

            <>
              {/* 📊 DASHBOARD VIEW 📊 */}
              {activeView === 'dashboard' && (
                <div>
                  {/* Summary Cards */}
                  <div className="admin-summary-grid">
                    <div className="summary-card revenue">
                      <div className="summary-icon"><Banknote size={28} color="#16a34a"/></div>
                      <div>
                        <div className="summary-value">Rs. {(summary.totalRevenue || 0).toLocaleString()}</div>
                        <div className="summary-label">Total Revenue</div>
                      </div>
                    </div>
                    <div className="summary-card orders">
                      <div className="summary-icon"><Package size={28} color="#10b981"/></div>
                      <div>
                        <div className="summary-value">{summary.totalOrders || 0}</div>
                        <div className="summary-label">Total Orders</div>
                      </div>
                    </div>
                    <div className="summary-card products">
                      <div className="summary-icon"><ShoppingCart size={28} color="var(--primary-color)"/></div>
                      <div>
                        <div className="summary-value">{summary.totalProducts || 0}</div>
                        <div className="summary-label">Total Products</div>
                      </div>
                    </div>
                    <div className="summary-card customers">
                      <div className="summary-icon"><Users size={28} color="#8b5cf6"/></div>
                      <div>
                        <div className="summary-value">{summary.customers || 0}</div>
                        <div className="summary-label">Customers</div>
                      </div>
                    </div>
                    <div className="summary-card" style={{ background: '#f0fdfa' }}>
                      <div className="summary-icon"><TrendingUp size={28} color="#0d9488"/></div>
                      <div>
                        <div className="summary-value">{summary.totalViews || 0}</div>
                        <div className="summary-label">Site Views</div>
                      </div>
                    </div>
                    <div className="summary-card" style={{ background: '#fdf4ff' }}>
                      <div className="summary-icon"><Clock size={28} color="#c026d3"/></div>
                      <div>
                        <div className="summary-value">{summary.avgSessionSeconds || 0}s</div>
                        <div className="summary-label">Avg Session Time</div>
                      </div>
                    </div>
                  </div>

                  {/* Low Stock Alert */}
                  {lowStock.length > 0 && (
                    <div className="admin-alert-panel" style={{ display: 'block' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                        <AlertTriangle size={18} className="alert-icon" style={{ marginRight: '8px' }}/>
                        <strong style={{ fontSize: '16px' }}>Low Stock Alert ({lowStock.length} items need restock)</strong>
                      </div>
                      <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>Category</th>
                              <th>Brand</th>
                              <th>Current Stock</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lowStock.slice(0, 5).map(p => (
                                <tr key={p.id}>
                                  <td>{p.name}</td>
                                  <td><span className="cat-badge">{p.category}</span></td>
                                  <td>{p.brand}</td>
                                    <td>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button 
                                          onClick={() => updateStock(p.id, p.stock - 1)}
                                          style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >-</button>
                                        <input
                                          type="number"
                                          min="0"
                                          defaultValue={p.stock}
                                          onBlur={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (!isNaN(val) && val >= 0 && val !== p.stock) {
                                              updateStock(p.id, val);
                                            }
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') e.target.blur();
                                          }}
                                          style={{ width: '40px', textAlign: 'center', border: '1px solid #fca5a5', borderRadius: '4px', padding: '2px', color: '#dc2626', fontWeight: 'bold' }}
                                        />
                                        <button 
                                          onClick={() => updateStock(p.id, p.stock + 1)}
                                          style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#f0fdf4', color: '#22c55e', border: '1px solid #86efac', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >+</button>
                                      </div>
                                    </td>
                                                                    <td><button className="action-btn btn-restock" onClick={() => alert('Restock request placed for ' + p.name)}>Restock</button></td>
                                </tr>
                            ))}
                          </tbody>
                        </table>
                        {lowStock.length > 5 && <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px', color: '#64748b' }}>+ {lowStock.length - 5} more items</div>}
                      </div>
                    </div>
                  )}

                  {/* Charts Row */}
                  <div className="admin-charts-row">
                    {/* Brand Revenue Donut */}
                    <div className="admin-chart-card">
                      <h3>Sales by Category</h3>
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={brandData.length ? brandData : []}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            innerRadius={45}
                            paddingAngle={3}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {(brandData.length ? brandData : []).map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => `Rs. ${v.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Category Performance Bar */}
                    <div className="admin-chart-card">
                      <h3>Monthly Revenue</h3>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart
                          data={catData.length ? catData : []}
                          margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                          <XAxis dataKey="name" tick={{ fontSize: 11 }}/>
                          <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}K`} tick={{ fontSize: 11 }}/>
                          <Tooltip/>
                          <Bar dataKey="revenue" fill="#10b981" radius={[4,4,0,0]}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* 📦 INVENTORY / PRODUCTS VIEW 📦 */}
              {activeView === 'products' && (
                <div>
                  {/* Top Bar with Header & Add/Reset Actions */}
                  <div className="admin-panel-header" style={{ marginBottom: 18, background: 'transparent', border: 'none', padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--primary-color)' }}>
                        Inventory & Products
                      </h2>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                        Manage, edit, add, or delete catalog items. All updates sync instantly.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button 
                        type="button"
                        onClick={handleResetInventory}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1',
                          background: '#ffffff', color: '#475569', fontSize: 13, fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        title="Restore original default product catalog"
                      >
                        <RotateCcw size={15}/> Reset Catalog
                      </button>
                      <button 
                        type="button"
                        className="btn-add" 
                        onClick={handleOpenAddProduct}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '10px 18px', borderRadius: 8, border: 'none',
                          background: '#10b981', color: '#ffffff', fontSize: 13, fontWeight: 700,
                          cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <Plus size={16}/> Add New Product
                      </button>
                    </div>
                  </div>

                  {/* Search and Quick Filters Bar */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ position: 'relative', flex: '1 1 240px' }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}/>
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Search products by model, brand, or category..."
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 36px',
                            border: '1px solid #cbd5e1',
                            borderRadius: 8,
                            fontSize: 13,
                            fontFamily: 'inherit',
                            outline: 'none',
                            background: '#f8fafc'
                          }}
                        />
                        {productSearch && (
                          <button
                            type="button"
                            onClick={() => setProductSearch('')}
                            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
                          >
                            <X size={14}/>
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                        Showing {filteredProducts.length} of {products.length} products
                      </div>
                    </div>

                    {/* Category Filter Pills with count */}
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingTop: '12px', marginTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                      <button 
                        type="button"
                        onClick={() => setSelectedCategory('All')} 
                        style={{
                          padding: '6px 14px', borderRadius: '20px', border: 'none',
                          background: selectedCategory === 'All' ? 'var(--primary-color)' : '#f1f5f9',
                          color: selectedCategory === 'All' ? 'white' : '#475569',
                          cursor: 'pointer', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap'
                        }}
                      >
                        All ({products.length})
                      </button>
                      {allAvailableCategories.map(cat => {
                        const count = products.filter(p => p.category === cat).length;
                        if (count === 0 && selectedCategory !== cat) return null;
                        return (
                          <button 
                            key={`filter-${cat}`}
                            type="button"
                            onClick={() => setSelectedCategory(cat)} 
                            style={{
                              padding: '6px 14px', borderRadius: '20px', border: 'none',
                              background: selectedCategory === cat ? 'var(--primary-color)' : '#f1f5f9',
                              color: selectedCategory === cat ? 'white' : '#475569',
                              cursor: 'pointer', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap'
                            }}
                          >
                            {cat} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 🔍 LIGHTBOX IMAGE ZOOM MODAL (Requirement 2) 🔍 */}
                  {imageZoomModal.open && (
                    <div 
                      className="admin-zoom-modal-overlay" 
                      onClick={() => setImageZoomModal({ open: false, imageUrl: '', title: '' })}
                    >
                      <div className="admin-zoom-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="admin-zoom-modal-header">
                          <div className="admin-zoom-modal-title">
                            <Eye size={18} color="#10b981"/>
                            <span>Product Image Verification: {imageZoomModal.title || 'Image'}</span>
                          </div>
                          <button 
                            type="button"
                            className="admin-zoom-modal-close" 
                            onClick={() => setImageZoomModal({ open: false, imageUrl: '', title: '' })}
                            title="Close preview"
                          >
                            <X size={20}/>
                          </button>
                        </div>
                        <div className="admin-zoom-modal-body">
                          <img 
                            src={imageZoomModal.imageUrl} 
                            alt={imageZoomModal.title} 
                            className="admin-zoom-image"
                            onError={e => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/400x400/f1f5f9/64748b?text=Image+Load+Failed';
                            }}
                          />
                        </div>
                        <div className="admin-zoom-modal-footer">
                          <span className="admin-zoom-tip">
                            💡 Examine model badges, color, and design to ensure exact match before saving.
                          </span>
                          <button 
                            type="button"
                            className="btn-cancel" 
                            onClick={() => setImageZoomModal({ open: false, imageUrl: '', title: '' })}
                          >
                            Close Preview
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 📝 ADD / EDIT PRODUCT MODAL (Requirements 1, 2, 3, 4) 📝 */}
                  {productForm !== null && (
                    <div className="admin-modal-overlay">
                      <div className="admin-modal" style={{ width: '95%', maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto' }}>
                        <div className="admin-modal-head">
                          <div>
                            <h3 style={{ margin: 0 }}>{productForm.id ? 'Edit Product' : 'Add New Product'}</h3>
                            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                              {productForm.id ? `Editing ID: ${productForm.id}` : 'Fill in the product specifications and image.'}
                            </p>
                          </div>
                          <button 
                            type="button"
                            className="btn-close" 
                            onClick={() => { setProductForm(null); setFormErrors({}); }}
                          >
                            <X size={20}/>
                          </button>
                        </div>

                        <div className="admin-modal-body" style={{ display: 'grid', gridTemplateColumns: window.innerWidth <= 640 ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
                          
                          {/* Product Title / Name */}
                          <div className="form-group" style={{ gridColumn: '1/-1' }}>
                            <label>Product Name / Model Code *</label>
                            <input
                              className="form-input"
                              type="text"
                              value={productForm.name || ''}
                              onChange={e => {
                                setProductForm(p => ({ ...p, name: e.target.value }));
                                setFormErrors(err => ({ ...err, name: null }));
                              }}
                              placeholder="e.g. Dawlance Aura X 30 1.5 Ton Inverter AC"
                              style={{ borderColor: formErrors.name ? '#ef4444' : '' }}
                            />
                            {formErrors.name && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{formErrors.name}</span>}
                          </div>

                          {/* Brand Select / Custom */}
                          <div className="form-group">
                            <label>Brand *</label>
                            <select
                              className="form-input"
                              value={customBrandMode ? 'Other' : (productForm.brand || 'Dawlance')}
                              onChange={e => {
                                const val = e.target.value;
                                if (val === 'Other') {
                                  setCustomBrandMode(true);
                                  setProductForm(p => ({ ...p, brand: '' }));
                                } else {
                                  setCustomBrandMode(false);
                                  setProductForm(p => ({ ...p, brand: val }));
                                  setFormErrors(err => ({ ...err, brand: null }));
                                }
                              }}
                            >
                              {STANDARD_BRANDS.map(b => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                            {customBrandMode && (
                              <input
                                className="form-input"
                                type="text"
                                style={{ marginTop: '8px', borderColor: formErrors.brand ? '#ef4444' : '' }}
                                placeholder="Type custom brand name..."
                                value={productForm.brand || ''}
                                onChange={e => {
                                  setProductForm(p => ({ ...p, brand: e.target.value }));
                                  setFormErrors(err => ({ ...err, brand: null }));
                                }}
                              />
                            )}
                            {formErrors.brand && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{formErrors.brand}</span>}
                          </div>

                          {/* Category Select / Custom */}
                          <div className="form-group">
                            <label>Category *</label>
                            <select
                              className="form-input"
                              value={customCategoryMode ? 'Other' : (productForm.category || 'Air Conditioners')}
                              onChange={e => {
                                const val = e.target.value;
                                if (val === 'Other') {
                                  setCustomCategoryMode(true);
                                  setProductForm(p => ({ ...p, category: '' }));
                                } else {
                                  setCustomCategoryMode(false);
                                  setProductForm(p => ({ ...p, category: val }));
                                  setFormErrors(err => ({ ...err, category: null }));
                                }
                              }}
                            >
                              {STANDARD_CATEGORIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                              <option value="Other">Other / Custom Category</option>
                            </select>
                            {customCategoryMode && (
                              <input
                                className="form-input"
                                type="text"
                                style={{ marginTop: '8px', borderColor: formErrors.category ? '#ef4444' : '' }}
                                placeholder="Type custom category name..."
                                value={productForm.category || ''}
                                onChange={e => {
                                  setProductForm(p => ({ ...p, category: e.target.value }));
                                  setFormErrors(err => ({ ...err, category: null }));
                                }}
                              />
                            )}
                            {formErrors.category && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{formErrors.category}</span>}
                          </div>

                          {/* Regular Price (Rs.) */}
                          <div className="form-group">
                            <label>Regular Price (Rs.) *</label>
                            <input
                              className="form-input"
                              type="number"
                              min="0"
                              value={productForm.price !== undefined ? productForm.price : ''}
                              onChange={e => {
                                setProductForm(p => ({ ...p, price: e.target.value }));
                                setFormErrors(err => ({ ...err, price: null }));
                              }}
                              placeholder="e.g. 128000"
                              style={{ borderColor: formErrors.price ? '#ef4444' : '' }}
                            />
                            {productForm.price > 0 && (
                              <span style={{ color: '#059669', fontSize: '11px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                                Formatted: Rs. {Number(productForm.price).toLocaleString()}
                              </span>
                            )}
                            {formErrors.price && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{formErrors.price}</span>}
                          </div>

                          {/* Discount / Sale Price (Rs.) */}
                          <div className="form-group">
                            <label>Discount / Sale Price (Rs.) (Optional)</label>
                            <input
                              className="form-input"
                              type="number"
                              min="0"
                              value={productForm.discountPrice !== undefined ? productForm.discountPrice : ''}
                              onChange={e => {
                                setProductForm(p => ({ ...p, discountPrice: e.target.value }));
                                setFormErrors(err => ({ ...err, discountPrice: null }));
                              }}
                              placeholder="e.g. 118000"
                              style={{ borderColor: formErrors.discountPrice ? '#ef4444' : '' }}
                            />
                            {productForm.discountPrice > 0 && productForm.price > productForm.discountPrice && (
                              <span style={{ color: '#ea580c', fontSize: '11px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                                Savings: Rs. {(productForm.price - productForm.discountPrice).toLocaleString()} ({Math.round(((productForm.price - productForm.discountPrice) / productForm.price) * 100)}% OFF)
                              </span>
                            )}
                            {formErrors.discountPrice && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{formErrors.discountPrice}</span>}
                          </div>

                          {/* Stock Qty */}
                          <div className="form-group">
                            <label>Stock Qty *</label>
                            <input 
                              className="form-input" 
                              type="number" 
                              min="0"
                              value={productForm.stock !== undefined ? productForm.stock : ''} 
                              onChange={e => {
                                setProductForm(p => ({ ...p, stock: e.target.value }));
                                setFormErrors(err => ({ ...err, stock: null }));
                              }}
                              style={{ borderColor: formErrors.stock ? '#ef4444' : '' }}
                            />
                            {formErrors.stock && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{formErrors.stock}</span>}
                          </div>

                          {/* Stock Threshold */}
                          <div className="form-group">
                            <label>Low Stock Alert Threshold *</label>
                            <input 
                              className="form-input" 
                              type="number" 
                              min="0"
                              value={productForm.stock_threshold !== undefined ? productForm.stock_threshold : ''} 
                              onChange={e => {
                                setProductForm(p => ({ ...p, stock_threshold: e.target.value }));
                                setFormErrors(err => ({ ...err, stock_threshold: null }));
                              }}
                              style={{ borderColor: formErrors.stock_threshold ? '#ef4444' : '' }}
                            />
                            {formErrors.stock_threshold && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{formErrors.stock_threshold}</span>}
                          </div>

                          {/* 🖼️ IMAGE UPLOAD & GALLERY SECTION (Requirements 2 & 3) 🖼️ */}
                          <div className="form-group" style={{ gridColumn: '1/-1' }}>
                            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>Product Image *</span>
                              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                                Mobile Gallery / Camera / URL
                              </span>
                            </label>

                            {/* Mode Switch Tabs */}
                            <div className="admin-img-upload-tabs">
                              <button
                                type="button"
                                className={`admin-img-tab-btn ${imageInputMode === 'gallery' ? 'active' : ''}`}
                                onClick={() => setImageInputMode('gallery')}
                              >
                                <Camera size={14}/> Choose from Mobile Gallery / File
                              </button>
                              <button
                                type="button"
                                className={`admin-img-tab-btn ${imageInputMode === 'url' ? 'active' : ''}`}
                                onClick={() => setImageInputMode('url')}
                              >
                                <ImageIcon size={14}/> Paste Image URL
                              </button>
                            </div>

                            {/* Hidden file input that triggers mobile gallery / camera */}
                            <input
                              type="file"
                              accept="image/*"
                              ref={fileInputRef}
                              style={{ display: 'none' }}
                              onChange={handleImageFileChange}
                            />

                            {/* Gallery Mode Button */}
                            {imageInputMode === 'gallery' && (
                              <div>
                                <button
                                  type="button"
                                  className="admin-file-picker-btn"
                                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                >
                                  <Upload size={18}/>
                                  <span>{productForm.image ? 'Change Photo from Gallery / Camera' : 'Tap to Select Photo from Gallery / Camera'}</span>
                                </button>
                                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, textAlign: 'center' }}>
                                  Works on iPhone & Android. Automatically optimizes photo size for instantaneous loading.
                                </div>
                              </div>
                            )}

                            {/* URL Mode Input */}
                            {imageInputMode === 'url' && (
                              <input
                                className="form-input"
                                type="text"
                                value={productForm.image || ''}
                                onChange={e => {
                                  setProductForm(p => ({ ...p, image: e.target.value }));
                                  setFormErrors(err => ({ ...err, image: null }));
                                }}
                                placeholder="Paste direct image link: https://example.com/image.jpg"
                              />
                            )}

                            {/* Image Preview & Click-to-Zoom Box (Requirement 2) */}
                            {productForm.image ? (
                              <div className="admin-img-preview-box">
                                <div 
                                  className="admin-preview-thumbnail-wrap" 
                                  onClick={() => setImageZoomModal({ open: true, imageUrl: productForm.image, title: productForm.name || 'Product Image' })}
                                  title="Click to view full image in high resolution"
                                >
                                  <img 
                                    src={productForm.image} 
                                    alt="Product Preview" 
                                    onError={e => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://placehold.co/84x84/f1f5f9/64748b?text=Broken+Image';
                                    }}
                                  />
                                  <div className="admin-preview-zoom-badge">
                                    <ZoomIn size={10}/> Tap Zoom
                                  </div>
                                </div>
                                <div className="admin-preview-actions">
                                  <div className="admin-preview-actions-title">Image Ready & Attached</div>
                                  <div className="admin-preview-actions-sub">
                                    Click thumbnail or Zoom button to inspect full size and ensure correct model.
                                  </div>
                                  <div className="admin-preview-btns-row">
                                    <button
                                      type="button"
                                      className="btn-sm btn-green"
                                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                                      onClick={() => setImageZoomModal({ open: true, imageUrl: productForm.image, title: productForm.name || 'Product Image' })}
                                    >
                                      <Eye size={13}/> Zoom & Inspect
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-sm btn-red"
                                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                                      onClick={() => setProductForm(p => ({ ...p, image: '' }))}
                                    >
                                      <Trash2 size={13}/> Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div style={{ marginTop: 8, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1', fontSize: 12, color: '#64748b', textAlign: 'center' }}>
                                No image selected yet. Pick a photo from your gallery or paste a link.
                              </div>
                            )}

                            {formErrors.image && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{formErrors.image}</span>}
                          </div>

                          {/* Description */}
                          <div className="form-group" style={{ gridColumn: '1/-1' }}>
                            <label>Description & Features</label>
                            <textarea
                              className="form-input"
                              value={productForm.description || ''}
                              onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))}
                              rows={3}
                              placeholder="Product features, warranty details, official specifications summary..."
                            />
                          </div>

                          {/* Technical Specifications */}
                          <div className="form-group" style={{ gridColumn: '1/-1' }}>
                            <label>Technical Specifications (Optional)</label>
                            <textarea
                              className="form-input"
                              value={productForm.specifications || ''}
                              onChange={e => setProductForm(p => ({ ...p, specifications: e.target.value }))}
                              rows={2}
                              placeholder="e.g. Inverter Technology: Yes | Warranty: 10 Years Compressor | Voltage: 220V"
                            />
                          </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="admin-modal-footer">
                          <button 
                            type="button"
                            className="btn-cancel" 
                            onClick={() => { setProductForm(null); setFormErrors({}); }}
                          >
                            Cancel
                          </button>
                          <button 
                            type="button"
                            className="btn-save" 
                            onClick={async (e) => {
                              e.preventDefault();
                              const errors = {};
                              
                              if (!productForm.name || !String(productForm.name).trim()) errors.name = 'Product name is required';
                              if (!productForm.brand || !String(productForm.brand).trim()) errors.brand = 'Brand is required';
                              if (!productForm.category || !String(productForm.category).trim()) errors.category = 'Category is required';
                              if (!productForm.price || Number(productForm.price) <= 0) errors.price = 'Price must be a positive number';
                              if (productForm.discountPrice && Number(productForm.discountPrice) >= Number(productForm.price)) {
                                errors.discountPrice = 'Discount price should be less than regular price';
                              }
                              
                              const stockVal = Number(productForm.stock);
                              if (productForm.stock === undefined || productForm.stock === '' || stockVal < 0 || !Number.isInteger(stockVal)) {
                                errors.stock = 'Stock must be a non-negative number';
                              }
                              
                              const thresholdVal = Number(productForm.stock_threshold);
                              if (productForm.stock_threshold === undefined || productForm.stock_threshold === '' || thresholdVal < 0 || !Number.isInteger(thresholdVal)) {
                                errors.stock_threshold = 'Threshold must be a non-negative number';
                              }

                              if (Object.keys(errors).length > 0) {
                                setFormErrors(errors);
                                return;
                              }
                              setFormErrors({});

                              try {
                                if (productForm.id) {
                                  await updateProduct(productForm);
                                  await updateStock(productForm.id, Number(productForm.stock || 0));
                                  alert(`✅ Product "${productForm.name}" updated successfully!`);
                                } else {
                                  await addProduct(productForm);
                                  alert(`✅ New product "${productForm.name}" added successfully!`);
                                }
                                setProductForm(null);
                              } catch (err) {
                                console.error(err);
                                alert("Failed to save product.");
                              }
                            }}
                          >
                            {productForm.id ? 'Save Changes' : 'Add Product to Catalog'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Empty Search Results State */}
                  {filteredProducts.length === 0 && (
                    <div className="admin-empty" style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '40px 20px' }}>
                      <AlertTriangle size={36} color="#94a3b8" style={{ marginBottom: 12 }}/>
                      <h4 style={{ margin: '0 0 6px', color: '#1e293b' }}>No products match your search</h4>
                      <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: 13 }}>
                        Try searching with different terms or selecting another category.
                      </p>
                      <button 
                        type="button"
                        onClick={() => { setProductSearch(''); setSelectedCategory('All'); }}
                        className="btn-sm btn-green"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}

                  {/* 📱 MOBILE VIEW: TOUCH PRODUCT CARDS (Requirement 3) 📱 */}
                  <div className="admin-mobile-products-grid">
                    {filteredProducts.map(p => (
                      <div key={`mob-${p.id}`} className="admin-mobile-product-card">
                        <div className="mobile-card-top">
                          <div 
                            className="mobile-card-thumb-wrap" 
                            onClick={() => setImageZoomModal({ open: true, imageUrl: p.image || '/images/cat_ac.png', title: p.name })}
                            title="Tap to zoom image"
                          >
                            <img
                              src={p.image || `https://placehold.co/68x68/f1f5f9/64748b?text=${encodeURIComponent((p.brand||'?')[0])}`}
                              alt={p.name}
                              loading="lazy"
                              onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/68x68/f1f5f9/64748b?text=${encodeURIComponent((p.brand||'?')[0])}`; }}
                            />
                            <div className="mobile-card-zoom-indicator">
                              <Eye size={10}/>
                            </div>
                          </div>

                          <div className="mobile-card-info">
                            <div className="mobile-card-badges">
                              <span className="mobile-badge brand">{p.brand}</span>
                              <span className="mobile-badge cat">{p.category}</span>
                            </div>
                            <div className="mobile-card-title">{p.name}</div>
                            <div className="mobile-card-price-row">
                              <span className="mobile-price-current">
                                Rs. {(p.discountPrice || p.price)?.toLocaleString()}
                              </span>
                              {p.discountPrice && (
                                <span className="mobile-price-was">
                                  Rs. {p.price?.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mobile-card-bottom-row">
                          {/* Quick Stock Controls */}
                          <div className="mobile-stock-controls">
                            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Stock:</span>
                            <button
                              type="button"
                              className="mobile-stock-btn"
                              style={{ background: '#fef2f2', color: '#ef4444' }}
                              onClick={() => updateStock(p.id, Math.max(0, (p.stock || 0) - 1))}
                            >-</button>
                            <input
                              type="number"
                              min="0"
                              defaultValue={p.stock !== undefined ? p.stock : 0}
                              key={p.stock}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val >= 0 && val !== p.stock) {
                                  updateStock(p.id, val);
                                }
                              }}
                              style={{ width: '48px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px', fontWeight: 'bold', fontSize: 13 }}
                            />
                            <button
                              type="button"
                              className="mobile-stock-btn"
                              style={{ background: '#f0fdf4', color: '#16a34a' }}
                              onClick={() => updateStock(p.id, (p.stock || 0) + 1)}
                            >+</button>
                          </div>

                          {/* Action Buttons */}
                          <div className="mobile-card-actions">
                            <button
                              type="button"
                              className="mobile-action-btn edit"
                              onClick={() => handleOpenEditProduct(p)}
                            >
                              <Pencil size={13}/> Edit
                            </button>
                            <button
                              type="button"
                              className="mobile-action-btn delete"
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                            >
                              <Trash2 size={13}/> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 💻 DESKTOP VIEW: FULL TABLE VIEW (Requirement 4) 💻 */}
                  <div className="admin-desktop-table-view">
                    {[...new Set(filteredProducts.map(p => p.category))].sort().map(cat => {
                      const catProducts = filteredProducts.filter(p => p.category === cat);
                      if (catProducts.length === 0) return null;
                      return (
                        <div key={cat} className="admin-panel" style={{ marginBottom: '24px' }}>
                          <div className="admin-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>
                              {cat} <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>({catProducts.length} items)</span>
                            </h3>
                          </div>
                          <div className="admin-table-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
                            <table className="admin-table">
                              <thead>
                                <tr>
                                  <th>Product</th>
                                  <th>Brand</th>
                                  <th>Category</th>
                                  <th>Price</th>
                                  <th>Stock</th>
                                  <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {catProducts.sort((a, b) => a.name.localeCompare(b.name)).map(p => (
                                  <tr key={p.id}>
                                    <td>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div 
                                          style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                                          onClick={() => setImageZoomModal({ open: true, imageUrl: p.image || '/images/cat_ac.png', title: p.name })}
                                          title="Click to view full image in high resolution"
                                        >
                                          <img
                                            src={p.image || `https://placehold.co/48x48/f1f5f9/64748b?text=${encodeURIComponent((p.brand||'?')[0])}`}
                                            alt={p.name}
                                            style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8, background: '#f8fafc', border: '1px solid rgba(0,0,0,0.08)' }}
                                            onError={e => { e.target.onerror=null; e.target.src=`https://placehold.co/48x48/f1f5f9/64748b?text=${encodeURIComponent((p.brand||'?')[0])}`; }}
                                          />
                                          <div style={{ position: 'absolute', bottom: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ZoomIn size={9}/>
                                          </div>
                                        </div>
                                        <div>
                                          <div style={{ color: 'var(--primary-color)', fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                                          <div style={{ color: '#64748b', fontSize: 11 }}>ID: {p.id}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td style={{ color: '#475569', fontWeight: 600 }}>{p.brand}</td>
                                    <td style={{ color: '#64748b', fontSize: 12 }}>{p.category}</td>
                                    <td>
                                      <div style={{ color: '#059669', fontWeight: 700 }}>
                                        Rs. {(p.discountPrice || p.price)?.toLocaleString()}
                                      </div>
                                      {p.discountPrice && (
                                        <div style={{ color: '#94a3b8', fontSize: 11, textDecoration: 'line-through' }}>
                                          Rs. {p.price?.toLocaleString()}
                                        </div>
                                      )}
                                    </td>
                                    <td>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button 
                                          type="button"
                                          onClick={() => updateStock(p.id, Math.max(0, (p.stock || 0) - 1))}
                                          style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', cursor: 'pointer', fontWeight: 'bold' }}
                                        >-</button>
                                        
                                        <input
                                          type="number"
                                          min="0"
                                          defaultValue={p.stock !== undefined ? p.stock : 0}
                                          key={p.stock}
                                          onBlur={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (!isNaN(val) && val >= 0 && val !== p.stock) {
                                              updateStock(p.id, val);
                                            }
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') e.target.blur();
                                          }}
                                          style={{ width: '50px', textAlign: 'center', border: `1px solid ${(p.stock || 0) > (p.stock_threshold||5) ? '#86efac' : '#fca5a5'}`, borderRadius: '4px', padding: '2px', fontWeight: 'bold' }}
                                        />
                                        
                                        <button 
                                          type="button"
                                          onClick={() => updateStock(p.id, (p.stock || 0) + 1)}
                                          style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f0fdf4', color: '#22c55e', border: '1px solid #86efac', cursor: 'pointer', fontWeight: 'bold' }}
                                        >+</button>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                                        <button 
                                          type="button"
                                          className="btn-icon edit" 
                                          onClick={() => handleOpenEditProduct(p)}
                                          title="Edit this product"
                                        >
                                          <Pencil size={15}/>
                                        </button>
                                        <button 
                                          type="button"
                                          className="btn-icon delete" 
                                          onClick={() => handleDeleteProduct(p.id, p.name)}
                                          title="Delete this product"
                                        >
                                          <Trash2 size={15}/>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 📈 ANALYTICS VIEW 📈 */}
              {activeView === 'analytics' && (
                <div>
                  <div className="admin-view-header"><h3>Sales Analytics</h3></div>
                  <div className="admin-charts-col">
                    <div className="admin-chart-card wide">
                      <h3>Category Sales Distribution</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={brandData.length ? brandData : []} margin={{ top: 10, right: 20, bottom: 0, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)"/>
                          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }}/>
                          <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: '#64748b' }}/>
                          <Tooltip formatter={v => `Rs. ${v.toLocaleString()}`}/>
                          <Bar dataKey="value" radius={[6,6,0,0]}>
                            {(brandData.length ? brandData : []).map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="admin-chart-card wide">
                      <h3>Monthly Revenue Trend</h3>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={catData.length ? catData : []} margin={{ top: 10, right: 20, bottom: 0, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)"/>
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }}/>
                          <YAxis yAxisId="left" tickFormatter={v => `${(v/1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: '#64748b' }}/>
                          <Tooltip/>
                          <Bar yAxisId="left" dataKey="revenue" fill="#10b981" name="Revenue (PKR)" radius={[4,4,0,0]}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* 👥 CUSTOMERS VIEW 👥 */}
              {activeView === 'users' && (
                <div>
                  <div className="admin-view-header"><h3>Customer Accounts ({crmUsers.length})</h3></div>
                  {crmUsers.length === 0 ? (
                    <div className="admin-empty">No customers found.</div>
                  ) : (
                    <div className="admin-panel" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Name/Email</th>
                              <th>Status</th>
                              <th>Live Location</th>
                              <th>Session Time</th>
                              <th>Total Orders</th>
                            </tr>
                          </thead>
                          <tbody>
                            {crmUsers.map(u => {
                              const isActive = u.status === 'Active';
                              return (
                              <tr key={u.id} className={!isActive ? 'user-blocked-row' : ''}>
                                <td>{u.id}</td>
                                <td>
                                  <div className="user-name">{u.name}</div>
                                  <div className="user-email">{u.email}</div>
                                </td>
                                <td>
                                  <span className={`status-badge ${isActive ? 'active' : 'blocked'}`}>
                                    {u.status}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
                                    <MapPin size={14} color="#3b82f6"/>
                                    {u.location}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: isActive ? '#10b981' : '#64748b' }}>
                                    <Clock size={14}/>
                                    {u.sessionTime} mins
                                  </div>
                                </td>
                                <td>{u.orders}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 💳 INSTALLMENTS VIEW 💳 */}
              {activeView === 'installments' && (
                <div>
                  <div className="admin-view-header">
                    <h3>Installment Ledger</h3>
                    <button className="admin-add-btn"><Plus size={16}/> New Plan</button>
                  </div>
                  {installments.length === 0 ? (
                    <div className="admin-empty">
                      <CreditCard size={40} style={{opacity:0.3, margin:'0 auto 16px'}}/>
                      <p>No installment plans yet. Connect MySQL DB to manage EMI plans.</p>
                    </div>
                  ) : (
                    <div className="admin-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
                      <table className="admin-table">
                        <thead>
                          <tr><th>Customer</th><th>Product</th><th>Total</th><th>Monthly</th><th>Progress</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                          {installments.map(il => (
                            <tr key={il.id}>
                              <td>{il.customer_name || 'N/A'}</td>
                              <td>{il.product_name || il.product_id}</td>
                              <td>Rs. {il.total_amount?.toLocaleString()}</td>
                              <td>Rs. {il.monthly_amount?.toLocaleString()}</td>
                              <td>{il.paid_months}/{il.total_months} months</td>
                              <td><span className={`status-badge ${il.status}`}>{il.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 🛒 ORDERS VIEW 🛒 */}
              {activeView === 'orders' && (
                <div>
                  <div className="admin-view-header"><h3>Orders Management</h3></div>
                  <div className="admin-empty-state">
                    <ShoppingCart size={48} color="#94a3b8"/>
                    <h3>No new orders yet</h3>
                    <p>When customers place orders, they will appear here for processing.</p>
                  </div>
                </div>
              )}

              {/* 🎟️ COUPONS VIEW (NEW) 🎟️ */}
              {activeView === 'coupons' && (
                <div>
                  <div className="admin-view-header">
                    <h3>Promo Codes & Coupons</h3>
                    <button className="action-btn add"><Plus size={16}/> Create Coupon</button>
                  </div>
                  <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
                    <table className="admin-table">
                      <thead>
                        <tr><th>Code</th><th>Discount</th><th>Status</th><th>Usage</th><th>Action</th></tr>
                      </thead>
                      <tbody>
                        <tr><td><strong>RAMZAN50</strong></td><td>Rs. 5,000 Off</td><td><span className="cat-badge" style={{background: '#dcfce7', color: '#16a34a'}}>Active</span></td><td>12 / 100</td><td><button className="action-btn edit">Edit</button></td></tr>
                        <tr><td><strong>FREESHIP</strong></td><td>Free Shipping</td><td><span className="cat-badge" style={{background: '#dcfce7', color: '#16a34a'}}>Active</span></td><td>45 / ∞</td><td><button className="action-btn edit">Edit</button></td></tr>
                        <tr><td><strong>EID2025</strong></td><td>10% Off</td><td><span className="cat-badge" style={{background: '#f1f5f9', color: '#64748b'}}>Expired</span></td><td>150 / 150</td><td><button className="action-btn delete">Delete</button></td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ⭐ REVIEWS VIEW (DYNAMIC MODERATION) ⭐ */}
              {activeView === 'reviews' && (
                <div>
                  <div className="admin-view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                    <div>
                      <h3 style={{ margin: 0 }}>Product Reviews Moderation</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                        Approve or decline customer reviews before they appear publicly.
                      </p>
                    </div>

                    {/* Filter Pills */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'all', label: `All (${adminReviews.length})` },
                        { id: 'pending', label: `Pending (${adminReviews.filter(r => r.status === 'pending').length})` },
                        { id: 'approved', label: `Approved (${adminReviews.filter(r => r.status === 'approved').length})` },
                        { id: 'rejected', label: `Rejected (${adminReviews.filter(r => r.status === 'rejected').length})` },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setReviewFilter(tab.id)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: reviewFilter === tab.id ? '2px solid #065f46' : '1px solid #cbd5e1',
                            background: reviewFilter === tab.id ? '#ecfdf5' : '#ffffff',
                            color: reviewFilter === tab.id ? '#065f46' : '#64748b',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                    <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>TOTAL REVIEWS</div>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{adminReviews.length}</div>
                    </div>
                    <div style={{ background: '#fffbeb', padding: '14px 18px', borderRadius: '10px', border: '1px solid #fef3c7', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: '12px', color: '#b45309', fontWeight: '600' }}>PENDING MODERATION</div>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: '#b45309', marginTop: '2px' }}>{adminReviews.filter(r => r.status === 'pending').length}</div>
                    </div>
                    <div style={{ background: '#f0fdf4', padding: '14px 18px', borderRadius: '10px', border: '1px solid #dcfce7', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: '12px', color: '#166534', fontWeight: '600' }}>APPROVED LIVE</div>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: '#166534', marginTop: '2px' }}>{adminReviews.filter(r => r.status === 'approved').length}</div>
                    </div>
                    <div style={{ background: '#fef2f2', padding: '14px 18px', borderRadius: '10px', border: '1px solid #fee2e2', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: '12px', color: '#991b1b', fontWeight: '600' }}>REJECTED</div>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: '#991b1b', marginTop: '2px' }}>{adminReviews.filter(r => r.status === 'rejected').length}</div>
                    </div>
                  </div>

                  <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    {adminReviews.filter(r => reviewFilter === 'all' || r.status === reviewFilter).length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                        <Star size={36} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                        <p style={{ margin: 0, fontSize: '14px' }}>No reviews found for "{reviewFilter}" filter.</p>
                      </div>
                    ) : (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Customer</th>
                            <th>Product</th>
                            <th>Rating</th>
                            <th>Review</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminReviews
                            .filter(r => reviewFilter === 'all' || r.status === reviewFilter)
                            .map(r => (
                              <tr key={r.id}>
                                <td>
                                  <strong>{r.customer}</strong>
                                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{r.date || 'Recent'}</div>
                                </td>
                                <td>
                                  <span style={{ fontWeight: '600', color: '#0f172a' }}>{r.product}</span>
                                </td>
                                <td>
                                  <div style={{ color: '#f59e0b', fontSize: '14px', letterSpacing: '2px' }}>
                                    {'★'.repeat(r.rating || 5)}{'☆'.repeat(5 - (r.rating || 5))}
                                  </div>
                                </td>
                                <td style={{ maxWidth: 280, fontSize: '13px', color: '#334155', lineHeight: '1.4' }}>
                                  "{r.review}"
                                </td>
                                <td>
                                  {r.status === 'approved' && (
                                    <span className="cat-badge" style={{ background: '#dcfce7', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                                      <Check size={12} /> Approved
                                    </span>
                                  )}
                                  {r.status === 'rejected' && (
                                    <span className="cat-badge" style={{ background: '#fee2e2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                                      <X size={12} /> Rejected
                                    </span>
                                  )}
                                  {r.status === 'pending' && (
                                    <span className="cat-badge" style={{ background: '#fef3c7', color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                                      <Clock size={12} /> Pending
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    {r.status !== 'approved' && (
                                      <button 
                                        className="action-btn edit" 
                                        onClick={() => handleApproveReview(r.id)}
                                        style={{ background: '#10b981', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '4px', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                        title="Approve this review"
                                      >
                                        <Check size={13} /> Approve
                                      </button>
                                    )}

                                    {r.status !== 'rejected' && (
                                      <button 
                                        className="action-btn delete" 
                                        onClick={() => handleRejectReview(r.id)}
                                        style={{ background: '#ef4444', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '4px', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                        title="Reject / Decline this review"
                                      >
                                        <X size={13} /> Reject
                                      </button>
                                    )}

                                    <button 
                                      onClick={() => handleDeleteReview(r.id)}
                                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}
                                      title="Delete review"
                                      onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                                      onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* 📩 CUSTOMER SUPPORT INQUIRIES / TICKETS VIEW 📩 */}
              {activeView === 'inquiries' && (
                <div>
                  <div className="admin-view-header">
                    <div>
                      <h3>Customer Support Inquiries</h3>
                      <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
                        Messages and problem tickets submitted by customers through the Contact Us form.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={{ background: '#ecfdf5', color: '#065f46', padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '13px' }}>
                        {supportTickets.length} Total Tickets
                      </span>
                    </div>
                  </div>

                  {supportTickets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <MessageSquare size={48} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
                      <h4 style={{ margin: '0 0 6px', color: '#334155' }}>No Support Tickets</h4>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Customer inquiries submitted via the Contact form will appear here in real-time.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {supportTickets.map(ticket => (
                        <div 
                          key={ticket.id} 
                          style={{ 
                            background: '#ffffff', 
                            border: ticket.status === 'new' ? '1.5px solid #10b981' : '1px solid #e2e8f0', 
                            borderRadius: '14px', 
                            padding: '20px', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>{ticket.id}</span>
                                <h4 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>{ticket.subject}</h4>
                                {ticket.status === 'new' ? (
                                  <span style={{ fontSize: '11px', fontWeight: '700', background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '10px' }}>● NEW</span>
                                ) : (
                                  <span style={{ fontSize: '11px', fontWeight: '700', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '10px' }}>RESOLVED</span>
                                )}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                Received on: <strong>{ticket.date}</strong>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                              {ticket.phone && (
                                <a 
                                  href={`https://wa.me/${ticket.phone.replace(/[^0-9]/g, '')}?text=Assalam-o-Alaikum%20${encodeURIComponent(ticket.name)},%20EarthyElectronics%20Regal%20Market%20Showroom%20se%20rabta%20kiya%20ja%20raha%20hai%20regarding:%20${encodeURIComponent(ticket.subject)}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', background: '#25d366', color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}
                                  title="Reply on WhatsApp"
                                >
                                  <MessageSquare size={14} /> WhatsApp Reply
                                </a>
                              )}
                              <a 
                                href={`mailto:${ticket.email}?subject=Re:%20${encodeURIComponent(ticket.subject)}`}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', background: '#f1f5f9', color: '#334155', borderRadius: '8px', fontSize: '12px', fontWeight: '600', textDecoration: 'none', border: '1px solid #cbd5e1' }}
                                title="Reply via Email"
                              >
                                <Mail size={14} /> Email
                              </a>
                              <button 
                                onClick={() => handleResolveTicket(ticket.id)}
                                style={{ padding: '7px 12px', background: ticket.status === 'new' ? '#f0fdf4' : '#f8fafc', color: ticket.status === 'new' ? '#166534' : '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                              >
                                {ticket.status === 'new' ? 'Mark Resolved' : 'Reopen'}
                              </button>
                              <button 
                                onClick={() => handleDeleteTicket(ticket.id)}
                                style={{ padding: '7px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                title="Delete inquiry"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Customer Details Box */}
                          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
                            <div>👤 <strong>Customer:</strong> {ticket.name}</div>
                            <div>✉️ <strong>Email:</strong> <a href={`mailto:${ticket.email}`} style={{ color: '#0284c7', textDecoration: 'none' }}>{ticket.email}</a></div>
                            {ticket.phone && <div>📞 <strong>Phone:</strong> <a href={`tel:${ticket.phone}`} style={{ color: '#0284c7', textDecoration: 'none' }}>{ticket.phone}</a></div>}
                          </div>

                          {/* Problem / Message Body */}
                          <div style={{ background: '#fbfcf8', borderLeft: '4px solid #10b981', padding: '12px 16px', borderRadius: '0 8px 8px 0', fontSize: '14px', color: '#1e293b', lineHeight: '1.6' }}>
                            "{ticket.message}"
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 🖼️ BANNERS VIEW (NEW) 🖼️ */}
              {activeView === 'banners' && (
                <div>
                  <div className="admin-view-header">
                    <h3>Homepage Banners & Carousels</h3>
                    <button className="action-btn save" onClick={() => alert("Banner changes saved successfully! The live site has been updated.")} style={{ background: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Save Changes</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    {(themeConfig?.heroSlides || []).map((slide, index) => (
                      <div key={index} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', background: 'white' }}>
                        <img src={slide.bgImage} alt={`Banner ${index + 1}`} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }}/>
                        
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label style={{fontSize: '12px', color: '#64748b'}}>Image URL</label>
                          <input type="text" className="form-input" value={slide.bgImage} onChange={(e) => updateBanner(index, 'bgImage', e.target.value)} style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0'}}/>
                        </div>

                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label style={{fontSize: '12px', color: '#64748b'}}>Heading</label>
                          <input type="text" className="form-input" value={slide.title} onChange={(e) => updateBanner(index, 'title', e.target.value)} style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0'}}/>
                        </div>

                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label style={{fontSize: '12px', color: '#64748b'}}>Subtext Description</label>
                          <input type="text" className="form-input" value={slide.desc} onChange={(e) => updateBanner(index, 'desc', e.target.value)} style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0'}}/>
                        </div>

                        <div className="form-group" style={{ marginBottom: '0' }}>
                          <label style={{fontSize: '12px', color: '#64748b'}}>Offer Tag (e.g. Free Delivery)</label>
                          <input type="text" className="form-input" value={slide.offer} onChange={(e) => updateBanner(index, 'offer', e.target.value)} style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0'}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ⚙️ SITE SETTINGS / CMS VIEW (NEW) ⚙️ */}
              {activeView === 'site-settings' && (
                <div>
                  <div className="admin-view-header">
                    <h3>Live Site Editor & CMS</h3>
                    <button className="action-btn save" onClick={() => alert("Settings saved successfully! The live site has been updated.")} style={{ background: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Save Changes</button>
                  </div>
                  
                                    <div className="admin-settings-layout">
                    <div className="settings-panels-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                      
                      <div className="admin-panel" style={{ padding: '24px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <h4 style={{ color: 'var(--primary-color)', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>Global Settings</h4>
                        
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                          <label>Store Name</label>
                          <input type="text" className="form-input" value={themeConfig?.storeName || ""} onChange={(e) => updateTheme("storeName", e.target.value)} style={{width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #e2e8f0'}}/>
                        </div>
                        
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                          <label>Contact Phone</label>
                          <input type="text" className="form-input" value={themeConfig?.contactPhone || ""} onChange={(e) => updateTheme("contactPhone", e.target.value)} style={{width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #e2e8f0'}}/>
                        </div>
                        
                        <div className="form-group">
                          <label>Footer About Text</label>
                          <textarea className="form-input" style={{ minHeight: '80px', width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={themeConfig?.footerAbout || ""} onChange={(e) => updateTheme("footerAbout", e.target.value)}></textarea>
                        </div>
                      </div>



                      {/* NEW: CMS Fields (Hero & Promo) */}
                      <div className="admin-panel" style={{ padding: '24px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <h4 style={{ color: 'var(--primary-color)', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>Content Management</h4>
                        

                        
                        <div className="form-group" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input type="checkbox" checked={themeConfig?.promoActive !== false} onChange={(e) => updateTheme("promoActive", e.target.checked)} style={{width: '18px', height: '18px'}}/>
                          <div>
                            <label style={{marginBottom: 0}}>Enable Top Promotion Bar</label>
                            <span style={{display: 'block', fontSize: '11px', color: '#64748b'}}>Toggles the yellow scrolling announcement bar at the very top of the website.</span>
                          </div>
                        </div>
                        
                        <div className="form-group">
                          <label>Promotion Bar Text</label>
                          <span style={{display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '8px'}}>The actual text shown in the scrolling yellow promotion bar.</span>
                          <input type="text" className="form-input" value={themeConfig?.promoText || ""} onChange={(e) => updateTheme("promoText", e.target.value)} style={{width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #e2e8f0'}}/>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible on <= 768px screens) */}
      <nav className="admin-mobile-bottom-nav" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', gap: '4px', justifyContent: 'flex-start', padding: '6px 8px' }}>
        {navItems.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveView(item.id)}
            className={`admin-mobile-nav-btn ${activeView === item.id ? 'active' : ''}`}
            style={{
              flex: '0 0 auto',
              minWidth: '60px',
              padding: '6px 8px',
              borderRadius: '8px',
              background: activeView === item.id ? 'rgba(16, 185, 129, 0.12)' : 'transparent'
            }}
          >
            <div className="nav-btn-icon">{item.icon}</div>
            <span className="nav-btn-label" style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
          </button>
        ))}
      </nav>
      
      <AdminChatbot />
    </div>
  );
}











