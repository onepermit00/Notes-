import React from 'react';
import { ArrowLeft, CreditCard, DollarSign, Calendar, ChevronRight, TrendingUp } from 'lucide-react';
import { UserRole } from '../../types';
import { useTheme } from '../../context/ThemeContext';

const INTER = "'Inter','Plus Jakarta Sans',sans-serif";
const GREEN = '#2E9E5B';
const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`;

const glassCard = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
  borderRadius: 16,
};

const glass = (opacity = 0.88, blur = 24) => ({
  background: `rgba(14,14,18,${opacity})`,
  backdropFilter: `blur(${blur}px)`,
  WebkitBackdropFilter: `blur(${blur}px)`,
  border: '1px solid rgba(255,255,255,0.09)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
});

export const AccountsPage = ({ onBack, role }) => {
  const { colors } = useTheme();
  const { MUTED, TEXT, BORDER } = colors;

  const isCaregiver = role === UserRole.CAREGIVER;
  const accent      = isCaregiver ? GREEN : '#3A7BD5';
  const BG          = isCaregiver
    ? 'radial-gradient(ellipse at 20% 0%, rgba(46,158,91,0.22) 0%, transparent 55%), #080810'
    : 'radial-gradient(ellipse at 20% 0%, rgba(58,123,213,0.22) 0%, transparent 55%), #080810';

  // On this page the text is always white-on-dark (dark glass card design)
  const mutedText = 'rgba(255,255,255,0.4)';

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: INTER, position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: GRAIN, backgroundSize: '200px', opacity: 0.18, pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, ...glass(0.9, 20), padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 10, borderBottom: `1px solid ${BORDER}` }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: mutedText, display: 'flex', padding: 4 }}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ fontFamily: INTER, fontSize: '1.2rem', color: 'white', letterSpacing: '-0.02em' }}>
          {isCaregiver ? 'Earnings' : 'Billing'}
        </h1>
      </div>

      <div style={{ padding: '20px 20px 80px', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', zIndex: 1 }}>

        {/* Balance Card */}
        <div style={{ borderRadius: 20, padding: 24, background: isCaregiver ? GREEN : accent, boxShadow: `0 8px 32px ${accent}40` }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>
            {isCaregiver ? 'Available Balance' : 'Current Balance'}
          </p>
          <p style={{ fontSize: 40, fontWeight: 700, color: 'white', letterSpacing: '-0.03em', marginBottom: 20 }}>
            {isCaregiver ? '$1,247.50' : '$0.00'}
          </p>
          {isCaregiver ? (
            <button style={{ width: '100%', padding: '14px 0', background: 'white', border: 'none', borderRadius: 12, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: GREEN, cursor: 'pointer' }}>
              Withdraw Funds
            </button>
          ) : (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>No outstanding balance</p>
          )}
        </div>

        {/* Quick Stats */}
        {isCaregiver && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[
              { icon: Calendar,   label: 'This Week',  value: '$485.00'   },
              { icon: TrendingUp, label: 'This Month', value: '$1,892.50' },
            ].map(({ icon: Icon, label, value }, idx) => (
              <div key={idx} style={{ ...glassCard, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Icon size={16} color={mutedText} />
                  <span style={{ fontSize: 12, color: mutedText }}>{label}</span>
                </div>
                <p style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Payment Method */}
        <div style={{ ...glassCard, padding: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 14 }}>Payment Method</h3>
          <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, borderRadius: 12, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: 'rgba(59,130,246,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={20} color="#60a5fa" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>•••• 4242</p>
                <p style={{ fontSize: 12, color: mutedText, marginTop: 2 }}>Visa ending in 4242</p>
              </div>
            </div>
            <ChevronRight size={18} color={mutedText} />
          </button>
        </div>

        {/* Recent Transactions */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: mutedText, letterSpacing: '0.14em', marginBottom: 12 }}>Recent Transactions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { desc: isCaregiver ? 'Shift Payment - Dec 15' : 'Care Service - Dec 15', amount: isCaregiver ? '+$125.00' : '-$125.00' },
              { desc: isCaregiver ? 'Shift Payment - Dec 14' : 'Care Service - Dec 14', amount: isCaregiver ? '+$150.00' : '-$150.00' },
              { desc: isCaregiver ? 'Shift Payment - Dec 13' : 'Care Service - Dec 13', amount: isCaregiver ? '+$100.00' : '-$100.00' },
            ].map((tx, idx) => (
              <div key={idx} style={{ ...glassCard, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isCaregiver ? `${GREEN}20` : 'rgba(255,255,255,0.07)' }}>
                    <DollarSign size={20} color={isCaregiver ? GREEN : mutedText} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>{tx.desc}</p>
                    <p style={{ fontSize: 12, color: mutedText, marginTop: 2 }}>Completed</p>
                  </div>
                </div>
                <span style={{ fontWeight: 700, fontSize: 15, color: isCaregiver ? GREEN : 'white' }}>{tx.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;
