import React from 'react';
import './FloatingWhatsApp.css';

export default function FloatingWhatsApp() {
  const phone = '923002347457';
  const defaultMessage = 'Assalam o Alaikum! I want to inquire about products at EarthyElectronics.';
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-wa-btn"
      aria-label="Chat with EarthyElectronics on WhatsApp"
      title="Chat on WhatsApp"
    >
      <span className="floating-wa-pulse" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="30"
        height="30"
        fill="currentColor"
      >
        <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.908.534 3.69 1.46 5.215L2.08 22l4.908-1.328a9.96 9.96 0 0 0 5.043 1.359h.004c5.535 0 10.031-4.495 10.031-10.031 0-2.678-1.043-5.197-2.936-7.09A9.957 9.957 0 0 0 12.031 2zm0 18.363h-.003a8.318 8.318 0 0 1-4.24-1.164l-.304-.18-3.155.854.845-3.076-.197-.314a8.307 8.307 0 0 1-1.274-4.452c0-4.597 3.741-8.338 8.341-8.338 2.227 0 4.321.868 5.895 2.443a8.286 8.286 0 0 1 2.442 5.897c-.001 4.599-3.743 8.338-8.344 8.338zm4.571-6.241c-.25-.125-1.48-.73-1.71-.813-.23-.083-.397-.125-.564.125-.167.25-.646.813-.792.98-.146.166-.292.187-.542.062s-1.058-.39-2.016-1.244c-.745-.665-1.248-1.487-1.394-1.737-.146-.25-.016-.385.109-.509.112-.112.25-.291.375-.437.125-.146.167-.25.25-.417.083-.166.042-.312-.021-.437-.062-.125-.563-1.354-.771-1.854-.203-.487-.41-.421-.564-.429l-.481-.008c-.167 0-.438.063-.667.312-.229.25-.875.854-.875 2.083s.896 2.417 1.021 2.583c.125.167 1.763 2.693 4.271 3.777.597.258 1.063.412 1.427.528.6.191 1.146.164 1.578.1.481-.072 1.48-.604 1.688-1.188.208-.583.208-1.083.146-1.188-.063-.104-.229-.167-.479-.292z"/>
      </svg>
      <span className="floating-wa-tooltip">Chat on WhatsApp</span>
    </a>
  );
}
