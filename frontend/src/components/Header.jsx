import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, MessageCircle, Search, Trash2, Plus, Minus, X, Menu, Moon, Sun, LogIn, LogOut, LayoutDashboard, PartyPopper, Truck, Star, CheckCircle2, Banknote, PhoneCall, Wind, Tv, Refrigerator, Shirt, ChefHat, Microwave, Droplets, Snowflake, Zap, Leaf, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import emailjs from '@emailjs/browser';
import './Header.css';

export default function Header() {
  const { cartItems, cartCount, cartTotal, updateQuantity, removeFromCart, clearCart, toast, setToast } = useCart();
  const { isDark, toggleTheme, themeConfig } = useTheme();
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);
  
  // Checkout form states
  const [orderName, setOrderName] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [orderErrors, setOrderErrors] = useState({});
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccessPopup, setOrderSuccessPopup] = useState(false);
  const [placedOrderInfo, setPlacedOrderInfo] = useState(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [bounce, setBounce] = useState(false);
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const searchRef = useRef(null);
  const [authUser, setAuthUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const handleAuthLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthUser(null);
    window.dispatchEvent(new Event('authChange'));
    navigate('/signin');
  };

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  
  const navigate = useNavigate();
  const location = useLocation();

  const catFallback = (cat) => {
    if (!cat) return '/images/cat_washer.png';
    cat = cat.toLowerCase();
    if (cat.includes('ac') || cat.includes('air')) return '/images/cat_ac.png';
    if (cat.includes('tv') || cat.includes('led')) return '/images/cat_tv.png';
    if (cat.includes('fridge') || cat.includes('refriger')) return '/images/cat_fridge.png';
    if (cat.includes('washer') || cat.includes('washing')) return '/images/cat_washer.png';
    if (cat.includes('microwave') || cat.includes('oven')) return '/images/cat_microwave.png';
    if (cat.includes('dispenser')) return '/images/product_dispenser.png';
    if (cat.includes('freezer')) return '/images/product_freezer.png';
    return '/images/cat_washer.png';
  };

  const isActive = (path) => location.pathname === path ? 'nav-active' : '';

  // Trigger bounce animation on cart count increase
  useEffect(() => {
    if (cartCount === 0) return;
    setBounce(true);
    const timer = setTimeout(() => setBounce(false), 400);
    return () => clearTimeout(timer);
  }, [cartCount]);

  // Prefill order name and email if user is logged in
  useEffect(() => {
    if (authUser) {
      if (!orderName && authUser.name) setOrderName(authUser.name);
      if (!orderEmail && authUser.email) setOrderEmail(authUser.email);
    }
  }, [authUser]);

  // Listen for external open-cart events
  useEffect(() => {
    const handleOpenCart = (e) => {
      setCartOpen(true);
      if (e?.detail?.checkout) {
        setCheckoutMode(true);
      }
    };
    window.addEventListener('open-cart', handleOpenCart);
    return () => window.removeEventListener('open-cart', handleOpenCart);
  }, []);

  // Show floating cart on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowFloatingCart(true);
      } else {
        setShowFloatingCart(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch all products once for suggestions
  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
    fetch(`/data/products.json`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') {
          const brokenIds = new Set([471, 447, 507, 465, 760, 1001, 1002, 1003, 1004, 2001, 2002, 2003, 759]);
          setAllProducts(data.data.filter(p => !brokenIds.has(p.id)));
        }
      })
      .catch(() => {});
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Filter suggestions as user types
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setActiveIdx(-1);
    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const q = val.toLowerCase();
    const matched = [];
    const seen = new Set();
    allProducts.forEach(p => {
      // Match product name
      if (p.name.toLowerCase().includes(q) && !seen.has(p.name)) {
        seen.add(p.name);
        matched.push({ type: 'product', label: p.name, category: p.category, brand: p.brand });
      }
      // Match brand
      if (p.brand.toLowerCase().includes(q) && !seen.has('brand_' + p.brand)) {
        seen.add('brand_' + p.brand);
        matched.push({ type: 'brand', label: p.brand, category: p.category });
      }
      // Match category
      if (p.category.toLowerCase().includes(q) && !seen.has('cat_' + p.category)) {
        seen.add('cat_' + p.category);
        matched.push({ type: 'category', label: p.category, category: p.category });
      }
    });
    setSuggestions(matched.slice(0, 8));
    setShowSuggestions(matched.length > 0);
  };

  const handleSuggestionClick = (s) => {
    setShowSuggestions(false);
    setSearch('');
    if (s.type === 'category') {
      navigate(`/products?category=${encodeURIComponent(s.category)}`);
    } else if (s.type === 'brand') {
      navigate(`/products?search=${encodeURIComponent(s.label)}`);
    } else {
      navigate(`/products?search=${encodeURIComponent(s.label)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[activeIdx]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  // Strict email and phone validation helpers
  const validateEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email.trim());
  };

  const validatePhone = (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    const clean = phone.trim().replace(/[\s\-\(\)]/g, '');
    if (!/^\+?[0-9]{10,15}$/.test(clean)) return false;
    if (clean.startsWith('03')) return /^03[0-9]{9}$/.test(clean);
    if (clean.startsWith('+923')) return /^\+923[0-9]{9}$/.test(clean);
    if (clean.startsWith('923')) return /^923[0-9]{9}$/.test(clean);
    return clean.length >= 10 && clean.length <= 15;
  };

  const handleCheckout = () => {
    let text = "Hello EarthyElectronics! I want to place an order:\n\n";
    if (orderName.trim()) text += `*Name:* ${orderName.trim()}\n`;
    if (orderEmail.trim()) text += `*Email:* ${orderEmail.trim()}\n`;
    if (orderPhone.trim()) text += `*Phone:* ${orderPhone.trim()}\n`;
    if (orderAddress.trim()) text += `*Delivery Address:* ${orderAddress.trim()}\n\n`;
    text += "*Items Ordered:*\n";
    cartItems.forEach(i => {
      text += `- ${i.name} (Qty: ${i.quantity}) = Rs. ${((i.discountPrice || i.price) * i.quantity).toLocaleString()}\n`;
    });
    text += `\n*Total Amount: Rs. ${cartTotal.toLocaleString()}*`;
    window.open(`https://wa.me/923002347457?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Strict validation: Email and Phone number are strictly compulsory and must be valid!
    const errs = {};
    if (!orderName.trim()) {
      errs.name = 'Full name is required.';
    }
    if (!orderEmail.trim()) {
      errs.email = 'Email address is compulsory / required.';
    } else if (!validateEmail(orderEmail)) {
      errs.email = 'Please enter a valid email address (e.g. name@gmail.com).';
    }

    if (!orderPhone.trim()) {
      errs.phone = 'Phone number is compulsory / required.';
    } else if (!validatePhone(orderPhone)) {
      errs.phone = 'Please enter a valid phone number (e.g. 0300-1234567).';
    }

    if (!orderAddress.trim()) {
      errs.address = 'Delivery address is required.';
    }

    if (Object.keys(errs).length > 0) {
      setOrderErrors(errs);
      return;
    }
    setOrderErrors({});

    setOrderSubmitting(true);
    try {
      const trimmedName = orderName.trim();
      const trimmedEmail = orderEmail.trim().toLowerCase();
      const trimmedPhone = orderPhone.trim();
      const trimmedAddress = orderAddress.trim();
      const orderNumber = 'EE-' + Math.floor(100000 + Math.random() * 900000);

      // Prepare the email text
      let itemsList = cartItems.map(i => `- ${i.name} (Qty: ${i.quantity}) - Rs. ${((i.discountPrice || i.price) * i.quantity).toLocaleString()}`).join('\n');
      
      const emailMessage = `
NEW ORDER RECEIVED!
--------------------------
Order #: ${orderNumber}
Customer Name: ${trimmedName}
Email: ${trimmedEmail}
Phone Number: ${trimmedPhone}
Delivery Address: ${trimmedAddress}

ORDER DETAILS:
${itemsList}

Total Amount: Rs. ${cartTotal.toLocaleString()}
Payment Method: Cash on Delivery (COD)
--------------------------
`;

      const orderRecord = {
        id: 'EE-' + Date.now().toString().slice(-6),
        order_number: orderNumber,
        customer_name: trimmedName,
        customer_email: trimmedEmail,
        customer_phone: trimmedPhone,
        customer_address: trimmedAddress,
        items: cartItems.map(i => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.discountPrice || i.price,
          image: i.image
        })),
        total: cartTotal,
        status: 'Processing',
        created_at: new Date().toISOString(),
        user_email: trimmedEmail
      };

      // 1. Save to local storage for instant customer dashboard availability
      try {
        const rawLocal = localStorage.getItem('earthy_user_orders');
        const existingLocal = rawLocal ? JSON.parse(rawLocal) : [];
        existingLocal.unshift(orderRecord);
        localStorage.setItem('earthy_user_orders', JSON.stringify(existingLocal));
      } catch (storageErr) {
        console.warn('Could not cache order locally:', storageErr);
      }

      // 2. Dispatch to backend API asynchronously (safely catches if backend offline)
      try {
        const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
        const token = localStorage.getItem('token');
        fetch(`${base}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            customerName: trimmedName,
            customer_name: trimmedName,
            customerEmail: trimmedEmail,
            customer_email: trimmedEmail,
            email: trimmedEmail,
            phone: trimmedPhone,
            customer_phone: trimmedPhone,
            address: trimmedAddress,
            customer_address: trimmedAddress,
            total: cartTotal,
            items: orderRecord.items,
            orderNumber: orderNumber
          })
        }).catch(() => {});
      } catch {}

      // 3. Use EmailJS to send the email
      try {
        await emailjs.send(
          'service_5e6fcjm',    // Service ID
          'template_2pedukm',   // Template ID
          { 
            message: emailMessage,
            customer_name: trimmedName,
            customer_email: trimmedEmail,
            customer_phone: trimmedPhone,
            customer_address: trimmedAddress,
            order_total: `Rs. ${cartTotal.toLocaleString()}`,
            order_number: orderNumber,
            items_list: itemsList
          },
          'ehutdzjr0maqm0s_U'   // Public Key
        );
      } catch (emailErr) {
        console.warn('EmailJS error:', emailErr);
      }

      setPlacedOrderInfo({
        orderNumber,
        customerName: trimmedName,
        customerEmail: trimmedEmail,
        customerPhone: trimmedPhone,
        customerAddress: trimmedAddress,
        total: cartTotal
      });

      clearCart();
      setCartOpen(false);
      setCheckoutMode(false);
      setOrderName('');
      setOrderEmail('');
      setOrderPhone('');
      setOrderAddress('');
      setOrderErrors({});
      setOrderSuccessPopup(true);
      
    } catch (err) {
      console.error(err);
      alert('Error placing order. Please check your internet connection and try again.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <>
      {/* ─── Scrolling Offer Ticker (Absolute Top) ─── */}
      {themeConfig?.promoActive !== false && (<div className="offer-ticker">
        <div className="ticker-track">
          {[
            <><PartyPopper size={15} color="#fbbf24" fill="#f59e0b" style={{ filter: 'drop-shadow(0 2px 4px rgba(251,191,36,0.6))' }}/> {themeConfig?.promoText || 'Flat 10% Off Sitewide.'}</>,
            <><Truck size={15} color="#38bdf8" fill="#0284c7" style={{ filter: 'drop-shadow(0 2px 4px rgba(56,189,248,0.6))' }}/> Free Delivery on Orders Rs.80,000 & Above.</>,
            <><Star size={15} color="#fbbf24" fill="#f59e0b" style={{ filter: 'drop-shadow(0 2px 4px rgba(251,191,36,0.6))' }}/> Welcome to EarthyElectronics.</>,
            <><CheckCircle2 size={15} color="#34d399" fill="#059669" style={{ filter: 'drop-shadow(0 2px 4px rgba(52,211,153,0.6))' }}/> Authorized Dealer of Haier.</>,
            <><CheckCircle2 size={15} color="#34d399" fill="#059669" style={{ filter: 'drop-shadow(0 2px 4px rgba(52,211,153,0.6))' }}/> Authorized Dealer of Gree.</>,
            <><CheckCircle2 size={15} color="#34d399" fill="#059669" style={{ filter: 'drop-shadow(0 2px 4px rgba(52,211,153,0.6))' }}/> Authorized Dealer of Dawlance.</>,
            <><PartyPopper size={15} color="#fbbf24" fill="#f59e0b" style={{ filter: 'drop-shadow(0 2px 4px rgba(251,191,36,0.6))' }}/> {themeConfig?.promoText || 'Flat 10% Off Sitewide.'}</>,
            <><Truck size={15} color="#38bdf8" fill="#0284c7" style={{ filter: 'drop-shadow(0 2px 4px rgba(56,189,248,0.6))' }}/> Free Delivery on Orders Rs.80,000 & Above.</>,
            <><Star size={15} color="#fbbf24" fill="#f59e0b" style={{ filter: 'drop-shadow(0 2px 4px rgba(251,191,36,0.6))' }}/> Welcome to EarthyElectronics.</>,
            <><CheckCircle2 size={15} color="#34d399" fill="#059669" style={{ filter: 'drop-shadow(0 2px 4px rgba(52,211,153,0.6))' }}/> Authorized Dealer of Kenwood.</>,
            <><Banknote size={15} color="#4ade80" fill="#16a34a" style={{ filter: 'drop-shadow(0 2px 4px rgba(74,222,128,0.6))' }}/> Up to 15% Off on Inverter ACs.</>,
            <><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#25d366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 2px 4px rgba(37,211,102,0.6))', display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> WhatsApp Order: 0300-2347457.</>,
          ].map((t, i) => (
            <span key={i} className="ticker-item">{t}</span>
          ))}
        </div>
      </div>)}

      {/* ─── Main Header ─── */}
      <header className="site-header">
        <div className="header-main-row" style={window.innerWidth <= 640 ? { flexWrap: 'wrap' } : {}}>
          {/* Mobile hamburger menu toggle */}
          <button className="hdr-mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>

          <Link to="/" className="hdr-logo" style={{ display: 'flex', alignItems: 'center', padding: '0', textDecoration: 'none' }}>
            <img 
              src="/images/earthyelectronics_official_banner_logo.png" 
              alt="EarthyElectronics Official Logo" 
              className="hdr-logo-img" 
            />
          </Link>

          {/* Desktop Navigation (Middle) */}
          <nav className="hdr-nav-inline">
            <ul className="hdr-nav-list-inline">
              <li><Link to="/" className={isActive('/')}>Home</Link></li>
              <li className="hdr-nav-dropdown-inline">
                <Link to="/products" className={`dropdown-trigger-link-inline ${isActive('/products')}`}>
                  Products ▾
                </Link>
                <ul className="dropdown-menu-inline">
                  <li><Link to="/products?category=Air%20Conditioner"><Wind size={15} color="#0284c7" className="inline-icon"/>Air Conditioners</Link></li>
                  <li><Link to="/products?category=LED%20TV"><Tv size={15} color="#7c3aed" className="inline-icon"/>LED TVs</Link></li>
                  <li><Link to="/products?category=Refrigerator"><Refrigerator size={15} color="#0d9488" className="inline-icon"/>Refrigerators</Link></li>
                  <li><Link to="/products?category=Washing%20Machine"><Shirt size={15} color="#db2777" className="inline-icon"/>Washing Machines</Link></li>
                  <li><Link to="/products?category=Kitchen%20Appliances"><ChefHat size={15} color="#ea580c" className="inline-icon"/>Kitchen Appliances</Link></li>
                  <li><Link to="/products?category=Microwave%20Oven"><Microwave size={15} color="#ca8a04" className="inline-icon"/>Microwave Ovens</Link></li>
                  <li><Link to="/products?category=Water%20Dispenser"><Droplets size={15} color="#2563eb" className="inline-icon"/>Water Dispensers</Link></li>
                  <li><Link to="/products?category=Deep%20Freezer"><Snowflake size={15} color="#0284c7" className="inline-icon"/>Deep Freezers</Link></li>
                </ul>
              </li>
              <li><Link to="/about" className={isActive('/about')}>About</Link></li>
              <li><Link to="/contact" className={isActive('/contact')}>Contact</Link></li>
            </ul>
          </nav>

          {/* Search & Actions Group (Right) */}
          <div className="hdr-right-group" style={window.innerWidth <= 640 ? { flexWrap: 'wrap', width: '100%', justifyContent: 'flex-end' } : {}}>
            {/* Search with Autocomplete */}
            <div className="hdr-search-wrap" ref={searchRef} style={window.innerWidth <= 640 ? { order: 3, flexBasis: '100%', width: '100%', minWidth: '100%', marginTop: '10px' } : {}}>
              <form className="hdr-search" onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search ACs, TVs, Refrigerators, Brands..."
                  value={search}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  autoComplete="off"
                />
                <button type="submit"><Search size={16} /></button>
              </form>
              {showSuggestions && (
                <ul className="search-suggestions">
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      className={`suggestion-item${i === activeIdx ? ' active' : ''}`}
                      onMouseDown={() => handleSuggestionClick(s)}
                    >
                      <span className="suggestion-icon">
                        {s.type === 'category' ? '📂' : s.type === 'brand' ? '🏷️' : '🔍'}
                      </span>
                      <span className="suggestion-label">{s.label}</span>
                      <span className="suggestion-type">
                        {s.type === 'category' ? 'Category' : s.type === 'brand' ? 'Brand' : s.category}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Cart Icon Button */}
            <button className="hdr-cart-btn-compact" onClick={() => setCartOpen(true)} title="View Cart">
              <div className={`cart-icon-container-compact ${bounce ? 'cart-bounce' : ''}`}>
                <ShoppingCart size={22} />
                {cartCount > 0 && <span className="hdr-cart-badge-compact">{cartCount}</span>}
              </div>
              <span className="hdr-cart-text-compact">Cart</span>
            </button>

            {/* WhatsApp Order Button */}
            <a
              href="https://wa.me/923002347457?text=Hello%20EarthyElectronics!%20I%20need%20assistance."
              target="_blank"
              rel="noopener noreferrer"
              className="hdr-wa-btn-compact"
              title="Order on WhatsApp"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span>WhatsApp</span>
            </a>

            {/* Auth Button */}
            {authUser ? (
              <div className="auth-menu-wrap" ref={userMenuRef}>
                <button
                  className="auth-user-pill"
                  onClick={() => setUserMenuOpen(prev => !prev)}
                  style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                >
                  <span className="auth-user-avatar">{authUser.name?.[0]?.toUpperCase() || 'U'}</span>
                  <span className="auth-user-name">{authUser.name?.split(' ')[0]}</span>
                  <span style={{ fontSize: '10px', marginLeft: '2px' }}>▾</span>
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{authUser.name}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{authUser.email}</span>
                    </div>
                    <div className="user-dropdown-divider"/>
                    {authUser.role === 'admin' && (
                      <Link
                        to="/abid"
                        className="user-dropdown-item admin-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard size={15}/> Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/dashboard"
                      className="user-dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Star size={15}/> My Account
                    </Link>
                    <div className="user-dropdown-divider"/>
                    <button
                      className="user-dropdown-item logout-item"
                      onClick={() => { setUserMenuOpen(false); handleAuthLogout(); }}
                    >
                      <LogOut size={15}/> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/signin" className="hdr-signin-btn" title="Sign In">
                <LogIn size={15}/>
                <span>Sign In</span>
              </Link>
            )}

          </div>
        </div>
      </header>

      {/* ─── Mobile Menu Drawer ─── */}
      <div className={`menu-overlay${mobileMenuOpen ? ' is-open' : ''}`} onClick={() => setMobileMenuOpen(false)}>
        <div className="menu-panel" onClick={e => e.stopPropagation()}>
          <div className="menu-panel-head">
            <h3>📂 Navigation Menu</h3>
            <button className="menu-close-x" onClick={() => setMobileMenuOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="menu-panel-body">
            <div className="menu-panel-links">
              <Link to="/" className={isActive('/')} onClick={() => setMobileMenuOpen(false)}>🏠 Home</Link>
              <Link to="/products" className={isActive('/products')} onClick={() => setMobileMenuOpen(false)}>📦 All Products</Link>
              <Link to="/products?category=Air%20Conditioner" onClick={() => setMobileMenuOpen(false)}>❄️ Air Conditioners</Link>
              <Link to="/products?category=LED%20TV" onClick={() => setMobileMenuOpen(false)}>📺 LED TVs</Link>
              <Link to="/products?category=Refrigerator" onClick={() => setMobileMenuOpen(false)}>🧊 Refrigerators</Link>
              <Link to="/products?category=Washing%20Machine" onClick={() => setMobileMenuOpen(false)}>🧺 Washing Machines</Link>
              <Link to="/products?category=Kitchen%20Appliances" onClick={() => setMobileMenuOpen(false)}>🍳 Kitchen Appliances</Link>
              <Link to="/products?category=Microwave%20Oven" onClick={() => setMobileMenuOpen(false)}>🍲 Microwave Ovens</Link>
              <Link to="/products?category=Water%20Dispenser" onClick={() => setMobileMenuOpen(false)}>🚰 Water Dispensers</Link>
              <Link to="/products?category=Deep%20Freezer" onClick={() => setMobileMenuOpen(false)}>🥶 Deep Freezers</Link>
              <Link to="/about" className={isActive('/about')} onClick={() => setMobileMenuOpen(false)}>ℹ️ About Us</Link>
              <Link to="/contact" className={isActive('/contact')} onClick={() => setMobileMenuOpen(false)}>📞 Contact Us</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Cart Drawer ─── */}
      <div className={`cart-overlay${cartOpen ? ' is-open' : ''}`} onClick={() => setCartOpen(false)}>
        <div className="cart-panel" onClick={e => e.stopPropagation()}>
          {/* Head */}
          <div className="cart-panel-head">
            <h3>{checkoutMode ? 'Secure Checkout' : `🛒 Cart (${cartCount} item${cartCount !== 1 ? 's' : ''})`}</h3>
            <button className="cart-close-x" onClick={() => { setCartOpen(false); setCheckoutMode(false); }}>
              <X size={20} />
            </button>
          </div>

          {/* Items / Checkout Form */}
          <div className="cart-panel-body">
            {cartItems.length === 0 ? (
              <div className="cart-empty-msg" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <ShoppingCart size={64} strokeWidth={1.5} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>Your cart is empty</p>
                <p style={{ fontSize: '14px', marginBottom: '24px' }}>Looks like you haven't added anything yet.</p>
                <button className="btn btn-navy" onClick={() => setCartOpen(false)} style={{ padding: '10px 24px', borderRadius: '8px' }}>Start Shopping</button>
              </div>
            ) : checkoutMode ? (
              <form className="checkout-form" onSubmit={handlePlaceOrder} style={{ padding: '10px' }} noValidate>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <h4 style={{ margin: 0, color: '#065f46', fontSize: '15px', fontWeight: '700' }}>Delivery & Contact Details</h4>
                  <span style={{ fontSize: '11px', color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>Guest Checkout</span>
                </div>

                {/* Error Banner */}
                {Object.keys(orderErrors).length > 0 && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', color: '#991b1b', fontSize: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>⚠️</span>
                    <div>
                      <strong>Please correct required fields:</strong>
                      <div>Valid Email and Phone Number must be provided to place an order.</div>
                    </div>
                  </div>
                )}

                {/* Full Name */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', fontWeight: '600', color: '#1e293b' }}>
                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    value={orderName} 
                    onChange={e => {
                      setOrderName(e.target.value);
                      if (orderErrors.name) setOrderErrors(prev => ({ ...prev, name: null }));
                    }} 
                    style={{ width: '100%', padding: '10px', border: orderErrors.name ? '1.5px solid #ef4444' : '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} 
                    placeholder="Muhammad Ahmed" 
                  />
                  {orderErrors.name && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '3px', fontWeight: '500' }}>{orderErrors.name}</div>
                  )}
                </div>

                {/* Compulsory Email */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginBottom: '4px', fontWeight: '600', color: '#1e293b' }}>
                    <span>Email Address <span style={{ color: '#ef4444', fontWeight: '700' }}>* (Compulsory)</span></span>
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: '500' }}>Order invoice</span>
                  </label>
                  <input 
                    type="email" 
                    value={orderEmail} 
                    onChange={e => {
                      setOrderEmail(e.target.value);
                      if (orderErrors.email) setOrderErrors(prev => ({ ...prev, email: null }));
                    }} 
                    style={{ width: '100%', padding: '10px', border: orderErrors.email ? '1.5px solid #ef4444' : '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} 
                    placeholder="name@example.com" 
                  />
                  {orderErrors.email ? (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '3px', fontWeight: '500' }}>⚠️ {orderErrors.email}</div>
                  ) : (
                    <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>Valid email required for confirmation.</div>
                  )}
                </div>

                {/* Compulsory Phone */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginBottom: '4px', fontWeight: '600', color: '#1e293b' }}>
                    <span>Phone Number <span style={{ color: '#ef4444', fontWeight: '700' }}>* (Compulsory)</span></span>
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: '500' }}>Delivery call</span>
                  </label>
                  <input 
                    type="tel" 
                    value={orderPhone} 
                    onChange={e => {
                      setOrderPhone(e.target.value);
                      if (orderErrors.phone) setOrderErrors(prev => ({ ...prev, phone: null }));
                    }} 
                    style={{ width: '100%', padding: '10px', border: orderErrors.phone ? '1.5px solid #ef4444' : '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} 
                    placeholder="0300-1234567" 
                  />
                  {orderErrors.phone ? (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '3px', fontWeight: '500' }}>⚠️ {orderErrors.phone}</div>
                  ) : (
                    <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>e.g. 03xx-xxxxxxx (11 digits).</div>
                  )}
                </div>

                {/* Delivery Address */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', fontWeight: '600', color: '#1e293b' }}>
                    Delivery Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea 
                    value={orderAddress} 
                    onChange={e => {
                      setOrderAddress(e.target.value);
                      if (orderErrors.address) setOrderErrors(prev => ({ ...prev, address: null }));
                    }} 
                    rows="3" 
                    style={{ width: '100%', padding: '10px', border: orderErrors.address ? '1.5px solid #ef4444' : '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} 
                    placeholder="House/Flat No, Street, Area, City" 
                  />
                  {orderErrors.address && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '3px', fontWeight: '500' }}>{orderErrors.address}</div>
                  )}
                </div>
                
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', color: '#475569' }}>
                    <span>Subtotal:</span>
                    <span>Rs. {cartTotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', color: '#16a34a', fontWeight: '600' }}>
                    <span>Delivery:</span>
                    <span>Free</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', color: '#475569' }}>
                    <span>Payment:</span>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>Cash on Delivery</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '8px', fontWeight: '800', fontSize: '15px' }}>
                    <span>Total:</span>
                    <span style={{ color: '#059669' }}>Rs. {cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button type="button" onClick={() => setCheckoutMode(false)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: '13px' }}>Back</button>
                  <button type="submit" className="btn btn-green" disabled={orderSubmitting} style={{ flex: 2, justifyContent: 'center', fontSize: '14px', fontWeight: '700' }}>
                    {orderSubmitting ? 'Placing Order...' : 'Confirm Order'}
                  </button>
                </div>

                <div style={{ textAlign: 'center', borderTop: '1px dashed #e2e8f0', paddingTop: '10px' }}>
                  <Link 
                    to="/checkout" 
                    onClick={() => { setCartOpen(false); setCheckoutMode(false); }}
                    style={{ fontSize: '12px', color: '#0284c7', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    Switch to Fullscreen Checkout Page →
                  </Link>
                </div>
              </form>
            ) : (
              cartItems.map(item => (
                <div key={item.id} className="cart-prod-row">
                  <img 
                    className="cart-prod-img" 
                    src={item.image || catFallback(item.category)} 
                    alt={item.name} 
                    style={{ mixBlendMode: 'multiply' }}
                    onError={e => { e.target.onerror = null; e.target.src = catFallback(item.category); }}
                  />
                  <div className="cart-prod-info">
                    <h4>{item.name}</h4>
                    <div className="cart-prod-price">
                      Rs. {((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                    </div>
                    <div className="cart-qty-row">
                      <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus size={12} />
                      </button>
                      <span className="cart-qty-num">{item.quantity}</span>
                      <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus size={12} />
                      </button>
                      <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && !checkoutMode && (
            <div className="cart-panel-foot">
              <div className="cart-total-row">
                <span>Total:</span>
                <span>Rs. {cartTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="btn btn-orange" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} onClick={() => setCheckoutMode(true)}>
                  Proceed to Checkout (Website)
                </button>
                <button className="cart-wa-checkout" onClick={handleCheckout}>
                  <MessageCircle size={18} /> Checkout on WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Floating Sticky Cart Button (on scroll) ─── */}
      {cartCount > 0 && (
        <button 
          className={`floating-cart-btn${showFloatingCart ? ' visible' : ''}`}
          onClick={() => setCartOpen(true)}
          title="Open Cart"
        >
          <div style={{ position: 'relative', display: 'flex' }}>
            <ShoppingCart size={24} />
            <span className="floating-cart-badge">{cartCount}</span>
          </div>
        </button>
      )}

      {/* ─── Toast Popup ─── */}
      <div className={`cart-toast${toast.show ? ' show' : ''}`}>
        <div className="cart-toast-icon">✓</div>
        <span>{toast.message}</span>
      </div>

      {/* ─── Success Order Popup Modal ─── */}
      {orderSuccessPopup && (
        <div className="menu-overlay is-open" style={{ zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setOrderSuccessPopup(false)}>
          <div className="cart-panel" style={{ width: '90%', maxWidth: '440px', height: 'auto', borderRadius: '16px', padding: '28px 22px', textAlign: 'center', animation: 'scaleUp 0.3s ease-out' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: '#dcfce7', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <CheckCircle2 size={36} color="#16a34a" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#064e3b', marginBottom: '6px' }}>Order Placed Successfully!</h2>
            
            {placedOrderInfo && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', margin: '14px 0 16px', textAlign: 'left', fontSize: '13px', lineHeight: '1.6' }}>
                <div><span style={{ color: '#64748b' }}>Order #: </span><strong style={{ color: '#0f172a' }}>{placedOrderInfo.orderNumber}</strong></div>
                <div><span style={{ color: '#64748b' }}>Customer: </span><strong>{placedOrderInfo.customerName}</strong></div>
                <div><span style={{ color: '#64748b' }}>Email: </span><strong>{placedOrderInfo.customerEmail}</strong></div>
                <div><span style={{ color: '#64748b' }}>Phone: </span><strong>{placedOrderInfo.customerPhone}</strong></div>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '6px' }}>
                  <span style={{ color: '#64748b' }}>Total Amount: </span><strong style={{ color: '#059669', fontSize: '14px' }}>Rs. {placedOrderInfo.total.toLocaleString()} (COD)</strong>
                </div>
              </div>
            )}

            <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.5', marginBottom: '20px' }}>
              A confirmation invoice has been sent to your email. Our delivery team will call you on your phone number before dispatching.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="btn btn-green" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px' }} onClick={() => setOrderSuccessPopup(false)}>
                Continue Shopping
              </button>
              <a 
                href={`https://wa.me/923002347457?text=${encodeURIComponent(`Hello EarthyElectronics, I placed order #${placedOrderInfo?.orderNumber || ''}. Can you please confirm?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cart-wa-checkout"
                style={{ justifyContent: 'center', padding: '10px', fontSize: '13px' }}
              >
                <MessageCircle size={16} /> Track on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

