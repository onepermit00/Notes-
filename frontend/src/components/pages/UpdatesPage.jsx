import React from 'react';
import { ArrowLeft, Calendar, Bell, AlertTriangle, Clock, Pill, Activity } from 'lucide-react';

const INTER = "'Inter','Plus Jakarta Sans',sans-serif";
const BG    = 'radial-gradient(ellipse at 20% 0%, rgba(58,123,213,0.18) 0%, transparent 55%), #080810';
const MUTED = 'rgba(255,255,255,0.4)';
const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`;

const glass = (opacity = 0.88, blur = 24) => ({
  background: `rgba(14,14,18,${opacity})`,
  backdropFilter: `blur(${blur}px)`,
  WebkitBackdropFilter: `blur(${blur}px)`,
  border: '1px solid rgba(255,255,255,0.09)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
});

const glassCard = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
  borderRadius: 14,
};

export const UpdatesPage = ({ onBack }) => {
  const upcomingSchedule = [
    { id: 1, title: 'Physical Therapy',   time: '10:00 AM Tomorrow', icon: Activity },
    { id: 2, title: 'Doctor Visit',        time: 'Dec 20, 2:30 PM',  icon: Calendar },
    { id: 3, title: 'Medication Refill Due', time: 'Dec 22',          icon: Pill     },
  ];

  const alerts = [
    { id: 1, title: 'Care Plan Updated',          desc: 'New evening routine added',          time: '2 hours ago', priority: 'low'    },
    { id: 2, title: 'Medication Schedule Change',  desc: 'Evening meds moved to 6 PM',        time: 'Yesterday',   priority: 'medium' },
    { id: 3, title: 'Caregiver Assignment',        desc: 'Julia will cover weekend shifts',    time: '2 days ago',  priority: 'low'    },
  ];

  const alertStyle = (priority) => {
    if (priority === 'high')   return { background: 'rgba(244,63,94,0.1)',   border: '1px solid rgba(244,63,94,0.3)' };
    if (priority === 'medium') return { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' };
    return { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' };
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: INTER, position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: GRAIN, backgroundSize: '200px', opacity: 0.18, pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, ...glass(0.9, 20), padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex', padding: 4 }}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ fontFamily: INTER, fontSize: '1.2rem', color: 'white', letterSpacing: '-0.02em' }}>Notifications</h1>
      </div>

      <div style={{ padding: '20px 20px 80px', display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', zIndex: 1 }}>

        {/* Upcoming Schedule */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Calendar size={16} color={MUTED} />
            <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em' }}>Upcoming Schedule</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcomingSchedule.map((item) => (
              <div key={item.id} style={{ ...glassCard, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, background: 'rgba(59,130,246,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon size={20} color="#60a5fa" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: 'white', fontSize: 15 }}>{item.title}</p>
                  <p style={{ fontSize: 13, color: MUTED, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color={MUTED} />
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Bell size={16} color={MUTED} />
            <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em' }}>Recent Alerts</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alerts.map((alert) => {
              const aStyle = alertStyle(alert.priority);
              return (
                <div key={alert.id} style={{ borderRadius: 14, padding: 16, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', ...aStyle }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, color: 'white', fontSize: 15 }}>{alert.title}</p>
                      <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>{alert.desc}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>{alert.time}</p>
                    </div>
                    {alert.priority === 'high' && (
                      <AlertTriangle size={20} color="#fb7185" style={{ flexShrink: 0, marginLeft: 12 }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatesPage;

