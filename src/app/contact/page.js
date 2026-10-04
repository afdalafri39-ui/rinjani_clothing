import { prisma } from '@/lib/prisma';
import { MessageSquare, Camera, Mail, MapPin } from 'lucide-react';
import { generateWhatsAppUrl } from '@/lib/utils';

export const metadata = {
  title: 'Contact Us — Rinjani Clothing',
  description: 'Hubungi admin Rinjani Clothing melalui WhatsApp, Instagram, atau email.',
};

async function getContactSettings() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });
    return settings;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default async function ContactPage() {
  const settings = await getContactSettings();

  const waNumber = settings?.whatsappNumber || '6281369876282';
  const igUrl = settings?.instagramUrl || 'http://instagram.com/rinjani.clothing';
  const waUrl = generateWhatsAppUrl(waNumber, 'Halo Rinjani Clothing, saya ingin bertanya mengenai produk.');

  return (
    <div className="container" style={{ paddingBottom: '96px' }}>
      <div className="contact-hero">
        <div className="section-label">HUBUNGI KAMI</div>
        <h1 className="contact-hero-title">LET&apos;S TALK.</h1>
        <p className="contact-hero-text">
          Punya pertanyaan seputar ukuran, ketersediaan stok, atau pesanan custom? Tim customer service kami siap membantu Anda.
        </p>
      </div>

      <div className="contact-channels">
        {/* WHATSAPP */}
        {settings?.whatsappEnabled !== false && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-channel"
          >
            <div className="contact-channel-icon" style={{ backgroundColor: '#25D366', color: '#FFF' }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <div className="contact-channel-name">WhatsApp Chat</div>
              <div className="contact-channel-value">+{waNumber}</div>
            </div>
          </a>
        )}

        {/* INSTAGRAM */}
        {igUrl && (
          <a
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-channel"
          >
            <div className="contact-channel-icon" style={{ backgroundColor: '#E1306C', color: '#FFF' }}>
              <Camera size={24} />
            </div>
            <div>
              <div className="contact-channel-name">Instagram</div>
              <div className="contact-channel-value">@rinjani.clothing</div>
            </div>
          </a>
        )}

        {/* EMAIL */}
        {settings?.email && (
          <a
            href={`mailto:${settings.email}`}
            className="contact-channel"
          >
            <div className="contact-channel-icon" style={{ backgroundColor: '#111', color: '#FFF' }}>
              <Mail size={24} />
            </div>
            <div>
              <div className="contact-channel-name">Email Support</div>
              <div className="contact-channel-value">{settings.email}</div>
            </div>
          </a>
        )}
      </div>

      {settings?.address && (
        <div style={{ marginTop: '48px', padding: '32px', border: '1px solid var(--color-gray-200)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <MapPin size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px' }}>LOKASI & HEADQUARTER</h3>
            <p style={{ color: '#666', fontSize: '0.9375rem', lineHeight: '1.6' }}>{settings.address}</p>
          </div>
        </div>
      )}
    </div>
  );
}
