import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, CheckCircle2, AlertCircle, MessageCircle, ArrowLeft, ShieldCheck, Truck, Trash2, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import emailjs from '@emailjs/browser';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartCount, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();

  const [orderName, setOrderName] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  // If user is logged in, prefill their details for convenience
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        if (user.name) setOrderName(user.name);
        if (user.email) setOrderEmail(user.email);
      }
    } catch {}
  }, []);

  // Strict email validation
  const validateEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email.trim());
  };

  // Strict phone validation (Pakistan 03xx-xxxxxxx, +923..., 923... or international 10-15 digits)
  const validatePhone = (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    const clean = phone.trim().replace(/[\s\-\(\)]/g, '');
    if (!/^\+?[0-9]{10,15}$/.test(clean)) return false;
    if (clean.startsWith('03')) return /^03[0-9]{9}$/.test(clean);
    if (clean.startsWith('+923')) return /^\+923[0-9]{9}$/.test(clean);
    if (clean.startsWith('923')) return /^923[0-9]{9}$/.test(clean);
    return clean.length >= 10 && clean.length <= 15;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Validate fields strictly - email & phone are compulsory and must be valid!
    const newErrors = {};
    if (!orderName.trim()) {
      newErrors.name = 'Full name is required.';
    }
    if (!orderEmail.trim()) {
      newErrors.email = 'Email address is compulsory / required.';
    } else if (!validateEmail(orderEmail)) {
      newErrors.email = 'Please enter a valid email address (e.g. name@gmail.com).';
    }

    if (!orderPhone.trim()) {
      newErrors.phone = 'Phone number is compulsory / required.';
    } else if (!validatePhone(orderPhone)) {
      newErrors.phone = 'Please enter a valid phone number (e.g. 0300-1234567).';
    }

    if (!orderAddress.trim()) {
      newErrors.address = 'Delivery address is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      const trimmedName = orderName.trim();
      const trimmedEmail = orderEmail.trim().toLowerCase();
      const trimmedPhone = orderPhone.trim();
      const trimmedAddress = orderAddress.trim();
      const orderNumber = 'EE-' + Math.floor(100000 + Math.random() * 900000);

      const itemsList = cartItems
        .map(i => `- ${i.name} (Qty: ${i.quantity}) - Rs. ${((i.discountPrice || i.price) * i.quantity).toLocaleString()}`)
        .join('\n');

      const emailMessage = `
NEW ORDER RECEIVED!
--------------------------
Order #: ${orderNumber}
Customer Name: ${trimmedName}
Email: ${trimmedEmail}
Phone Number: ${trimmedPhone}
Delivery Address: ${trimmedAddress}
Order Notes: ${orderNotes.trim() || 'None'}

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
        notes: orderNotes.trim(),
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

      // 1. Cache to local storage
      try {
        const rawLocal = localStorage.getItem('earthy_user_orders');
        const existingLocal = rawLocal ? JSON.parse(rawLocal) : [];
        existingLocal.unshift(orderRecord);
        localStorage.setItem('earthy_user_orders', JSON.stringify(existingLocal));
      } catch (storageErr) {
        console.warn('Could not cache order locally:', storageErr);
      }

      // 2. Dispatch to backend API
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

      // 3. EmailJS notification
      try {
        await emailjs.send(
          'service_5e6fcjm',
          'template_2pedukm',
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
          'ehutdzjr0maqm0s_U'
        );
      } catch (emailErr) {
        console.warn('EmailJS notification notice:', emailErr);
      }

      setPlacedOrderDetails({
        orderNumber,
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        address: trimmedAddress,
        total: cartTotal,
        itemCount: cartCount
      });

      clearCart();
      setOrderPlaced(true);
      window.scrollTo({ top: 80, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert('Error placing order. Please check your internet connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppCheckout = () => {
    let text = "Hello EarthyElectronics! I want to place an order:\n\n";
    if (orderName) text += `*Name:* ${orderName}\n`;
    if (orderEmail) text += `*Email:* ${orderEmail}\n`;
    if (orderPhone) text += `*Phone:* ${orderPhone}\n`;
    if (orderAddress) text += `*Address:* ${orderAddress}\n\n`;
    text += "*Items Ordered:*\n";
    cartItems.forEach(i => {
      text += `- ${i.name} (${i.quantity}x) = Rs. ${((i.discountPrice || i.price) * i.quantity).toLocaleString()}\n`;
    });
    text += `\n*Total Amount: Rs. ${cartTotal.toLocaleString()}*`;
    window.open(`https://wa.me/923002347457?text=${encodeURIComponent(text)}`, '_blank');
  };

  // If order was successfully placed, render Order Confirmation View
  if (orderPlaced && placedOrderDetails) {
    return (
      <div className="checkout-page-wrapper">
        <div className="checkout-page-container">
          <div className="checkout-success-view">
            <div className="checkout-success-icon">
              <CheckCircle2 size={48} />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#064e3b', marginBottom: '8px' }}>
              Order Confirmed!
            </h1>
            <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
              Thank you for shopping with <strong>EarthyElectronics</strong>. Your order has been registered and our sales team has received your order details.
            </p>

            <div className="checkout-success-box">
              <div className="checkout-success-row">
                <span style={{ color: '#64748b' }}>Order Number:</span>
                <strong>{placedOrderDetails.orderNumber}</strong>
              </div>
              <div className="checkout-success-row">
                <span style={{ color: '#64748b' }}>Confirmation Sent To:</span>
                <strong>{placedOrderDetails.email}</strong>
              </div>
              <div className="checkout-success-row">
                <span style={{ color: '#64748b' }}>Contact Phone:</span>
                <strong>{placedOrderDetails.phone}</strong>
              </div>
              <div className="checkout-success-row">
                <span style={{ color: '#64748b' }}>Delivery Address:</span>
                <span>{placedOrderDetails.address}</span>
              </div>
              <div className="checkout-success-row" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '6px' }}>
                <span style={{ fontWeight: '700' }}>Total Amount:</span>
                <strong style={{ color: '#059669', fontSize: '16px' }}>Rs. {placedOrderDetails.total.toLocaleString()} (COD)</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => navigate('/products')} className="checkout-submit-btn">
                Continue Shopping
              </button>
              <a
                href={`https://wa.me/923002347457?text=${encodeURIComponent(`Hello EarthyElectronics, I just placed order #${placedOrderDetails.orderNumber}. Can you please confirm the delivery time?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="checkout-wa-btn"
              >
                <MessageCircle size={18} /> Track / Confirm on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page-wrapper">
        <div className="checkout-page-container">
          <div className="checkout-empty-view">
            <ShoppingCart size={64} strokeWidth={1.5} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Your cart is empty</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
              Please add items to your cart before proceeding to checkout.
            </p>
            <button onClick={() => navigate('/products')} className="checkout-submit-btn" style={{ maxWidth: '240px', margin: '0 auto' }}>
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-wrapper">
      <div className="checkout-page-container">
        <button
          onClick={() => navigate('/products')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '20px', fontSize: '13px', fontWeight: '600' }}
        >
          <ArrowLeft size={16} /> Continue Shopping
        </button>

        <h1 className="checkout-header-title">Checkout & Order Placement</h1>
        <p className="checkout-header-subtitle">
          Complete your order with Cash on Delivery. No advance payment required.
        </p>

        <div className="checkout-grid">
          {/* Left Column: Delivery & Contact Details Form */}
          <div className="checkout-card">
            <div className="checkout-card-header">
              <h2>Delivery & Contact Details</h2>
              <span className="checkout-badge-guest">Guest Checkout Enabled</span>
            </div>

            {/* Error Banner */}
            {Object.keys(errors).length > 0 && (
              <div className="checkout-error-banner">
                <span className="checkout-error-banner-icon">⚠️</span>
                <div className="checkout-error-banner-content">
                  <strong>Please complete all compulsory fields:</strong>
                  <p>Valid Email Address and valid Phone Number are required to accept your order.</p>
                </div>
              </div>
            )}

            <form onSubmit={handlePlaceOrder} noValidate>
              {/* Full Name */}
              <div className="checkout-field-group">
                <label className="checkout-label">
                  <span>Full Name <span className="checkout-label-tag required">*</span></span>
                </label>
                <input
                  type="text"
                  className={`checkout-input ${errors.name ? 'has-error' : ''}`}
                  value={orderName}
                  onChange={e => {
                    setOrderName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                  }}
                  placeholder="e.g. Muhammad Ahmed"
                />
                {errors.name && <div className="checkout-error-msg">⚠️ {errors.name}</div>}
              </div>

              {/* Compulsory Email */}
              <div className="checkout-field-group">
                <label className="checkout-label">
                  <span>Email Address <span className="checkout-label-tag required">* (Compulsory)</span></span>
                  <span className="checkout-helper-text" style={{ margin: 0, color: '#059669', fontWeight: '500' }}>For invoice & confirmation</span>
                </label>
                <input
                  type="email"
                  className={`checkout-input ${errors.email ? 'has-error' : ''}`}
                  value={orderEmail}
                  onChange={e => {
                    setOrderEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                  }}
                  placeholder="name@example.com"
                />
                {errors.email ? (
                  <div className="checkout-error-msg">⚠️ {errors.email}</div>
                ) : (
                  <div className="checkout-helper-text">Valid email is required. We will send your order confirmation here.</div>
                )}
              </div>

              {/* Compulsory Phone */}
              <div className="checkout-field-group">
                <label className="checkout-label">
                  <span>Phone Number <span className="checkout-label-tag required">* (Compulsory)</span></span>
                  <span className="checkout-helper-text" style={{ margin: 0, color: '#059669', fontWeight: '500' }}>For delivery verification</span>
                </label>
                <input
                  type="tel"
                  className={`checkout-input ${errors.phone ? 'has-error' : ''}`}
                  value={orderPhone}
                  onChange={e => {
                    setOrderPhone(e.target.value);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                  }}
                  placeholder="0300-1234567"
                />
                {errors.phone ? (
                  <div className="checkout-error-msg">⚠️ {errors.phone}</div>
                ) : (
                  <div className="checkout-helper-text">Valid mobile number (e.g. 03xx-xxxxxxx). Delivery agent will call before dispatch.</div>
                )}
              </div>

              {/* Delivery Address */}
              <div className="checkout-field-group">
                <label className="checkout-label">
                  <span>Complete Delivery Address <span className="checkout-label-tag required">*</span></span>
                </label>
                <textarea
                  className={`checkout-textarea ${errors.address ? 'has-error' : ''}`}
                  rows="3"
                  value={orderAddress}
                  onChange={e => {
                    setOrderAddress(e.target.value);
                    if (errors.address) setErrors(prev => ({ ...prev, address: null }));
                  }}
                  placeholder="House/Apartment #, Street, Block, Area, City"
                />
                {errors.address && <div className="checkout-error-msg">⚠️ {errors.address}</div>}
              </div>

              {/* Order Notes (Optional) */}
              <div className="checkout-field-group">
                <label className="checkout-label">
                  <span>Order Notes / Instructions <span className="checkout-label-tag optional">(Optional)</span></span>
                </label>
                <textarea
                  className="checkout-textarea"
                  rows="2"
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  placeholder="Any special instructions for delivery or packaging..."
                />
              </div>

              <button
                type="submit"
                className="checkout-submit-btn"
                disabled={submitting}
              >
                <Zap size={18} />
                {submitting ? 'Placing Order...' : `Confirm Order — Rs. ${cartTotal.toLocaleString()}`}
              </button>

              <button
                type="button"
                className="checkout-wa-btn"
                onClick={handleWhatsAppCheckout}
              >
                <MessageCircle size={18} />
                Order via WhatsApp Instead
              </button>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="checkout-summary-card">
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={18} /> Order Summary ({cartCount} {cartCount === 1 ? 'item' : 'items'})
            </h2>

            <div className="checkout-items-list">
              {cartItems.map(item => (
                <div key={item.id} className="checkout-item-row">
                  <img
                    src={item.image || '/images/cat_washer.png'}
                    alt={item.name}
                    className="checkout-item-img"
                    onError={e => { e.target.onerror = null; e.target.src = '/images/cat_washer.png'; }}
                  />
                  <div className="checkout-item-info">
                    <div className="checkout-item-name" title={item.name}>{item.name}</div>
                    <div className="checkout-item-meta">Qty: {item.quantity} × Rs. {((item.discountPrice || item.price)).toLocaleString()}</div>
                  </div>
                  <div className="checkout-item-price">
                    Rs. {((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                  </div>
                  <button
                    className="checkout-item-remove"
                    title="Remove item"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="checkout-totals-box">
              <div className="checkout-totals-row">
                <span>Subtotal</span>
                <span>Rs. {cartTotal.toLocaleString()}</span>
              </div>
              <div className="checkout-totals-row delivery">
                <span>Delivery Charges</span>
                <span>FREE</span>
              </div>
              <div className="checkout-totals-row grand-total">
                <span>Total Amount</span>
                <span>Rs. {cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="checkout-payment-badge">
              <ShieldCheck size={20} color="#059669" />
              <span>Payment Mode: Cash on Delivery (COD)</span>
            </div>

            <div className="checkout-trust-badges">
              <div className="checkout-trust-item">
                <Truck size={16} color="#0284c7" />
                <span>Fast Nationwide Delivery</span>
              </div>
              <div className="checkout-trust-item">
                <ShieldCheck size={16} color="#059669" />
                <span>100% Genuine Brand Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
