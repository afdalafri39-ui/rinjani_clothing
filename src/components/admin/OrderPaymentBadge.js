'use client';

import { useMemo } from 'react';
import { CheckCircle2, Clock, Banknote, QrCode, Wallet, Landmark, CreditCard } from 'lucide-react';
import { getOrderPaymentBadgeInfo } from '@/lib/paymentUtils';

export default function OrderPaymentBadge({ order, showMethod = true }) {
  const badgeInfo = useMemo(() => getOrderPaymentBadgeInfo(order), [order]);

  const IconComponent = useMemo(() => {
    if (badgeInfo.status === 'LUNAS') return CheckCircle2;
    if (badgeInfo.status === 'DP') return Clock;
    if (badgeInfo.status === 'LEBIH_BAYAR') return CheckCircle2;
    return Banknote;
  }, [badgeInfo.status]);

  return (
    <span
      className="order-payment-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 8px',
        fontSize: '0.6875rem',
        fontWeight: 600,
        borderRadius: '4px',
        backgroundColor: badgeInfo.bg,
        color: badgeInfo.color,
        border: `1px solid ${badgeInfo.border}`,
        whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
      }}
      title={`Status Pembayaran: ${badgeInfo.status} (${badgeInfo.methodText})`}
    >
      <IconComponent size={12} style={{ flexShrink: 0 }} />
      <span>{showMethod ? badgeInfo.badgeText : badgeInfo.shortText}</span>
    </span>
  );
}
