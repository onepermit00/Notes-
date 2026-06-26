import React from 'react';
import { ArrowLeft, Star, Award, Clock, Phone, MessageCircle, Shield, CheckCircle } from 'lucide-react';

const INTER = "'Inter','Plus Jakarta Sans',sans-serif";
const BG    = 'radial-gradient(ellipse at 20% 0%, rgba(58,123,213,0.18) 0%, transparent 55%), #080810';
const MUTED = 'rgba(255,255,255,0.4)';
const GREEN = '#2E9E5B';
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
  borderRadius: 16,
};

export const CaregiverPage = ({ onBack }) => {
  const caregiver = {
    name: 'Julia Martinez',
    role: 'Certified Nursing Assistant',
    photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80',
    phone: '(555) 567-8901',
    rating: 4.9,
    yearsExperience: 5,
    shiftsCompleted: 234,
    certifications: ['CNA', 'CPR/First Aid', 'Dementia Care'],
    bio: "Experienced caregiver with a passion for elderly care. Specialized in dementia and Alzheimer's patients.",
    currentShift: { status: 'Active', startTime: '8:00 AM', location: 'On-site' }
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: INTER, position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: GRAIN, backgroundSize: '200px', opacity: 0.18, pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, ...glass(0.9, 20), padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex', padding: 4 }}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ fontFamily: INTER, fontSize: '1.2rem', color: 'white', letterSpacing: '-0.02em' }}>Current Caregiver</h1>
      </div>

      <div style={{ padding: '24px 20px 80px', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', zIndex: 1 }}>

        {/* Profile Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <img src={caregiver.photo} alt={caregiver.name}
              style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${GREEN}`, boxShadow: `0 0 0 4px ${GREEN}30` }} />
            <div style={{ position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, background: GREEN, borderRadius: '50%', border: '2px solid #080810' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4 }}>{caregiver.name}</h2>
          <p style={{ fontSize: 14, color: MUTED, marginBottom: 12 }}>{caregiver.role}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: `${GREEN}20`, borderRadius: 999 }}>
            <div style={{ width: 8, height: 8, background: GREEN, borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: GREEN }}>Currently on shift</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { icon: Star,         color: '#eab308', value: caregiver.rating,           label: 'Rating'     },
            { icon: Award,        color: '#3b82f6', value: caregiver.yearsExperience,   label: 'Years Exp.' },
            { icon: CheckCircle,  color: GREEN,     value: caregiver.shiftsCompleted,   label: 'Shifts'     },
          ].map(({ icon: Icon, color, value, label }, idx) => (
            <div key={idx} style={{ ...glassCard, padding: 16, textAlign: 'center' }}>
              <Icon size={24} color={color} style={{ margin: '0 auto 6px' }} />
              <p style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{value}</p>
              <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Contact Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <a href={`tel:${caregiver.phone}`}
            style={{ flex: 1, padding: '14px 0', background: GREEN, border: 'none', borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 600, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', boxShadow: `0 6px 20px ${GREEN}40` }}>
            <Phone size={20} />
            Call
          </a>
          <button style={{ flex: 1, padding: '14px 0', ...glass(0.6, 12), borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 600, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <MessageCircle size={20} />
            Message
          </button>
        </div>

        {/* About */}
        <div style={{ ...glassCard, padding: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 10 }}>About</h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>{caregiver.bio}</p>
        </div>

        {/* Certifications */}
        <div style={{ ...glassCard, padding: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={18} color="#3b82f6" />
            Verified Certifications
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {caregiver.certifications.map((cert, idx) => (
              <span key={idx} style={{ padding: '6px 14px', background: `${GREEN}18`, color: GREEN, borderRadius: 999, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={12} />
                {cert}
              </span>
            ))}
          </div>
        </div>

        {/* Current Shift */}
        <div style={{ borderRadius: 16, padding: 16, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#60a5fa', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} />
            Current Shift
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div>
              <p style={{ fontSize: 12, color: 'rgba(96,165,250,0.7)', marginBottom: 4 }}>Started</p>
              <p style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>{caregiver.currentShift.startTime}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'rgba(96,165,250,0.7)', marginBottom: 4 }}>Location</p>
              <p style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>{caregiver.currentShift.location}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverPage;

