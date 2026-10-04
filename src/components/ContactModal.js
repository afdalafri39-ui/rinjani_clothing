'use client';

import { useState, useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { generateOrderMessage, generateWhatsAppUrl } from '@/lib/utils';

export default function ContactModal({ isOpen, onClose, productData = null }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          setSettings(data.settings);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Fetch settings error:', err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  const messageData = productData
    ? {
        product_name: productData.name,
        product_url: currentUrl,
        product_slug: productData.slug,
        price: productData.price,
        size: productData.selectedSize || '-',
        color: productData.selectedColor || '-',
        quantity: productData.quantity || 1,
      }
    : {
        product_name: 'Tanya Produk / Informasi',
        product_url: currentUrl,
      };

  const message = generateOrderMessage(settings?.orderMessageTemplate, messageData);
  const waUrl = settings?.whatsappNumber
    ? generateWhatsAppUrl(settings.whatsappNumber, message)
    : '#';

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Hubungi Admin</h3>
          <button className="modal-close" onClick={onClose} aria-label="Tutup Modal">
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '20px' }}>
          Pilih kanal komunikasi untuk melakukan pemesanan atau bertaut langsung dengan customer service kami.
        </p>

        {loading ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#666' }}>
            Memuat kanal komunikasi...
          </div>
        ) : (
          <div className="modal-options">
            {settings?.whatsappEnabled && settings?.whatsappNumber && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-option"
              >
                <div className="modal-option-icon" style={{ backgroundColor: '#25D366', color: '#FFF' }}>
                  <MessageSquare size={20} />
                </div>
                <div className="modal-option-text">
                  <div className="modal-option-title">WhatsApp</div>
                  <div className="modal-option-desc">Order otomatis lewat WhatsApp chat</div>
                </div>
              </a>
            )}

            {!settings?.whatsappEnabled && (
              <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
                Tidak ada kanal komunikasi aktif saat ini.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
