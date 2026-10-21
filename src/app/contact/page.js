import { supabase } from '@/lib/supabase';
import { MessageSquare, Camera, Mail, MapPin, Navigation, ExternalLink } from 'lucide-react';
import { generateWhatsAppUrl } from '@/lib/utils';

export const metadata = {
  title: 'Contact Us — Rinjani Clothing',
  description: 'Hubungi admin Rinjani Clothing melalui WhatsApp, Instagram, email, atau kunjungi lokasi workshop di Google Maps.',
};

async function getContactSettings() {
  try {
    const { data: settings } = await supabase
      .from('SiteSettings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();
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
  const emailAddress = settings?.email || 'rinjaniclothing17@gmail.com';
  const mapsUrl = 'https://maps.app.goo.gl/fGNRs9wzCHdDmPgH9?g_st=iw';
  const addressText = settings?.address || 'Tomoni Timur, Kec. Tomoni, Kab. Luwu Timur, Sulawesi Selatan';
  const waUrl = generateWhatsAppUrl(waNumber, 'Halo Rinjani Clothing, saya ingin bertanya mengenai produk.');

  return (
    <div className="container" style={{ paddingBottom: '96px' }}>
      <div className="contact-hero">
        <div className="section-label">HUBUNGI KAMI</div>
        <h1 className="contact-hero-title">LET&apos;S TALK.</h1>
        <p className="contact-hero-text">
          Punya pertanyaan seputar ukuran, ketersediaan stok, pesanan custom, atau ingin berkunjung langsung ke workshop kami? Tim kami siap melayani Anda.
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
        {emailAddress && (
          <a
            href={`mailto:${emailAddress}`}
            className="contact-channel"
          >
            <div className="contact-channel-icon" style={{ backgroundColor: '#111', color: '#FFF' }}>
              <Mail size={24} />
            </div>
            <div>
              <div className="contact-channel-name">Email Support</div>
              <div className="contact-channel-value">{emailAddress}</div>
            </div>
          </a>
        )}

        {/* GOOGLE MAPS */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-channel"
        >
          <div className="contact-channel-icon" style={{ backgroundColor: '#EA4335', color: '#FFF' }}>
            <MapPin size={24} />
          </div>
          <div>
            <div className="contact-channel-name">Google Maps</div>
            <div className="contact-channel-value">Tomoni Timur, Luwu Timur</div>
          </div>
        </a>
      </div>

      {/* SECTION DETAIL LOKASI & INTERACTIVE MAP EMBED */}
      <div
        style={{
          marginTop: '48px',
          border: '1px solid var(--color-gray-200)',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '32px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '24px',
            borderBottom: '1px solid var(--color-gray-200)',
          }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', maxWidth: '640px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#111',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MapPin size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.08em', color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>
                Workshop & Store Headquarter
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: '#111' }}>
                RINJANI CLOTHING
              </h3>
              <p style={{ color: '#555', fontSize: '0.9375rem', lineHeight: '1.6', margin: 0 }}>
                {addressText}
              </p>
              <p style={{ color: '#888', fontSize: '0.8125rem', marginTop: '6px' }}>
                Koordinat GPS: <strong>-2.4362080, 120.8889128</strong>
              </p>
            </div>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 24px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.875rem',
              letterSpacing: '0.04em',
            }}
          >
            <Navigation size={16} />
            BUKA DI GOOGLE MAPS
            <ExternalLink size={14} style={{ opacity: 0.7 }} />
          </a>
        </div>

        {/* GOOGLE MAPS EMBEDDED IFRAME */}
        <div style={{ position: 'relative', width: '100%', height: '400px', backgroundColor: '#F3F4F6' }}>
          <iframe
            title="Lokasi Rinjani Clothing di Google Maps"
            src="https://maps.google.com/maps?q=-2.4362080,120.8889128&hl=id&z=15&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0, display: 'block' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
