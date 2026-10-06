import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle } from 'lucide-react';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newTicket = {
      id: 'TCK-' + Date.now().toString().slice(-6),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
      date: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }),
      status: 'new'
    };

    try {
      const existing = JSON.parse(localStorage.getItem('earthy_support_tickets') || '[]');
      localStorage.setItem('earthy_support_tickets', JSON.stringify([newTicket, ...existing]));
      window.dispatchEvent(new Event('ticketsUpdated'));
    } catch (err) {
      console.error(err);
    }

    // Attempt backend sync
    const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
    fetch(`${API}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTicket)
    }).catch(() => {});

    setSubmitted(true);
    // Clear form
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page-container container section-padding">
      <div className="page-header">
        <h1 className="text-gradient">Get In Touch</h1>
        <p>Have questions about DC inverter compatibility, specs, or ordering? Reach out directly.</p>
      </div>

      <div className="contact-layout">
        {/* Contact info column */}
        <aside className="contact-info-panel glass-panel" data-aos="fade-right">
          <h3>Customer Support Channels</h3>
          <p>Choose the method that works best for you. Our Karachi offices respond within minutes.</p>

          <div className="support-channels-list">
            <div className="channel-item">
              <div className="channel-icon"><Phone size={20} /></div>
              <div className="channel-details">
                <h4>Call Support</h4>
                <a href="tel:+923002347457">0300-2347457</a>
                <span>Available Mon - Sat (11am - 9pm)</span>
              </div>
            </div>

            <div className="channel-item">
              <div className="channel-icon"><Mail size={20} /></div>
              <div className="channel-details">
                <h4>Email Support</h4>
                <a href="mailto:earthyelectronics2026@gmail.com">earthyelectronics2026@gmail.com</a>
                <span>We answer within 24 hours</span>
              </div>
            </div>

            <div className="channel-item">
              <div className="channel-icon"><MessageSquare size={20} style={{ color: '#25d366' }} /></div>
              <div className="channel-details">
                <h4>WhatsApp Sales Desk</h4>
                <a 
                  href="https://wa.me/923002347457?text=Hi%20EarthyElectronics,%20I%20have%20a%20sales%20query."
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="whatsapp-link-text"
                >
                  Start Live Chat
                </a>
                <span>Best for instant stock confirmation</span>
              </div>
            </div>

            <div className="channel-item">
              <div className="channel-icon"><Clock size={20} /></div>
              <div className="channel-details">
                <h4>Office Hours</h4>
                <span>Mon - Sat: 11:00 AM - 9:00 PM</span>
                <span>Sunday: Closed (Online WhatsApp active for bookings)</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Contact form column */}
        <main className="contact-form-panel glass-panel" data-aos="fade-left">
          {submitted ? (
            <motion.div 
              className="submission-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <CheckCircle size={56} className="success-icon" />
              <h3>Message Sent Successfully!</h3>
              <p>Thank you for contacting EarthyElectronics. Your message has been routed to our Regal Showroom Support Desk and a specialist will reach out to you shortly.</p>
              <button className="btn btn-primary" onClick={() => setSubmitted(false)}>Send Another Message</button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <h3>Submit a Support Ticket</h3>
              <p>Fill out this form and our Regal showroom support desk will receive your request directly.</p>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Your Full Name</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                    className="input-field" 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="name@email.com"
                    className="input-field" 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0300-1234567"
                    className="input-field" 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Inquiry Subject</label>
                  <input 
                    type="text" 
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="AC Tonnage, LED stock query..."
                    className="input-field" 
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="message">Detailed Message</label>
                <textarea 
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Explain your appliance model query, branch check, or price offer..."
                  className="input-field" 
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-submit">
                <Send size={18} />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </main>
      </div>

      {/* Showroom Map Section */}
      <section className="mock-map-section section-padding">
        <div className="glass-panel text-center map-box">
          <MapPin size={36} className="map-icon" style={{ color: '#065f46' }} />
          <h3>Visit Our Regal Market Showroom</h3>
          <p>We are centrally located in Karachi's prime electronics hub with easy accessibility.</p>
          <div className="map-placeholder-media" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="map-point" style={{ maxWidth: '580px', width: '100%', textAlign: 'left', padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <MapPin size={22} color="#10b981" />
                <h4 style={{ margin: 0, fontSize: '18px', color: '#065f46' }}>Regal Market Flagship Showroom</h4>
              </div>
              <p style={{ margin: '6px 0', fontSize: '14px', color: '#334155', fontWeight: '500' }}>
                Shop #12, Beauty House, Near Regal Market, Saddar, Karachi.
              </p>
              <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                <span>📞 <strong>0300-2347457</strong></span>
                <span>⏰ <strong>Mon - Sat: 11:00 AM - 9:00 PM</strong></span>
                <span>📍 <strong>Landmark: Regal Chowk, Saddar</strong></span>
              </div>
              <div style={{ marginTop: '16px' }}>
                <a 
                  href="https://maps.google.com/?q=Regal+Market+Saddar+Karachi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', textDecoration: 'none' }}
                >
                  <MapPin size={14} /> Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;


