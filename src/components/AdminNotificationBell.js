'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ClipboardList, ShoppingBag, CheckCheck, Trash2 } from 'lucide-react';

export default function AdminNotificationBell() {
  const [data, setData] = useState({
    totalNewCount: 0,
    customNewCount: 0,
    productNewCount: 0,
    recentNewOrders: [],
  });
  const [readIds, setReadIds] = useState([]);
  const [clearedIds, setClearedIds] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  // Load read and cleared states from localStorage on mount
  useEffect(() => {
    try {
      const storedRead = localStorage.getItem('rinjani_admin_read_notifs');
      if (storedRead) setReadIds(JSON.parse(storedRead));
      const storedCleared = localStorage.getItem('rinjani_admin_cleared_notifs');
      if (storedCleared) setClearedIds(JSON.parse(storedCleared));
    } catch (err) {
      console.error('Error loading stored notifications state:', err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 20000);
    return () => clearInterval(timer);
  }, [fetchNotifications, pathname]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Filter visible and unread orders based on local state
  const visibleOrders = (data.recentNewOrders || []).filter(
    (order) => !clearedIds.includes(order.id)
  );

  const unreadOrders = visibleOrders.filter(
    (order) => !readIds.includes(order.id)
  );

  const unreadCount = unreadOrders.length;
  const hasUnread = unreadCount > 0;

  // Mark all currently visible orders as read
  const handleMarkAllRead = () => {
    const allIds = visibleOrders.map((o) => o.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    try {
      localStorage.setItem('rinjani_admin_read_notifs', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  // Clear/delete all currently visible notifications
  const handleClearAll = () => {
    const allIds = visibleOrders.map((o) => o.id);
    const updated = Array.from(new Set([...clearedIds, ...allIds]));
    setClearedIds(updated);
    try {
      localStorage.setItem('rinjani_admin_cleared_notifs', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  // Mark single item as read when clicked
  const handleItemClick = (orderId) => {
    if (!readIds.includes(orderId)) {
      const updated = [...readIds, orderId];
      setReadIds(updated);
      try {
        localStorage.setItem('rinjani_admin_read_notifs', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }
    setIsOpen(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Notification Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifikasi Pesanan"
        title={hasUnread ? `${unreadCount} pesanan baru belum dibaca!` : 'Notifikasi'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '6px',
          border: hasUnread ? '1px solid #EF4444' : '1px solid #E5E5E2',
          backgroundColor: hasUnread ? '#FEF2F2' : '#FFFFFF',
          color: hasUnread ? '#B91C1C' : '#333333',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.8125rem',
          transition: 'all 0.15s ease',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Bell size={16} style={{ color: hasUnread ? '#DC2626' : '#666666' }} />
          {hasUnread && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
          )}
        </div>
        <span>Notifikasi</span>
        {hasUnread ? (
          <span
            style={{
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '999px',
              minWidth: '18px',
              textAlign: 'center',
              lineHeight: '16px',
            }}
          >
            {unreadCount}
          </span>
        ) : (
          <span
            style={{
              backgroundColor: '#F1F1EF',
              color: '#888888',
              fontSize: '0.6875rem',
              fontWeight: 500,
              padding: '1px 6px',
              borderRadius: '999px',
            }}
          >
            0
          </span>
        )}
      </button>

      {/* Notification Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '360px',
            maxWidth: 'calc(100vw - 32px)',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E5E2',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06)',
            zIndex: 150,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid #E5E5E2',
              backgroundColor: '#FAF9F6',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111111' }}>
              Pesanan Masuk
            </div>
            {hasUnread ? (
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                {unreadCount} Baru
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#888888' }}>
                Semua Dibaca
              </span>
            )}
          </div>

          {/* List of Orders */}
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {visibleOrders.length === 0 ? (
              <div
                style={{
                  padding: '36px 16px',
                  textAlign: 'center',
                  color: '#888888',
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                  <Bell size={28} style={{ opacity: 0.3 }} />
                </div>
                Belum ada pesan notifikasi baru.
              </div>
            ) : (
              visibleOrders.map((order) => {
                const isCustom = order.type === 'CUSTOM';
                const isRead = readIds.includes(order.id);

                return (
                  <Link
                    key={`${order.type}_${order.id}`}
                    href={order.url}
                    onClick={() => handleItemClick(order.id)}
                    style={{
                      display: 'block',
                      padding: '12px 16px',
                      borderBottom: '1px solid #F1F1EF',
                      textDecoration: 'none',
                      color: 'inherit',
                      backgroundColor: isRead ? '#FFFFFF' : '#FFFDF7',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F5F5F3';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isRead ? '#FFFFFF' : '#FFFDF7';
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: isCustom ? '#EEF2FF' : '#ECFDF5',
                            color: isCustom ? '#4338CA' : '#047857',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isCustom ? <ClipboardList size={11} /> : <ShoppingBag size={11} />}
                          {order.typeLabel}
                        </span>
                        {!isRead && (
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: '#EF4444',
                              display: 'inline-block',
                            }}
                            title="Belum dibaca"
                          />
                        )}
                      </div>
                      <span style={{ fontSize: '0.6875rem', color: '#888888' }}>
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: isRead ? 500 : 700,
                        color: isRead ? '#444444' : '#111111',
                        marginBottom: '2px',
                      }}
                    >
                      {order.customerName}{' '}
                      <span style={{ fontWeight: 400, color: '#888888', fontSize: '0.75rem' }}>
                        ({order.orderNumber})
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#666662',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>
                        {order.itemTitle} · {order.quantity} pcs
                      </span>
                      <span style={{ color: '#3B82F6', fontWeight: 600, fontSize: '0.6875rem' }}>
                        Buka &rarr;
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer Actions: Tandai Semua (Dibaca) & Hapus Pesan */}
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: '#FAF9F6',
              borderTop: '1px solid #E5E5E2',
              display: 'flex',
              gap: '12px',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={visibleOrders.length === 0 || unreadCount === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: unreadCount > 0 ? '#1D4ED8' : '#9CA3AF',
                fontWeight: 600,
                cursor: unreadCount > 0 ? 'pointer' : 'not-allowed',
                padding: '4px 6px',
                borderRadius: '4px',
                fontSize: '0.75rem',
              }}
              title="Tandai semua notifikasi pesanan telah dibaca"
            >
              <CheckCheck size={14} />
              Tandai Semua (Dibaca)
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              disabled={visibleOrders.length === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: visibleOrders.length > 0 ? '#DC2626' : '#9CA3AF',
                fontWeight: 600,
                cursor: visibleOrders.length > 0 ? 'pointer' : 'not-allowed',
                padding: '4px 6px',
                borderRadius: '4px',
                fontSize: '0.75rem',
              }}
              title="Hapus semua pesan notifikasi dari daftar"
            >
              <Trash2 size={14} />
              Hapus Pesan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
