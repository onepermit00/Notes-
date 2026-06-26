import React, { useState } from 'react';
import { ArrowLeft, Camera, Star, Award, CheckCircle, Check } from 'lucide-react';
import { UserRole } from '../../types';

const INTER  = `'Inter','Plus Jakarta Sans',sans-serif`;
const BG     = '#FFFFFF';
const CARD   = '#FFFFFF';
const TEXT   = '#222222';
const MUTED  = '#717171';
const BORDER = '#EBEBEB';
const SHADOW = '0 2px 12px rgba(0,0,0,0.08)';

const glassCard = {
  background: CARD,
  border: `1px solid ${BORDER}`,
  boxShadow: SHADOW,
  borderRadius: 16,
};

export const ProfilePage = ({ onBack, role }) => {
  const isCaregiver = role === UserRole.CAREGIVER;

  const [profile, setProfile] = useState({
    name: isCaregiver ? 'Julia Martinez' : 'Mary Smith',
    role: isCaregiver ? 'Certified Nursing Assistant' : 'Family Guardian',
    email: isCaregiver ? 'julia.martinez@careagency.com' : 'mary.smith@email.com',
    phone: isCaregiver ? '(555) 567-8901' : '(555) 234-5678',
    photo: isCaregiver
      ? 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80'
      : 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfile(prev => ({ ...prev, photo: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const accentColor = isCaregiver ? '#2E9E5B' : '#3A7BD5';

  return (
    <div data-testid="profile-page" style={{ minHeight: '100vh', background: BG, fontFamily: INTER }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 20px 16px', borderBottom: `1px solid ${BORDER}`, background: CARD }}>
        <button onClick={onBack} data-testid="profile-back-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex' }}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ fontFamily: INTER, fontSize: '1.4rem', color: TEXT, letterSpacing: '-0.01em' }}>Profile</h1>
      </div>

      <div style={{ padding: '0 20px 100px' }}>
        {/* Photo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0 24px' }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <img
              src={profile.photo}
              alt={profile.name}
              style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${accentColor}` }}
            />
            <label style={{ position: 'absolute', bottom: 4, right: 4, width: 44, height: 44, background: accentColor, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              <Camera size={20} color="white" />
              <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
            </label>
          </div>
          <h2 style={{ fontFamily: INTER, fontSize: '1.8rem', color: TEXT, letterSpacing: '-0.01em', marginBottom: 6 }}>{profile.name}</h2>
          <p style={{ color: MUTED, fontSize: 15 }}>{profile.role}</p>
        </div>

        {/* Stats — Caregiver only */}
        {isCaregiver && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { icon: Star,        value: '4.9', label: 'Rating', color: '#eab308' },
              { icon: Award,       value: '5',   label: 'Years',  color: '#3b82f6' },
              { icon: CheckCircle, value: '234', label: 'Shifts', color: accentColor },
            ].map(({ icon: Icon, value, label, color }, i) => (
              <div key={i} style={{ ...glassCard, padding: '16px 12px', textAlign: 'center' }}>
                <Icon size={24} color={color} style={{ margin: '0 auto 8px', display: 'block' }} fill={i === 2 ? color : 'none'} stroke={i === 2 ? CARD : color} />
                <p style={{ fontFamily: INTER, fontSize: '1.6rem', color: TEXT, letterSpacing: '-0.02em', margin: 0 }}>{value}</p>
                <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Contact info */}
        <div style={{ ...glassCard, padding: '20px', marginBottom: 12 }}>
          <h3 style={{ fontFamily: INTER, fontSize: '1.1rem', color: TEXT, letterSpacing: '-0.01em', marginBottom: 16 }}>Contact Information</h3>
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Email</p>
            <p style={{ color: TEXT, fontSize: 15 }}>{profile.email}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Phone</p>
            <p style={{ color: TEXT, fontSize: 15 }}>{profile.phone}</p>
          </div>
        </div>

        {/* Certifications — Caregiver only */}
        {isCaregiver && (
          <div style={{ ...glassCard, padding: '20px' }}>
            <h3 style={{ fontFamily: INTER, fontSize: '1.1rem', color: TEXT, letterSpacing: '-0.01em', marginBottom: 14 }}>Certifications</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['CNA', 'CPR/First Aid', 'Dementia Care'].map((cert, idx) => (
                <span
                  key={idx}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: `${accentColor}18`, border: `1px solid ${accentColor}35`, color: accentColor, borderRadius: 999, fontSize: 13, fontWeight: 700 }}
                >
                  <Check size={14} /> {cert}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
