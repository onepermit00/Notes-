import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Settings, User, ChevronRight, ChevronDown, Menu, X,
  Bell, CheckCircle, AlertTriangle, Clock, Package,
  Building2, Users, TrendingUp, MapPin, Wrench,
  Plus, Check, Calendar, FileText, Lock, ShoppingCart, Send
} from 'lucide-react';
import { UserRole } from '../types';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { SupportPage } from './pages/SupportPage';
import { SHIFT_HISTORY } from '../services/mockData';

// ─── Design tokens (Airbnb system) ────────────────────────────────────────────
const BG      = '#FFFFFF';
const CARD    = '#FFFFFF';
const CARD2   = '#F7F7F7';
const GREEN   = '#34C759';
const BLUE    = '#FF385C';
const PURPLE  = '#7C3AED';
const RED     = '#FF3B30';
const ORANGE  = '#FF9500';
const BORDER  = '#EBEBEB';
const TEXT    = '#222222';
const MUTED   = '#717171';
const SHADOW  = '0 2px 12px rgba(0,0,0,0.08)';
const SIDEBAR = '#FFFFFF';
const INTER   = `'Inter','Plus Jakarta Sans',sans-serif`;

const gc = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: SHADOW };

// ─── Mock live data per property ──────────────────────────────────────────────
const LIVE_PROPERTIES = [
  {
    id: 'hannah',
    name: 'The Hannah',
    address: '1306 Callowhill St, Philadelphia',
    company: 'Greystar',
    units: 286,
    photo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    concierge: { name: 'Marcus D.', avatar: 'https://randomuser.me/api/portraits/men/35.jpg', role: 'Night Concierge', shiftStart: '5:00 PM', onShift: true },
    tasks:     { completed: 6, total: 7, missed: 0 },
    incidents: [
      { id: 'i1', title: 'Unauthorized vehicle – P2', severity: 'medium', filedAt: '9:30 PM', note: 'Awaiting tow approval from management' },
      { id: 'i2', title: 'Noise complaint – Unit 912', severity: 'low', filedAt: '10:45 PM', note: 'Resolved at door, documented' },
    ],
    packages:  { pending: 7, inToday: 3, outToday: 0 },
    vendors:   [
      { company: 'Comfort Systems Inc.', purpose: 'HVAC', unit: 'Mech Room B2', checkIn: '10:15 AM', checkOut: '3:00 PM', status: 'out' },
    ],
    lockouts:  [{ unit: '814', resident: 'James B.', resolvedAt: '8:20 PM' }],
    loaners:   { out: 1, total: 5 },
    status:    'active',
    alert:     'Incident open',
  },
  {
    id: 'bozzuto',
    name: 'Bozzuto Commons',
    address: '400 Spring Garden St, Philadelphia',
    company: 'Bozzuto',
    units: 212,
    photo: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    concierge: { name: 'Kevin T.', avatar: 'https://randomuser.me/api/portraits/men/28.jpg', role: 'Night Concierge', shiftStart: '6:00 PM', onShift: true },
    tasks:     { completed: 5, total: 6, missed: 0 },
    incidents: [],
    packages:  { pending: 3, inToday: 5, outToday: 4 },
    vendors:   [],
    lockouts:  [],
    loaners:   { out: 0, total: 4 },
    status:    'active',
    alert:     null,
  },
  {
    id: 'huntington',
    name: 'The Huntington at Oakview',
    address: '2200 Oakview Dr, Philadelphia',
    company: 'Greystar',
    units: 318,
    photo: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    concierge: { name: 'Lisa R.', avatar: 'https://randomuser.me/api/portraits/women/32.jpg', role: 'Overnight', shiftStart: '5:00 PM', onShift: true },
    tasks:     { completed: 7, total: 7, missed: 0 },
    incidents: [
      { id: 'i3', title: 'Pool gate latch broken', severity: 'medium', filedAt: '7:10 PM', note: 'Maintenance notified, gate secured manually for tonight' },
    ],
    packages:  { pending: 11, inToday: 8, outToday: 3 },
    vendors:   [],
    lockouts:  [{ unit: '503', resident: 'Amy K.', resolvedAt: '9:45 PM' }],
    loaners:   { out: 2, total: 6 },
    status:    'active',
    alert:     'Incident open',
  },
  {
    id: 'greystone',
    name: 'Greystone Perimeter',
    address: '3500 Perimeter Blvd, Philadelphia',
    company: 'Greystar',
    units: 180,
    photo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    concierge: { name: 'Derek H.', avatar: 'https://randomuser.me/api/portraits/men/44.jpg', role: 'Weekend', shiftStart: '8:00 AM', onShift: false },
    tasks:     { completed: 0, total: 5, missed: 0 },
    incidents: [],
    packages:  { pending: 2, inToday: 0, outToday: 0 },
    vendors:   [],
    lockouts:  [],
    loaners:   { out: 0, total: 3 },
    status:    'off_shift',
    alert:     null,
  },
  {
    id: 'parkplace',
    name: 'Park Place Residences',
    address: '800 Park Place, Philadelphia',
    company: 'Highmark',
    units: 154,
    photo: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    concierge: { name: 'Amara K.', avatar: 'https://randomuser.me/api/portraits/women/56.jpg', role: 'Night Concierge', shiftStart: '11:00 PM', onShift: false },
    tasks:     { completed: 0, total: 5, missed: 0 },
    incidents: [],
    packages:  { pending: 0, inToday: 0, outToday: 0 },
    vendors:   [],
    lockouts:  [],
    loaners:   { out: 0, total: 3 },
    status:    'off_shift',
    alert:     null,
  },
];

const VENDOR_PROFILE = {
  name: 'Paul Wilson',
  title: 'Operations Manager',
  company: 'Maverick Concierge Services',
  photo: 'https://randomuser.me/api/portraits/men/62.jpg',
};

const severityColor = (s) =>
  s === 'critical' ? RED : s === 'high' ? '#EA580C' : s === 'medium' ? ORANGE : GREEN;

export const EnterpriseDashboard = ({ onRoleSwitch }) => {
  const [activeTab, setActiveTab]         = useState('home');
  const [activePage, setActivePage]       = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [isMobile, setIsMobile]           = useState(window.innerWidth < 768);
  const [expandedProp, setExpandedProp]   = useState(null);
  const [expandedShift, setExpandedShift] = useState(null);
  const [drillProp, setDrillProp]         = useState(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleTabChange = (id) => { window.scrollTo(0, 0); setActiveTab(id); setDrillProp(null); };

  const onShiftNow     = LIVE_PROPERTIES.filter(p => p.status === 'active');
  const totalIncidents = LIVE_PROPERTIES.reduce((a, p) => a + p.incidents.length, 0);
  const totalPending   = LIVE_PROPERTIES.reduce((a, p) => a + p.packages.pending, 0);
  const maverickShifts = SHIFT_HISTORY.filter(s => s.company === 'Maverick');
  const avgCompletion  = Math.round(maverickShifts.reduce((a, s) => a + (s.tasksCompleted / s.totalTasks) * 100, 0) / maverickShifts.length);

  // ── Sub-pages ──────────────────────────────────────────────────────────────
  if (activePage === 'profile')  return <ProfilePage  onBack={() => setActivePage(null)} role={UserRole.ENTERPRISE} />;
  if (activePage === 'settings') return <SettingsPage onBack={() => setActivePage(null)} />;
  if (activePage === 'support')  return <SupportPage  onBack={() => setActivePage(null)} role="vendor" />;

  const NAV_ITEMS = [
    { id: 'home',     Icon: Home,       label: 'Overview'      },
    { id: 'live',     Icon: Users,      label: 'Active Shifts', badge: totalIncidents > 0 },
    { id: 'history',  Icon: Clock,      label: 'Shift History' },
    { id: 'reports',  Icon: TrendingUp, label: 'Reports'       },
    { id: 'settings', Icon: Settings,   label: 'Menu'          },
  ];

  // ── Sidebar ────────────────────────────────────────────────────────────────
  const renderSidebarContent = (isDrawer) => {
    const collapsed = !isDrawer && sidebarCollapsed;
    return (
      <>
        <div style={{ padding: collapsed ? '18px 0 14px' : '18px 18px 14px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: 10, borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          {!collapsed && <span style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em' }}>✦ Maverick</span>}
          {isDrawer ? (
            <button onClick={() => setSidebarOpen(false)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <X size={18} color={MUTED} />
            </button>
          ) : (
            <button onClick={() => setSidebarCollapsed(c => !c)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <Menu size={18} color={MUTED} />
            </button>
          )}
        </div>

        {/* Live pulse strip */}
        {!collapsed && (
          <div style={{ margin: '10px 12px 4px', background: 'rgba(52,199,89,0.06)', border: '1px solid rgba(52,199,89,0.20)', borderRadius: 14, padding: '12px 14px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN }} />
              <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: GREEN, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Live Operations</span>
            </div>
            <div style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: TEXT }}>{onShiftNow.length} of {LIVE_PROPERTIES.length} on shift</div>
            {totalIncidents > 0 && (
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,149,0,0.10)', border: '1px solid rgba(255,149,0,0.25)', borderRadius: 8, padding: '4px 8px' }}>
                <AlertTriangle size={11} color={ORANGE} strokeWidth={1.5} />
                <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: ORANGE }}>{totalIncidents} open incident{totalIncidents > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        )}

        <nav style={{ flex: 1, padding: collapsed ? '2px 4px' : '4px 0', overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ id, Icon, label, badge }) => {
            const active = activeTab === id;
            return (
              <button key={id} title={collapsed ? label : undefined}
                onClick={() => { handleTabChange(id); if (isDrawer) setSidebarOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : 14, padding: collapsed ? '13px 0' : '11px 18px', border: 'none', cursor: 'pointer', textAlign: 'left', background: active ? 'rgba(255,56,92,0.07)' : 'transparent', borderLeft: !collapsed && active ? `3px solid ${BLUE}` : !collapsed ? '3px solid transparent' : 'none', width: '100%', transition: 'background 120ms', position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <Icon size={18} color={active ? BLUE : MUTED} strokeWidth={active ? 2 : 1.5} />
                  {badge && !collapsed && <div style={{ position: 'absolute', top: -3, right: -3, width: 7, height: 7, borderRadius: '50%', background: ORANGE }} />}
                </div>
                {!collapsed && <span style={{ fontFamily: INTER, fontSize: 15, fontWeight: active ? 600 : 400, color: active ? TEXT : MUTED, flex: 1 }}>{label}</span>}
                {collapsed && active && <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 20, borderRadius: 2, background: BLUE }} />}
              </button>
            );
          })}
        </nav>

        <div style={{ borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <button onClick={() => { setActivePage('profile'); if (isDrawer) setSidebarOpen(false); }}
            style={{ padding: collapsed ? '14px 0 10px' : '14px 18px 10px', display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            {collapsed ? (
              <img src={VENDOR_PROFILE.photo} alt={VENDOR_PROFILE.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                <img src={VENDOR_PROFILE.photo} alt={VENDOR_PROFILE.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', display: 'block', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 600, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{VENDOR_PROFILE.name}</div>
                  <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginTop: 1 }}>Operations Manager</div>
                </div>
              </div>
            )}
          </button>
          {!collapsed && (
            <div style={{ padding: '0 18px 16px' }}>
              <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Notes</span>
              <span style={{ fontFamily: INTER, fontSize: 11, color: MUTED, marginLeft: 6 }}>v1.0.0</span>
            </div>
          )}
        </div>
      </>
    );
  };

  // ── Shared property drill-down (same data manager sees for one property) ───
  const renderDrillDown = (prop) => (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}>
      {/* Back header */}
      <div style={{ padding: isMobile ? '60px 16px 0' : '24px 20px 0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <button onClick={() => setDrillProp(null)}
          style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${BORDER}`, background: CARD, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: SHADOW }}>
          <ChevronDown size={18} color={MUTED} strokeWidth={1.5} style={{ transform: 'rotate(90deg)' }} />
        </button>
        <div>
          <div style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em' }}>{prop.name}</div>
          <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{prop.company} · {prop.units} units</div>
        </div>
        {prop.status === 'active' && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(52,199,89,0.10)', border: '1px solid rgba(52,199,89,0.25)', borderRadius: 999, padding: '4px 10px', flexShrink: 0 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN }} />
            <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 600, color: GREEN }}>Live</span>
          </div>
        )}
      </div>

      {/* Building photo */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ position: 'relative', height: 140, borderRadius: 18, overflow: 'hidden', boxShadow: SHADOW }}>
          <img src={prop.photo} alt={prop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
            <div style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>{prop.name}</div>
            <div style={{ fontFamily: INTER, fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>{prop.address}</div>
          </div>
        </div>
      </div>

      {/* On-shift concierge */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>On Shift</div>
        <div style={{ ...gc, padding: 16, borderLeft: `3px solid ${prop.status === 'active' ? GREEN : MUTED}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={prop.concierge.avatar} alt={prop.concierge.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
              {prop.status === 'active' && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: GREEN, border: `2px solid ${CARD}` }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT }}>{prop.concierge.name}</div>
              <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginTop: 2 }}>{prop.concierge.role}</div>
              <div style={{ fontFamily: INTER, fontSize: 11, color: MUTED, marginTop: 2 }}>
                {prop.status === 'active' ? `Since ${prop.concierge.shiftStart}` : 'Off shift'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: INTER, fontSize: '1.3rem', fontWeight: 700, color: prop.tasks.completed === prop.tasks.total ? GREEN : ORANGE, letterSpacing: '-0.02em' }}>{prop.tasks.completed}/{prop.tasks.total}</div>
              <div style={{ fontFamily: INTER, fontSize: 10, color: MUTED, fontWeight: 600 }}>tasks</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI row — same as manager sees */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {[
            { Icon: AlertTriangle, value: prop.incidents.length, label: 'Incidents',  color: prop.incidents.length > 0 ? ORANGE : GREEN,  bg: prop.incidents.length > 0 ? 'rgba(255,149,0,0.08)' : 'rgba(52,199,89,0.08)'  },
            { Icon: Package,       value: prop.packages.pending, label: 'Pending Pkg',color: prop.packages.pending > 10 ? ORANGE : TEXT,    bg: CARD                },
            { Icon: Wrench,        value: prop.vendors.length,   label: 'Vendors',    color: PURPLE,                                        bg: 'rgba(124,58,237,0.08)' },
            { Icon: Lock,          value: prop.lockouts.length,  label: 'Lockouts',   color: prop.lockouts.length > 0 ? ORANGE : MUTED,     bg: CARD                },
          ].map(({ Icon, value, label, color, bg }) => (
            <div key={label} style={{ ...gc, padding: '12px 6px', textAlign: 'center', background: bg, boxShadow: 'none' }}>
              <Icon size={14} color={color} strokeWidth={1.5} style={{ margin: '0 auto 4px', display: 'block' }} />
              <div style={{ fontFamily: INTER, fontSize: '1.3rem', fontWeight: 700, color, letterSpacing: '-0.02em' }}>{value}</div>
              <div style={{ fontFamily: INTER, fontSize: 9, color: MUTED, marginTop: 2, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Task Progress</div>
        <div style={{ ...gc, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT }}>{prop.tasks.completed} of {prop.tasks.total} complete</div>
            {prop.tasks.missed > 0 && <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: RED, background: 'rgba(255,59,48,0.10)', borderRadius: 999, padding: '2px 8px' }}>{prop.tasks.missed} missed</span>}
          </div>
          <div style={{ height: 8, background: CARD2, borderRadius: 999, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
            <div style={{ height: '100%', width: `${(prop.tasks.completed / prop.tasks.total) * 100}%`, background: prop.tasks.completed === prop.tasks.total ? GREEN : ORANGE, borderRadius: 999 }} />
          </div>
          <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginTop: 8 }}>
            {prop.tasks.completed === prop.tasks.total ? 'All tasks complete for this shift' : `${prop.tasks.total - prop.tasks.completed} task${prop.tasks.total - prop.tasks.completed > 1 ? 's' : ''} remaining`}
          </div>
        </div>
      </div>

      {/* Incidents */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Open Incidents</div>
        {prop.incidents.length === 0 ? (
          <div style={{ ...gc, padding: 20, textAlign: 'center', boxShadow: 'none' }}>
            <CheckCircle size={24} color={GREEN} strokeWidth={1.5} style={{ margin: '0 auto 8px', display: 'block' }} />
            <div style={{ fontFamily: INTER, fontSize: 13, fontWeight: 600, color: MUTED }}>No open incidents</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {prop.incidents.map(inc => (
              <div key={inc.id} style={{ ...gc, padding: 14, borderLeft: `3px solid ${severityColor(inc.severity)}` }}>
                <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 4 }}>{inc.title}</div>
                <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginBottom: 4 }}>Filed {inc.filedAt}</div>
                <div style={{ fontFamily: INTER, fontSize: 12, color: TEXT, fontStyle: 'italic' }}>"{inc.note}"</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Packages */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Packages</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {[
            { label: 'Pending Pickup', value: prop.packages.pending, color: prop.packages.pending > 8 ? ORANGE : TEXT },
            { label: 'In Today',       value: prop.packages.inToday, color: GREEN },
            { label: 'Out Today',      value: prop.packages.outToday, color: MUTED },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ ...gc, padding: '14px 8px', textAlign: 'center', boxShadow: 'none' }}>
              <div style={{ fontFamily: INTER, fontSize: '1.6rem', fontWeight: 700, color, letterSpacing: '-0.02em' }}>{value}</div>
              <div style={{ fontFamily: INTER, fontSize: 10, color: MUTED, marginTop: 4, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Vendors */}
      {prop.vendors.length > 0 && (
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Vendor Access Today</div>
          {prop.vendors.map((v, i) => (
            <div key={i} style={{ ...gc, padding: 14, borderLeft: `3px solid ${v.status === 'active' ? ORANGE : GREEN}` }}>
              <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT }}>{v.company}</div>
              <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginTop: 3 }}>{v.purpose} · {v.unit}</div>
              <div style={{ fontFamily: INTER, fontSize: 11, color: MUTED, marginTop: 3 }}>In {v.checkIn} {v.checkOut ? `→ Out ${v.checkOut}` : '· still in building'}</div>
            </div>
          ))}
        </div>
      )}

      {/* Lockouts */}
      {prop.lockouts.length > 0 && (
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Lockouts Today</div>
          {prop.lockouts.map((l, i) => (
            <div key={i} style={{ ...gc, padding: 14, borderLeft: `3px solid ${GREEN}` }}>
              <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT }}>Unit {l.unit} — {l.resident}</div>
              <div style={{ fontFamily: INTER, fontSize: 12, color: GREEN, marginTop: 3, fontWeight: 600 }}>Resolved at {l.resolvedAt}</div>
            </div>
          ))}
        </div>
      )}

      {/* Loaners */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Amenity Loaners</div>
        <div style={{ ...gc, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <ShoppingCart size={22} color={prop.loaners.out > 0 ? ORANGE : GREEN} strokeWidth={1.5} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT }}>{prop.loaners.out} of {prop.loaners.total} checked out</div>
            <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginTop: 2 }}>{prop.loaners.out === 0 ? 'All items in — shift close ready' : 'Items must be returned before shift close'}</div>
          </div>
          {prop.loaners.out > 0 && <AlertTriangle size={18} color={ORANGE} strokeWidth={1.5} />}
        </div>
      </div>
    </div>
  );

  // ── TAB: Overview ──────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}>
      <div style={{ padding: isMobile ? '60px 16px 12px' : '24px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED }}>✦ Vendor Portal</span>
          <div style={{ marginTop: 3 }}>
            <span style={{ fontFamily: INTER, fontSize: 'clamp(1.3rem,4vw,1.7rem)', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', lineHeight: 1.1 }}>Maverick Operations</span>
          </div>
          <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 4 }}>{LIVE_PROPERTIES.length} properties · {onShiftNow.length} concierges on shift now</div>
        </div>
        {totalIncidents > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,149,0,0.10)', border: '1px solid rgba(255,149,0,0.3)', borderRadius: 999, padding: '6px 12px', flexShrink: 0 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: ORANGE }} />
            <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 600, color: ORANGE }}>{totalIncidents} incident{totalIncidents > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Fleet KPIs */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {[
            { value: onShiftNow.length,     label: 'On Shift',   color: GREEN,  bg: 'rgba(52,199,89,0.08)',   border: 'rgba(52,199,89,0.2)'   },
            { value: totalIncidents,        label: 'Incidents',  color: totalIncidents > 0 ? ORANGE : GREEN, bg: totalIncidents > 0 ? 'rgba(255,149,0,0.08)' : CARD, border: totalIncidents > 0 ? 'rgba(255,149,0,0.2)' : BORDER },
            { value: totalPending,          label: 'Packages',   color: TEXT,   bg: CARD,                     border: BORDER                  },
            { value: `${avgCompletion}%`,   label: 'Avg Rate',   color: PURPLE, bg: 'rgba(124,58,237,0.08)',  border: 'rgba(124,58,237,0.2)'  },
          ].map(({ value, label, color, bg, border }) => (
            <div key={label} style={{ ...gc, padding: '14px 6px', textAlign: 'center', background: bg, border: `1px solid ${border}`, boxShadow: 'none' }}>
              <div style={{ fontFamily: INTER, fontSize: '1.4rem', fontWeight: 700, color, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
              <div style={{ fontFamily: INTER, fontSize: 9, color: MUTED, marginTop: 4, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Property cards — same at-a-glance data manager sees */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>All Properties</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {LIVE_PROPERTIES.map(prop => (
            <button key={prop.id}
              onClick={() => { setDrillProp(prop); setActiveTab('live'); }}
              style={{ ...gc, padding: 0, textAlign: 'left', border: 'none', cursor: 'pointer', borderLeft: `3px solid ${prop.status === 'active' ? (prop.incidents.length > 0 ? ORANGE : GREEN) : BORDER}` }}>

              {/* Property row */}
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={prop.concierge.avatar} alt={prop.concierge.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                  {prop.status === 'active' && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: '50%', background: GREEN, border: `2px solid ${CARD}` }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 2 }}>{prop.name}</div>
                  <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{prop.concierge.name} · {prop.status === 'active' ? `Since ${prop.concierge.shiftStart}` : 'Off shift'}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {prop.status === 'active' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(52,199,89,0.10)', borderRadius: 999, padding: '3px 9px' }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: GREEN }} />
                      <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 600, color: GREEN }}>Live</span>
                    </div>
                  ) : (
                    <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 600, color: MUTED, background: CARD2, borderRadius: 999, padding: '3px 9px' }}>Off Shift</span>
                  )}
                  <ChevronRight size={14} color={MUTED} strokeWidth={1.5} />
                </div>
              </div>

              {/* Data strip */}
              {prop.status === 'active' && (
                <div style={{ borderTop: `1px solid ${BORDER}`, padding: '10px 16px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: prop.tasks.completed === prop.tasks.total ? GREEN : ORANGE }}>{prop.tasks.completed}/{prop.tasks.total} tasks</span>
                  {prop.incidents.length > 0 && <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: ORANGE, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={11} color={ORANGE} strokeWidth={1.5} />{prop.incidents.length} incident{prop.incidents.length > 1 ? 's' : ''}</span>}
                  <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{prop.packages.pending} pkg pending</span>
                  {prop.vendors.length > 0 && <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{prop.vendors.length} vendor{prop.vendors.length > 1 ? 's' : ''}</span>}
                  {prop.loaners.out > 0 && <span style={{ fontFamily: INTER, fontSize: 12, color: ORANGE }}>{prop.loaners.out} loaner out</span>}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB: Active Shifts (drill-down view) ───────────────────────────────────
  const renderLive = () => {
    if (drillProp) return renderDrillDown(drillProp);

    return (
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}>
        <div style={{ padding: isMobile ? '60px 16px 12px' : '24px 20px 12px' }}>
          <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED }}>✦ Shift Monitor</span>
          <div style={{ marginTop: 3 }}>
            <span style={{ fontFamily: INTER, fontSize: 'clamp(1.3rem,4vw,1.7rem)', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', lineHeight: 1.1 }}>Active Shifts</span>
          </div>
          <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 4 }}>Tap a property to see what the manager sees</div>
        </div>

        {/* Active properties */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>On Shift Now</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {onShiftNow.map(prop => (
              <button key={prop.id} onClick={() => setDrillProp(prop)}
                style={{ ...gc, padding: 0, textAlign: 'left', border: 'none', cursor: 'pointer', borderLeft: `3px solid ${prop.incidents.length > 0 ? ORANGE : GREEN}` }}>
                <div style={{ padding: '16px 16px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={prop.concierge.avatar} alt={prop.concierge.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: GREEN, border: `2px solid ${CARD}` }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT }}>{prop.concierge.name}</div>
                      <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{prop.name}</div>
                      <div style={{ fontFamily: INTER, fontSize: 11, color: MUTED, marginTop: 1 }}>{prop.company} · Since {prop.concierge.shiftStart}</div>
                    </div>
                    <ChevronRight size={18} color={MUTED} strokeWidth={1.5} />
                  </div>
                  {/* Same KPI strip as manager overview */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                    {[
                      { label: 'Tasks',    value: `${prop.tasks.completed}/${prop.tasks.total}`, color: prop.tasks.completed === prop.tasks.total ? GREEN : ORANGE },
                      { label: 'Incidents',value: prop.incidents.length,  color: prop.incidents.length > 0 ? ORANGE : GREEN  },
                      { label: 'Packages', value: prop.packages.pending,   color: prop.packages.pending > 8 ? ORANGE : TEXT   },
                      { label: 'Vendors',  value: prop.vendors.length,     color: prop.vendors.length > 0 ? PURPLE : MUTED    },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ background: CARD2, borderRadius: 10, padding: '9px 6px', textAlign: 'center', border: `1px solid ${BORDER}` }}>
                        <div style={{ fontFamily: INTER, fontSize: '1.1rem', fontWeight: 700, color, letterSpacing: '-0.02em' }}>{value}</div>
                        <div style={{ fontFamily: INTER, fontSize: 9, color: MUTED, marginTop: 3, fontWeight: 600 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  {prop.incidents.length > 0 && (
                    <div style={{ marginTop: 10, background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.2)', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={13} color={ORANGE} strokeWidth={1.5} />
                      <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 600, color: ORANGE }}>{prop.incidents[0].title}</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Off-shift properties */}
        {LIVE_PROPERTIES.filter(p => p.status !== 'active').length > 0 && (
          <div style={{ padding: '0 16px' }}>
            <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>Off Shift</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LIVE_PROPERTIES.filter(p => p.status !== 'active').map(prop => (
                <button key={prop.id} onClick={() => setDrillProp(prop)}
                  style={{ ...gc, padding: '14px 16px', textAlign: 'left', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={prop.concierge.avatar} alt={prop.concierge.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, opacity: 0.6 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT }}>{prop.name}</div>
                    <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{prop.concierge.name} · Off shift · {prop.packages.pending} pkg pending</div>
                  </div>
                  <ChevronRight size={16} color={MUTED} strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── TAB: Shift History ─────────────────────────────────────────────────────
  const renderHistory = () => (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}>
      <div style={{ padding: isMobile ? '60px 16px 12px' : '24px 20px 12px' }}>
        <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED }}>✦ Shift Log</span>
        <div style={{ marginTop: 3 }}>
          <span style={{ fontFamily: INTER, fontSize: 'clamp(1.3rem,4vw,1.7rem)', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', lineHeight: 1.1 }}>All Shifts</span>
        </div>
        <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 4 }}>Every Maverick concierge shift across all properties</div>
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SHIFT_HISTORY.filter(s => s.company === 'Maverick').map(shift => (
          <div key={shift.id} style={{ ...gc, borderLeft: `3px solid ${shift.incidentCount > 0 ? ORANGE : GREEN}` }}>
            <button onClick={() => setExpandedShift(expandedShift === shift.id ? null : shift.id)}
              style={{ width: '100%', padding: 16, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT }}>{shift.staff}</span>
                  <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginLeft: 8 }}>{shift.shiftType}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: shift.tasksCompleted === shift.totalTasks ? 'rgba(52,199,89,0.10)' : 'rgba(255,149,0,0.10)', color: shift.tasksCompleted === shift.totalTasks ? GREEN : ORANGE }}>
                    {shift.tasksCompleted}/{shift.totalTasks}
                  </span>
                  <ChevronDown size={16} color={MUTED} strokeWidth={1.5} style={{ transform: expandedShift === shift.id ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{shift.date}</span>
                <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{shift.hours}</span>
                {shift.incidentCount > 0 && (
                  <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: ORANGE, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertTriangle size={11} color={ORANGE} strokeWidth={1.5} />{shift.incidentCount} incident{shift.incidentCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </button>
            {expandedShift === shift.id && (
              <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${BORDER}` }}>
                <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: PURPLE, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '12px 0 6px' }}>Shift Summary</div>
                <p style={{ fontFamily: INTER, fontSize: 13, color: TEXT, lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>"{shift.summary}"</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB: Reports ───────────────────────────────────────────────────────────
  const renderReports = () => {
    const maverickShifts = SHIFT_HISTORY.filter(s => s.company === 'Maverick');
    const totalTasks     = maverickShifts.reduce((a, s) => a + s.totalTasks, 0);
    const completedTasks = maverickShifts.reduce((a, s) => a + s.tasksCompleted, 0);
    const totalIncTotal  = maverickShifts.reduce((a, s) => a + s.incidentCount, 0);
    const overallRate    = Math.round((completedTasks / totalTasks) * 100);

    return (
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}>
        <div style={{ padding: isMobile ? '60px 16px 12px' : '24px 20px 12px' }}>
          <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED }}>✦ Analytics</span>
          <div style={{ marginTop: 3 }}>
            <span style={{ fontFamily: INTER, fontSize: 'clamp(1.3rem,4vw,1.7rem)', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', lineHeight: 1.1 }}>Performance</span>
          </div>
        </div>

        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ ...gc, padding: 20 }}>
            <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>All Properties · This Period</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 1, background: BORDER, borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
              {[
                { label: 'Total Shifts',     value: maverickShifts.length,               color: TEXT    },
                { label: 'Task Completion',  value: `${overallRate}%`,                   color: overallRate >= 95 ? GREEN : ORANGE },
                { label: 'Tasks Completed',  value: `${completedTasks}/${totalTasks}`,   color: GREEN   },
                { label: 'Incidents Filed',  value: totalIncTotal,                        color: totalIncTotal === 0 ? GREEN : ORANGE },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: CARD, padding: '18px 12px', textAlign: 'center' }}>
                  <div style={{ fontFamily: INTER, fontSize: '1.8rem', fontWeight: 700, color, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
                  <div style={{ fontFamily: INTER, fontSize: 11, color: MUTED, marginTop: 6, fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 600, color: TEXT }}>Overall Completion Rate</span>
                <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: overallRate >= 95 ? GREEN : ORANGE }}>{overallRate}%</span>
              </div>
              <div style={{ height: 8, background: CARD2, borderRadius: 999, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                <div style={{ height: '100%', width: `${overallRate}%`, background: overallRate >= 95 ? GREEN : ORANGE, borderRadius: 999 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Per-property breakdown */}
        <div style={{ padding: '0 16px' }}>
          <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>Property Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LIVE_PROPERTIES.map(prop => (
              <div key={prop.id} style={{ ...gc, padding: 16, borderLeft: `3px solid ${prop.status === 'active' ? GREEN : BORDER}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <img src={prop.concierge.avatar} alt={prop.concierge.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT }}>{prop.name}</div>
                    <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{prop.concierge.name} · {prop.company}</div>
                  </div>
                  {prop.status === 'active' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(52,199,89,0.10)', borderRadius: 999, padding: '3px 9px' }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: GREEN }} />
                      <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 600, color: GREEN }}>Live</span>
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                  {[
                    { label: 'Tasks',      value: `${prop.tasks.completed}/${prop.tasks.total}`, color: prop.tasks.completed === prop.tasks.total ? GREEN : ORANGE },
                    { label: 'Incidents',  value: prop.incidents.length,  color: prop.incidents.length > 0 ? ORANGE : GREEN  },
                    { label: 'Packages',   value: prop.packages.pending,   color: TEXT  },
                    { label: 'Vendors',    value: prop.vendors.length,     color: MUTED },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: CARD2, borderRadius: 10, padding: '9px 6px', textAlign: 'center', border: `1px solid ${BORDER}` }}>
                      <div style={{ fontFamily: INTER, fontSize: '1rem', fontWeight: 700, color, letterSpacing: '-0.02em' }}>{value}</div>
                      <div style={{ fontFamily: INTER, fontSize: 9, color: MUTED, marginTop: 2, fontWeight: 600 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── TAB: Menu ──────────────────────────────────────────────────────────────
  const renderSettings = () => (
    <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '60px 16px 32px' : '24px 20px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED }}>✦ Account</span>
        <div style={{ marginTop: 3 }}>
          <span style={{ fontFamily: INTER, fontSize: 'clamp(1.3rem,4vw,1.7rem)', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', lineHeight: 1.1 }}>Menu</span>
        </div>
      </div>

      <button onClick={() => setActivePage('profile')}
        style={{ ...gc, padding: 16, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left', border: 'none' }}>
        <img src={VENDOR_PROFILE.photo} alt={VENDOR_PROFILE.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em' }}>{VENDOR_PROFILE.name}</div>
          <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 3 }}>{VENDOR_PROFILE.title} · {VENDOR_PROFILE.company}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(124,58,237,0.10)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 999, padding: '3px 10px', marginTop: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: PURPLE }} />
            <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 600, color: PURPLE }}>Vendor</span>
          </div>
        </div>
        <ChevronRight size={18} color={MUTED} strokeWidth={1.5} />
      </button>

      {/* Agency summary */}
      <div style={{ ...gc, padding: '16px' }}>
        <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>Maverick Overview</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { label: 'Properties',   value: LIVE_PROPERTIES.length,        color: PURPLE },
            { label: 'On Shift Now', value: onShiftNow.length,             color: GREEN  },
            { label: 'Avg Rate',     value: `${avgCompletion}%`,           color: avgCompletion >= 95 ? GREEN : ORANGE },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center', padding: '12px 6px', background: CARD2, borderRadius: 10, border: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: INTER, fontSize: '1.3rem', fontWeight: 700, color, letterSpacing: '-0.02em' }}>{value}</div>
              <div style={{ fontFamily: INTER, fontSize: 10, color: MUTED, marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {[
        { label: 'Settings',       Icon: Settings, color: MUTED, bg: CARD2, action: () => setActivePage('settings') },
        { label: 'Help & Support', Icon: Bell,     color: MUTED, bg: CARD2, action: () => setActivePage('support')  },
      ].map(({ label, Icon, color, bg, action }) => (
        <button key={label} onClick={action}
          style={{ ...gc, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left', border: 'none' }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${BORDER}` }}>
            <Icon size={20} color={color} strokeWidth={1.5} />
          </div>
          <span style={{ fontFamily: INTER, fontSize: 15, fontWeight: 600, color: TEXT, flex: 1 }}>{label}</span>
          <ChevronRight size={18} color={MUTED} strokeWidth={1.5} />
        </button>
      ))}

      <button onClick={() => onRoleSwitch && onRoleSwitch(UserRole.CONCIERGE)}
        style={{ background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.18)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(255,59,48,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${BORDER}` }}>
          <User size={20} color={RED} strokeWidth={1.5} />
        </div>
        <span style={{ fontFamily: INTER, fontSize: 15, fontWeight: 600, color: RED, flex: 1 }}>Sign Out</span>
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: INTER, background: BG }}>

      {!isMobile && (
        <div style={{ width: sidebarCollapsed ? 64 : 248, minWidth: sidebarCollapsed ? 64 : 248, background: SIDEBAR, borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', zIndex: 10, transition: 'width 220ms ease, min-width 220ms ease' }}>
          {renderSidebarContent(false)}
        </div>
      )}

      {isMobile && (
        <>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)}
              style={{ position: 'fixed', top: 13, left: 13, zIndex: 55, width: 40, height: 40, borderRadius: 11, border: `1px solid ${BORDER}`, background: SIDEBAR, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: SHADOW }}>
              <Menu size={18} color={TEXT} strokeWidth={1.5} />
            </button>
          )}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div key="sb-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
                  onClick={() => setSidebarOpen(false)}
                  style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.52)', zIndex: 45, backdropFilter: 'blur(2px)' }} />
                <motion.div key="sb-panel" initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                  style={{ position: 'fixed', left: 0, top: 0, width: 248, height: '100vh', background: SIDEBAR, borderRight: `1px solid ${BORDER}`, zIndex: 50, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                  {renderSidebarContent(true)}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      <div style={{ flex: 1, background: BG, display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'home'     && renderOverview()}
          {activeTab === 'live'     && renderLive()}
          {activeTab === 'history'  && renderHistory()}
          {activeTab === 'reports'  && renderReports()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
};

export default EnterpriseDashboard;
