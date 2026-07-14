import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, MessageSquare, Clock, Settings, User, MapPin, ChevronRight,
  Bell, CheckCircle, Sparkles, AlertTriangle, X, ChevronDown,
  Calendar, ArrowLeft, Check, Phone, BookOpen, Shield, Wifi,
  Car, Zap, Package, Building2, Users, DoorOpen, DoorClosed, Plus,
  Waves, Activity, Sun, Coffee, Briefcase, Film, Heart, Bike, Leaf, Flame,
  Menu, Lock, ShoppingCart, ClipboardList, PlusCircle, Wrench, Search,
  Tag, Navigation, Flag, ChevronLeft, UserCheck, Truck, HelpCircle, Star, LogOut, Mail, Moon,
  GraduationCap, FileText, Image, Video, Play, Eye, Printer
} from 'lucide-react';
import { PackageDashboard } from './PackageDashboard';
import { ToursDashboard } from './ToursDashboard';
import MicButton from './MicButton';
import { toNarrative } from '../lib/toNarrative';
import { TaskStatus, UserRole } from '../types';
import { TaskCard } from './TaskCard';
import { TaskRequestCard }  from './TaskRequestCard';
import { TaskCompletionModal } from './TaskCompletionModal';
import { AICopilot } from './AICopilot';
import { CareAssistantIcon } from './CareAssistantIcon';
import { IncidentReportPage } from './IncidentReportPage';
import { LoanersDashboard } from './LoanersDashboard';
import { LockoutPage } from './LockoutPage';
import { TeamMessagesPage } from './TeamMessagesPage';
import { ShiftCalendarPage } from './ShiftCalendarPage';
import { VendorsDashboard } from './VendorsDashboard';
import { GuestsDashboard } from './GuestsDashboard';
import FollowUpTracker, { useFollowUps } from './FollowUpTracker';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SupportPage } from './pages/SupportPage';
import { ChatPage } from './pages/ChatPage';
import {
  BUILDING_PROFILE, BUILDING_CONTACTS,
  BUILDING_STATUS, BUILDING_SOPS, SHIFT_HISTORY,
} from '../services/mockData';
import { authApi } from '../services/authApi';
import { useTheme } from '../context/ThemeContext';
import { useSharedData } from '../context/SharedDataContext';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { SignaturePad } from './SignaturePad';

// ─── Static / brand tokens (theme-independent) ────────────────────────────────
const INTER   = `'Inter','Plus Jakarta Sans',sans-serif`;
const GREEN   = '#34C759';
const BLUE    = '#FF385C';
const RED     = '#FF3B30';
const ORANGE  = '#FF9500';

function Ghost({ label }) { return null; }
function SectionLabel({ children }) {
  const { colors } = useTheme();
  return <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 600, color: colors.MUTED, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{children}</span>;
}
function SectionTitle({ children, style = {} }) {
  const { colors } = useTheme();
  return <span style={{ fontFamily: INTER, fontSize: 'clamp(1.1rem,3vw,1.4rem)', fontWeight: 700, color: colors.TEXT, letterSpacing: '-0.01em', lineHeight: 1.2, ...style }}>{children}</span>;
}
function Card({ children, style = {}, onClick, testId }) {
  const { colors } = useTheme();
  const gc = { background: colors.CARD, boxShadow: colors.SHADOW, borderRadius: 24, overflow: 'hidden' };
  return (
    <div data-testid={testId} onClick={onClick} style={{ ...gc, cursor: onClick ? 'pointer' : undefined, ...style }}>
      {children}
    </div>
  );
}


const statusLabel = (status) => {
  if (status === 'open')    return 'Open';
  if (status === 'nominal') return 'OK';
  if (status === 'issue')   return 'Issue';
  if (status === 'closed')  return 'Closed';
  return status;
};

// ─── building status icons ────────────────────────────────────────────────────
const STATUS_ITEMS = [
  { key: 'amenities', label: 'Amenities', Icon: Waves    },
  { key: 'models',    label: 'Models',    Icon: DoorOpen },
  { key: 'elevators', label: 'Elevators', Icon: Zap      },
  { key: 'pkgroom',   label: 'Pkg Room',  Icon: Package  },
];

const AMENITIES_INIT = [
  { id: 'pool',      name: 'Pool & Deck',       Icon: Waves,     open: false, openedAt: null, openedBy: null, closedAt: null, closedBy: null },
  { id: 'fitness',   name: 'Fitness Center',    Icon: Activity,  open: false, openedAt: null, openedBy: null, closedAt: null, closedBy: null },
  { id: 'rooftop',   name: 'Rooftop Lounge',    Icon: Sun,       open: false, openedAt: null, openedBy: null, closedAt: null, closedBy: null },
  { id: 'clubroom',  name: 'Club Room',         Icon: Coffee,    open: false, openedAt: null, openedBy: null, closedAt: null, closedBy: null },
  { id: 'business',  name: 'Business Center',   Icon: Briefcase, open: false, openedAt: null, openedBy: null, closedAt: null, closedBy: null },
];

const TASK_CATEGORIES = [
  'Resident Assist', 'Maintenance', 'Cleaning', 'Vendor / Contractor',
  'Administrative', 'Safety / Security', 'Amenity', 'Delivery', 'Other',
];

const TASK_CATEGORY_CONFIG = [
  { id: 'Resident Assist',     Icon: User,          desc: 'Helping a resident with a request'        },
  { id: 'Maintenance',         Icon: Wrench,         desc: 'Repairs, equipment, or upkeep'            },
  { id: 'Cleaning',            Icon: Sparkles,       desc: 'Cleaning or janitorial work'              },
  { id: 'Vendor / Contractor', Icon: Building2,      desc: 'Outside contractor or vendor access'      },
  { id: 'Administrative',      Icon: ClipboardList,  desc: 'Paperwork, logs, or office tasks'         },
  { id: 'Safety / Security',   Icon: Shield,         desc: 'Security check or safety concern'         },
  { id: 'Amenity',             Icon: Waves,          desc: 'Pool, gym, rooftop or common areas'       },
  { id: 'Delivery',            Icon: Package,        desc: 'Package or courier delivery'              },
  { id: 'Other',               Icon: HelpCircle,     desc: 'Task not listed above'                    },
];

const MODEL_UNITS_INIT = [
  { id: 'm1', unit: '101',  type: 'Studio',         sqft: 520,  floor: 1,  open: true,  openedAt: '8:15 AM', openedBy: 'George N.' },
  { id: 'm2', unit: '215',  type: '1 Bed / 1 Bath', sqft: 720,  floor: 2,  open: true,  openedAt: '8:20 AM', openedBy: 'George N.' },
  { id: 'm3', unit: '512',  type: '2 Bed / 2 Bath', sqft: 1100, floor: 5,  open: false, openedAt: null,      openedBy: null        },
  { id: 'm4', unit: '1402', type: 'Pent. 2 Bed',    sqft: 1450, floor: 14, open: false, openedAt: null,      openedBy: null        },
];

/* ── Shift calendar data & helpers ──────────────────────────────────────────── */
const TODAY_STR  = new Date().toISOString().slice(0, 10);
const toDS       = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
const getCalCells = (year, month) => {
  const first = new Date(year, month, 1).getDay();
  const days  = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push({ day: d, dateStr: toDS(year, month, d) });
  return cells;
};
const SH_MONTHS    = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SH_MONTH_ABB = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const SH_DAY_HDR   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const SH_CAT_ICON = {
  'Delivery': Package, 'Resident Assist': User, 'Administrative': ClipboardList,
  'Safety / Security': Shield, 'Vendor / Contractor': Truck, 'Amenity': Waves,
};
const SH_CAT_COLOR = {
  'Delivery': '#FF385C', 'Resident Assist': '#34C759', 'Administrative': '#717171',
  'Safety / Security': '#FF3B30', 'Vendor / Contractor': '#FF9500', 'Amenity': '#A78BFA',
};

const mkShAct = (items) => items.map((x, i) => ({ id: i + 1, ...x }));

const SHIFT_DATA = {
  '2026-06-22': {
    concierge: { name:'George Nwachukwu', init:'GN', co:'Maverick Concierge Services' },
    clockIn:'8:00 AM', clockOut:null, status:'active', duration:'6h 45m (ongoing)',
    activities: mkShAct([
      { time:'8:00 AM',  title:'Shift started',                                       category:'Administrative',      notes:'GPS verified · The Hannah'         },
      { time:'8:45 AM',  title:'Package delivery · UPS → Unit 524',                   category:'Delivery',            notes:'2 packages · Luxer Locker'         },
      { time:'9:12 AM',  title:'Guest arrival · John Smith → Maria Lopez · Unit 312', category:'Resident Assist',     notes:'Personal Visit'                    },
      { time:'9:30 AM',  title:'Vendor check-in · City Plumbing Co. · Plumbing',      category:'Vendor / Contractor', notes:'Unit 802 · Auth: Maria Lopez'      },
      { time:'10:15 AM', title:'Pool opened',                                          category:'Amenity',             notes:''                                  },
      { time:'10:22 AM', title:'Package pickup · Maria Lopez · Unit 312',              category:'Delivery',            notes:''                                  },
      { time:'11:05 AM', title:'Lockout · James Chen · Unit 715',                     category:'Safety / Security',   notes:'Forgot Key · Master Key'           },
      { time:'11:30 AM', title:'Tour · Alex Rivera · 1 Bed / 1 Bath',                 category:'Resident Assist',     notes:'Walk-in'                           },
      { time:'12:10 PM', title:'Package room audit · Match',                           category:'Administrative',      notes:'Luxer: 8 · Physical: 8'           },
      { time:'12:45 PM', title:'Loaner checkout · Luggage Cart #1 · Unit 412',        category:'Amenity',             notes:''                                  },
      { time:'1:20 PM',  title:'Rounds check · All floors clear',                      category:'Safety / Security',   notes:'Floors 1–14 checked'              },
      { time:'2:05 PM',  title:'Package delivery · Amazon → Unit 715',                 category:'Delivery',            notes:'1 package'                         },
    ]),
    note: 'All systems operational. Package room at capacity ~noon — leasing notified.',
    incidents: ['Unauthorized vehicle – P2','Package room at capacity'],
    metrics: { packages:4, guests:2, vendors:1, lockouts:1, tours:1 },
    leasingTeam: 'The Hannah Leasing',
  },
  '2026-06-21': {
    concierge: { name:'Kevin Thompson', init:'KT', co:'Maverick Concierge Services' },
    clockIn:'8:00 AM', clockOut:'4:00 PM', status:'completed', duration:'8h 0m',
    activities: mkShAct([
      { time:'8:00 AM',  title:'Shift started',                           category:'Administrative',      notes:'GPS verified'                          },
      { time:'8:30 AM',  title:'Lobby Opening Check',                     category:'Administrative',      notes:'All clear · lights checked'            },
      { time:'9:00 AM',  title:'Package delivery · FedEx → Unit 108',    category:'Delivery',            notes:'1 package'                             },
      { time:'10:15 AM', title:'Gym opened',                              category:'Amenity',             notes:''                                      },
      { time:'10:45 AM', title:'Vendor check-in · HVAC Services',         category:'Vendor / Contractor', notes:'Roof mechanical · Auth: Mike Rodriguez' },
      { time:'11:20 AM', title:'Vendor check-out · HVAC Services',        category:'Vendor / Contractor', notes:'Work completed'                        },
      { time:'12:30 PM', title:'Package room audit · Match',              category:'Administrative',      notes:'Luxer: 5 · Physical: 5'               },
      { time:'2:00 PM',  title:'Tour · Jennifer Kim · Studio',            category:'Resident Assist',     notes:'Scheduled · Strong interest in 704'    },
      { time:'3:45 PM',  title:'Shift handover notes logged',             category:'Administrative',      notes:'HVAC issue flagged for PM'             },
    ]),
    note: 'Quiet Saturday. HVAC roof inspection completed.',
    incidents: ['Gym HVAC: slight warm temp reported'],
    metrics: { packages:1, guests:0, vendors:2, lockouts:0, tours:1 },
    leasingTeam: 'The Hannah Leasing',
  },
  '2026-06-20': {
    concierge: { name:'Maria Santos', init:'MS', co:'Maverick Concierge Services' },
    clockIn:'8:00 AM', clockOut:'4:00 PM', status:'completed', duration:'8h 0m',
    activities: mkShAct([
      { time:'8:00 AM',  title:'Shift started',                              category:'Administrative',    notes:'GPS verified'                          },
      { time:'8:15 AM',  title:'Move-in setup · Unit 1204 · Elevator booked',category:'Administrative',    notes:'9 AM–1 PM window'                     },
      { time:'9:05 AM',  title:'Package delivery · UPS → Unit 304',          category:'Delivery',          notes:'3 packages'                            },
      { time:'9:30 AM',  title:'Move-in · Emily & David Park · Unit 1204',   category:'Resident Assist',   notes:'Elevator reserved · Luggage cart out'  },
      { time:'11:15 AM', title:'Lockout · Sophia Wright · Unit 302',         category:'Safety / Security', notes:'Key fob issue · Temp access issued'    },
      { time:'12:00 PM', title:'Package room audit · +1 unaccounted',        category:'Administrative',    notes:'Luxer: 7 · Physical: 8 · Reported'    },
      { time:'2:30 PM',  title:'Package delivery · Amazon → Unit 712',       category:'Delivery',          notes:'2 packages'                            },
      { time:'3:00 PM',  title:'Pool closed · weather advisory',             category:'Amenity',           notes:'Storm approaching'                     },
    ]),
    note: 'Move-in for 1204 smooth. Package audit +1 discrepancy — reported to Luxer.',
    incidents: ['Package count discrepancy · Luxer +1'],
    metrics: { packages:5, guests:2, vendors:0, lockouts:1, tours:0 },
  },
  '2026-06-19': {
    concierge: { name:'George Nwachukwu', init:'GN', co:'Maverick Concierge Services' },
    clockIn:'8:00 AM', clockOut:'4:00 PM', status:'completed', duration:'8h 0m',
    activities: mkShAct([
      { time:'8:00 AM',  title:'Shift started',                          category:'Administrative',      notes:'GPS verified'                          },
      { time:'8:30 AM',  title:'Lobby Opening Check',                    category:'Administrative',      notes:'Broken light #3 — ticket #4435 created' },
      { time:'9:00 AM',  title:'Package delivery · UPS → Unit 901',     category:'Delivery',            notes:'1 package'                             },
      { time:'10:30 AM', title:'Tour · Marcus Bell · 1 Bed / 1 Bath',   category:'Resident Assist',     notes:'Scheduled · Model 501'                 },
      { time:'11:30 AM', title:'Vendor check-in · Cleaning Services',    category:'Vendor / Contractor', notes:'Common areas · Auth: Sarah Thompson'   },
      { time:'12:15 PM', title:'Package room audit · Match',             category:'Administrative',      notes:'Luxer: 3 · Physical: 3'               },
      { time:'2:45 PM',  title:'Package delivery · Amazon → Unit 215',  category:'Delivery',            notes:'2 packages'                            },
    ]),
    note: 'Lobby light #3 flagged, ticket #4435. Marcus Bell tour — interested in 1BR.',
    incidents: ['Lobby light #3 burned out — ticket #4435'],
    metrics: { packages:3, guests:0, vendors:2, lockouts:0, tours:1 },
    leasingTeam: 'The Hannah Leasing',
  },
  '2026-06-18': {
    concierge: { name:'Kevin Thompson', init:'KT', co:'Maverick Concierge Services' },
    clockIn:'8:00 AM', clockOut:'4:00 PM', status:'completed', duration:'8h 0m',
    activities: mkShAct([
      { time:'8:00 AM',  title:'Shift started',                           category:'Administrative',    notes:'GPS verified'                      },
      { time:'9:15 AM',  title:'Package delivery · FedEx → Unit 601',    category:'Delivery',          notes:'1 package'                         },
      { time:'9:45 AM',  title:'Package delivery · USPS → Unit 814',     category:'Delivery',          notes:'2 packages'                        },
      { time:'10:30 AM', title:'Guest arrival · Tom Clark → Unit 1105',  category:'Resident Assist',   notes:'Furniture delivery assistance'     },
      { time:'12:00 PM', title:'Package room audit · Match',              category:'Administrative',    notes:'Luxer: 4 · Physical: 4'           },
      { time:'3:15 PM',  title:'Lockout · Robert Wu · Unit 414',         category:'Safety / Security', notes:'Lost fob · Temp key issued'       },
    ]),
    note: 'Furniture delivery assistance for 1105. Lost fob for Unit 414 flagged.',
    incidents: [],
    metrics: { packages:4, guests:1, vendors:0, lockouts:1, tours:0 },
  },
};
const SHIFT_DATES = new Set([
  '2026-06-22','2026-06-21','2026-06-20','2026-06-19','2026-06-18',
]);

export const CaregiverDashboard = ({
  onSignOut,
  onViewCalendar,
  authUser,
}) => {
  // ── Theme ──────────────────────────────────────────────────────────────────
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { uploadedSOPs, trainingItems } = useSharedData();
  const BG     = colors.BG;
  const CARD   = colors.CARD;
  const CARD2  = colors.CARD2;
  const BORDER = colors.BORDER;
  const TEXT   = colors.TEXT;
  const MUTED  = colors.MUTED;
  const SHADOW = colors.SHADOW;
  const SIDEBAR = colors.SIDEBAR;
  const propertyName = authUser?.property_name || propertyName;
  const glass     = () => ({ background: CARD, boxShadow: SHADOW });
  const glassCard = () => ({ background: CARD, boxShadow: SHADOW, borderRadius: 24, overflow: 'hidden' });
  const glassRow  = { background: CARD, boxShadow: SHADOW, borderRadius: 20 };
  const statusStyle = (status) => {
    if (status === 'open' || status === 'nominal') return { bg: 'rgba(52,199,89,0.12)', color: GREEN, dot: GREEN };
    if (status === 'issue')  return { bg: 'rgba(217,119,6,0.10)',  color: ORANGE, dot: ORANGE };
    if (status === 'closed') return { bg: 'rgba(239,68,68,0.10)',  color: RED,    dot: RED    };
    return { bg: CARD2, color: MUTED, dot: MUTED };
  };
  // ───────────────────────────────────────────────────────────────────────────

  const [tasks,    setTasks]    = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [fullscreenItem, setFullscreenItem] = useState(null);
  const [activeTab, setActiveTab]             = useState('home');
  const [activeTaskTab, setActiveTaskTab]     = useState('today');
  const [expandedTaskId, setExpandedTaskId]   = useState(null);
  const [selectedTask, setSelectedTask]       = useState(null);
  const [showCopilot, setShowCopilot]         = useState(false);
  const [isShiftActive, setIsShiftActive]     = useState(false);
  const [shiftStarted,  setShiftStarted]     = useState(false);
  const [shiftStartTime, setShiftStartTime]   = useState('');
  const [clockOutTime, setClockOutTime]       = useState(null);
  const [currentShiftId, setCurrentShiftId]  = useState(null);
  const [previousShiftData, setPreviousShiftData] = useState(undefined); // undefined = loading
  const [activePage, setActivePage]           = useState(null);
  const [historyFilter, setHistoryFilter]     = useState('all');
  const [showClockAlert, setShowClockAlert]   = useState(false);
  const [clockAlertTitle, setClockAlertTitle] = useState('');
  const [clockAlertMsg, setClockAlertMsg]     = useState('');
  const [showContacts,  setShowContacts]  = useState(false);
  const [successTaskId, setSuccessTaskId] = useState(null);
  const [ntError,       setNtError]       = useState('');
  const [tasksLoading,  setTasksLoading]  = useState(true);
  const [tasksError,    setTasksError]    = useState(false);
  const [srAnnounce,    setSrAnnounce]    = useState('');
  const [showSOPs, setShowSOPs]                 = useState(false);
  const [expandedSOP, setExpandedSOP]           = useState(null);
  const [expandedSOPId, setExpandedSOPId]       = useState(null);
  const [showAmenities, setShowAmenities] = useState(false);
  const [amenities,     setAmenities]     = useState(AMENITIES_INIT);
  const [showPkgAudit,  setShowPkgAudit]  = useState(false);
  const [pkgAudits,     setPkgAudits]     = useState([]);
  const [auditForm,     setAuditForm]     = useState({ luxerCount: '0', physicalCount: '0', notes: '' });
  const [selfTasks,     setSelfTasks]     = useState([]);
  const [showNewTask,   setShowNewTask]   = useState(false);
  const [ntStep,        setNtStep]        = useState(1);
  const [ntForm,        setNTF]           = useState({ title: '', category: '', notes: '', location: '', priority: 'normal', dueDate: '', flagFollowUp: false });
  const [showModels,    setShowModels]    = useState(false);
  const [modelUnits,    setModelUnits]    = useState(MODEL_UNITS_INIT);
  const [showElevators, setShowElevators] = useState(false);
  const [elevatorMoves, setElevatorMoves] = useState([]);
  const [showElevForm,  setShowElevForm]  = useState(false);
  const [eForm, setEF] = useState({ moveType: 'move_in', residentName: '', unit: '', floor: '', notes: '' });
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [notifCG,          setNotifCG]          = useState({ push:true, email:true, shift:true, incident:true });
  const [settingExp,       setSettingExp]       = useState(null);
  const [editInfoCG,       setEditInfoCG]       = useState({ name: '', email: '', phone: '' });
  const [pwFormCG,         setPwFormCG]         = useState({ current:'', next:'', confirm:'' });
  const [pwStatusCG,       setPwStatusCG]       = useState('');  // '', 'saving', 'success', 'error:...'
  const [shiftStarting,    setShiftStarting]    = useState(false);
  const [showSearch,       setShowSearch]       = useState(false);
  const [showSummary,      setShowSummary]      = useState(false);
  const [summaryText,      setSummaryText]      = useState('');
  const [summaryCopied,    setSummaryCopied]    = useState(false);
  const followUps = useFollowUps();
  const [searchQuery,      setSearchQuery]      = useState('');
  const [shCalDate,    setShCalDate]    = useState(new Date());
  const [shCalView,    setShCalView]    = useState('month');
  const [shiftDay,     setShiftDay]     = useState(null);
  const [shiftsPage,   setShiftsPage]   = useState(0);
  const [shiftHistory, setShiftHistory] = useState([]);
  const [viewPhoto,  setViewPhoto]  = useState(null);
  const [isMobile,      setIsMobile]      = useState(() => { const t = 'ontouchstart' in window || navigator.maxTouchPoints > 0; return window.innerWidth < (t ? 1366 : 768); });
  const [isPhone,       setIsPhone]       = useState(() => { const t = 'ontouchstart' in window || navigator.maxTouchPoints > 0; return t && window.innerWidth < 768; });

  // Load real data + shift state on mount
  useEffect(() => {
    authApi.getTasks()
      .then(list => { setTasks(list); setTasksLoading(false); setTasksError(false); })
      .catch(() => { setTasksLoading(false); setTasksError(true); });
    authApi.getIncidents().then(list => setIncidents(list)).catch(() => {});
    authApi.getShiftHistory().then(data => setShiftHistory(data?.shifts || [])).catch(() => {});

    // Check for active shift and load previous shift concurrently
    Promise.all([authApi.getActiveShift(), authApi.getPreviousShift()]).then(([activeRes, prevRes]) => {
      // Restore active shift if already clocked in — ignore shifts that ended before today
      if (activeRes?.shift) {
        const s = activeRes.shift;
        const todayStr = new Date().toLocaleDateString();
        if (s.clock_out && new Date(s.clock_out).toLocaleDateString() !== todayStr) {
          // Shift ended before today — treat as no active shift
        } else {
          setCurrentShiftId(s.shift_id);
          setIsShiftActive(true);
          setShiftStarted(true);
          setShiftStartTime(new Date(s.clock_in).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
          // Restore only today's activities as selfTasks
          const prevActivities = (s.activities || []).filter(t => {
            if (!t.created_at) return false;
            return new Date(t.created_at).toLocaleDateString() === todayStr;
          }).map(t => ({
            id: t.task_id,
            title: t.title,
            category: t.category || 'Other',
            notes: t.notes || '',
            completedAt: t.created_at ? new Date(t.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '',
            startedAt:   t.created_at ? new Date(t.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '',
            status: 'completed',
          }));
          setSelfTasks(prevActivities);
        }
      }

      // Set previous shift for the pre-shift handoff view
      if (prevRes?.shift) {
        const s = prevRes.shift;
        const clockIn  = new Date(s.clock_in).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const clockOut = s.clock_out ? new Date(s.clock_out).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : null;
        const msElapsed = s.clock_out ? (new Date(s.clock_out) - new Date(s.clock_in)) : 0;
        const hours = Math.floor(msElapsed / 3600000);
        const mins  = Math.floor((msElapsed % 3600000) / 60000);
        setPreviousShiftData({
          concierge: { name: s.concierge_name },
          clockIn,
          clockOut,
          duration: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
          note:       s.handover_notes || '',
          openItems:  s.open_items || [],
          incidents: (s.incidents || []).map(i => `${i.type || ''}: ${i.description || ''}`),
          activities: (s.activities || []).map(t => ({
            id: t.task_id,
            time: t.created_at ? new Date(t.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '',
            title: t.title,
            notes: t.notes || '',
            category: t.category || 'Other',
          })),
        });
      } else {
        setPreviousShiftData(null); // No previous shift on record
      }
    }).catch(() => setPreviousShiftData(null));
  }, []);

  // Sync authUser into editInfoCG
  useEffect(() => {
    if (authUser) {
      setEditInfoCG({ name: authUser.name || '', email: authUser.email || '', phone: authUser.phone || '' });
    }
  }, [authUser]);

  useEffect(() => {
    const onResize = () => { const t = 'ontouchstart' in window || navigator.maxTouchPoints > 0; setIsMobile(window.innerWidth < (t ? 1366 : 768)); setIsPhone(t && window.innerWidth < 768); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // On iPhone: lock body + counteract iOS visual-viewport scroll so panels never jump
  useEffect(() => {
    if (!isPhone) return;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = '0';
    const reset = () => { window.scrollTo(0, 0); };
    window.addEventListener('scroll', reset, { passive: true });
    window.visualViewport?.addEventListener('scroll', reset);
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.removeEventListener('scroll', reset);
      window.visualViewport?.removeEventListener('scroll', reset);
    };
  }, [isPhone]);

  // Real-time SSE — manager-assigned tasks & incidents appear instantly
  useEffect(() => {
    const es = authApi.openEventStream(({ tasks: newTasks = [], incidents: newInc = [] }) => {
      if (newTasks.length) {
        const normalized = newTasks.map(t => ({
          id: t.task_id, task_id: t.task_id, title: t.title || '', notes: t.notes || '',
          category: t.category || 'Other', priority: t.priority || 'Standard',
          assignedTo: t.assigned_to || '', toId: t.assigned_to_id || '',
          dueTime: t.due_time || 'ASAP', status: t.status || 'pending',
          createdAt: t.created_at ? new Date(t.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '',
          createdBy: t.created_by_name || '', createdByType: t.created_by_type || 'concierge',
        }));
        setTasks(prev => {
          const ids = new Set(prev.map(x => x.task_id));
          const fresh = normalized.filter(t => !ids.has(t.task_id));
          return fresh.length ? [...fresh, ...prev] : prev;
        });
      }
      if (newInc.length) {
        setIncidents(prev => {
          const ids = new Set(prev.map(x => x.incident_id));
          const fresh = newInc.filter(i => !ids.has(i.incident_id));
          return fresh.length ? [...fresh, ...prev] : prev;
        });
      }
    });
    return () => es.close();
  }, []);

  // Ctrl+K / Cmd+K → focus the main search bar
  const searchInputRef = React.useRef(null);
  const [ddIdx, setDdIdx] = useState(-1);
  const ddItemsRef = React.useRef([]);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSearch(true);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);


  const openModelCount = modelUnits.filter(m => m.open).length;
  const toggleModel = (id) => {
    const t = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const m = modelUnits.find(x => x.id === id);
    if (m) {
      const action = m.open ? 'closed' : 'opened';
      setSelfTasks(p => [...p, { id: Date.now(), title: `Model unit ${m.unit} ${action} · ${m.type}`, category: 'Amenity', notes: '', location: '', priority: 'normal', completedAt: t, startedAt: t, status: 'completed', _source: 'dashboard' }]);
    }
    setModelUnits(p => p.map(m => m.id !== id ? m : {
      ...m, open: !m.open,
      openedAt: !m.open ? t : null,
      openedBy: !m.open ? (authUser?.name || 'Concierge').split(' ')[0] + ' ' + (authUser?.name || 'Concierge').split(' ')[1][0] + '.' : null,
    }));
  };

  const nowStr  = () => new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  const staffId = () => { const n = (authUser?.name || 'Concierge').split(' '); return `${n[0]} ${n[1][0]}.`; };

  const openAmenityCount  = amenities.filter(a => a.open).length;
  const lastAudit         = pkgAudits[0] || null;
  const lastAuditMatch    = lastAudit ? lastAudit.luxerCount === lastAudit.physicalCount : null;

  const submitPkgAudit = () => {
    if (auditForm.luxerCount === '' || auditForm.physicalCount === '') return;
    const luxer    = parseInt(auditForm.luxerCount,    10);
    const physical = parseInt(auditForm.physicalCount, 10);
    const match    = luxer === physical;
    const diff     = physical - luxer;
    const t        = nowStr();
    setPkgAudits(p => [{
      id: Date.now(), time: t, by: staffId(),
      luxerCount: luxer, physicalCount: physical,
      match, diff,
      notes: auditForm.notes,
    }, ...p]);
    const statusText = match ? 'Match' : diff > 0 ? `+${diff} unaccounted` : `${Math.abs(diff)} missing`;
    setSelfTasks(p => [...p, { id: Date.now() + 1, title: `Package room audit · ${statusText}`, category: 'Administrative', notes: auditForm.notes || `Luxer: ${luxer} · Physical: ${physical}`, location: '', priority: 'normal', completedAt: t, startedAt: t, status: 'completed', _source: 'dashboard' }]);
    setAuditForm({ luxerCount: '0', physicalCount: '0', notes: '' });
  };

  const toggleAmenity = (id) => {
    const t = nowStr(); const who = staffId();
    const a = amenities.find(x => x.id === id);
    if (a) {
      const action = a.open ? 'closed' : 'opened';
      setSelfTasks(p => [...p, { id: Date.now(), title: `${a.name} ${action}`, category: 'Amenity', notes: '', location: '', priority: 'normal', completedAt: t, startedAt: t, status: 'completed', _source: 'dashboard' }]);
    }
    setAmenities(p => p.map(a => a.id !== id ? a : a.open
      ? { ...a, open: false, closedAt: t,  closedBy: who }
      : { ...a, open: true,  openedAt: t,  openedBy: who, closedAt: null, closedBy: null }
    ));
  };

  const submitNewTask = async () => {
    if (!ntForm.title) return;
    const t = nowStr();
    const localTask = { ...ntForm, id: Date.now(), startedAt: t, completedAt: t, status: 'completed', _source: 'task' };
    setSelfTasks(p => [localTask, ...p]);
    if (ntForm.flagFollowUp) {
      followUps.add({ text: ntForm.title + (ntForm.notes ? ` — ${ntForm.notes}` : ''), source: ntForm.category || 'task' });
    }
    setNTF({ title: '', category: '', notes: '', location: '', priority: 'normal', dueDate: '', flagFollowUp: false });
    setNtStep(1);
    setShowNewTask(false);
    // Save to backend so manager can see it
    try {
      const saved = await authApi.createTask({
        title:      ntForm.title,
        notes:      ntForm.notes || '',
        category:   ntForm.category || 'Other',
        priority:   ntForm.priority === 'high' ? 'High' : ntForm.priority === 'low' ? 'Low' : 'Standard',
        assignedTo: authUser?.name || '',
        toId:       authUser?.user_id || '',
        dueTime:    ntForm.dueDate || 'ASAP',
      });
      setTasks(p => [saved, ...p]);
    } catch { /* already shown locally — ignore API error silently */ }
  };
  const activeElevMove   = elevatorMoves.find(m => m.elevStatus === 'in_progress');
  const reservedElevMove = elevatorMoves.find(m => m.elevStatus === 'reserved');
  const elevCardStatus   = activeElevMove ? 'in_progress' : reservedElevMove ? 'reserved' : 'available';
  const elColor = elevCardStatus === 'in_progress' ? RED : elevCardStatus === 'reserved' ? ORANGE : GREEN;
  const elVal   = elevCardStatus === 'in_progress' ? 'In Use' : elevCardStatus === 'reserved' ? 'Reserved' : 'Free';
  const pkColor = lastAudit === null ? ORANGE : lastAuditMatch ? GREEN : RED;
  const pkVal   = lastAudit === null ? 'No Audit' : lastAuditMatch ? 'Match' : 'Variance';

  const submitElevReservation = () => {
    if (!eForm.residentName || !eForm.unit) return;
    setElevatorMoves(p => [{
      ...eForm, id: Date.now(),
      elevStatus: 'reserved',
      reservedAt: nowStr(),
      startTime: null,
      endTime: null,
    }, ...p]);
    setEF({ moveType: 'move_in', residentName: '', unit: '', floor: '', notes: '' });
    setShowElevForm(false);
  };

  const markElevStart    = (id) => setElevatorMoves(p => p.map(m => m.id === id ? { ...m, elevStatus: 'in_progress', startTime: nowStr() } : m));
  const markElevComplete = (id) => setElevatorMoves(p => p.map(m => m.id === id ? { ...m, elevStatus: 'completed',  endTime:   nowStr() } : m));

  const today = new Date();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayLabel = today.toDateString() === new Date().toDateString() ? 'Today' : `${monthNames[today.getMonth()]} ${today.getDate()}`;

  const handleTabChange  = (id) => { setActiveTab(id); };
  const handlePageChange = (page) => { window.scrollTo(0, 0); setActivePage(page); };
  const handleStartTask     = useCallback((task) => setSelectedTask(task), []);
  const handleCompleteTask  = (updated) => {
    const id = updated.id || updated.task_id;
    if (tasks.find(t => t.id === id || t.task_id === id)) {
      handleUpdateTask({ ...updated, status: 'completed' });
    } else {
      handleActivityLogged({ title: updated.title, category: updated.category || 'Administrative', notes: updated.completionNote || '', evidenceUrls: updated.evidenceUrls || [] });
    }
    setSuccessTaskId(id);
    setSrAnnounce('Task marked as complete.');
    setTimeout(() => { setSuccessTaskId(null); setSrAnnounce(''); }, 1000);
    setSelectedTask(null);
    setExpandedTaskId(null);
  };
  const handleClockIn = async () => {
    try {
      const shift = await authApi.startShift();
      setCurrentShiftId(shift.shift_id);
      setIsShiftActive(true);
      setSelfTasks([]);
      setShiftStartTime(new Date(shift.clock_in).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
      setClockOutTime(null);
      setClockAlertTitle('Clocked In');
      setClockAlertMsg('Shift started. GPS location verified. Read the handoff notes before beginning rounds.');
      setShowClockAlert(true);
    } catch { /* silently ignore */ }
  };
  const [showHandover,      setShowHandover]      = useState(false);
  const [handoverNotes,     setHandoverNotes]     = useState('');
  const [handoverItems,     setHandoverItems]     = useState('');
  const [handoverSaving,    setHandoverSaving]    = useState(false);
  const [showChecklist,     setShowChecklist]     = useState(false);
  const [checklistAcks,     setChecklistAcks]     = useState({});  // id → 'done' | 'escalate'

  const { isOnline, queueLen, isSyncing } = useOfflineQueue();

  const handleClockOut = () => {
    setChecklistAcks({});
    setShowChecklist(true);
  };

  const proceedToHandover = () => {
    setShowChecklist(false);
    setHandoverNotes('');
    setHandoverItems('');
    setShowHandover(true);
  };

  const submitHandover = async () => {
    setHandoverSaving(true);
    try {
      const openItems = handoverItems.split('\n').map(s => s.trim()).filter(Boolean);
      const res = await authApi.handoverShift(handoverNotes, openItems);
      setIsShiftActive(false);
      setCurrentShiftId(null);
      setShowHandover(false);
      setClockOutTime(new Date(res.clock_out).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
      setClockAlertTitle('Shift Handed Over');
      setClockAlertMsg('Shift ended. Your handover notes have been saved for the next concierge.');
      setShowClockAlert(true);
    } catch { /* silently ignore */ } finally { setHandoverSaving(false); }
  };
  const handleActivityLogged = ({ title, category = '', notes = '', evidenceUrls = [] }) => {
    const t = nowStr();
    const local = { id: Date.now(), title, category, notes, evidenceUrls, location: '', priority: 'normal', completedAt: t, startedAt: t, status: 'completed', _source: 'dashboard' };
    setSelfTasks(p => [...p, local]);
    // Save activity to backend so manager sees it
    authApi.createTask({
      title, notes, category: category || 'Other',
      priority: 'Standard',
      assignedTo: authUser?.name || '',
      toId: authUser?.user_id || '',
      dueTime: t,
    }).then(saved => setTasks(p => [saved, ...p])).catch(() => {});
  };

  const handleUpdateTask = async (updated) => {
    try {
      const taskId = updated.task_id || updated.id;
      const saved = await authApi.updateTask(taskId, {
        status: updated.status,
        completion_note: updated.completionNote || updated.completion_note || '',
      });
      setTasks(p => p.map(t => (t.id === saved.id || t.task_id === saved.task_id) ? saved : t));
    } catch { /* silently fail */ }
  };

  const handleAcceptRequest = useCallback(async (task) => {
    try {
      await authApi.updateTask(task.id, { status: 'in_progress' });
      setTasks(p => p.map(t => t.id === task.id ? { ...t, status: 'in_progress' } : t));
    } catch {}
  }, []);

  const handleDeclineRequest = useCallback(async (taskId) => {
    try {
      await authApi.updateTask(taskId, { status: 'completed' });
      setTasks(p => p.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
    } catch {}
  }, []);

  const displayTasks    = tasks.filter(t => t.status !== TaskStatus.PROPOSED);
  const pendingTasks    = displayTasks.filter(t => t.status !== TaskStatus.COMPLETED);
  const filteredTasks   = searchQuery
    ? pendingTasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : pendingTasks;
  const pendingRequests = tasks.filter(t => t.createdByType === 'manager' && t.status !== 'completed');
  const completedCount  = displayTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const totalCount      = displayTasks.length;
  const progressPct     = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const filteredHistory = SHIFT_HISTORY.filter(s => historyFilter === 'all' || s.status === historyFilter);

  // ── sub-pages ──────────────────────────────────────────────────────────────
  if (activePage === 'settings') return <SettingsPage onBack={() => handlePageChange(null)} />;
  if (activePage === 'history')  return <HistoryPage  onBack={() => handlePageChange(null)} />;
  if (activePage === 'support')  return <SupportPage  onBack={() => handlePageChange(null)} role="caregiver" />;
  if (activePage === 'chat')     return <ChatPage     role={UserRole.CONCIERGE} />;

  // ── PRE-SHIFT BRIEFING ─────────────────────────────────────────────────────
  const renderPreShiftBriefing = () => {
    const prevShift = previousShiftData;

    const doStart = async () => {
      if (shiftStarting) return;
      setShiftStarting(true);
      try {
        const shift = await authApi.startShift();
        setCurrentShiftId(shift.shift_id);
        setIsShiftActive(true);
        setShiftStarted(true);
        setSelfTasks([]);
          setShiftStartTime(new Date(shift.clock_in).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
      } finally { setShiftStarting(false); }
    };

    // On mobile: full-width bar. On desktop: centered pill button.
    const StartBtn = () => (
      <div style={{
        position: 'fixed', bottom: 0, left: isMobile ? 0 : 248, right: 0,
        padding: isMobile ? '10px 20px 14px' : '12px 40px 16px',
        background: BG, borderTop: `1px solid ${BORDER}`, zIndex: 20,
        display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end',
      }}>
        <motion.button
          onClick={doStart}
          disabled={shiftStarting}
          whileTap={shiftStarting ? {} : { scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            width: isMobile ? '100%' : 'auto',
            padding: isMobile ? '16px 0' : '14px 40px',
            background: shiftStarting ? MUTED : BLUE,
            border: 'none', borderRadius: 14,
            fontFamily: INTER, fontSize: 16, fontWeight: 700, color: 'white',
            cursor: shiftStarting ? 'not-allowed' : 'pointer',
            boxShadow: shiftStarting ? 'none' : `0 6px 24px ${BLUE}50`,
            whiteSpace: 'nowrap', letterSpacing: '-0.01em',
          }}>
          {shiftStarting ? 'Starting…' : 'Start My Shift'}
        </motion.button>
      </div>
    );

    if (prevShift === undefined) {
      const sk = isDarkMode ? 'skeleton-dark' : 'skeleton-light';
      return (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 80 }}>
          <div style={{ padding: isMobile ? '64px 16px 0' : '20px 16px 0' }}>
            <div style={{ borderRadius: 20, overflow: 'hidden', border: `1.5px solid ${BORDER}` }}>
              {/* Dark header shimmer */}
              <div style={{ background: '#111827', padding: '28px 28px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ height: 11, borderRadius: 6, width: '34%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ height: 22, borderRadius: 8, width: '52%', background: 'rgba(255,255,255,0.11)' }} />
                <div style={{ height: 14, borderRadius: 6, width: '44%', background: 'rgba(255,255,255,0.07)' }} />
              </div>
              {/* Card body skeleton rows */}
              <div style={{ background: CARD }}>
                {[80, 65, 90, 55, 72].map((w, i) => (
                  <div key={i} style={{ padding: '14px 28px', borderBottom: i < 4 ? `1px solid ${BORDER}` : 'none', display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div className={sk} style={{ width: 72, height: 13, borderRadius: 5, flexShrink: 0 }} />
                    <div className={sk} style={{ height: 13, borderRadius: 5, width: w + '%' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <StartBtn />
        </div>
      );
    }

    if (!prevShift) {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', paddingTop: isMobile ? 80 : 40 }}>
          <div style={{ width: 64, height: 64, background: CARD2, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <CheckCircle size={30} color={MUTED} strokeWidth={1.75} />
          </div>
          <p style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 5px' }}>No previous shift on record</p>
          <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: '0 0 28px' }}>You're the first one in.</p>
          <StartBtn />
        </div>
      );
    }

    const acts     = prevShift.activities || [];
    const delivery = acts.filter(a => a.category === 'Delivery');
    const security = acts.filter(a => a.category === 'Safety / Security');
    const resident = acts.filter(a => a.category === 'Resident Assist');
    const vends    = acts.filter(a => a.category === 'Vendor / Contractor');
    const amenity  = acts.filter(a => a.category === 'Amenity');
    const audit    = acts.find(a => a.category === 'Administrative' && a.title?.toLowerCase().includes('audit'));
    const loaners  = amenity.filter(a => a.title?.toLowerCase().includes('loaner'));
    const guests   = resident.filter(a => a.title?.toLowerCase().includes('guest') || a.title?.toLowerCase().includes('arrival'));
    const tours    = resident.filter(a => a.title?.toLowerCase().includes('tour') || a.title?.toLowerCase().includes('move'));
    const pickups  = delivery.filter(a => a.title?.toLowerCase().includes('pickup'));
    const incoming = delivery.filter(a => !a.title?.toLowerCase().includes('pickup'));
    const lockouts = security.filter(a => a.title?.toLowerCase().includes('lockout'));
    const rounds   = security.filter(a => !a.title?.toLowerCase().includes('lockout'));

    // Same Sect/Field/toStr as Manager Dashboard — unified DAR format
    const Sect = ({ title, accent = '#8FAEDD' }) => (
      <div style={{ background: accent, padding: isPhone ? '7px 14px' : isMobile ? '7px 18px' : '8px 32px', marginTop: 4 }}>
        <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 800, color: TEXT, letterSpacing: '0.10em', textTransform: 'uppercase' }}>{title}</span>
      </div>
    );
    const Field = ({ label, value, sub, last }) => (
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'flex-start', gap: isMobile ? 3 : 18, padding: isPhone ? '12px 14px' : isMobile ? '12px 18px' : '14px 32px', borderBottom: last ? 'none' : `1px solid ${BORDER}` }}>
        <div style={{ width: isMobile ? '100%' : 210, flexShrink: 0, fontFamily: INTER, fontSize: 13, fontWeight: isMobile ? 700 : 600, color: MUTED, lineHeight: 1.4, textTransform: isMobile ? 'uppercase' : 'none', letterSpacing: isMobile ? '0.06em' : 'normal' }}>{label}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: INTER, fontSize: 15, color: TEXT, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{value}</div>
          {sub && <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
    );
    const toStr = arr => arr.length > 0
      ? arr.map(a => `${a.time || '—'}: ${a.title}${a.notes ? ' · ' + a.notes : ''}`).join('\n')
      : 'N/A';

    return (
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 80 }}>
        <div style={{ padding: isMobile ? '64px 16px 0' : '20px 16px 0' }}>
          <div style={{ marginTop: 0, borderRadius: 20, overflow: 'hidden', border: `1.5px solid ${BORDER}` }}>
            {/* Header */}
            <div style={{ background: '#111827', padding: isPhone ? '16px 18px' : isMobile ? '18px 20px 16px' : '20px 32px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: INTER, fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: isPhone ? 5 : 6 }}>Previous Shift · Handoff</div>
                  <div style={{ fontFamily: INTER, fontSize: isPhone ? 17 : isMobile ? 18 : 18, fontWeight: 700, color: 'white', marginBottom: isPhone ? 4 : 5 }}>{prevShift.concierge?.name}</div>
                  <div style={{ fontFamily: INTER, fontSize: isPhone ? 13 : 14, color: 'rgba(255,255,255,0.55)' }}>
                    {prevShift.clockIn} – {prevShift.clockOut || 'End of shift'} · {prevShift.duration}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(52,199,89,0.15)', borderRadius: 999, padding: '5px 12px' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, boxShadow: '0 0 0 3px rgba(52,199,89,0.25)' }} />
                    <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: GREEN }}>Completed</span>
                  </div>
                  <div style={{ fontFamily: INTER, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{prevShift.duration}</div>
                </div>
              </div>
            </div>
            {/* Sections — identical layout to Manager DAR */}
            <div style={{ background: CARD }}>
              <Sect title="Start of Shift Package Audit" />
              <Field label="Package Audit Completed" value="Yes" />
              <Field label="Keys Found at Start of Shift" value="Yes" last={!audit} />
              {audit && <Field label="Package Room Count" value={audit.notes} last />}

              <Sect title="Packages" />
              <Field label="Delivered by Couriers" value={toStr(incoming)} />
              <Field label="Picked Up by Residents" value={toStr(pickups)} last />

              <Sect title="Guests" />
              <Field label="Guest Arrivals / Check-ins" value={toStr(guests)} last />

              <Sect title="Tours" />
              <Field label="Scheduled & Walk-in Tours" value={toStr(tours)} last />

              <Sect title="Loaners" />
              <Field label="Checkouts & Returns" value={toStr(loaners)} last />

              <Sect title="Lockouts" />
              <Field label="Keys & Access Requests" value={toStr(lockouts)} last />

              <Sect title="Vendors" />
              <Field label="Vendor Activity" value={toStr(vends)} last />

              {rounds.length > 0 && (
                <>
                  <Sect title="Security & Rounds" />
                  <Field label="Rounds Completed" value={toStr(rounds)} last />
                </>
              )}

              <Sect title="Shift Notes" />
              <div style={{ padding: isPhone ? '14px 14px 18px' : isMobile ? '14px 18px 18px' : '16px 32px 20px' }}>
                <p style={{ fontFamily: INTER, fontSize: 15, color: prevShift.note ? TEXT : MUTED, lineHeight: 1.65, margin: 0, fontStyle: prevShift.note ? 'normal' : 'italic' }}>{prevShift.note || 'No shift notes.'}</p>
              </div>

              {prevShift.openItems?.length > 0 && (
                <>
                  <Sect title="Open Items (Carry Over)" accent={ORANGE} />
                  {prevShift.openItems.map((item, i, arr) => (
                    <Field key={i} label={`Item ${i + 1}`} value={item} last={i === arr.length - 1} />
                  ))}
                </>
              )}

              {prevShift.incidents?.length > 0 && (
                <>
                  <Sect title="Incidents Filed" accent={RED} />
                  {prevShift.incidents.map((inc, i, arr) => (
                    <Field key={i} label={`Incident ${i + 1}`} value={inc} last={i === arr.length - 1} />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
        <StartBtn />
      </div>
    );
  };

  // ── HOME tab ───────────────────────────────────────────────────────────────
  const renderHomeContent = () => {
    // Build activeShift from real state (not mock data)
    const activeShift = isShiftActive ? {
      concierge: { name: authUser?.name || 'Concierge' },
      clockIn:   shiftStartTime,
      note:      '',
      incidents: incidents.filter(i => i.status === 'new').map(i => `${i.type || ''}: ${i.title || ''}`),
      activities: selfTasks,
    } : null;
    const activeTasks = tasks.filter(t => t.createdByType === 'manager' && t.status !== 'completed');
    const sevColor    = (sev) => sev === 'critical' || sev === 'high' ? RED : sev === 'medium' ? ORANGE : BLUE;

    const taskCatMap = { packages:'Delivery', mail:'Delivery', patrol:'Safety / Security', amenity:'Amenity', opening:'Administrative', coverage:'Administrative', documentation:'Administrative' };
    const todayLabel = new Date().toLocaleDateString('en-US', { month:'short', day:'numeric' });
    const isToday = ts => ts && ts.startsWith(todayLabel + ',');
    const completedTaskActs = isShiftActive ? displayTasks.filter(t=>t.status===TaskStatus.COMPLETED&&isToday(t.completedAt)).map(t=>({ id:'task-'+t.id, time:t.completedAt, title:t.title, notes:t.completionNote||'', category:taskCatMap[t.category]||'Administrative', evidenceUrls:t.evidenceUrls?.length?t.evidenceUrls:t.evidenceUrl?[t.evidenceUrl]:[] })) : [];
    const selfTaskActs = selfTasks.filter(t=>isToday(t.completedAt)).map(t=>({ id:'self-'+t.id, time:t.completedAt||'', title:t.title, notes:t.notes||'', category:t.category||'Administrative', evidenceUrls:Array.isArray(t.evidenceUrls)?t.evidenceUrls:t.evidenceUrl?[t.evidenceUrl]:[], _source:t._source||'task' }));
    // dashboardActs = sub-dashboard inputs (Guests, Vendors, Loaners, Lockout, etc.)
    // wizardActs = Log New Task wizard entries — always go to Tasks Completed
    const dashboardActs = selfTaskActs.filter(a => a._source === 'dashboard');
    const wizardActs    = selfTaskActs.filter(a => a._source !== 'dashboard');
    const delivery = dashboardActs.filter(a=>a.category==='Delivery');
    const security = dashboardActs.filter(a=>a.category==='Safety / Security');
    const resident = dashboardActs.filter(a=>a.category==='Resident Assist');
    const vends    = dashboardActs.filter(a=>a.category==='Vendor / Contractor');
    const amenity  = dashboardActs.filter(a=>a.category==='Amenity');
    const audit    = dashboardActs.find(a=>a.category==='Administrative'&&a.title.toLowerCase().includes('audit'));
    const loaners  = amenity.filter(a=>a.title.toLowerCase().includes('loaner'));
    const guests   = resident.filter(a=>a.title.toLowerCase().includes('guest')||a.title.toLowerCase().includes('arrival'));
    const tours    = resident.filter(a=>a.title.toLowerCase().includes('tour')||a.title.toLowerCase().includes('move'));
    const pickups  = delivery.filter(a=>a.title.toLowerCase().includes('pickup'));
    const incoming = delivery.filter(a=>!a.title.toLowerCase().includes('pickup'));
    const lockouts = security.filter(a=>a.title.toLowerCase().includes('lockout'));
    const rounds   = security.filter(a=>!a.title.toLowerCase().includes('lockout'));
    // Tasks Completed: all wizard tasks + all manager-assigned completed tasks
    const taskEntries = [...wizardActs, ...completedTaskActs].sort((a,b) => a.time.localeCompare(b.time));

    const Sect = ({ title, accent='#8FAEDD' }) => (
      <div style={{ background:accent, padding: isPhone ? '7px 14px' : isMobile ? '7px 18px' : '8px 32px', marginTop:4 }}>
        <span style={{ fontFamily:INTER, fontSize:12, fontWeight:800, color:TEXT, letterSpacing:'0.10em', textTransform:'uppercase' }}>{title}</span>
      </div>
    );
    const NarrativeEntry = ({ activity, last }) => (
      <div style={{ padding: isPhone ? '14px 14px' : isMobile ? '14px 18px' : '16px 32px', borderBottom: last ? 'none' : `1px solid ${BORDER}` }}>
        <p style={{ fontFamily:INTER, fontSize:15, color:TEXT, lineHeight:1.75, margin:0 }}>{toNarrative(activity)}</p>
        {Array.isArray(activity.evidenceUrls) && activity.evidenceUrls.length > 0 && (
          <div style={{ display:'flex', gap:6, marginTop:10 }}>
            {activity.evidenceUrls.map((url,i) => (
              <button key={i} onClick={() => setViewPhoto(url)} style={{ width:42,height:42,borderRadius:8,overflow:'hidden',border:`1.5px solid ${BORDER}`,padding:0,cursor:'pointer',background:CARD2,flexShrink:0 }}>
                <img src={url} alt={`evidence ${i+1}`} style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }} />
              </button>
            ))}
          </div>
        )}
      </div>
    );
    const NoActivity = ({ last }) => (
      <div style={{ padding: isPhone ? '14px 14px' : isMobile ? '14px 18px' : '16px 32px', borderBottom: last ? 'none' : `1px solid ${BORDER}` }}>
        <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, lineHeight:1.6, margin:0, fontStyle:'italic' }}>No activity logged this shift.</p>
      </div>
    );

    return (
    <div style={{ flex:1, minHeight:0, overflowY:'auto', padding: isMobile ? '64px 16px 48px' : '28px 28px 48px' }}>


      {/* 2-column Overview layout: DAR left, right col for tasks/incidents/actions */}
      <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection:'column', gridTemplateColumns:'1fr 460px', gap:24, alignItems: isMobile ? 'stretch' : 'start' }}>

        {/* Left: Daily Activity Report */}
        <div className="dar-print-target" style={{ background:CARD, border:`1.5px solid ${BORDER}`, borderRadius:20, overflow:'hidden', display:'flex', flexDirection:'column', order: isMobile ? 1 : 0 }}>
          {!activeShift ? (
            <div style={{ padding:40, textAlign:'center', fontFamily:INTER, fontSize:14, color:MUTED }}>No active shift today</div>
          ) : (
            <>
              <style>{`
                @keyframes dar-onduty-pulse {
                  0%,100% { box-shadow: 0 0 0 3px rgba(52,199,89,0.25); }
                  50%      { box-shadow: 0 0 0 7px rgba(52,199,89,0.06); }
                }
                .dar-onduty-dot { animation: dar-onduty-pulse 2.6s ease-in-out infinite; }
              `}</style>
              <div style={{ background:'#111827', padding: isMobile ? '14px 20px' : '20px 32px 18px' }}>
                {isMobile ? (
                  /* Mobile: 2-col matching Manager */
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <div style={{ fontFamily:INTER, fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.4)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:5 }}>DAR</div>
                      <div style={{ fontFamily:INTER, fontSize:17, fontWeight:700, color:'white', marginBottom:4 }}>{activeShift.concierge.name}</div>
                      <div style={{ fontFamily:INTER, fontSize:13, color:'rgba(255,255,255,0.50)' }}>
                        {new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} · {activeShift.clockIn} – Now
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                      {isPhone ? (
                        <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', background:'rgba(52,199,89,0.15)', borderRadius:999, padding:'11px' }}>
                          <div className="dar-onduty-dot" style={{ width:12, height:12, borderRadius:'50%', background:GREEN }} />
                        </div>
                      ) : (
                        <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(52,199,89,0.15)', borderRadius:999, padding:'5px 12px' }}>
                          <div className="dar-onduty-dot" style={{ width:7, height:7, borderRadius:'50%', background:GREEN }} />
                          <span style={{ fontFamily:INTER, fontSize:12, fontWeight:700, color:GREEN }}>On Duty</span>
                        </div>
                      )}
                      {isPhone ? (
                        <button onClick={() => window.print()} style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', padding:0, marginRight:7, background:'none', border:'none', cursor:'pointer' }}>
                          <Printer size={16} color='rgba(255,255,255,0.6)' />
                        </button>
                      ) : (
                        <button onClick={() => window.print()} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 10px', marginRight:4, marginTop:6, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.14)', borderRadius:7, fontFamily:INTER, fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.75)', cursor:'pointer' }}>
                          <Printer size={12} /> Export
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Desktop: 2-column matching Manager */
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <div style={{ fontFamily:INTER, fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.4)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:6 }}>Daily Activity Report</div>
                      <div style={{ fontFamily:INTER, fontSize:18, fontWeight:700, color:'white', marginBottom:5 }}>{activeShift.concierge.name}</div>
                      <div style={{ fontFamily:INTER, fontSize:14, color:'rgba(255,255,255,0.55)' }}>
                        {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})} · {activeShift.clockIn} – Present
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                      <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(52,199,89,0.15)', borderRadius:999, padding:'5px 12px' }}>
                        <div className="dar-onduty-dot" style={{ width:7, height:7, borderRadius:'50%', background:GREEN }} />
                        <span style={{ fontFamily:INTER, fontSize:12, fontWeight:700, color:GREEN }}>On Duty</span>
                      </div>
                      <button onClick={() => window.print()} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', marginRight:4, marginTop:6, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.14)', borderRadius:7, fontFamily:INTER, fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.75)', cursor:'pointer' }}>
                        <Printer size={12} /> Export
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ background:CARD }}>
                <Sect title="Start of Shift Package Audit" accent='#8FAEDD' />
                {audit
                  ? <NarrativeEntry activity={audit} last />
                  : <NoActivity last />
                }

                <Sect title="Packages" accent='#8FAEDD' />
                {[...incoming, ...pickups].length > 0
                  ? [...incoming, ...pickups].map((a, i, arr) => <NarrativeEntry key={a.id} activity={a} last={i === arr.length - 1} />)
                  : <NoActivity last />
                }

                <Sect title="Guests" accent='#8FAEDD' />
                {guests.length > 0
                  ? guests.map((a, i, arr) => <NarrativeEntry key={a.id} activity={a} last={i === arr.length - 1} />)
                  : <NoActivity last />
                }

                <Sect title="Tours" accent='#8FAEDD' />
                {tours.length > 0
                  ? tours.map((a, i, arr) => <NarrativeEntry key={a.id} activity={a} last={i === arr.length - 1} />)
                  : <NoActivity last />
                }

                <Sect title="Loaners" accent='#8FAEDD' />
                {loaners.length > 0
                  ? loaners.map((a, i, arr) => <NarrativeEntry key={a.id} activity={a} last={i === arr.length - 1} />)
                  : <NoActivity last />
                }

                <Sect title="Lockouts" accent='#8FAEDD' />
                {lockouts.length > 0
                  ? lockouts.map((a, i, arr) => <NarrativeEntry key={a.id} activity={a} last={i === arr.length - 1} />)
                  : <NoActivity last />
                }

                <Sect title="Vendors" accent='#8FAEDD' />
                {vends.length > 0
                  ? vends.map((a, i, arr) => <NarrativeEntry key={a.id} activity={a} last={i === arr.length - 1} />)
                  : <NoActivity last />
                }

                {rounds.length > 0 && (
                  <>
                    <Sect title="Security & Rounds" accent='#8FAEDD' />
                    {rounds.map((a, i, arr) => <NarrativeEntry key={a.id} activity={a} last={i === arr.length - 1} />)}
                  </>
                )}

                <Sect title="Shift Notes" accent='#8FAEDD' />
                <div style={{ padding: isPhone ? '16px 14px 20px' : isMobile ? '16px 18px 20px' : '20px 32px 24px' }}>
                  <p style={{ fontFamily:INTER, fontSize:17, color:TEXT, lineHeight:1.75, margin:0 }}>{activeShift.note}</p>
                </div>

                <Sect title="Tasks Completed" accent='#8FAEDD' />
                {taskEntries.length > 0
                  ? taskEntries.map((a, i, arr) => <NarrativeEntry key={a.id} activity={a} last={i === arr.length - 1} />)
                  : <NoActivity last />
                }

                {activeShift.incidents.length > 0 && (
                  <>
                    <Sect title="Incidents Filed" accent={RED} />
                    {activeShift.incidents.map((inc, i, arr) => (
                      <div key={i} style={{ padding: isPhone ? '14px 14px' : isMobile ? '14px 18px' : '16px 32px', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${BORDER}` }}>
                        <p style={{ fontFamily:INTER, fontSize:15, color:TEXT, lineHeight:1.75, margin:0 }}>{inc}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:20, order: isMobile ? 2 : 0 }}>

          {/* Active Tasks */}
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <ClipboardList size={20} color={ORANGE} />
                <h3 style={{ fontFamily:INTER, fontSize:17, fontWeight:700, color:TEXT, margin:0 }}>Assigned by Management</h3>
              </div>
              <span aria-live="polite" aria-label={`${activeTasks.length} active tasks`} style={{ width:32, height:32, borderRadius:'50%', background:activeTasks.length>0?`${ORANGE}14`:CARD2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:activeTasks.length>0?ORANGE:MUTED, flexShrink:0 }}>{activeTasks.length}</span>
            </div>
            {tasksLoading ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[0, 1, 2].map(i => {
                  const sk = isDarkMode ? 'skeleton-dark' : 'skeleton-light';
                  const widths = [[70, 42], [58, 35], [44, 28]];
                  return (
                    <div key={i} style={{ borderRadius:16, overflow:'hidden', background:CARD, border:`1px solid ${BORDER}`, display:'flex', opacity: 1 - i * 0.15 }}>
                      <div style={{ width:4, flexShrink:0, background:CARD2, borderRadius:'16px 0 0 16px' }} />
                      <div style={{ flex:1, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
                        <div className={sk} style={{ width:36, height:36, borderRadius:10, flexShrink:0 }} />
                        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:7 }}>
                          <div className={sk} style={{ height:14, borderRadius:6, width: widths[i][0] + '%' }} />
                          <div className={sk} style={{ height:11, borderRadius:5, width: widths[i][1] + '%' }} />
                        </div>
                        <div className={sk} style={{ width:52, height:22, borderRadius:6, flexShrink:0 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : tasksError ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'24px 16px', textAlign:'center' }}>
                <div style={{ width:48, height:48, borderRadius:14, background:'rgba(255,59,48,0.08)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                  <AlertTriangle size={22} color={RED} />
                </div>
                <p style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, margin:'0 0 4px' }}>Couldn't load tasks</p>
                <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:'0 0 14px' }}>Check your connection and try again</p>
                <button onClick={() => { setTasksLoading(true); setTasksError(false); authApi.getTasks().then(list => { setTasks(list); setTasksLoading(false); }).catch(() => { setTasksLoading(false); setTasksError(true); }); }}
                  style={{ padding:'8px 18px', background:BLUE, border:'none', borderRadius:10, fontFamily:INTER, fontSize:13, fontWeight:700, color:'white', cursor:'pointer' }}>
                  Retry
                </button>
              </div>
            ) : activeTasks.length > 0 ? (
              <div data-card-list role="list" style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {activeTasks.slice(0,5).map(task => (
                  <TaskCard key={task.id} task={task} onStartTask={handleStartTask} successId={successTaskId} />
                ))}
                {activeTasks.length > 5 && (
                  <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, textAlign:'center', margin:'4px 0 0' }}>+{activeTasks.length-5} more</p>
                )}
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'28px 16px', textAlign:'center' }}>
                <div style={{ width:56, height:56, borderRadius:18, background:`${GREEN}12`, border:`1.5px solid ${GREEN}25`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                  <CheckCircle size={26} color={GREEN} />
                </div>
                <p style={{ fontFamily:INTER, fontSize:15, fontWeight:700, color:TEXT, margin:'0 0 4px', letterSpacing:'-0.01em' }}>You're all caught up</p>
                <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:0, lineHeight:1.5 }}>No tasks assigned yet — check back or pull to refresh</p>
              </div>
            )}
          </div>

          {/* Open Incidents */}
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <AlertTriangle size={20} color={RED} />
                <h3 style={{ fontFamily:INTER, fontSize:17, fontWeight:700, color:TEXT, margin:0 }}>Open Incidents</h3>
              </div>
              <span style={{ width:32, height:32, borderRadius:'50%', background:incidents.length>0?`${RED}14`:CARD2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:incidents.length>0?RED:MUTED, flexShrink:0 }}>{incidents.length}</span>
            </div>
            {incidents.length === 0 ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'20px 0', textAlign:'center' }}>
                <div style={{ width:48, height:48, borderRadius:14, background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                  <CheckCircle size={22} color={GREEN} />
                </div>
                <p style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, margin:'0 0 4px' }}>All clear</p>
                <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:0 }}>No open incidents right now</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {incidents.map(inc => (
                  <div key={inc.id} style={{ background:CARD2, border:`1px solid ${sevColor(inc.severity)}30`, borderRadius:14, padding:16, display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:`${sevColor(inc.severity)}14`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <AlertTriangle size={22} color={sevColor(inc.severity)} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontFamily:INTER, fontSize:14, fontWeight:700, color:TEXT, margin:'0 0 3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{inc.title}</p>
                      <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:0 }}>{inc.description || inc.note || inc.createdAt}</p>
                    </div>
                    <button onClick={()=>handleTabChange('incident')} style={{ flexShrink:0, padding:'8px 14px', background:`${BLUE}14`, border:`1px solid ${BLUE}25`, borderRadius:10, fontFamily:INTER, fontSize:12, fontWeight:700, color:BLUE, cursor:'pointer' }}>View</button>
                  </div>
                ))}
              </div>
            )}
          </div>


        </div>
      </div>
    </div>
    );
  };

  // ── REQUESTS tab ───────────────────────────────────────────────────────────
  const renderRequestsContent = () => (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 24, background: BG }}>
      <div style={{ padding: '16px 16px 14px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={20} color={BLUE} />
            <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Requests from Management</h2>
          </div>
          {pendingRequests.length > 0 && (
            <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,56,92,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: BLUE, flexShrink: 0 }}>{pendingRequests.length}</span>
          )}
        </div>
        {pendingRequests.length > 0 ? pendingRequests.map(task => (
          <TaskRequestCard
            key={task.id}
            task={{
              ...task,
              scheduledTime: task.dueTime,
              proposedBy:    task.createdBy,
              description:   task.notes,
            }}
            onAccept={() => handleAcceptRequest(task)}
            onDecline={(id) => handleDeclineRequest(task.id)}
          />
        )) : (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: `${GREEN}12`, border: `1.5px solid ${GREEN}25`, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Sparkles size={28} color={GREEN} strokeWidth={1.5} />
            </div>
            <div style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 6, letterSpacing: '-0.01em' }}>Inbox zero</div>
            <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>No pending requests — management hasn't sent anything new</div>
          </div>
        )}
      </div>
    </div>
  );

  // ── NEW TASK tab ───────────────────────────────────────────────────────────
  const renderNewTaskContent = () => (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24, background: BG }}>
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Hero CTA */}
        <button onClick={() => setShowNewTask(true)}
          style={{ width: '100%', padding: 20, background: BLUE, borderRadius: 20, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: `0 8px 28px ${BLUE}40` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.20)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={28} color="white" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontFamily: INTER, fontSize: 17, fontWeight: 700, color: 'white', margin: '0 0 3px' }}>Log Task</p>
              <p style={{ fontFamily: INTER, fontSize: 13, color: 'rgba(255,255,255,0.72)', margin: 0 }}>Record work you've done this shift</p>
            </div>
          </div>
          <ChevronRight size={24} color="rgba(255,255,255,0.72)" />
        </button>

        {/* Section header */}
        {selfTasks.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClipboardList size={20} color={BLUE} />
                <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Logged Tasks</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => {
                  const lines = selfTasks.map((t, i) => `${i+1}. [${t.category||'General'}] ${t.title}${t.notes ? ` — ${t.notes}` : ''}${t.location ? ` (${t.location})` : ''}`).join('\n');
                  const date = new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
                  const name = authUser?.name || 'Concierge';
                  const text = `SHIFT SUMMARY\n${date} · ${name}\nTime on Duty: ${shiftStartTime ? `${shiftStartTime} – Present` : 'Active shift'}\n\nACTIVITIES LOGGED (${selfTasks.length}):\n${lines}\n\nKEY STATS:\n• Packages handled: ${selfTasks.filter(t=>(t.category||'').includes('Delivery')).length}\n• Security events: ${selfTasks.filter(t=>(t.category||'').includes('Safety')).length}\n• Resident assists: ${selfTasks.filter(t=>(t.category||'').includes('Resident')).length}\n\nAll events documented in the activity log. Ready for handoff.`;
                  setSummaryText(text);
                  setShowSummary(true);
                }}
                  style={{ height: 32, padding: '0 12px', background: 'rgba(255,56,92,0.08)', border: '1px solid rgba(255,56,92,0.2)', borderRadius: 10, fontFamily: INTER, fontSize: 12, fontWeight: 700, color: BLUE, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
                  <Sparkles size={13} /> AI Summary
                </button>
                <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,56,92,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: BLUE, flexShrink: 0 }}>{selfTasks.length}</span>
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {selfTasks.length === 0 && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: CARD2, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <PlusCircle size={30} color={MUTED} strokeWidth={1.5} />
            </div>
            <div style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 6, letterSpacing: '-0.01em' }}>Nothing logged yet</div>
            <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>Tap "Log Task" above to record your first activity this shift</div>
          </div>
        )}

        {/* Task cards */}
        {selfTasks.map(t => {
          const catConf = TASK_CATEGORY_CONFIG.find(c => c.id === t.category);
          const CatIcon = catConf?.Icon || CheckCircle;
          return (
            <div key={t.id} className="stagger-item" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 52, height: 52, background: 'rgba(255,56,92,0.10)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CatIcon size={24} color={BLUE} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
                  <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>{t.title}</div>
                  <span style={{ fontFamily: INTER, fontSize: 11, color: MUTED, flexShrink: 0 }}>{t.completedAt}</span>
                </div>
                {t.category && (
                  <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: BLUE, background: 'rgba(255,56,92,0.10)', borderRadius: 6, padding: '2px 7px', display: 'inline-block', marginBottom: t.notes ? 6 : 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.category}</span>
                )}
                {t.notes && <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, lineHeight: 1.4 }}>{t.notes}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── SHIFT LOG tab ──────────────────────────────────────────────────────────
  const renderShiftContent = () => (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 116 }}>
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Header */}
        <div style={{ marginBottom: 4 }}>
          <SectionLabel>SHIFT MANAGEMENT</SectionLabel>
          <div style={{ marginTop: 3 }}><SectionTitle>Clock & Log</SectionTitle></div>
        </div>

        {/* Shift status card */}
        <Card style={{ padding: 20, position: 'relative', overflow: 'hidden' }} testId="shift-status-card">
          <Ghost label="SHIFT" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20, textAlign: 'center' }}>
              {[
                { label: 'Clock In',     value: shiftStartTime || '—' },
                { label: 'Clock Out',    value: clockOutTime   || '—' },
                { label: 'Weekly Hrs',   value: '32.5h' },
              ].map(({ label, value }, i) => (
                <div key={i} style={{ borderRight: i < 2 ? `1px solid ${BORDER}` : 'none' }}>
                  <div style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: INTER, fontSize: '1.5rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>{value}</div>
                </div>
              ))}
            </div>
            <button onClick={isShiftActive ? handleClockOut : handleClockIn} data-testid="clock-btn"
              style={{ width: '100%', padding: '15px 0', background: isShiftActive ? RED : GREEN, border: 'none', borderRadius: 999, fontFamily: INTER, fontSize: 16, fontWeight: 600, color: 'white', cursor: 'pointer' }}>
              {isShiftActive ? 'Clock Out' : 'Clock In'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
              <MapPin size={13} color={MUTED} />
              <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>GPS verification · {BUILDING_PROFILE.address}</span>
            </div>
          </div>
        </Card>

        {/* Handoff note */}
        <Card style={{ padding: 16, background: 'rgba(255,56,92,0.05)', border: `1px solid rgba(255,56,92,0.2)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, background: 'rgba(255,56,92,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookOpen size={16} color={BLUE} />
            </div>
            <div style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: BLUE }}>Last Night's Handoff</div>
            <span style={{ marginLeft: 'auto', fontFamily: INTER, fontSize: 11, color: MUTED }}>Marcus D. · Maverick</span>
          </div>
          <p style={{ fontFamily: INTER, fontSize: 13, color: TEXT, lineHeight: 1.6, margin: 0 }}>
            "Two incidents: unauthorized vehicle on P2 (photographed — awaiting tow approval). Noise complaint floor 9, unit 912 — resolved at 11:30pm. Garage gate P2 still slow, forwarded to maintenance."
          </p>
        </Card>

        {/* Shift history */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <SectionTitle style={{ fontSize: '1rem' }}>Recent Shifts</SectionTitle>
            <div style={{ display: 'flex', gap: 6 }}>
              {['all','day','night'].map(f => (
                <button key={f} onClick={() => setHistoryFilter(f === 'day' ? 'completed' : f === 'night' ? 'completed' : 'all')}
                  style={{ padding: '5px 12px', borderRadius: 999, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: historyFilter === (f === 'all' ? 'all' : 'completed') && f === 'all' && historyFilter === 'all' ? BLUE : CARD2, color: historyFilter === 'all' && f === 'all' ? 'white' : MUTED }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredHistory.map(shift => (
              <Card key={shift.id} style={{ padding: 16, borderLeft: `3px solid ${shift.incidentCount > 0 ? ORANGE : GREEN}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT }}>{shift.date}</span>
                    <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginLeft: 8 }}>{shift.shiftType}</span>
                  </div>
                  <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(5,150,105,0.10)', color: GREEN }}>
                    {shift.tasksCompleted}/{shift.totalTasks} tasks
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: shift.summary ? 8 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <User size={12} color={MUTED} />
                    <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{shift.staff} · {shift.company}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={12} color={MUTED} />
                    <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{shift.hours}</span>
                  </div>
                  {shift.incidentCount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={12} color={ORANGE} />
                      <span style={{ fontFamily: INTER, fontSize: 12, color: ORANGE, fontWeight: 700 }}>{shift.incidentCount} incident{shift.incidentCount > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
                {shift.summary && (
                  <p style={{ fontFamily: INTER, fontSize: 12, color: MUTED, lineHeight: 1.55, margin: 0, fontStyle: 'italic' }}>"{shift.summary}"</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── PROFILE tab ───────────────────────────────────────────────────────────
  const renderProfileContent = () => (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 32, background: BG }}>

      {/* Hero — photo + name + shift status */}
      <div style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, padding: '28px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <div style={{ width:100, height:100, borderRadius:'50%', background:`${BLUE}14`, border:`3px solid ${BLUE}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontFamily:INTER, fontSize:32, fontWeight:800, color:BLUE }}>{(authUser?.name||'C').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</span>
          </div>
          <div style={{ position: 'absolute', bottom: 2, right: 2, width: 22, height: 22, borderRadius: '50%', background: isShiftActive ? GREEN : MUTED, border: `3px solid ${CARD}` }} />
        </div>
        <div style={{ fontFamily: INTER, fontSize: 22, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', marginBottom: 4 }}>
          {(authUser?.name || 'Concierge')}
        </div>
        <div style={{ fontFamily: INTER, fontSize: 14, color: MUTED, marginBottom: 10 }}>
          {(authUser?.title || 'Concierge')} · {(authUser?.property_name || '')}
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: isShiftActive ? 'rgba(52,199,89,0.10)' : 'rgba(113,113,113,0.10)', borderRadius: 999, padding: '5px 12px' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: isShiftActive ? GREEN : MUTED }} />
          <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: isShiftActive ? GREEN : MUTED }}>
            {isShiftActive ? `On Shift · since ${shiftStartTime}` : 'Off Shift'}
          </span>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: BORDER, borderRadius: 16, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
          {[
            { value: 5.0,          label: 'Rating',         color: '#EAB308' },
            { value: 0, label: 'Yrs Experience', color: BLUE      },
            { value: 0,  label: 'Shifts',         color: BLUE      },
          ].map(({ value, label, color }) => (
            <div key={label} style={{ background: CARD, padding: '18px 8px', textAlign: 'center' }}>
              <div style={{ fontFamily: INTER, fontSize: '1.8rem', fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
              <div style={{ fontFamily: INTER, fontSize: 11, color: MUTED, marginTop: 5, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '16px 18px' }}>
          <div style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 14 }}>Contact Information</div>
          {[
            { label: 'Email', value: (authUser?.email || '') },
            { label: 'Phone', value: (authUser?.phone || '') },
          ].map(({ label, value }, i, arr) => (
            <div key={label} style={{ paddingBottom: i < arr.length - 1 ? 12 : 0, marginBottom: i < arr.length - 1 ? 12 : 0, borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
              <div style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: INTER, fontSize: 15, color: TEXT }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Property assignment */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,56,92,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPin size={18} color={BLUE} />
          </div>
          <div>
            <div style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 3 }}>{propertyName}</div>
            <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{BUILDING_PROFILE.company} · {BUILDING_PROFILE.units} units</div>
            <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginTop: 2 }}>{BUILDING_PROFILE.address}</div>
          </div>
        </div>

        {/* Certifications */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '16px 18px' }}>
          <div style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 12 }}>Certifications</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Concierge Certified'].map(cert => (
              <span key={cert} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'rgba(255,56,92,0.08)', border: '1px solid rgba(255,56,92,0.2)', color: BLUE, borderRadius: 999, fontFamily: INTER, fontSize: 12, fontWeight: 700 }}>
                <Check size={13} /> {cert}
              </span>
            ))}
          </div>
        </div>

        {/* Previous employers */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '16px 18px' }}>
          <div style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 12 }}>Previous Employers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[].map((emp, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: MUTED, flexShrink: 0 }} />
                <span style={{ fontFamily: INTER, fontSize: 14, color: MUTED }}>{emp}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );

  // ── MENU tab ───────────────────────────────────────────────────────────────
  const SOP_ICON_CONFIG = {
    'Amenity Hours':      Waves,
    'Guest Policy':       UserCheck,
    'Noise & Quiet Hours': Bell,
    'Security':           Shield,
    'Move-In / Move-Out': Truck,
    'Emergency':          AlertTriangle,
    'Package Management': Package,
  };

  const SOP_COLOR_CONFIG = {
    'Emergency':          RED,
    'Security':           ORANGE,
    'Move-In / Move-Out': BLUE,
    'Amenity Hours':      GREEN,
    'Guest Policy':       BLUE,
    'Noise & Quiet Hours':ORANGE,
    'Package Management': GREEN,
  };

  const renderSettingsContent = () => {
    const toggle = (id) => setSettingExp(e => e === id ? null : id);
    const inputStyle = { fontFamily:INTER, fontSize:14, color:TEXT, background:CARD2, border:`1px solid ${BORDER}`, borderRadius:10, padding:'12px 14px', outline:'none', width:'100%', boxSizing:'border-box' };
    const sectionLabel = (txt) => <p style={{ fontFamily:INTER, fontSize:11, fontWeight:800, color:MUTED, letterSpacing:'0.14em', textTransform:'uppercase', margin:'0 0 12px' }}>{txt}</p>;
    const row = (id, Icon, color, title, desc, extra) => (
      <div key={id} style={{ borderRadius:16, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
        <button onClick={() => toggle(id)} style={{ width:'100%', display:'flex', alignItems:'center', gap:16, padding:20, background:CARD, border:`1px solid ${settingExp===id ? `${color}35` : BORDER}`, borderRadius: settingExp===id ? '16px 16px 0 0' : 16, cursor:'pointer', textAlign:'left', transition:'all 150ms' }}>
          <div style={{ width:52, height:52, borderRadius:14, background:`${color}12`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Icon size={22} color={color} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontFamily:INTER, fontSize:15, fontWeight:700, color:TEXT, margin:'0 0 3px' }}>{title}</p>
            <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:0 }}>{desc}</p>
          </div>
          <ChevronRight size={18} color={MUTED} style={{ transform: settingExp===id ? 'rotate(90deg)' : 'none', transition:'transform 200ms', flexShrink:0 }} />
        </button>
        {settingExp === id && (
          <div style={{ background:CARD2, border:`1px solid ${color}20`, borderTop:'none', borderRadius:'0 0 16px 16px', padding:'16px 20px 20px' }}>
            {extra}
          </div>
        )}
      </div>
    );

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:28, padding:'28px 24px 40px' }}>

        {/* Profile Hero */}
        <button onClick={() => handleTabChange('profile')}
          style={{ background:`${BLUE}08`, border:`1px solid ${BLUE}20`, borderRadius:20, padding:24, display:'flex', alignItems:'center', gap:20, cursor:'pointer', textAlign:'left', width:'100%', transition:'background 150ms' }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:`${BLUE}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <User size={32} color={BLUE} />
          </div>
          <div>
            <p style={{ fontFamily:INTER, fontSize:20, fontWeight:800, color:TEXT, margin:'0 0 3px', letterSpacing:'-0.02em' }}>{(authUser?.name || 'Concierge')}</p>
            <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:'0 0 10px' }}>{(authUser?.title || 'Concierge')}</p>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(52,199,89,0.12)', border:'1px solid rgba(52,199,89,0.25)', borderRadius:999, padding:'5px 12px' }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:GREEN, boxShadow:'0 0 0 2px rgba(52,199,89,0.3)' }} />
              <span style={{ fontFamily:INTER, fontSize:12, fontWeight:700, color:GREEN }}>{isShiftActive ? 'On Shift' : 'Off Shift'}</span>
            </div>
          </div>
          <ChevronRight size={20} color={MUTED} style={{ marginLeft:'auto', flexShrink:0 }} />
        </button>

        {/* My Profile */}
        <div>
          {sectionLabel('My Profile')}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {row('update-info', User, BLUE, 'Update Information', 'Edit your name, email and contact details',
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <input style={inputStyle} value={editInfoCG.name}  onChange={e => setEditInfoCG(f=>({...f,name:e.target.value}))}  placeholder="Full name" />
                <input style={inputStyle} value={editInfoCG.email} onChange={e => setEditInfoCG(f=>({...f,email:e.target.value}))} placeholder="Email address" />
                <input style={inputStyle} value={editInfoCG.phone} onChange={e => setEditInfoCG(f=>({...f,phone:e.target.value}))} placeholder="Phone number" />
                <button onClick={() => setSettingExp(null)} style={{ marginTop:4, padding:'12px', background:BLUE, border:'none', borderRadius:10, fontFamily:INTER, fontSize:14, fontWeight:700, color:'white', cursor:'pointer' }}>Save Changes</button>
              </div>
            )}
            {row('change-pw', Lock, RED, 'Change Password', 'Update your account password securely',
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <input style={inputStyle} type="password" value={pwFormCG.current} onChange={e => { setPwFormCG(f=>({...f,current:e.target.value})); setPwStatusCG(''); }} placeholder="Current password" />
                <input style={inputStyle} type="password" value={pwFormCG.next}    onChange={e => { setPwFormCG(f=>({...f,next:e.target.value}));    setPwStatusCG(''); }} placeholder="New password (min 6 chars)" />
                <input style={inputStyle} type="password" value={pwFormCG.confirm} onChange={e => { setPwFormCG(f=>({...f,confirm:e.target.value})); setPwStatusCG(''); }} placeholder="Confirm new password" />
                {pwStatusCG.startsWith('error') && <p style={{ fontFamily:INTER, fontSize:13, color:RED, margin:0, fontWeight:600 }}>{pwStatusCG.replace('error:','')}</p>}
                {pwStatusCG === 'success' && <p style={{ fontFamily:INTER, fontSize:13, color:GREEN, margin:0, fontWeight:600 }}>Password updated successfully.</p>}
                <button
                  disabled={pwStatusCG === 'saving'}
                  onClick={async () => {
                    if (!pwFormCG.current || !pwFormCG.next || !pwFormCG.confirm) { setPwStatusCG('error:Please fill in all fields.'); return; }
                    if (pwFormCG.next !== pwFormCG.confirm) { setPwStatusCG('error:New passwords do not match.'); return; }
                    if (pwFormCG.next.length < 6) { setPwStatusCG('error:New password must be at least 6 characters.'); return; }
                    setPwStatusCG('saving');
                    try {
                      await authApi.changePassword(pwFormCG.current, pwFormCG.next);
                      setPwStatusCG('success');
                      setPwFormCG({ current:'', next:'', confirm:'' });
                      setTimeout(() => { setPwStatusCG(''); setSettingExp(null); }, 2000);
                    } catch (err) {
                      setPwStatusCG('error:' + (err?.response?.data?.detail || 'Failed to update password.'));
                    }
                  }}
                  style={{ marginTop:4, padding:'12px', background: pwStatusCG==='saving' ? MUTED : RED, border:'none', borderRadius:10, fontFamily:INTER, fontSize:14, fontWeight:700, color:'white', cursor: pwStatusCG==='saving' ? 'not-allowed' : 'pointer' }}>
                  {pwStatusCG === 'saving' ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security & Privacy */}
        <div>
          {sectionLabel('Security & Privacy')}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {row('2fa',     Shield,      GREEN,  'Two-Factor Authentication', 'Add an extra layer of security to your account', <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:0 }}>Two-factor authentication is managed by your property administrator.</p>)}
            {row('privacy', BookOpen,    BLUE,   'Privacy Settings',          'Control how your data is used and shared',        <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:0 }}>Your data is stored securely and never shared without consent.</p>)}
          </div>
        </div>

        {/* Teams & Conditions */}
        <div>
          {sectionLabel('Teams & Conditions')}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {row('team',  Users,         ORANGE, 'Team Settings',   'Manage your team access and permissions',     <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:0 }}>Team roles and permissions are managed by your property manager.</p>)}
            {row('terms', ClipboardList, MUTED,  'Terms of Service','Review the platform terms of service',        <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:0 }}>By using this platform you agree to our terms of service and usage policy.</p>)}
            {row('pp',    HelpCircle,    MUTED,  'Privacy Policy',  'How we collect, use and protect your data',   <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:0 }}>We collect only the data necessary to operate the platform and never sell your information.</p>)}
          </div>
        </div>

        {/* Account */}
        <div>
          {sectionLabel('Account')}
          <button onClick={onSignOut} data-testid="menu-sign-out-btn"
            style={{ width:'100%', padding:20, display:'flex', alignItems:'center', gap:16, background:'rgba(255,59,48,0.05)', border:`2px solid rgba(255,59,48,0.20)`, borderRadius:16, cursor:'pointer', textAlign:'left' }}>
            <div style={{ width:52, height:52, borderRadius:14, background:'rgba(255,59,48,0.10)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <LogOut size={22} color={RED} />
            </div>
            <div>
              <p style={{ fontFamily:INTER, fontSize:16, fontWeight:700, color:RED, margin:'0 0 3px' }}>Sign Out</p>
              <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:0 }}>End your session securely</p>
            </div>
          </button>
        </div>
      </div>
    );
  };

  // ── SOPs (read-only) ───────────────────────────────────────────────────────
  const renderSOPs = () => {
    const SOP_ICON_MAP = {
      'Amenity Hours': Waves, 'Guest Policy': User, 'Noise & Quiet Hours': Phone,
      'Security': Shield, 'Move-In / Move-Out': Truck, 'Emergency': AlertTriangle,
      'Package Management': Package, 'Other': HelpCircle,
    };
    const SOP_COLOR_MAP = {
      'Emergency': RED, 'Security': ORANGE, 'Move-In / Move-Out': BLUE,
      'Amenity Hours': GREEN, 'Guest Policy': BLUE,
      'Noise & Quiet Hours': ORANGE, 'Package Management': GREEN,
    };

    if (uploadedSOPs.length === 0) {
      return (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', gap:16, padding:'24px 20px 0', textAlign:'center' }}>
          <div style={{ width:72, height:72, borderRadius:22, background:'rgba(255,56,92,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <BookOpen size={36} color={BLUE} />
          </div>
          <div>
            <p style={{ fontFamily:INTER, fontSize:'1.1rem', fontWeight:700, color:TEXT, margin:'0 0 8px', letterSpacing:'-0.01em' }}>No SOPs uploaded yet</p>
            <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:0, lineHeight:1.6 }}>Your manager will upload building procedures here for you to reference.</p>
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
        {uploadedSOPs.map((sop) => {
          const CatIcon = sop.fileType === 'image' ? Image : sop.fileType === 'pdf' ? FileText : (SOP_ICON_MAP[sop.category] || BookOpen);
          const catColor = SOP_COLOR_MAP[sop.category] || MUTED;
          const typeLabel = sop.fileType === 'image' ? 'Photo' : 'PDF';
          const typeBadgeColor = sop.fileType === 'image' ? GREEN : ORANGE;
          return (
            <button key={sop.id} onClick={() => setFullscreenItem(sop)}
              style={{ padding:20, borderRadius:16, textAlign:'left', display:'flex', alignItems:'center', gap:16, cursor:'pointer', width:'100%', background:CARD, border:`1px solid ${BORDER}` }}>
              <div style={{ width:56, height:56, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:CARD2, overflow:'hidden' }}>
                {sop.fileType === 'image' ? (
                  <img src={sop.dataURL} alt={sop.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                ) : (
                  <CatIcon size={26} color={catColor} />
                )}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'0.12em', margin:'0 0 4px' }}>{sop.category}</p>
                <p style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:16, margin:'0 0 6px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sop.title}</p>
                <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:8, background:typeBadgeColor, fontFamily:INTER, fontSize:11, fontWeight:700, color:'white' }}>
                  <FileText size={11} color="white" />{typeLabel}
                </span>
              </div>
              <ChevronRight size={18} color={MUTED} style={{ flexShrink:0 }} />
            </button>
          );
        })}
      </div>
    );
  };

  // ── Training (read-only) ───────────────────────────────────────────────────
  const renderTrainingContent = () => {
    const TRAINING_ICON_MAP = {
      'Onboarding': UserCheck, 'Safety & Emergency': Shield, 'Guest Experience': Star,
      'Building Systems': Wrench, 'Amenity Operations': MapPin, 'Software & Tools': Settings,
      'Other': HelpCircle,
    };

    if (trainingItems.length === 0) {
      return (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', gap:16, padding:'24px 20px 0', textAlign:'center' }}>
          <div style={{ width:72, height:72, borderRadius:22, background:'rgba(255,56,92,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <GraduationCap size={36} color={BLUE} />
          </div>
          <div>
            <p style={{ fontFamily:INTER, fontSize:'1.1rem', fontWeight:700, color:TEXT, margin:'0 0 8px', letterSpacing:'-0.01em' }}>No training materials yet</p>
            <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:0, lineHeight:1.6 }}>Your manager will upload training documents, videos, and images here.</p>
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
        {trainingItems.map((item) => {
          const CatIcon = TRAINING_ICON_MAP[item.category] || HelpCircle;
          const typeLabel = item.fileType === 'video' ? 'Video' : item.fileType === 'image' ? 'Photo' : 'PDF';
          const typeBadgeColor = item.fileType === 'video' ? BLUE : item.fileType === 'image' ? GREEN : ORANGE;
          const TypeIcon = item.fileType === 'video' ? Video : item.fileType === 'image' ? Image : FileText;
          return (
            <button key={item.id} onClick={() => setFullscreenItem(item)}
              style={{ padding:20, borderRadius:16, textAlign:'left', display:'flex', alignItems:'center', gap:16, cursor:'pointer', width:'100%', background:CARD, border:`1px solid ${BORDER}` }}>
              <div style={{ width:56, height:56, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:CARD2, overflow:'hidden' }}>
                {item.fileType === 'image' ? (
                  <img src={item.dataURL} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                ) : (
                  <CatIcon size={26} color={MUTED} />
                )}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'0.12em', margin:'0 0 4px' }}>{item.category}</p>
                <p style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:16, margin:'0 0 6px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</p>
                <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:8, background:typeBadgeColor, fontFamily:INTER, fontSize:11, fontWeight:700, color:'white' }}>
                  <TypeIcon size={11} color="white" />{typeLabel}
                </span>
              </div>
              <ChevronRight size={18} color={MUTED} style={{ flexShrink:0 }} />
            </button>
          );
        })}
      </div>
    );
  };

  // ── SHELL ──────────────────────────────────────────────────────────────────
  const PAGE_TITLES = {
    home: "Today's Tasks", requests: 'Requests', packages: 'Packages',
    loaners: 'Loaners', lockout: 'Lockouts', tours: 'Tours',
    vendors: 'Vendors', incident: 'Incident Report', calendar: 'Calendar',
    'shift-history': 'Shift History', messages: 'Messages',
    guests: 'Guests', settings: 'Settings', profile: 'Profile',
    sops: 'Building SOPs', training: 'Training', followup: 'Follow-up Tracker',
  };

  const NAV_ITEMS = [
    { id: 'home',          Icon: Home,          label: "Today's"             },
    { id: 'new-task',      Icon: Plus,          label: 'New Task',           action: () => setShowNewTask(true) },
    { id: 'requests',      Icon: Bell,          label: 'Requests'            },
    { id: 'packages',      Icon: Package,       label: 'Packages'            },
    { id: 'guests',        Icon: UserCheck,     label: 'Guests'              },
    { id: 'lockout',       Icon: Lock,          label: 'Lockouts'            },
    { id: 'vendors',       Icon: Wrench,        label: 'Vendors'             },
    { id: 'tours',         Icon: Users,         label: 'Tours'               },
    { id: 'loaners',       Icon: ShoppingCart,  label: 'Loaners'             },
    { id: 'incident',      Icon: AlertTriangle,  label: 'Incident'   },
    { id: 'followup',      Icon: Flag,           label: 'Follow-ups',  badge: followUps.items.filter(i => i.status !== 'resolved').length || null },
    { id: 'sops',          Icon: BookOpen,       label: 'SOPs'       },
    { id: 'training',      Icon: GraduationCap,  label: 'Training'   },
    { id: 'calendar',      Icon: Calendar,       label: 'Shifts'     },
    { id: 'settings',      Icon: Settings,       label: 'Settings'   },
    { id: 'emergency',     Icon: Phone,         label: 'Emergency Contacts', action: () => setShowContacts(true) },
  ];

  /* ── Shift Calendar ─────────────────────────────────────────────────────────── */
  const renderShifts = () => {
    // Convert backend shift history to display format, keyed by date
    const shiftDatesMap = {};
    shiftHistory.forEach(s => {
      const dateKey = s.clock_in ? s.clock_in.split('T')[0] : null;
      if (!dateKey) return;
      const clockInDate  = s.clock_in  ? new Date(s.clock_in)  : null;
      const clockOutDate = s.clock_out ? new Date(s.clock_out) : null;
      const msElapsed    = clockInDate && clockOutDate ? clockOutDate - clockInDate : 0;
      const hrs  = Math.floor(msElapsed / 3600000);
      const mins = Math.floor((msElapsed % 3600000) / 60000);
      const cname = s.concierge_name || authUser?.name || '';
      const cinit = cname.trim().split(/\s+/).map(w => w[0]).join('').slice(0,2).toUpperCase() || 'C';
      shiftDatesMap[dateKey] = {
        concierge: { name: cname, init: cinit },
        clockIn:   clockInDate  ? clockInDate.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' }) : '',
        clockOut:  clockOutDate ? clockOutDate.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' }) : null,
        status:    s.status || 'completed',
        duration:  msElapsed > 0 ? `${hrs}h ${mins}m` : (s.status === 'active' ? 'Ongoing' : '—'),
        activities: (s.activities || []).map(t => ({
          id: t.task_id, time: t.created_at ? new Date(t.created_at).toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' }) : '—',
          title: t.title || '', notes: t.notes || '', category: t.category || 'Other',
        })),
        incidents: (s.incidents || []).map(i => `${i.type || 'Incident'}: ${i.description || i.title || ''}`),
        note: '',
      };
    });
    const shiftDatesSet = new Set(Object.keys(shiftDatesMap));

    const year   = shCalDate.getFullYear();
    const month  = shCalDate.getMonth();
    const cells  = getCalCells(year, month);
    const prefix = toDS(year, month, 1).slice(0, 7);
    const monthCount = (y, m) => [...shiftDatesSet].filter(d => d.startsWith(toDS(y, m, 1).slice(0,7))).length;
    const selectedShift = shiftDay ? shiftDatesMap[shiftDay] : null;

    const ShActRow = ({ a }) => {
      const CIcon = SH_CAT_ICON[a.category] ?? HelpCircle;
      const cc    = SH_CAT_COLOR[a.category] ?? MUTED;
      return (
        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'11px 0', borderBottom:`1px solid ${BORDER}` }}>
          <div style={{ width:40, height:40, borderRadius:11, background:`${cc}14`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <CIcon size={18} color={cc} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:INTER, fontSize:14, fontWeight:700, color:TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.title}</div>
            {a.notes && <div style={{ fontFamily:INTER, fontSize:12, color:MUTED, marginTop:2 }}>{a.notes}</div>}
          </div>
          <span style={{ fontFamily:INTER, fontSize:12, color:MUTED, flexShrink:0 }}>{a.time}</span>
        </div>
      );
    };

    const shiftDARBody = (s, dateLabel) => {
      const acts     = s.activities;
      const toStr    = arr => arr.length > 0 ? arr.map(a => `${a.time}: ${a.title}${a.notes ? ' · ' + a.notes : ''}`).join('\n') : 'N/A';
      const delivery = acts.filter(a => a.category === 'Delivery');
      const security = acts.filter(a => a.category === 'Safety / Security');
      const resident = acts.filter(a => a.category === 'Resident Assist');
      const vendors  = acts.filter(a => a.category === 'Vendor / Contractor');
      const amenity  = acts.filter(a => a.category === 'Amenity');
      const audit    = acts.find(a => a.category === 'Administrative' && a.title.toLowerCase().includes('audit'));
      const loaners  = amenity.filter(a => a.title.toLowerCase().includes('loaner'));
      const guests   = resident.filter(a => a.title.toLowerCase().includes('guest') || a.title.toLowerCase().includes('arrival'));
      const tours    = resident.filter(a => a.title.toLowerCase().includes('tour') || a.title.toLowerCase().includes('move'));
      const pickups  = delivery.filter(a => a.title.toLowerCase().includes('pickup'));
      const incoming = delivery.filter(a => !a.title.toLowerCase().includes('pickup'));
      const lockouts = security.filter(a => a.title.toLowerCase().includes('lockout'));
      const rounds   = security.filter(a => !a.title.toLowerCase().includes('lockout'));
      const Sect = ({ title, accent='#8FAEDD' }) => (
        <div style={{ background:accent, padding: isMobile ? '7px 16px' : '6px 28px', marginTop:6 }}>
          <span style={{ fontFamily:INTER, fontSize:12, fontWeight:800, color:TEXT, letterSpacing:'0.12em', textTransform:'uppercase' }}>{title}</span>
        </div>
      );
      const Field = ({ label, value, sub, last }) => (
        <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', alignItems:'flex-start', gap: isMobile ? 2 : 20, padding: isMobile ? '12px 16px' : '14px 28px', borderBottom:last?'none':`1px solid ${BORDER}` }}>
          <div style={{ width: isMobile ? '100%' : 240, flexShrink:0, fontFamily:INTER, fontSize: isMobile ? 11 : 16, fontWeight:700, color:MUTED, lineHeight:1.4, textTransform: isMobile ? 'uppercase' : 'none', letterSpacing: isMobile ? '0.06em' : 'normal' }}>{label}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:INTER, fontSize: isMobile ? 15 : 16, color:TEXT, lineHeight:1.55, whiteSpace:'pre-line' }}>{value}</div>
            {sub && <div style={{ fontFamily:INTER, fontSize: isMobile ? 13 : 14, color:MUTED, marginTop:3 }}>{sub}</div>}
          </div>
        </div>
      );
      return (
        <>
          <div style={{ background:'#111827', padding:'28px 28px 22px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.4)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:8 }}>Daily Activity Report</div>
                <div style={{ fontFamily:INTER, fontSize:22, fontWeight:800, color:'white', marginBottom:5 }}>{s.concierge.name}</div>
                <div style={{ fontFamily:INTER, fontSize:14, color:'rgba(255,255,255,0.55)' }}>
                  {dateLabel} · {s.clockIn}{s.clockOut ? ` – ${s.clockOut}` : ' – Present'}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:s.status==='active'?'rgba(52,199,89,0.15)':'rgba(255,255,255,0.08)', borderRadius:999, padding:'6px 14px' }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:s.status==='active'?GREEN:'rgba(255,255,255,0.4)' }} />
                  <span style={{ fontFamily:INTER, fontSize:12, fontWeight:700, color:s.status==='active'?GREEN:'rgba(255,255,255,0.6)' }}>
                    {s.status==='active' ? 'On Duty' : 'Completed'}
                  </span>
                </div>
                <div style={{ fontFamily:INTER, fontSize:13, color:'rgba(255,255,255,0.45)' }}>{s.duration}</div>
              </div>
            </div>
          </div>
          <div>
            <Sect title="Start of Shift Package Audit" />
            <Field label="Package Audit Completed" value="Yes" />
            <Field label="Keys Found at Start of Shift" value="Yes" />
            {audit && <Field label="Package Room Count" value={audit.notes} last />}
            <Sect title="Packages" />
            <Field label="Delivered by Couriers" value={toStr(incoming)} />
            <Field label="Picked Up by Residents" value={toStr(pickups)} last />
            <Sect title="Guests" />
            <Field label="Guest Arrivals / Check-ins" value={toStr(guests)} last />
            <Sect title="Tours" />
            <Field label="Scheduled & Walk-in Tours" value={toStr(tours)} last />
            <Sect title="Loaners" />
            <Field label="Checkouts & Returns" value={toStr(loaners)} last />
            <Sect title="Lockouts" />
            <Field label="Keys & Access Requests" value={toStr(lockouts)} last />
            <Sect title="Vendors" />
            {vendors.length > 0
              ? vendors.map((a, i, arr) => <Field key={a.id} label={a.title} value={a.time} sub={a.notes} last={i===arr.length-1} />)
              : <Field label="Vendor Activity" value="N/A" last />
            }
            {rounds.length > 0 && (
              <>
                <Sect title="Security & Rounds" />
                {rounds.map((a, i, arr) => <Field key={a.id} label={a.title} value={a.time} sub={a.notes} last={i===arr.length-1} />)}
              </>
            )}
            {s.note && (
              <>
                <Sect title="Shift Notes" />
                <div style={{ padding:'16px 28px 20px' }}>
                  <p style={{ fontFamily:INTER, fontSize:16, color:TEXT, lineHeight:1.7, margin:0 }}>{s.note}</p>
                </div>
              </>
            )}
            {s.incidents.length > 0 && (
              <>
                <Sect title="Incidents Filed" accent={RED} />
                {s.incidents.map((inc, i, arr) => <Field key={i} label={`Incident ${i+1}`} value={inc} last={i===arr.length-1} />)}
              </>
            )}
          </div>
        </>
      );
    };

    const monthShifts = [...shiftDatesSet].filter(d=>d.startsWith(prefix)).sort((a,b)=>b.localeCompare(a));
    const totalPages  = Math.ceil(monthShifts.length / 5);
    const pageShifts  = monthShifts.slice(shiftsPage * 5, shiftsPage * 5 + 5);

    return (
      <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns:'1fr 400px', gap: isMobile ? 16 : 20, alignItems: isMobile ? 'stretch' : 'start', padding: isMobile ? '16px 16px 48px' : '28px 32px 48px' }}>

        {/* DAR — top on mobile, left column on desktop */}
        <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', order: isMobile ? 2 : 0, gridColumn: 1, gridRow: '1 / 3' }}>
          {selectedShift ? (
            shiftDARBody(selectedShift, (() => { const dp=shiftDay.split('-'); return `${SH_MONTHS[parseInt(dp[1])-1]} ${parseInt(dp[2])}, ${dp[0]}`; })())
          ) : (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 32px', textAlign:'center' }}>
              <div style={{ width:72, height:72, borderRadius:20, background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                <Calendar size={34} color={MUTED} strokeWidth={1.5} />
              </div>
              <p style={{ fontFamily:INTER, fontSize:17, fontWeight:700, color:TEXT, margin:'0 0 6px' }}>No shift selected</p>
              <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:0 }}>Pick a highlighted date or shift below to view the daily activity report</p>
            </div>
          )}
        </div>

        {/* Calendar card — top on mobile, right col row 1 on desktop */}
        <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.05)', order: isMobile ? 1 : 0, gridColumn: 2, gridRow: 1 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                {shCalView === 'month' ? (
                  <>
                    <button onClick={() => { setShCalDate(new Date(year, month-1, 1)); setShiftsPage(0); }} style={{ width:32, height:32, borderRadius:10, background:CARD2, border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                      <ChevronLeft size={15} color={MUTED} />
                    </button>
                    <div>
                      <div style={{ fontFamily:INTER, fontSize:16, fontWeight:800, color:TEXT }}>{SH_MONTHS[month]} {year}</div>
                      <div style={{ fontFamily:INTER, fontSize:11, color:MUTED }}>{[...shiftDatesSet].filter(d=>d.startsWith(prefix)).length} shifts</div>
                    </div>
                    <button onClick={() => { setShCalDate(new Date(year, month+1, 1)); setShiftsPage(0); }} style={{ width:32, height:32, borderRadius:10, background:CARD2, border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                      <ChevronRight size={15} color={MUTED} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setShCalDate(new Date(year-1, 0, 1))} style={{ width:32, height:32, borderRadius:10, background:CARD2, border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                      <ChevronLeft size={15} color={MUTED} />
                    </button>
                    <div style={{ fontFamily:INTER, fontSize:16, fontWeight:800, color:TEXT }}>{year}</div>
                    <button onClick={() => setShCalDate(new Date(year+1, 0, 1))} style={{ width:32, height:32, borderRadius:10, background:CARD2, border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                      <ChevronRight size={15} color={MUTED} />
                    </button>
                  </>
                )}
              </div>
              <div style={{ display:'flex', background:CARD2, borderRadius:10, padding:2, border:`1px solid ${BORDER}` }}>
                {['month','year'].map(v => (
                  <button key={v} onClick={() => setShCalView(v)}
                    style={{ padding:'6px 14px', borderRadius:8, background:shCalView===v?CARD:'transparent', border:shCalView===v?`1px solid ${BORDER}`:'none', fontFamily:INTER, fontSize:12, fontWeight:700, color:shCalView===v?TEXT:MUTED, cursor:'pointer', textTransform:'capitalize' }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {shCalView === 'month' && (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:8 }}>
                  {SH_DAY_HDR.map((d,i) => (
                    <div key={i} style={{ textAlign:'center', fontFamily:INTER, fontSize:10, fontWeight:800, color:MUTED, letterSpacing:'0.06em', padding:'4px 0' }}>{d}</div>
                  ))}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
                  {cells.map((cell, i) => {
                    if (!cell) return <div key={`e-${i}`} />;
                    const hasShift = shiftDatesSet.has(cell.dateStr);
                    const isToday  = cell.dateStr === TODAY_STR;
                    const isSel    = cell.dateStr === shiftDay;
                    return (
                      <button key={cell.dateStr}
                        onClick={() => hasShift && setShiftDay(isSel ? null : cell.dateStr)}
                        style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', aspectRatio:'1', borderRadius:10, background:isSel?BLUE:isToday?'rgba(255,56,92,0.08)':'transparent', border:isSel?'none':isToday?`2px solid ${BLUE}`:'2px solid transparent', cursor:hasShift?'pointer':'default' }}>
                        <span style={{ fontFamily:INTER, fontSize:13, fontWeight:isSel||isToday?800:500, color:isSel?'white':isToday?BLUE:hasShift?TEXT:'#ccc' }}>{cell.day}</span>
                        {hasShift && <div style={{ width:4, height:4, borderRadius:'50%', background:isSel?'rgba(255,255,255,0.65)':BLUE, marginTop:2 }} />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {shCalView === 'year' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                {Array.from({ length:12 }, (_,i) => {
                  const count  = monthCount(year, i);
                  const isCurr = i === new Date().getMonth() && year === new Date().getFullYear();
                  return (
                    <button key={i} onClick={() => { setShCalDate(new Date(year, i, 1)); setShCalView('month'); }}
                      style={{ background:CARD2, border:`1.5px solid ${isCurr?BLUE:BORDER}`, borderRadius:12, padding:'12px 8px', cursor:'pointer', textAlign:'center' }}>
                      <div style={{ fontFamily:INTER, fontSize:12, fontWeight:700, color:isCurr?BLUE:TEXT, marginBottom:4 }}>{SH_MONTH_ABB[i]}</div>
                      <div style={{ fontFamily:INTER, fontSize:18, fontWeight:800, color:count>0?TEXT:MUTED }}>{count > 0 ? count : '—'}</div>
                      {count > 0 && <div style={{ fontFamily:INTER, fontSize:9, color:MUTED, marginTop:2 }}>shifts</div>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        {/* Shifts this month — bottom on mobile, right col row 2 on desktop */}
        {shCalView === 'month' && (
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.05)', order: isMobile ? 3 : 0, gridColumn: 2, gridRow: 2 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Clock size={20} color={BLUE} />
                  <h2 style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:17, margin:0 }}>Shifts This Month</h2>
                </div>
                <span style={{ fontFamily:INTER, fontSize:12, color:MUTED }}>{monthShifts.length > 0 ? `${shiftsPage*5+1}–${Math.min(shiftsPage*5+5,monthShifts.length)} of ${monthShifts.length}` : '0'}</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {pageShifts.map(dateStr => {
                  const s = shiftDatesMap[dateStr];
                  const dp = dateStr.split('-');
                  const label = `${SH_MONTH_ABB[parseInt(dp[1])-1]} ${parseInt(dp[2])}`;
                  const isSel = dateStr === shiftDay;
                  const onDuty = s?.status === 'active';
                  const stColor = onDuty ? GREEN : BLUE;
                  return (
                    <button key={dateStr} onClick={() => setShiftDay(dateStr)}
                      style={{ display:'flex', alignItems:'center', gap:14, padding:16, background:isSel?'rgba(255,56,92,0.04)':CARD2, border:`1.5px solid ${isSel?BLUE:BORDER}`, borderRadius:14, cursor:'pointer', textAlign:'left', transition:'border-color 150ms' }}>
                      <div style={{ width:48, height:48, borderRadius:14, background:onDuty?'rgba(52,199,89,0.12)':'rgba(255,56,92,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span style={{ fontFamily:INTER, fontSize:16, fontWeight:800, color:stColor }}>{s.concierge.init}</span>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
                          <span style={{ fontFamily:INTER, fontSize:14, fontWeight:700, color:TEXT }}>{s.concierge.name}</span>
                          <span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:stColor, background:`${stColor}14`, borderRadius:6, padding:'2px 6px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{onDuty?'On Duty':'Completed'}</span>
                        </div>
                        <div style={{ fontFamily:INTER, fontSize:12, color:MUTED }}>{label} · {s.clockIn}{s.clockOut?` – ${s.clockOut}`:''} · {s.activities.length} actions</div>
                      </div>
                      <ChevronRight size={16} color={isSel?BLUE:MUTED} />
                    </button>
                  );
                })}
                {monthShifts.length === 0 && (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'24px 0', textAlign:'center' }}>
                    <Clock size={28} color={MUTED} strokeWidth={1.5} style={{ marginBottom:8 }} />
                    <p style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, margin:'0 0 4px' }}>No shifts this month</p>
                    <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:0 }}>Navigate to another month to view shifts</p>
                  </div>
                )}
              </div>
              {totalPages > 1 && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:12, paddingTop:12, borderTop:`1px solid ${BORDER}` }}>
                  <button onClick={() => setShiftsPage(p=>Math.max(0,p-1))} disabled={shiftsPage===0}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10, border:`1px solid ${BORDER}`, background:shiftsPage===0?CARD2:CARD, fontFamily:INTER, fontSize:13, fontWeight:600, color:shiftsPage===0?MUTED:TEXT, cursor:shiftsPage===0?'default':'pointer' }}>
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <span style={{ fontFamily:INTER, fontSize:12, color:MUTED }}>{shiftsPage+1} / {totalPages}</span>
                  <button onClick={() => setShiftsPage(p=>Math.min(totalPages-1,p+1))} disabled={shiftsPage===totalPages-1}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10, border:`1px solid ${BORDER}`, background:shiftsPage===totalPages-1?CARD2:CARD, fontFamily:INTER, fontSize:13, fontWeight:600, color:shiftsPage===totalPages-1?MUTED:TEXT, cursor:shiftsPage===totalPages-1?'default':'pointer' }}>
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
        )}
      </div>
    );
  };

  // Sidebar content — shared between desktop persistent sidebar and mobile drawer
  const renderSidebarContent = (isDrawer) => {
    const collapsed = !isDrawer && sidebarCollapsed;

    const profileSection = isDrawer ? (
      <div style={{ position: 'relative', padding: '24px 20px 16px', flexShrink: 0, borderBottom: `1px solid ${BORDER}` }}>
        <button aria-label="Close navigation menu" onClick={() => setSidebarOpen(false)}
          style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X size={18} color={MUTED} />
        </button>
        <div style={{ fontFamily: INTER, fontSize: 18, fontWeight: 700, color: TEXT, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
          Welcome,<br />{(authUser?.name || 'Concierge')}!
        </div>
        <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 6 }}>{(authUser?.email || '')}</div>
      </div>
    ) : (
      <div style={{ padding: '14px 12px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => handleTabChange('profile')}
          title={collapsed ? (authUser?.name || 'Concierge') : undefined}
          style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', flex: 1, minWidth: 0 }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background:`${BLUE}14`, flexShrink:0, border:`2px solid ${activeTab==='profile'?BLUE:BORDER}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontFamily:INTER, fontSize:14, fontWeight:800, color:BLUE }}>{(authUser?.name||'C').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</span>
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>{(authUser?.name || 'Concierge')}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: isShiftActive ? GREEN : MUTED, flexShrink: 0 }} />
                <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{isShiftActive ? 'On Shift' : 'Off Shift'}</span>
              </div>
            </div>
          )}
        </button>
      </div>
    );

    return (
      <>
        {/* Profile — top on mobile drawer, bottom on desktop */}
        {isDrawer && profileSection}

        {/* Nav items */}
        <nav style={{ padding: collapsed ? '16px 8px 4px' : '12px 8px 4px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {NAV_ITEMS.map(({ id, Icon, label, action }) => {
            const active = !action && activeTab === id;
            return (
              <button key={id}
                className="nav-btn touch-target"
                onClick={() => {
                  if (collapsed) setSidebarCollapsed(false);
                  action ? action() : handleTabChange(id);
                  if (isDrawer) setSidebarOpen(false);
                }}
                title={collapsed ? label : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: collapsed ? 0 : 12, padding: '10px 12px', marginBottom: 2,
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: active ? `rgba(255,56,92,0.08)` : 'transparent',
                  borderRadius: 12, width: '100%',
                  transition: 'background 120ms', position: 'relative',
                  minHeight: 44,
                }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: active ? `rgba(255,56,92,0.12)` : CARD2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 120ms', position: 'relative',
                }}>
                  <Icon size={18} color={active ? BLUE : MUTED} strokeWidth={active ? 2.2 : 1.6} />
                  {id === 'requests' && pendingRequests.length > 0 && (
                    <span style={{ position: 'absolute', top: 2, right: 2, minWidth: 14, height: 14, borderRadius: '50%', background: RED, border: `2px solid ${CARD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px' }}>
                      <span style={{ fontFamily: INTER, fontSize: 7, fontWeight: 800, color: 'white', lineHeight: 1 }}>{pendingRequests.length}</span>
                    </span>
                  )}
                </div>
                {!collapsed && (
                  <span style={{ fontFamily: INTER, fontSize: 15, fontWeight: active ? 700 : 500, color: active ? TEXT : MUTED, flex: 1, letterSpacing: active ? '-0.01em' : 'normal', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {label}
                  </span>
                )}
                {!collapsed && !isDrawer && id === 'home' && (
                  <button aria-label="Collapse sidebar" onClick={(e) => { e.stopPropagation(); setSidebarCollapsed(true); }}
                    style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <X size={16} color={MUTED} />
                  </button>
                )}
                {!collapsed && (isDrawer || id !== 'home') && active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: BLUE, flexShrink: 0 }} />}
              </button>
            );
          })}
        </nav>

        {/* Bottom branding */}
        <div style={{ flexShrink: 0, padding: collapsed ? '12px 0' : '20px 20px 0', paddingBottom: 'max(24px, env(safe-area-inset-bottom))', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          {!collapsed && <span style={{ fontFamily: "'Helvetica Neue','Arial',sans-serif", fontSize: 11, fontWeight: 300, color: TEXT, letterSpacing: '0.22em', textTransform: 'uppercase' }}>onepermit</span>}
        </div>
      </>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: INTER, background: BG }}>
      {/* Screen-reader live region — announces task completions and status changes */}
      <div role="status" aria-live="polite" aria-atomic="true" style={{ position: 'absolute', width: 1, height: 1, margin: -1, padding: 0, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        {srAnnounce}
      </div>
      {/* ── Full-width desktop header ────────────────────────────────────── */}
      {!isMobile && (
        <div style={{ height: 52, background: '#111827', display: 'flex', alignItems: 'center', padding: '0 20px', flexShrink: 0, gap: 14, zIndex: 20 }}>
          {/* Left: branding — compact */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={15} color="white" />
            </div>
            <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{propertyName}</span>
          </div>

          {/* Search — fills all remaining space */}
          <div style={{ flex: 1, position: 'relative', marginRight: 520, marginLeft: 220 }}>
            <Search size={14} color="#6B7280" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); setDdIdx(-1); }}
              onFocus={() => setShowSearch(true)}
              onBlur={() => { setTimeout(() => setShowSearch(false), 150); setDdIdx(-1); }}
              onKeyDown={e => {
                if (e.key === 'Escape') { setSearchQuery(''); setShowSearch(false); setDdIdx(-1); }
                if (e.key === 'ArrowDown') { e.preventDefault(); setDdIdx(i => Math.min(i + 1, (ddItemsRef.current.length || 1) - 1)); }
                if (e.key === 'ArrowUp')   { e.preventDefault(); setDdIdx(i => Math.max(0, i - 1)); }
                if (e.key === 'Enter' && ddIdx >= 0 && ddItemsRef.current[ddIdx]) {
                  e.preventDefault();
                  ddItemsRef.current[ddIdx].action();
                  setShowSearch(false); setSearchQuery(''); setDdIdx(-1);
                }
              }}
              placeholder="Search or jump to a section… (⌘K)"
              style={{ width: '100%', height: 34, background: '#FFFFFF', border: 'none', borderRadius: 6, paddingLeft: 36, paddingRight: searchQuery ? 30 : 14, fontFamily: INTER, fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box' }}
            />
            {searchQuery && (
              <button aria-label="Clear search" onClick={() => { setSearchQuery(''); setShowSearch(false); }}
                style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:2, display:'flex' }}>
                <X size={13} color="#6B7280" />
              </button>
            )}
            {/* Unified search + command dropdown */}
            {showSearch && (() => {
              const q = searchQuery.toLowerCase().trim();
              const ALL_CMDS = [
                { id:'go-home',      group:'Navigate', label:"Today's Tasks",    Icon:Home,          action:()=>handleTabChange('home'),                        keywords:['dashboard','shift'] },
                { id:'go-requests',  group:'Navigate', label:'Requests',         Icon:Bell,          action:()=>handleTabChange('requests'),                    keywords:['management','tasks'] },
                { id:'go-packages',  group:'Navigate', label:'Packages',         Icon:Package,       action:()=>handleTabChange('packages'),                    keywords:['delivery','mail'] },
                { id:'go-guests',    group:'Navigate', label:'Guests',           Icon:UserCheck,     action:()=>handleTabChange('guests'),                      keywords:['visitor','access'] },
                { id:'go-lockout',   group:'Navigate', label:'Lockouts',         Icon:Lock,          action:()=>handleTabChange('lockout'),                     keywords:['key','locked'] },
                { id:'go-vendors',   group:'Navigate', label:'Vendors',          Icon:Wrench,        action:()=>handleTabChange('vendors'),                     keywords:['contractor','maintenance'] },
                { id:'go-tours',     group:'Navigate', label:'Tours',            Icon:Users,         action:()=>handleTabChange('tours'),                       keywords:['showing','prospect'] },
                { id:'go-loaners',   group:'Navigate', label:'Loaners',          Icon:ShoppingCart,  action:()=>handleTabChange('loaners'),                     keywords:['cart','item'] },
                { id:'go-incident',  group:'Navigate', label:'Incident Report',  Icon:AlertTriangle, action:()=>handleTabChange('incident'),                    keywords:['report','safety'] },
                { id:'go-sops',      group:'Navigate', label:'Building SOPs',    Icon:BookOpen,      action:()=>handleTabChange('sops'),                        keywords:['procedure','document'] },
                { id:'go-training',  group:'Navigate', label:'Training',         Icon:GraduationCap, action:()=>handleTabChange('training'),                    keywords:['learn','video'] },
                { id:'go-calendar',  group:'Navigate', label:'Shift Calendar',   Icon:Calendar,      action:()=>handleTabChange('calendar'),                    keywords:['schedule','shifts'] },
                { id:'go-messages',  group:'Navigate', label:'Messages',         Icon:MessageSquare, action:()=>handleTabChange('messages'),                    keywords:['chat','team'] },
                { id:'go-settings',  group:'Navigate', label:'Settings',         Icon:Settings,      action:()=>handleTabChange('settings'),                    keywords:['preferences'] },
                { id:'log-task',     group:'Actions',  label:'Log a Task',       Icon:Plus,          action:()=>{ handleTabChange('home'); setShowNewTask(true); }, keywords:['new','create','activity'] },
                { id:'go-copilot',   group:'Actions',  label:'Open AI Copilot',  Icon:Sparkles,      action:()=>setShowCopilot(true),                           keywords:['ai','assistant','help'] },
                { id:'emergency',    group:'Actions',  label:'Emergency Contacts', Icon:Phone,       action:()=>setShowContacts(true),                          keywords:['call','contact'] },
                ...(!isShiftActive ? [{ id:'clock-in',  group:'Actions', label:'Clock In',  Icon:Clock, action:handleClockIn,  keywords:['start','shift'] }] : []),
                ...(isShiftActive  ? [{ id:'clock-out', group:'Actions', label:'Clock Out', Icon:Clock, action:handleClockOut, keywords:['end','finish','shift'] }] : []),
              ];
              const matchCmd = c => !q || c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q) || (c.keywords||[]).some(k=>k.includes(q));
              const matchTask = t => (t.title||'').toLowerCase().includes(q) || (t.notes||'').toLowerCase().includes(q) || (t.category||'').toLowerCase().includes(q);
              const matchInc  = i => (i.title||'').toLowerCase().includes(q) || (i.type||'').toLowerCase().includes(q) || (i.location||'').toLowerCase().includes(q);
              const matchAct  = a => (a.title||'').toLowerCase().includes(q) || (a.notes||'').toLowerCase().includes(q) || (a.category||'').toLowerCase().includes(q);
              const cmdHits  = ALL_CMDS.filter(matchCmd);
              const mgmtHits = q ? tasks.filter(t => t.createdByType === 'manager' && matchTask(t)).slice(0,4) : [];
              const actHits  = q ? selfTasks.filter(matchAct).slice(0,4) : [];
              const incHits  = q ? incidents.filter(matchInc).slice(0,4) : [];
              const hasContent = mgmtHits.length + actHits.length + incHits.length > 0;

              // Group commands
              const navigateCmds = cmdHits.filter(c => c.group === 'Navigate');
              const actionCmds   = cmdHits.filter(c => c.group === 'Actions');

              // Flat list for arrow-key navigation
              const flatCmds = [...navigateCmds, ...actionCmds];
              ddItemsRef.current = flatCmds.map(c => ({ action: () => { c.action(); } }));

              return (
                <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.14)', zIndex:200, overflow:'hidden', maxHeight:460, overflowY:'auto' }}>
                  {/* Content results (only when query typed) */}
                  {hasContent && (
                    <>
                      {mgmtHits.length > 0 && (
                        <>
                          <div style={{ padding:'8px 14px 4px', fontFamily:INTER, fontSize:10, fontWeight:800, color:MUTED, textTransform:'uppercase', letterSpacing:'0.10em' }}>Assigned Tasks</div>
                          {mgmtHits.map(t => (
                            <button key={t.id} onMouseDown={() => { setShowSearch(false); setSearchQuery(''); handleTabChange('requests'); }}
                              style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'none', border:'none', cursor:'pointer', textAlign:'left', borderBottom:`1px solid ${BORDER}` }}>
                              <div style={{ width:32, height:32, borderRadius:9, background:`${ORANGE}14`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><ClipboardList size={15} color={ORANGE} /></div>
                              <div style={{ flex:1, minWidth:0 }}>
                                <p style={{ fontFamily:INTER, fontSize:13, fontWeight:600, color:TEXT, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.title}</p>
                                <p style={{ fontFamily:INTER, fontSize:11, color:MUTED, margin:0 }}>{t.category} · Due {t.dueTime} · from {t.createdBy}</p>
                              </div>
                              <span style={{ fontFamily:INTER, fontSize:10, fontWeight:700, color:t.status==='in_progress'?ORANGE:BLUE, background:t.status==='in_progress'?`${ORANGE}14`:`${BLUE}14`, borderRadius:6, padding:'2px 7px', flexShrink:0, textTransform:'uppercase' }}>{t.status==='in_progress'?'In Progress':'Pending'}</span>
                            </button>
                          ))}
                        </>
                      )}
                      {actHits.length > 0 && (
                        <>
                          <div style={{ padding:'8px 14px 4px', fontFamily:INTER, fontSize:10, fontWeight:800, color:MUTED, textTransform:'uppercase', letterSpacing:'0.10em' }}>My Activities</div>
                          {actHits.map((a, i) => (
                            <button key={a.id||i} onMouseDown={() => { setShowSearch(false); setSearchQuery(''); handleTabChange('new-task'); }}
                              style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'none', border:'none', cursor:'pointer', textAlign:'left', borderBottom:`1px solid ${BORDER}` }}>
                              <div style={{ width:32, height:32, borderRadius:9, background:`${GREEN}14`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><CheckCircle size={15} color={GREEN} /></div>
                              <div style={{ flex:1, minWidth:0 }}>
                                <p style={{ fontFamily:INTER, fontSize:13, fontWeight:600, color:TEXT, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.title}</p>
                                <p style={{ fontFamily:INTER, fontSize:11, color:MUTED, margin:0 }}>{a.category}{a.completedAt?` · ${a.completedAt}`:''}</p>
                              </div>
                              <CheckCircle size={14} color={GREEN} style={{ flexShrink:0 }} />
                            </button>
                          ))}
                        </>
                      )}
                      {incHits.length > 0 && (
                        <>
                          <div style={{ padding:'8px 14px 4px', fontFamily:INTER, fontSize:10, fontWeight:800, color:MUTED, textTransform:'uppercase', letterSpacing:'0.10em' }}>Incidents</div>
                          {incHits.map(inc => (
                            <button key={inc.id} onMouseDown={() => { setShowSearch(false); setSearchQuery(''); handleTabChange('incident'); }}
                              style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'none', border:'none', cursor:'pointer', textAlign:'left', borderBottom:`1px solid ${BORDER}` }}>
                              <div style={{ width:32, height:32, borderRadius:9, background:`${RED}14`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><AlertTriangle size={15} color={RED} /></div>
                              <div style={{ flex:1, minWidth:0 }}>
                                <p style={{ fontFamily:INTER, fontSize:13, fontWeight:600, color:TEXT, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{inc.title}</p>
                                <p style={{ fontFamily:INTER, fontSize:11, color:MUTED, margin:0 }}>{inc.type}{inc.location?` · ${inc.location}`:''} · {inc.filedAt}</p>
                              </div>
                              <span style={{ fontFamily:INTER, fontSize:10, fontWeight:700, color:RED, background:`${RED}12`, borderRadius:6, padding:'2px 7px', flexShrink:0, textTransform:'uppercase' }}>{inc.severity}</span>
                            </button>
                          ))}
                        </>
                      )}
                      {cmdHits.length > 0 && <div style={{ height:1, background:BORDER, margin:'4px 0' }} />}
                    </>
                  )}
                  {/* Commands */}
                  {navigateCmds.length > 0 && (
                    <>
                      <div style={{ padding:'8px 14px 4px', fontFamily:INTER, fontSize:10, fontWeight:800, color:MUTED, textTransform:'uppercase', letterSpacing:'0.10em' }}>Navigate</div>
                      {navigateCmds.map((cmd, relIdx) => {
                        const CmdIcon = cmd.Icon;
                        const flatIdx = relIdx;
                        const isActive = ddIdx === flatIdx;
                        return (
                          <button key={cmd.id}
                            onMouseDown={() => { cmd.action(); setShowSearch(false); setSearchQuery(''); setDdIdx(-1); }}
                            onMouseEnter={() => setDdIdx(flatIdx)}
                            style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 14px', background: isActive ? `${BLUE}12` : 'none', border:'none', cursor:'pointer', textAlign:'left', transition:'background 80ms' }}>
                            <div style={{ width:30, height:30, borderRadius:8, background: isActive ? `${BLUE}18` : CARD2, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 80ms' }}>
                              <CmdIcon size={14} color={isActive ? BLUE : MUTED} />
                            </div>
                            <span style={{ fontFamily:INTER, fontSize:13, fontWeight:600, color: isActive ? BLUE : TEXT }}>{cmd.label}</span>
                          </button>
                        );
                      })}
                    </>
                  )}
                  {actionCmds.length > 0 && (
                    <>
                      <div style={{ padding:'8px 14px 4px', fontFamily:INTER, fontSize:10, fontWeight:800, color:MUTED, textTransform:'uppercase', letterSpacing:'0.10em' }}>Actions</div>
                      {actionCmds.map((cmd, relIdx) => {
                        const CmdIcon = cmd.Icon;
                        const flatIdx = navigateCmds.length + relIdx;
                        const isActive = ddIdx === flatIdx;
                        return (
                          <button key={cmd.id}
                            onMouseDown={() => { cmd.action(); setShowSearch(false); setSearchQuery(''); setDdIdx(-1); }}
                            onMouseEnter={() => setDdIdx(flatIdx)}
                            style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 14px', background: isActive ? `${BLUE}12` : 'none', border:'none', cursor:'pointer', textAlign:'left', transition:'background 80ms' }}>
                            <div style={{ width:30, height:30, borderRadius:8, background: isActive ? `${BLUE}18` : `${BLUE}14`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 80ms' }}>
                              <CmdIcon size={14} color={BLUE} />
                            </div>
                            <span style={{ fontFamily:INTER, fontSize:13, fontWeight:600, color: isActive ? BLUE : TEXT }}>{cmd.label}</span>
                          </button>
                        );
                      })}
                    </>
                  )}
                  {!hasContent && cmdHits.length === 0 && q && (
                    <div style={{ padding:'24px 16px', textAlign:'center' }}>
                      <p style={{ fontFamily:INTER, fontSize:13, fontWeight:600, color:TEXT, margin:'0 0 4px' }}>No results</p>
                      <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:0 }}>Nothing matched "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Right: dark/light toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <button
              onClick={toggleTheme}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.10)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 150ms' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
            >
              {isDarkMode
                ? <Sun size={15} color="#FFD60A" />
                : <Moon size={15} color="rgba(255,255,255,0.80)" />}
            </button>
          </div>
        </div>
      )}

      {/* ── Body row: sidebar + content ─────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

      {/* ── DESKTOP SIDEBAR — persistent, always visible ≥768px ─────────── */}
      {!isMobile && (
        <div style={{ width: sidebarCollapsed ? 64 : 248, minWidth: sidebarCollapsed ? 64 : 248, background: SIDEBAR, borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10, flexShrink: 0, height: '100%', transition: 'width 220ms ease, min-width 220ms ease' }}>
          {renderSidebarContent(false)}
        </div>
      )}

      {/* ── MOBILE DRAWER — overlay, <768px ──────────────────────────────── */}
      {isMobile && (
        <>
          {/* Mobile header */}
          {!sidebarOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: CARD, borderBottom: `1px solid ${BORDER}`, zIndex: 48 }}>
              {/* Top row */}
              <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10 }}>
                <button aria-label="Open navigation menu" onClick={() => setSidebarOpen(true)}
                  style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <Menu size={20} color={TEXT} />
                </button>
                <div style={{ flex: 1, textAlign: 'center', fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em' }}>
                  {propertyName}
                </div>
                <button aria-label={showSearch ? 'Close search' : 'Open search'} onClick={() => { setShowSearch(s => !s); setSearchQuery(''); }}
                  style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: showSearch ? `${BLUE}14` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  {showSearch ? <X size={18} color={BLUE} /> : <Search size={18} color={TEXT} />}
                </button>
                <button aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}
                  style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: isDarkMode ? 'rgba(255,214,10,0.12)' : `${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  {isDarkMode ? <Sun size={17} color="#FFD60A" /> : <Moon size={17} color={MUTED} />}
                </button>
              </div>
              {/* Mobile search row */}
              {showSearch && (
                <div style={{ padding: '0 14px 10px', position: 'relative' }}>
                  <Search size={14} color={MUTED} style={{ position:'absolute', left:26, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Escape') { setSearchQuery(''); setShowSearch(false); } }}
                    placeholder="Search tasks, incidents, activities…"
                    style={{ width:'100%', height:38, background:CARD2, border:`1px solid ${BORDER}`, borderRadius:10, paddingLeft:36, paddingRight:14, fontFamily:INTER, fontSize:13, color:TEXT, outline:'none', boxSizing:'border-box' }}
                  />
                  {/* Mobile results */}
                  {searchQuery.trim().length > 0 && (() => {
                    const q = searchQuery.toLowerCase().trim();
                    const matchTask = t => (t.title||'').toLowerCase().includes(q) || (t.notes||'').toLowerCase().includes(q) || (t.category||'').toLowerCase().includes(q);
                    const matchInc  = i => (i.title||'').toLowerCase().includes(q) || (i.type||'').toLowerCase().includes(q);
                    const matchAct  = a => (a.title||'').toLowerCase().includes(q) || (a.category||'').toLowerCase().includes(q);
                    const mgmtHits  = tasks.filter(t => t.createdByType === 'manager' && matchTask(t)).slice(0, 3);
                    const actHits   = selfTasks.filter(matchAct).slice(0, 3);
                    const incHits   = incidents.filter(matchInc).slice(0, 3);
                    const total     = mgmtHits.length + actHits.length + incHits.length;
                    return (
                      <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,0.10)', marginTop:6, overflow:'hidden', maxHeight:340, overflowY:'auto' }}>
                        {total === 0 ? (
                          <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, padding:'16px 14px', margin:0 }}>No results for "{searchQuery}"</p>
                        ) : (
                          <>
                            {mgmtHits.map(t => (
                              <button key={t.id} onClick={() => { setShowSearch(false); setSearchQuery(''); handleTabChange('requests'); }}
                                style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:'none', border:'none', borderBottom:`1px solid ${BORDER}`, cursor:'pointer', textAlign:'left' }}>
                                <ClipboardList size={15} color={ORANGE} style={{ flexShrink:0 }} />
                                <div style={{ flex:1, minWidth:0 }}>
                                  <p style={{ fontFamily:INTER, fontSize:13, fontWeight:600, color:TEXT, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.title}</p>
                                  <p style={{ fontFamily:INTER, fontSize:11, color:MUTED, margin:0 }}>Task · {t.dueTime}</p>
                                </div>
                              </button>
                            ))}
                            {incHits.map(inc => (
                              <button key={inc.id} onClick={() => { setShowSearch(false); setSearchQuery(''); handleTabChange('incident'); }}
                                style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:'none', border:'none', borderBottom:`1px solid ${BORDER}`, cursor:'pointer', textAlign:'left' }}>
                                <AlertTriangle size={15} color={RED} style={{ flexShrink:0 }} />
                                <div style={{ flex:1, minWidth:0 }}>
                                  <p style={{ fontFamily:INTER, fontSize:13, fontWeight:600, color:TEXT, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{inc.title}</p>
                                  <p style={{ fontFamily:INTER, fontSize:11, color:MUTED, margin:0 }}>Incident · {inc.type}</p>
                                </div>
                              </button>
                            ))}
                            {actHits.map((a, i) => (
                              <button key={a.id||i} onClick={() => { setShowSearch(false); setSearchQuery(''); handleTabChange('new-task'); }}
                                style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:'none', border:'none', borderBottom:`1px solid ${BORDER}`, cursor:'pointer', textAlign:'left' }}>
                                <CheckCircle size={15} color={GREEN} style={{ flexShrink:0 }} />
                                <div style={{ flex:1, minWidth:0 }}>
                                  <p style={{ fontFamily:INTER, fontSize:13, fontWeight:600, color:TEXT, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.title}</p>
                                  <p style={{ fontFamily:INTER, fontSize:11, color:MUTED, margin:0 }}>Activity · {a.category}</p>
                                </div>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div key="sb-backdrop"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => setSidebarOpen(false)}
                  style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, backdropFilter: 'blur(2px)' }} />
                <motion.div key="sb-panel"
                  initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
                  transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                  style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 248, background: SIDEBAR, borderRight: `1px solid ${BORDER}`, zIndex: 55, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {renderSidebarContent(true)}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── OFFLINE BANNER ───────────────────────────────────────────────── */}
      {!isOnline && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: ORANGE, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Wifi size={14} color="white" />
          <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: 'white' }}>
            Offline — entries queued and will sync when reconnected
          </span>
        </div>
      )}
      {isSyncing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: GREEN, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Activity size={14} color="white" />
          <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: 'white' }}>
            Syncing {queueLen} queued {queueLen === 1 ? 'entry' : 'entries'}…
          </span>
        </div>
      )}

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, background: BG, display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0 }}>

        {/* AI Copilot FAB */}
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 40 }}>
          <button onClick={() => setShowCopilot(true)} data-testid="copilot-btn"
            style={{ width: 54, height: 54, borderRadius: 16, border: 'none', cursor: 'pointer', overflow: 'hidden', boxShadow: '0 8px 24px rgba(5,150,105,0.35)' }}>
            <CareAssistantIcon size={54} />
          </button>
        </div>

        {/* Main content — pre-shift briefing until shift starts, then live DAR */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {shiftStarted ? renderHomeContent() : renderPreShiftBriefing()}
        </div>

        {/* ── TAB PANELS — slide in from right, same style as New Task ──── */}
        <AnimatePresence>
          {activeTab !== 'home' && (
            <>
              {/* Backdrop */}
              <motion.div key="panel-bg"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleTabChange('home')}
                style={{ position: 'fixed', inset: 0, zIndex: 65, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(2px)' }} />

              {/* Panel */}
              <motion.div key={activeTab}
                initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 34, stiffness: 320 }}
                style={{
                  position: 'fixed', right: 16, top: 16, bottom: 16,
                  ...(activeTab === 'calendar'
                    ? (isPhone ? {top:0,bottom:0,left:0,right:0,borderRadius:0} : { left: isMobile ? 16 : (sidebarCollapsed ? 80 : 264) })
                    : (isPhone ? {top:0,bottom:0,left:0,right:0,borderRadius:0} : isMobile ? { left: 16 } : { width: Math.min(640, window.innerWidth - 280) })),
                  background: BG, zIndex: 66,
                  display: 'flex', flexDirection: 'column',
                  borderRadius: isPhone ? 0 : 24, overflow: 'hidden',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.20)',
                }}>

                {/* Panel title bar */}
                <div style={{
                  background: CARD, borderBottom: `1px solid ${BORDER}`,
                  padding: '16px 20px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 2px' }}>
                      {propertyName}
                    </p>
                    <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>
                      {PAGE_TITLES[activeTab] || activeTab}
                    </h2>
                  </div>
                  <button onClick={() => handleTabChange('home')}
                    style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${BORDER}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <X size={18} color={MUTED} strokeWidth={2} />
                  </button>
                </div>

                {/* Panel content — contained */}
                <div className="panel-enter" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
                  {activeTab === 'requests'      && renderRequestsContent()}
                  {activeTab === 'packages'      && <PackageDashboard onActivityLogged={handleActivityLogged} />}
                  {activeTab === 'loaners'       && <LoanersDashboard onActivityLogged={handleActivityLogged} />}
                  {activeTab === 'lockout'       && <LockoutPage      onActivityLogged={handleActivityLogged} />}
                  {activeTab === 'incident'      && <IncidentReportPage patientName={propertyName} incidents={incidents} onAddIncident={async (inc) => {
                    try {
                      const saved = await authApi.createIncident(inc);
                      setIncidents(p => [saved, ...p]);
                    } catch { /* ignore */ }
                  }} />}
                  {activeTab === 'tours'         && <ToursDashboard   onActivityLogged={handleActivityLogged} />}
                  {activeTab === 'vendors'       && <VendorsDashboard onActivityLogged={handleActivityLogged} />}
                  {activeTab === 'guests'        && <GuestsDashboard  onActivityLogged={handleActivityLogged} />}
                  {activeTab === 'calendar'      && renderShifts()}
                  {activeTab === 'shift-history' && <HistoryPage />}
                  {activeTab === 'profile'       && renderProfileContent()}
                  {activeTab === 'messages'      && <TeamMessagesPage />}
                  {activeTab === 'settings'      && renderSettingsContent()}
                  {activeTab === 'sops'          && renderSOPs()}
                  {activeTab === 'training'      && renderTrainingContent()}
                  {activeTab === 'followup'      && (
                    <div style={{ padding: isPhone ? '16px 16px 48px' : '20px 20px 48px' }}>
                      <FollowUpTracker
                        colors={{ BG, CARD, CARD2, BORDER, TEXT, MUTED, SHADOW }}
                        INTER={INTER}
                        followUps={followUps}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      {/* Task completion — right-side panel */}
      <AnimatePresence>
        {selectedTask && (
          <>
            <motion.div key="task-bg"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedTask(null)}
              style={{ position: 'fixed', inset: 0, zIndex: 67, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(2px)' }} />
            <motion.div key="task-panel"
              initial={{ x: '110%' }} animate={{ x: 0 }} exit={{ x: '110%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
              style={{
                position: 'fixed', right: 16, top: 16, bottom: 16,
                ...(isPhone ? {top:0,bottom:0,left:0,right:0,borderRadius:0} : isMobile ? {left:16} : {width:Math.min(640, window.innerWidth-280)}),
                background: CARD, zIndex: 68,
                display: 'flex', flexDirection: 'column',
                borderRadius: isPhone ? 0 : 24, overflow: 'hidden',
                boxShadow: '0 24px 64px rgba(0,0,0,0.20)',
              }}>
              <TaskCompletionModal task={selectedTask} onClose={() => setSelectedTask(null)} onComplete={handleCompleteTask} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Shift Summary modal */}
      {showSummary && (
        <>
          <div onClick={() => setShowSummary(false)} style={{ position:'fixed', inset:0, zIndex:90, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)' }} />
          <div style={{ position:'fixed', left:'50%', top:'50%', transform:'translate(-50%,-50%)', zIndex:91, width: isPhone ? 'calc(100% - 32px)' : 520, maxHeight: '80vh', background:CARD, borderRadius:24, display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.25)' }}>
            <div style={{ padding:'20px 20px 14px', borderBottom:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,56,92,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Sparkles size={18} color={BLUE} />
                </div>
                <div>
                  <div style={{ fontFamily:INTER, fontSize:16, fontWeight:700, color:TEXT }}>AI Shift Summary</div>
                  <div style={{ fontFamily:INTER, fontSize:12, color:MUTED }}>Ready to copy or share</div>
                </div>
              </div>
              <button onClick={() => setShowSummary(false)} style={{ width:32, height:32, borderRadius:'50%', border:'none', background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <X size={16} color={MUTED} />
              </button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:20 }}>
              <pre style={{ fontFamily:INTER, fontSize:13, color:TEXT, lineHeight:1.7, whiteSpace:'pre-wrap', wordBreak:'break-word', background:CARD2, borderRadius:14, padding:16, margin:0 }}>{summaryText}</pre>
            </div>
            <div style={{ padding:'14px 20px', borderTop:`1px solid ${BORDER}`, display:'flex', gap:10 }}>
              <button onClick={() => { navigator.clipboard.writeText(summaryText).then(() => { setSummaryCopied(true); setTimeout(() => setSummaryCopied(false), 2500); }); }}
                style={{ flex:1, padding:'13px 0', background: summaryCopied ? GREEN : BLUE, border:'none', borderRadius:12, fontFamily:INTER, fontSize:14, fontWeight:700, color:'white', cursor:'pointer' }}>
                {summaryCopied ? '✓ Copied!' : 'Copy Summary'}
              </button>
              <a href={`sms:?body=${encodeURIComponent(summaryText)}`}
                style={{ flex:1, padding:'13px 0', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:12, fontFamily:INTER, fontSize:14, fontWeight:700, color:TEXT, cursor:'pointer', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
                Send SMS
              </a>
            </div>
          </div>
        </>
      )}

      {/* AI Copilot */}
      <AICopilot isOpen={showCopilot} onClose={() => setShowCopilot(false)} role="concierge" patientName={propertyName} />

      {/* ── End-of-Shift Checklist ───────────────────────────────────────── */}
      <AnimatePresence>
        {showChecklist && (() => {
          const openTasks = tasks.filter(t => t.status !== 'completed');
          const openIncs  = incidents.filter(i => i.status !== 'resolved');
          const items     = [
            ...openTasks.map(t => ({ id: `task-${t.id}`, label: t.title, sub: `Task · ${t.category}`, type: 'task' })),
            ...openIncs.map(i  => ({ id: `inc-${i.id}`,  label: i.title, sub: `Incident · ${i.type}`, type: 'incident' })),
          ];
          const allAcked   = items.length === 0 || items.every(it => checklistAcks[it.id]);
          const ACK_COLORS = { done: GREEN, escalate: ORANGE };
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 32, stiffness: 280 }}
                style={{ ...glass(), borderRadius: isPhone ? '20px 20px 0 0' : 20, width: '100%', maxWidth: isPhone ? '100%' : 480, overflow: 'hidden', paddingBottom: 'env(safe-area-inset-bottom)', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 20px 14px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
                  <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 800, color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Before you go</div>
                  <div style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT }}>End-of-Shift Checklist</div>
                  <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 4 }}>Acknowledge every open item before handing over.</div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
                  {items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                      <CheckCircle size={36} color={GREEN} style={{ marginBottom: 10 }} />
                      <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 4px' }}>All clear!</p>
                      <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0 }}>No open tasks or unresolved incidents.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {items.map(it => {
                        const ack = checklistAcks[it.id];
                        return (
                          <div key={it.id} style={{ background: CARD, border: `1px solid ${ack ? ACK_COLORS[ack] + '40' : BORDER}`, borderRadius: 12, padding: '12px 14px' }}>
                            <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 2 }}>{it.label}</div>
                            <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginBottom: ack ? 0 : 10 }}>{it.sub}</div>
                            {!ack && (
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => setChecklistAcks(p => ({ ...p, [it.id]: 'done' }))}
                                  style={{ flex: 1, padding: '7px 0', background: `${GREEN}12`, border: `1px solid ${GREEN}30`, borderRadius: 8, fontFamily: INTER, fontSize: 12, fontWeight: 700, color: GREEN, cursor: 'pointer' }}>
                                  ✓ Mark Done
                                </button>
                                <button onClick={() => setChecklistAcks(p => ({ ...p, [it.id]: 'escalate' }))}
                                  style={{ flex: 1, padding: '7px 0', background: `${ORANGE}12`, border: `1px solid ${ORANGE}30`, borderRadius: 8, fontFamily: INTER, fontSize: 12, fontWeight: 700, color: ORANGE, cursor: 'pointer' }}>
                                  ⬆ Escalate
                                </button>
                              </div>
                            )}
                            {ack && (
                              <div style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: ACK_COLORS[ack] }}>
                                {ack === 'done' ? '✓ Marked done' : '⬆ Escalated to next shift'}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div style={{ padding: '12px 20px 20px', display: 'flex', gap: 10, borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
                  <button onClick={() => setShowChecklist(false)}
                    style={{ flex: 1, padding: '14px 0', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={proceedToHandover} disabled={!allAcked}
                    style={{ flex: 2, padding: '14px 0', background: allAcked ? BLUE : BORDER, border: 'none', borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: 'white', cursor: allAcked ? 'pointer' : 'not-allowed', opacity: allAcked ? 1 : 0.5 }}>
                    Continue to Handover →
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ── Shift Handover Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showHandover && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 280 }}
              style={{ ...glass(), borderRadius: isPhone ? '20px 20px 0 0' : 20, width: '100%', maxWidth: isPhone ? '100%' : 480, overflow: 'hidden', paddingBottom: 'env(safe-area-inset-bottom)' }}>
              {/* Header */}
              <div style={{ padding: '20px 20px 14px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 800, color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>End of Shift</div>
                <div style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em' }}>Shift Handover</div>
                <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, marginTop: 4 }}>Leave notes for the next concierge before clocking out.</div>
              </div>
              {/* Open items */}
              <div style={{ padding: '16px 20px 0' }}>
                <div style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8 }}>Open Items</div>
                <div style={{ position: 'relative' }}>
                  <textarea
                    placeholder={'One item per line, e.g.\n- Package for Unit 412 unclaimed\n- Gym HVAC making noise'}
                    value={handoverItems}
                    onChange={e => setHandoverItems(e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: '12px 44px 12px 14px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 14, color: TEXT, background: CARD2, outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.5 }}
                  />
                  <MicButton onTranscript={t => setHandoverItems(p => p ? p + '\n' + t : t)} />
                </div>
              </div>
              {/* Handover notes */}
              <div style={{ padding: '12px 20px 0' }}>
                <div style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8 }}>Handover Notes</div>
                <div style={{ position: 'relative' }}>
                  <textarea
                    placeholder="Anything the next concierge needs to know about the shift…"
                    value={handoverNotes}
                    onChange={e => setHandoverNotes(e.target.value)}
                    rows={4}
                    style={{ width: '100%', padding: '12px 44px 12px 14px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 14, color: TEXT, background: CARD2, outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.5 }}
                  />
                  <MicButton onTranscript={t => setHandoverNotes(p => p ? p + ' ' + t : t)} />
                </div>
              </div>
              {/* Footer */}
              <div style={{ padding: '16px 20px 20px', display: 'flex', gap: 10 }}>
                <button onClick={() => setShowHandover(false)}
                  style={{ flex: 1, padding: '14px 0', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={submitHandover} disabled={handoverSaving}
                  style={{ flex: 2, padding: '14px 0', background: RED, border: 'none', borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: 'white', cursor: handoverSaving ? 'not-allowed' : 'pointer', opacity: handoverSaving ? 0.7 : 1, boxShadow: '0 4px 14px rgba(255,59,48,0.30)' }}>
                  {handoverSaving ? 'Saving…' : 'Clock Out & Hand Over'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clock alert */}
      <AnimatePresence>
        {showClockAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
            data-testid="clock-alert-modal">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ ...glass(), borderRadius: 20, margin: '0 24px', maxWidth: 320, width: '100%', overflow: 'hidden', textAlign: 'center' }}>
              <div style={{ padding: '28px 24px 20px' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: clockAlertTitle === 'Clocked In' ? 'rgba(5,150,105,0.15)' : 'rgba(239,68,68,0.10)', border: `1px solid ${clockAlertTitle === 'Clocked In' ? 'rgba(5,150,105,0.35)' : 'rgba(239,68,68,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {clockAlertTitle === 'Clocked In' ? <Check size={22} color={GREEN} /> : <X size={22} color={RED} />}
                </div>
                <div style={{ fontFamily: INTER, fontSize: '1.3rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', marginBottom: 8 }}>{clockAlertTitle}</div>
                <p style={{ fontFamily: INTER, fontSize: 14, color: MUTED, lineHeight: 1.6 }}>{clockAlertMsg}</p>
              </div>
              <div style={{ borderTop: `1px solid ${BORDER}` }}>
                <button onClick={() => setShowClockAlert(false)} data-testid="clock-alert-ok-btn"
                  style={{ width: '100%', padding: '14px 0', background: 'none', border: 'none', fontFamily: INTER, fontSize: 14, fontWeight: 600, color: GREEN, cursor: 'pointer' }}>
                  OK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Emergency Contacts Panel ─────────────────────────────────────── */}
      <AnimatePresence>
        {showContacts && (
          <>
            <motion.div key="ec-bg"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowContacts(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 65, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(2px)' }} />
            <motion.div key="ec-panel"
              initial={{ x: 620 }} animate={{ x: 0 }} exit={{ x: 620 }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
              style={{ position: 'fixed', right: 16, top: 16, bottom: 16, ...(isPhone ? {top:0,bottom:0,left:0,right:0,borderRadius:0} : isMobile ? {left:16} : {width:Math.min(640, window.innerWidth-280)}), background: BG, zIndex: 66, display: 'flex', flexDirection: 'column', borderRadius: isPhone ? 0 : 24, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.20)' }}>

              {/* Header */}
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER}`, background: CARD, flexShrink: 0 }}>
                <div>
                  <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{propertyName}</div>
                  <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>Emergency Contacts</h2>
                </div>
                <button onClick={() => setShowContacts(false)}
                  style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${BORDER}`, background: CARD, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <X size={18} color={MUTED} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 28 }}>

                {/* Emergency Numbers */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={20} color={RED} />
                      <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Emergency Numbers</h2>
                    </div>
                    <span style={{ width: 32, height: 32, borderRadius: '50%', background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: MUTED, flexShrink: 0 }}>7</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'Police / Fire / EMS',    number: '911',                                              urgent: true  },
                      { label: 'Non-Emergency Police',   number: BUILDING_CONTACTS.emergency.nonEmergencyPolice,    urgent: false },
                      { label: 'Building Emergency Line',number: BUILDING_CONTACTS.emergency.buildingEmergency,     urgent: false },
                      { label: 'Elevator Emergency',     number: BUILDING_CONTACTS.emergency.elevatorEmergency,     urgent: false },
                      { label: 'Gas Emergency',          number: BUILDING_CONTACTS.emergency.gasEmergency,          urgent: false },
                      { label: 'Electricity Outage',     number: BUILDING_CONTACTS.emergency.electricityOutage,     urgent: false },
                      { label: 'Poison Control',         number: BUILDING_CONTACTS.emergency.poisonControl,         urgent: false },
                    ].map(({ label, number, urgent }) => (
                      <div key={label} style={{ background: CARD, border: `1px solid ${urgent ? 'rgba(255,59,48,0.3)' : BORDER}`, borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 16, boxShadow: urgent ? '0 4px 20px rgba(255,59,48,0.08)' : '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: urgent ? 'rgba(255,59,48,0.10)' : CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Phone size={22} color={urgent ? RED : MUTED} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 15, margin: '0 0 2px' }}>{label}</p>
                          <p style={{ fontFamily: INTER, fontSize: 14, color: MUTED, margin: 0 }}>{number}</p>
                        </div>
                        <a href={`tel:${number.replace(/\D/g,'')}`}
                          style={{ padding: '10px 18px', background: urgent ? RED : BLUE, color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none', flexShrink: 0, boxShadow: urgent ? '0 4px 14px rgba(255,59,48,0.30)' : '0 4px 14px rgba(255,56,92,0.28)' }}>
                          Call
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Property Team */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Users size={20} color={BLUE} />
                      <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Property Team</h2>
                    </div>
                    <span style={{ width: 32, height: 32, borderRadius: '50%', background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: MUTED, flexShrink: 0 }}>5</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {['propertyManager','maintenance','headConcierge','leasing','maverickDispatch'].map(key => {
                      const c = BUILDING_CONTACTS[key];
                      return (
                        <div key={key} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: c.phone ? 14 : 0 }}>
                            {c.avatar ? (
                              <img src={c.avatar} alt={c.name} style={{ width: 56, height: 56, borderRadius: 16, objectFit: 'cover', flexShrink: 0 }} />
                            ) : (
                              <div style={{ width: 56, height: 56, borderRadius: 16, background: CARD2, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Building2 size={24} color={MUTED} />
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 16, margin: '0 0 2px' }}>{c.name}</p>
                              <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: '0 0 1px' }}>{c.title}</p>
                              {c.available && <p style={{ fontFamily: INTER, fontSize: 12, color: MUTED, margin: 0 }}>{c.available}</p>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                              <a href={`tel:${c.phone?.replace(/\D/g,'')}`}
                                style={{ padding: '9px 20px', background: BLUE, color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center', boxShadow: '0 4px 14px rgba(255,56,92,0.28)' }}>
                                Call
                              </a>
                              {c.afterHoursLine && (
                                <a href={`tel:${c.afterHoursLine.replace(/\D/g,'')}`}
                                  style={{ padding: '7px 14px', background: CARD2, border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 10, fontSize: 12, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                                  After hrs
                                </a>
                              )}
                            </div>
                          </div>
                          {c.phone && (
                            <div style={{ paddingTop: 14, borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 16 }}>
                              <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED }}>{c.phone}</span>
                              {c.email && <span style={{ fontFamily: INTER, fontSize: 13, color: BLUE }}>{c.email}</span>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Building SOPs Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showSOPs && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: BG, borderRadius: '24px 24px 0 0', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>

              <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER}`, background: CARD, flexShrink: 0 }}>
                <h2 style={{ fontFamily: INTER, fontSize: 22, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>Building SOPs</h2>
                <button onClick={() => setShowSOPs(false)}
                  style={{ width: 36, height: 36, background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <X size={20} color={TEXT} strokeWidth={1.5} />
                </button>
              </div>

              <div style={{ overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 32 }}>
                {BUILDING_SOPS.map((sop) => (
                  <Card key={sop.id}>
                    <button onClick={() => setExpandedSOPId(expandedSOPId === sop.id ? null : sop.id)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      <div>
                        <div style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: BLUE, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>{sop.category}</div>
                        <div style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT }}>{sop.title}</div>
                      </div>
                      <ChevronDown size={18} color={MUTED} style={{ transform: expandedSOPId === sop.id ? 'rotate(180deg)' : 'none', transition: 'transform 200ms', flexShrink: 0, marginLeft: 12 }} />
                    </button>
                    {expandedSOPId === sop.id && (
                      <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${BORDER}` }}>
                        <p style={{ fontFamily: INTER, fontSize: 13, color: TEXT, lineHeight: 1.75, margin: '12px 0 0', whiteSpace: 'pre-line' }}>{sop.content}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── New Task Wizard ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showNewTask && (
          <>
            {/* Backdrop */}
            <motion.div key="nt-bg"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => { setShowNewTask(false); setNtStep(1); setNTF({ title: '', category: '', notes: '', location: '', priority: 'normal', dueDate: '' }); }}
              style={{ position: 'fixed', inset: 0, zIndex: 65, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(2px)' }} />

            {/* Panel */}
            <motion.div key="nt-panel"
              initial={{ x: 600 }} animate={{ x: 0 }} exit={{ x: 600 }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
              style={{
                position: 'fixed', right: 16, top: 16, bottom: 16,
                ...(isPhone ? {top:0,bottom:0,left:0,right:0,borderRadius:0} : isMobile ? {left:16} : {width:Math.min(640, window.innerWidth-280)}),
                background: CARD, zIndex: 66,
                display: 'flex', flexDirection: 'column',
                borderRadius: isPhone ? 0 : 24,
                boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
                overflow: 'hidden',
              }}>

              {/* Wizard header */}
              <div style={{ flexShrink: 0, background: CARD, borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ padding: '14px 20px 10px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em' }}>
                      {ntStep === 1 ? 'Describe the task' : ntStep === 2 ? 'Choose a category' : 'Priority & details'}
                    </div>
                    <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginTop: 3 }}>Step {ntStep} of 3</div>
                  </div>
                  <button onClick={() => { setShowNewTask(false); setNtStep(1); setNTF({ title: '', category: '', notes: '', location: '', priority: 'normal', dueDate: '' }); }}
                    style={{ fontFamily: INTER, fontSize: 14, fontWeight: 600, color: MUTED, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginTop: 2 }}>
                    Cancel
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 4, padding: '0 20px 14px' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= ntStep ? BLUE : BORDER, transition: 'background 200ms' }} />
                  ))}
                </div>
              </div>

              {/* Step content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* ── Step 1: Describe ── */}
                {ntStep === 1 && (
                  <>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ flex: 1, background: CARD2, borderRadius: 14, border: `1px solid ${BORDER}`, padding: '14px 16px' }}>
                        <p style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>Assignee</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width:28, height:28, borderRadius:'50%', background:`${BLUE}14`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:BLUE }}>{(authUser?.name||'C').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</span></div>
                          <span style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT }}>{(authUser?.name || 'Concierge').split(' ')[0]}</span>
                        </div>
                      </div>
                      <div style={{ flex: 1, background: CARD2, borderRadius: 14, border: `1px solid ${BORDER}`, padding: '14px 16px' }}>
                        <p style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>Time</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Clock size={16} color={BLUE} />
                          <span style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT }}>{nowStr()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 10px' }}>Description *</h3>
                      <div style={{ position: 'relative' }}>
                        <textarea
                          placeholder="e.g. Helped resident in 1204 carry groceries, assisted maintenance with P2 shut-off valve..."
                          value={ntForm.title}
                          onChange={e => setNTF(p => ({ ...p, title: e.target.value }))}
                          rows={isPhone ? 4 : 5}
                          autoFocus={!isPhone}
                          style={{
                            width: '100%', padding: '16px 44px 16px 16px', borderRadius: 14,
                            border: `1.5px solid ${ntForm.title ? BLUE : BORDER}`,
                            fontFamily: INTER, fontSize: 15, color: TEXT,
                            background: ntForm.title ? 'rgba(255,56,92,0.03)' : CARD,
                            outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6,
                            transition: 'border-color 0.15s',
                          }} />
                        <MicButton onTranscript={t => setNTF(p => ({ ...p, title: p.title ? p.title + ' ' + t : t }))} />
                      </div>
                    </div>
                  </>
                )}

                {/* ── Step 2: Category ── */}
                {ntStep === 2 && TASK_CATEGORY_CONFIG.map(({ id, Icon, desc }) => {
                  const sel = ntForm.category === id;
                  return (
                    <button key={id} onClick={() => setNTF(p => ({ ...p, category: sel ? '' : id }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16, padding: '15px 16px',
                        borderRadius: 16, border: `1.5px solid ${sel ? BLUE : BORDER}`,
                        background: sel ? 'rgba(255,56,92,0.05)' : CARD,
                        cursor: 'pointer', textAlign: 'left', width: '100%',
                        boxShadow: sel ? '0 4px 16px rgba(255,56,92,0.12)' : SHADOW,
                        transition: 'all 150ms',
                      }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: sel ? 'rgba(255,56,92,0.12)' : CARD2 }}>
                        <Icon size={22} color={sel ? BLUE : MUTED} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 2 }}>{id}</div>
                        <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED }}>{desc}</div>
                      </div>
                      {sel && (
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Check size={13} color="white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* ── Step 3: Priority & details ── */}
                {ntStep === 3 && (
                  <>
                    <div>
                      <h3 style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 10px' }}>Priority</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                          { val: 'normal', label: 'Normal', desc: 'Routine task, no rush',    Icon: CheckCircle,   color: GREEN  },
                          { val: 'high',   label: 'High',   desc: 'Needs attention soon',      Icon: AlertTriangle, color: ORANGE },
                          { val: 'urgent', label: 'Urgent', desc: 'Address immediately',       Icon: Zap,           color: RED    },
                        ].map(({ val, label, desc, Icon, color }) => {
                          const sel = ntForm.priority === val;
                          return (
                            <button key={val} onClick={() => setNTF(p => ({ ...p, priority: val }))}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px',
                                borderRadius: 16, border: `1.5px solid ${sel ? color : BORDER}`,
                                background: sel ? `${color}0D` : CARD,
                                cursor: 'pointer', textAlign: 'left', width: '100%',
                                boxShadow: sel ? `0 4px 16px ${color}22` : SHADOW,
                                transition: 'all 150ms',
                              }}>
                              <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: sel ? `${color}1A` : CARD2 }}>
                                <Icon size={22} color={sel ? color : MUTED} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 2 }}>{label}</div>
                                <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED }}>{desc}</div>
                              </div>
                              {sel && (
                                <div style={{ width: 22, height: 22, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <Check size={13} color="white" strokeWidth={3} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h3 style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 10px' }}>
                        Location / Unit <span style={{ fontWeight: 400, fontSize: 13, color: MUTED }}>(optional)</span>
                      </h3>
                      <input type="text" placeholder="e.g. Unit 412, Lobby, P2 Garage…"
                        value={ntForm.location} onChange={e => setNTF(p => ({ ...p, location: e.target.value }))}
                        style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: `1.5px solid ${ntForm.location ? BLUE : BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: ntForm.location ? 'rgba(255,56,92,0.03)' : CARD, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 10px' }}>
                        Entry Notes <span style={{ fontWeight: 400, fontSize: 13, color: MUTED }}>(optional)</span>
                      </h3>
                      <div style={{ position: 'relative' }}>
                        <textarea placeholder="Resident name, outcome, follow-up needed…"
                          value={ntForm.notes} onChange={e => setNTF(p => ({ ...p, notes: e.target.value }))}
                          rows={3}
                          style={{ width: '100%', padding: '14px 44px 14px 16px', borderRadius: 14, border: `1.5px solid ${BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: CARD, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                        <MicButton onTranscript={t => setNTF(p => ({ ...p, notes: p.notes ? p.notes + ' ' + t : t }))} />
                      </div>
                    </div>
                    {/* Flag for Follow-up */}
                    <button onClick={() => setNTF(p => ({ ...p, flagFollowUp: !p.flagFollowUp }))}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, border: `1.5px solid ${ntForm.flagFollowUp ? ORANGE : BORDER}`, background: ntForm.flagFollowUp ? 'rgba(255,149,0,0.06)' : CARD2, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 11, background: ntForm.flagFollowUp ? 'rgba(255,149,0,0.15)' : CARD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Flag size={18} color={ntForm.flagFollowUp ? ORANGE : MUTED} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: ntForm.flagFollowUp ? TEXT : MUTED }}>Flag for Follow-up</div>
                        <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginTop: 2 }}>Adds this task to your Follow-up Tracker</div>
                      </div>
                      <div style={{ width: 22, height: 22, borderRadius: 7, background: ntForm.flagFollowUp ? ORANGE : 'transparent', border: ntForm.flagFollowUp ? 'none' : `2px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {ntForm.flagFollowUp && <Check size={13} color="white" strokeWidth={3} />}
                      </div>
                    </button>
                  </>
                )}
              </div>

              {/* Wizard footer */}
              <div style={{ flexShrink: 0, background: CARD, borderTop: `1px solid ${BORDER}` }}>
                {ntError && (
                  <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={13} color={RED} />
                    <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 600, color: RED }}>{ntError}</span>
                  </div>
                )}
                <div style={{ padding: isPhone ? '12px 20px 32px' : '12px 20px 24px', display: 'flex', gap: 10 }}>
                  {ntStep > 1 && (
                    <button onClick={() => { setNtStep(p => p - 1); setNtError(''); }}
                      style={{ flex: 1, padding: '15px 0', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, cursor: 'pointer' }}>
                      Back
                    </button>
                  )}
                  {ntStep < 3 ? (
                    <button onClick={() => {
                        if (ntStep === 1 && !ntForm.title.trim()) { setNtError('Please describe what you did before continuing.'); return; }
                        setNtError(''); setNtStep(p => p + 1);
                      }}
                      style={{ flex: 1, padding: '15px 0', background: BLUE, border: 'none', borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: `0 6px 20px ${BLUE}28` }}>
                      Continue
                    </button>
                  ) : (
                    <button onClick={submitNewTask}
                      style={{ flex: 1, padding: '15px 0', background: BLUE, border: 'none', borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: `0 6px 20px ${BLUE}28` }}>
                      Create Task
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Package Room Audit Panel ─────────────────────────────────────── */}
      <AnimatePresence>
        {showPkgAudit && (
          <>
            <motion.div key="pkgaudit-bg"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowPkgAudit(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(2px)' }} />
            <motion.div key="pkgaudit-panel"
              initial={{ x: 620 }} animate={{ x: 0 }} exit={{ x: 620 }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
              style={{ position: 'fixed', right: 16, top: 16, bottom: 16, ...(isPhone ? {top:0,bottom:0,left:0,right:0,borderRadius:0} : isMobile ? {left:16} : {width:Math.min(640, window.innerWidth-280)}), background: BG, zIndex: 61, display: 'flex', flexDirection: 'column', borderRadius: isPhone ? 0 : 24, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.20)' }}>

              {/* Header */}
              <div style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, padding: '16px 20px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(255,56,92,0.10)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={22} color={BLUE} />
                  </div>
                  <div>
                    <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 2px' }}>{propertyName}</p>
                    <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>Package Room Audit</h2>
                  </div>
                </div>
                <button onClick={() => setShowPkgAudit(false)}
                  style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${BORDER}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <X size={18} color={MUTED} strokeWidth={2} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Instruction card */}
                <div style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 36, height: 36, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Package size={16} color={MUTED} />
                  </div>
                  <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, lineHeight: 1.65, margin: 0 }}>
                    Physically count packages in the room, then enter the count alongside the current Luxer total. Any discrepancy will be flagged and logged for the shift record.
                  </p>
                </div>

                {/* Audit form */}
                <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: 'rgba(255,56,92,0.10)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ClipboardList size={18} color={BLUE} />
                    </div>
                    <h3 style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>New Count</h3>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    {/* Luxer count */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8 }}>Luxer Count</div>
                      <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0"
                        value={auditForm.luxerCount}
                        onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); setAuditForm(p => ({ ...p, luxerCount: v })); }}
                        style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1.5px solid rgba(255,56,92,0.30)', fontFamily: INTER, fontWeight: 800, fontSize: '1.6rem', color: BLUE, background: 'rgba(255,56,92,0.04)', outline: 'none', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '-0.02em' }} />
                      <div style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: BLUE, textAlign: 'center', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>From Luxer</div>
                    </div>

                    {/* VS */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: 24 }}>
                      <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 13, color: MUTED }}>VS</div>
                    </div>

                    {/* Physical count */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8 }}>Physical Count</div>
                      <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0"
                        value={auditForm.physicalCount}
                        onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); setAuditForm(p => ({ ...p, physicalCount: v })); }}
                        style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1.5px solid rgba(52,199,89,0.35)', fontFamily: INTER, fontWeight: 800, fontSize: '1.6rem', color: GREEN, background: 'rgba(52,199,89,0.04)', outline: 'none', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '-0.02em' }} />
                      <div style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: GREEN, textAlign: 'center', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>In Room</div>
                    </div>
                  </div>

                  {/* Live diff */}
                  {auditForm.luxerCount !== '' && auditForm.physicalCount !== '' && (() => {
                    const diff  = parseInt(auditForm.physicalCount, 10) - parseInt(auditForm.luxerCount, 10);
                    const match = diff === 0;
                    return (
                      <div style={{ background: match ? 'rgba(52,199,89,0.07)' : 'rgba(255,149,0,0.07)', border: `1px solid ${match ? 'rgba(52,199,89,0.22)' : 'rgba(255,149,0,0.22)'}`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                        {match
                          ? <><Check size={15} color={GREEN} /><span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: GREEN }}>Counts match — package room is accurate</span></>
                          : <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: ORANGE }}>{diff > 0 ? `+${diff} unaccounted` : `${Math.abs(diff)} missing`} — discrepancy detected</span>}
                      </div>
                    );
                  })()}

                  {/* Notes */}
                  <div>
                    <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8 }}>
                      Notes{' '}
                      <span style={{ fontWeight: 400, fontSize: 11, color: MUTED, textTransform: 'none', letterSpacing: 0 }}>
                        {auditForm.luxerCount !== '' && auditForm.physicalCount !== '' && parseInt(auditForm.physicalCount, 10) !== parseInt(auditForm.luxerCount, 10) ? '(required for discrepancy)' : '(optional)'}
                      </span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <textarea placeholder="Package location details, carrier breakdown, possible explanations..."
                        value={auditForm.notes} onChange={e => setAuditForm(p => ({ ...p, notes: e.target.value }))} rows={3}
                        style={{ width: '100%', padding: '14px 44px 14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 14, color: TEXT, background: CARD2, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                      <MicButton onTranscript={t => setAuditForm(p => ({ ...p, notes: p.notes ? p.notes + ' ' + t : t }))} />
                    </div>
                  </div>

                  <button onClick={submitPkgAudit} disabled={auditForm.luxerCount === '' || auditForm.physicalCount === ''}
                    style={{ width: '100%', padding: '15px 0', background: auditForm.luxerCount === '' || auditForm.physicalCount === '' ? CARD2 : BLUE, border: auditForm.luxerCount === '' || auditForm.physicalCount === '' ? `1px solid ${BORDER}` : 'none', borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: auditForm.luxerCount === '' || auditForm.physicalCount === '' ? MUTED : 'white', cursor: auditForm.luxerCount === '' || auditForm.physicalCount === '' ? 'not-allowed' : 'pointer', boxShadow: auditForm.luxerCount === '' || auditForm.physicalCount === '' ? 'none' : `0 6px 20px ${BLUE}28` }}>
                    Submit Audit
                  </button>
                </div>

                {/* Audit history */}
                {pkgAudits.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Package size={20} color={BLUE} />
                        <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Audit History</h2>
                      </div>
                      <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,56,92,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: BLUE, flexShrink: 0 }}>{pkgAudits.length}</span>
                    </div>
                    {pkgAudits.map(a => (
                      <div key={a.id} style={{ background: CARD, border: `1.5px solid ${a.match ? 'rgba(52,199,89,0.22)' : 'rgba(255,149,0,0.28)'}`, borderRadius: 16, overflow: 'hidden', boxShadow: `0 4px 16px ${a.match ? 'rgba(52,199,89,0.06)' : 'rgba(255,149,0,0.06)'}` }}>
                        <div style={{ padding: 20 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
                            <div style={{ width: 52, height: 52, background: a.match ? 'rgba(52,199,89,0.12)' : 'rgba(255,149,0,0.12)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {a.match ? <Check size={24} color={GREEN} /> : <AlertTriangle size={24} color={ORANGE} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: a.match ? GREEN : ORANGE, background: a.match ? 'rgba(52,199,89,0.12)' : 'rgba(255,149,0,0.12)', borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                  {a.match ? 'Match' : 'Discrepancy'}
                                </span>
                              </div>
                              <p style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 2px' }}>Package Room Count</p>
                              <p style={{ fontFamily: INTER, fontSize: 12, color: MUTED, margin: 0 }}>{a.time} · {a.by}</p>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: a.notes ? 12 : 0 }}>
                            {[
                              { label: 'Luxer',    value: a.luxerCount,    color: BLUE  },
                              { label: 'Physical', value: a.physicalCount, color: GREEN },
                              { label: 'Diff',     value: a.diff > 0 ? `+${a.diff}` : a.diff === 0 ? '—' : `${a.diff}`, color: a.match ? MUTED : ORANGE },
                            ].map(({ label, value, color }) => (
                              <div key={label} style={{ background: CARD2, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                                <div style={{ fontFamily: INTER, fontSize: '1.4rem', fontWeight: 800, color, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{value}</div>
                                <div style={{ fontFamily: INTER, fontSize: 10, color: MUTED, fontWeight: 700 }}>{label}</div>
                              </div>
                            ))}
                          </div>
                          {a.notes && <p style={{ fontFamily: INTER, fontSize: 12, color: MUTED, margin: 0, fontStyle: 'italic', borderTop: `1px solid ${BORDER}`, paddingTop: 10 }}>"{a.notes}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {pkgAudits.length === 0 && (
                  <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, background: CARD2, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <Package size={30} color={MUTED} />
                    </div>
                    <p style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 5px' }}>No audits logged today</p>
                    <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0 }}>Complete your first count to verify Luxer accuracy</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Amenity Spaces Panel ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showAmenities && (
          <>
            <motion.div key="am-bg"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowAmenities(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(2px)' }} />
            <motion.div key="am-panel"
              initial={{ x: 620 }} animate={{ x: 0 }} exit={{ x: 620 }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
              style={{ position: 'fixed', right: 16, top: 16, bottom: 16, ...(isPhone ? {top:0,bottom:0,left:0,right:0,borderRadius:0} : isMobile ? {left:16} : {width:Math.min(640, window.innerWidth-280)}), background: BG, zIndex: 61, display: 'flex', flexDirection: 'column', borderRadius: isPhone ? 0 : 24, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.20)' }}>

              {/* Header */}
              <div style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, padding: '16px 20px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(255,56,92,0.10)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Waves size={22} color={BLUE} />
                  </div>
                  <div>
                    <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 2px' }}>{propertyName}</p>
                    <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>Amenity Spaces</h2>
                  </div>
                </div>
                <button onClick={() => setShowAmenities(false)}
                  style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${BORDER}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <X size={18} color={MUTED} strokeWidth={2} />
                </button>
              </div>

              {/* Scrollable content */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* Stat cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: openAmenityCount > 0 ? 'rgba(52,199,89,0.06)' : CARD, border: `1px solid ${openAmenityCount > 0 ? 'rgba(52,199,89,0.22)' : BORDER}`, borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: openAmenityCount > 0 ? 'rgba(52,199,89,0.12)' : CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                        <Check size={14} color={openAmenityCount > 0 ? GREEN : MUTED} />
                      </div>
                      <div style={{ fontFamily: INTER, fontSize: '1.8rem', fontWeight: 800, color: openAmenityCount > 0 ? GREEN : MUTED, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{openAmenityCount}</div>
                      <div style={{ fontFamily: INTER, fontSize: 10, color: MUTED, fontWeight: 700 }}>OPEN</div>
                    </div>
                    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                        <X size={14} color={MUTED} />
                      </div>
                      <div style={{ fontFamily: INTER, fontSize: '1.8rem', fontWeight: 800, color: MUTED, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{amenities.length - openAmenityCount}</div>
                      <div style={{ fontFamily: INTER, fontSize: 10, color: MUTED, fontWeight: 700 }}>CLOSED</div>
                    </div>
                  </div>

                  {/* Section header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Waves size={20} color={GREEN} />
                    <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Which spaces are open?</h2>
                  </div>

                  {/* Amenity cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {amenities.map((a) => {
                      const { Icon } = a;
                      return (
                        <button key={a.id} onClick={() => toggleAmenity(a.id)}
                          style={{
                            padding: 20, borderRadius: 16, textAlign: 'left',
                            display: 'flex', alignItems: 'center', gap: 16,
                            cursor: 'pointer', width: '100%',
                            background: a.open ? 'rgba(52,199,89,0.04)' : CARD,
                            border: a.open ? '1.5px solid rgba(52,199,89,0.28)' : `1px solid ${BORDER}`,
                            boxShadow: a.open ? '0 4px 16px rgba(52,199,89,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
                          }}>
                          <div style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: a.open ? 'rgba(52,199,89,0.12)' : CARD2 }}>
                            <Icon size={26} color={a.open ? GREEN : MUTED} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                              {a.open && <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: GREEN, background: 'rgba(52,199,89,0.12)', borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Open</span>}
                              <p style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 16, margin: 0 }}>{a.name}</p>
                            </div>
                            <p style={{ fontFamily: INTER, fontSize: 12, color: a.open ? GREEN : MUTED, margin: 0 }}>
                              {a.open ? (a.openedAt ? `Opened ${a.openedAt} · ${a.openedBy}` : 'Currently open') : 'Tap to mark as open'}
                            </p>
                          </div>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: a.open ? GREEN : 'transparent', border: a.open ? 'none' : `2px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {a.open && <Check size={15} color="white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Shift note */}
                  <div style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ width: 36, height: 36, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Briefcase size={16} color={MUTED} />
                    </div>
                    <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, lineHeight: 1.65, margin: 0 }}>
                      Tap a space to toggle open or closed. All changes are logged with your name for the shift record.
                    </p>
                  </div>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Open Models Panel ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModels && (
          <>
            <motion.div key="models-bg"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowModels(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(2px)' }} />
            <motion.div key="models-panel"
              initial={{ x: 620 }} animate={{ x: 0 }} exit={{ x: 620 }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
              style={{ position: 'fixed', right: 16, top: 16, bottom: 16, ...(isPhone ? {top:0,bottom:0,left:0,right:0,borderRadius:0} : isMobile ? {left:16} : {width:Math.min(640, window.innerWidth-280)}), background: BG, zIndex: 61, display: 'flex', flexDirection: 'column', borderRadius: isPhone ? 0 : 24, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.20)' }}>

              {/* Header */}
              <div style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, padding: '16px 20px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(255,56,92,0.10)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DoorOpen size={22} color={BLUE} />
                  </div>
                  <div>
                    <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 2px' }}>{propertyName}</p>
                    <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>Open Models</h2>
                  </div>
                </div>
                <button onClick={() => setShowModels(false)}
                  style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${BORDER}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <X size={18} color={MUTED} strokeWidth={2} />
                </button>
              </div>

              {/* Scrollable content */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* Stat cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: openModelCount > 0 ? 'rgba(255,56,92,0.06)' : CARD, border: `1px solid ${openModelCount > 0 ? 'rgba(255,56,92,0.22)' : BORDER}`, borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: openModelCount > 0 ? 'rgba(255,56,92,0.12)' : CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                        <DoorOpen size={14} color={openModelCount > 0 ? BLUE : MUTED} />
                      </div>
                      <div style={{ fontFamily: INTER, fontSize: '1.8rem', fontWeight: 800, color: openModelCount > 0 ? BLUE : MUTED, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{openModelCount}</div>
                      <div style={{ fontFamily: INTER, fontSize: 10, color: MUTED, fontWeight: 700 }}>SHOWING</div>
                    </div>
                    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                        <DoorClosed size={14} color={MUTED} />
                      </div>
                      <div style={{ fontFamily: INTER, fontSize: '1.8rem', fontWeight: 800, color: MUTED, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{modelUnits.length - openModelCount}</div>
                      <div style={{ fontFamily: INTER, fontSize: 10, color: MUTED, fontWeight: 700 }}>CLOSED</div>
                    </div>
                  </div>

                  {/* Section header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <DoorOpen size={20} color={BLUE} />
                    <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Which units are showing?</h2>
                  </div>

                  {/* Model unit cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {modelUnits.map(m => (
                      <button key={m.id} onClick={() => toggleModel(m.id)}
                        style={{
                          padding: 20, borderRadius: 16, textAlign: 'left',
                          display: 'flex', alignItems: 'center', gap: 16,
                          cursor: 'pointer', width: '100%',
                          background: m.open ? 'rgba(255,56,92,0.04)' : CARD,
                          border: m.open ? '1.5px solid rgba(255,56,92,0.28)' : `1px solid ${BORDER}`,
                          boxShadow: m.open ? '0 4px 16px rgba(255,56,92,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
                        }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: m.open ? 'rgba(255,56,92,0.12)' : CARD2 }}>
                          {m.open ? <DoorOpen size={26} color={BLUE} /> : <DoorClosed size={26} color={MUTED} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                            {m.open && <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: BLUE, background: 'rgba(255,56,92,0.10)', borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Showing</span>}
                            <p style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 16, margin: 0 }}>Unit {m.unit}</p>
                          </div>
                          <p style={{ fontFamily: INTER, fontSize: 12, color: MUTED, margin: '0 0 2px' }}>
                            {m.type} · {m.sqft.toLocaleString()} sq ft · Floor {m.floor}
                          </p>
                          {m.open && m.openedAt && (
                            <p style={{ fontFamily: INTER, fontSize: 12, color: BLUE, margin: 0, fontWeight: 600 }}>Opened {m.openedAt} · {m.openedBy}</p>
                          )}
                        </div>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: m.open ? BLUE : 'transparent', border: m.open ? 'none' : `2px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {m.open && <Check size={15} color="white" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Note */}
                  <div style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ width: 36, height: 36, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <DoorOpen size={16} color={MUTED} />
                    </div>
                    <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, lineHeight: 1.65, margin: 0 }}>
                      Tap a unit to toggle open or closed. Open models are logged with your name for the shift record.
                    </p>
                  </div>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Elevator / Move Tracking Panel ───────────────────────────────── */}
      <AnimatePresence>
        {showElevators && (
          <>
            <motion.div key="elev-bg"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => { setShowElevators(false); setShowElevForm(false); }}
              style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(2px)' }} />
            <motion.div key="elev-panel"
              initial={{ x: 620 }} animate={{ x: 0 }} exit={{ x: 620 }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
              style={{ position: 'fixed', right: 16, top: 16, bottom: 16, ...(isPhone ? {top:0,bottom:0,left:0,right:0,borderRadius:0} : isMobile ? {left:16} : {width:Math.min(640, window.innerWidth-280)}), background: BG, zIndex: 61, display: 'flex', flexDirection: 'column', borderRadius: isPhone ? 0 : 24, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.20)' }}>

              {/* Header */}
              <div style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, padding: '16px 20px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(255,56,92,0.10)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={22} color={BLUE} />
                  </div>
                  <div>
                    <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 2px' }}>{propertyName}</p>
                    <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>Move Activity</h2>
                  </div>
                </div>
                <button onClick={() => { setShowElevators(false); setShowElevForm(false); }}
                  style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${BORDER}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <X size={18} color={MUTED} strokeWidth={2} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* CTA or inline form */}
                {!showElevForm ? (
                  <button onClick={() => setShowElevForm(true)}
                    style={{ width: '100%', padding: 20, background: BLUE, border: 'none', borderRadius: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', boxShadow: `0 8px 28px ${BLUE}40` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Plus size={28} color="white" />
                      </div>
                      <div>
                        <p style={{ fontFamily: INTER, fontWeight: 700, color: 'white', fontSize: 17, margin: '0 0 3px' }}>Log Elevator Preparation</p>
                        <p style={{ fontFamily: INTER, fontSize: 13, color: 'rgba(255,255,255,0.72)', margin: 0 }}>Reserve & track a resident move</p>
                      </div>
                    </div>
                    <ChevronRight size={24} color="rgba(255,255,255,0.72)" />
                  </button>
                ) : (
                  <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, background: 'rgba(255,56,92,0.10)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={18} color={BLUE} />
                      </div>
                      <h3 style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>Document Elevator Preparation</h3>
                    </div>

                    {/* Move type */}
                    <div>
                      <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.10em', margin: '0 0 10px' }}>Move Type</p>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {[{ id: 'move_in', label: 'Move In' }, { id: 'move_out', label: 'Move Out' }].map(mt => {
                          const active = eForm.moveType === mt.id;
                          return (
                            <button key={mt.id} onClick={() => setEF(p => ({ ...p, moveType: mt.id }))}
                              style={{ flex: 1, padding: '13px 0', borderRadius: 12, border: active ? 'none' : `1px solid ${BORDER}`, background: active ? BLUE : CARD2, color: active ? 'white' : MUTED, fontFamily: INTER, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: active ? `0 4px 14px ${BLUE}40` : 'none' }}>
                              {mt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Resident name */}
                    <div>
                      <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.10em', margin: '0 0 10px' }}>Resident Name</p>
                      <input type="text" placeholder="Full name" value={eForm.residentName} onChange={e => setEF(p => ({ ...p, residentName: e.target.value }))}
                        style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${eForm.residentName ? BLUE : BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: eForm.residentName ? 'rgba(255,56,92,0.03)' : CARD, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }} />
                    </div>

                    {/* Unit + Floor */}
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.10em', margin: '0 0 10px' }}>Unit</p>
                        <input type="text" placeholder="e.g. 802" value={eForm.unit} onChange={e => setEF(p => ({ ...p, unit: e.target.value }))}
                          style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${eForm.unit ? BLUE : BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: eForm.unit ? 'rgba(255,56,92,0.03)' : CARD, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.10em', margin: '0 0 10px' }}>Floor</p>
                        <input type="text" placeholder="e.g. 8" value={eForm.floor} onChange={e => setEF(p => ({ ...p, floor: e.target.value }))}
                          style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 15, color: TEXT, background: CARD, outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.10em', margin: '0 0 10px' }}>
                        Notes <span style={{ fontSize: 12, fontWeight: 400, color: MUTED, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                      </p>
                      <textarea placeholder="Moving company, special instructions, expected duration..." value={eForm.notes} onChange={e => setEF(p => ({ ...p, notes: e.target.value }))} rows={3}
                        style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 14, color: TEXT, background: CARD, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => setShowElevForm(false)}
                        style={{ flex: 1, padding: '15px 0', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, cursor: 'pointer' }}>
                        Cancel
                      </button>
                      <button onClick={submitElevReservation} disabled={!eForm.residentName || !eForm.unit}
                        style={{ flex: 2, padding: '15px 0', background: !eForm.residentName || !eForm.unit ? CARD2 : BLUE, border: !eForm.residentName || !eForm.unit ? `1px solid ${BORDER}` : 'none', borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: !eForm.residentName || !eForm.unit ? MUTED : 'white', cursor: !eForm.residentName || !eForm.unit ? 'not-allowed' : 'pointer', boxShadow: !eForm.residentName || !eForm.unit ? 'none' : `0 6px 20px ${BLUE}28` }}>
                        Log as Prepared
                      </button>
                    </div>
                  </div>
                )}

                {/* Move log section */}
                {elevatorMoves.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Zap size={20} color={ORANGE} />
                        <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Today's Moves</h2>
                      </div>
                      <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,149,0,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: ORANGE, flexShrink: 0 }}>{elevatorMoves.length}</span>
                    </div>

                    {elevatorMoves.map(m => {
                      const isActive   = m.elevStatus === 'in_progress';
                      const isReserved = m.elevStatus === 'reserved';
                      const accent     = isActive ? RED : isReserved ? ORANGE : GREEN;
                      const statusText = isActive ? 'In Progress' : isReserved ? 'Prepared' : 'Completed';
                      return (
                        <div key={m.id} style={{ background: CARD, border: `1.5px solid ${isActive ? 'rgba(255,59,48,0.28)' : isReserved ? 'rgba(255,149,0,0.28)' : `rgba(52,199,89,0.22)`}`, borderRadius: 16, overflow: 'hidden', boxShadow: `0 4px 16px ${accent}0D` }}>
                          <div style={{ padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
                              <div style={{ width: 52, height: 52, background: `${accent}18`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Zap size={24} color={accent} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                  <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: accent, background: `${accent}14`, borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{statusText}</span>
                                  <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: MUTED, background: CARD2, borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.moveType === 'move_in' ? 'Move In' : 'Move Out'}</span>
                                </div>
                                <p style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 3px' }}>{m.residentName}</p>
                                <p style={{ fontFamily: INTER, fontSize: 12, color: MUTED, margin: 0 }}>Unit {m.unit}{m.floor ? ` · Floor ${m.floor}` : ''}</p>
                                {m.notes && <p style={{ fontFamily: INTER, fontSize: 12, color: MUTED, margin: '4px 0 0', fontStyle: 'italic' }}>"{m.notes}"</p>}
                              </div>
                            </div>

                            {/* Timeline */}
                            <div style={{ background: CARD2, borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 0 }}>
                              {[
                                { label: 'Prepared',     value: m.reservedAt, color: MUTED  },
                                { label: 'Move Started', value: m.startTime,  color: ORANGE },
                                { label: 'Move Done',    value: m.endTime,    color: GREEN  },
                              ].map(({ label, value, color }, i) => (
                                <div key={label} style={{ flex: 1, borderRight: i < 2 ? `1px solid ${BORDER}` : 'none', paddingRight: i < 2 ? 12 : 0, paddingLeft: i > 0 ? 12 : 0 }}>
                                  <div style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{label}</div>
                                  <div style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: value ? color : BORDER }}>{value || '—'}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {(isReserved || isActive) && (
                            <div style={{ padding: '0 20px 20px' }}>
                              {isReserved && (
                                <button onClick={() => markElevStart(m.id)}
                                  style={{ width: '100%', padding: '13px 0', background: ORANGE, border: 'none', borderRadius: 12, fontFamily: INTER, fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: `0 4px 14px rgba(255,149,0,0.30)` }}>
                                  Move Started
                                </button>
                              )}
                              {isActive && (
                                <button onClick={() => markElevComplete(m.id)}
                                  style={{ width: '100%', padding: '13px 0', background: BLUE, border: 'none', borderRadius: 12, fontFamily: INTER, fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: `0 4px 14px rgba(255,56,92,0.28)` }}>
                                  Move Complete · Release Elevator
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {elevatorMoves.length === 0 && !showElevForm && (
                  <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, background: CARD2, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <Zap size={30} color={MUTED} />
                    </div>
                    <p style={{ fontFamily: INTER, fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 5px' }}>No moves logged today</p>
                    <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0 }}>Tap above to log an elevator preparation</p>
                  </div>
                )}

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Evidence Photo Viewer ────────────────────────────────────────── */}
      <AnimatePresence>
        {viewPhoto && (
          <motion.div key="photo-viewer"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setViewPhoto(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ position: 'relative', maxWidth: 680, width: '100%', borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
              <img src={viewPhoto} alt="Task evidence" style={{ width: '100%', display: 'block', maxHeight: '80vh', objectFit: 'contain', background: '#111' }} />
              <button onClick={() => setViewPhoto(null)}
                style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} color="white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>{/* end MAIN CONTENT */}
      </div>{/* end body row */}

      {/* ── Fullscreen viewer (SOPs + Training) ─────────────────────────────── */}
      {fullscreenItem && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.96)', display:'flex', flexDirection:'column' }}
          onClick={() => setFullscreenItem(null)}>
          <div style={{ flexShrink:0, display:'flex', alignItems:'center', gap:14, padding:'14px 20px', background:'rgba(0,0,0,0.7)', backdropFilter:'blur(10px)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.45)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:2 }}>{fullscreenItem.category}</div>
              <div style={{ fontFamily:INTER, fontSize:16, fontWeight:700, color:'white', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{fullscreenItem.title}</div>
            </div>
            <button onClick={() => setFullscreenItem(null)}
              style={{ width:40, height:40, borderRadius:12, background:'rgba(255,255,255,0.12)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
              <X size={20} color="white" />
            </button>
          </div>
          <div style={{ flex:1, minHeight:0, display:'flex', alignItems:'center', justifyContent:'center', padding:'12px', overflowY:'auto' }}
            onClick={e => e.stopPropagation()}>
            {fullscreenItem.fileType === 'image' ? (
              <img src={fullscreenItem.dataURL} alt={fullscreenItem.title}
                style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain', borderRadius:8, display:'block' }} />
            ) : fullscreenItem.fileType === 'video' ? (
              <video src={fullscreenItem.dataURL} controls autoPlay
                style={{ maxWidth:'100%', maxHeight:'100%', borderRadius:8, display:'block', outline:'none' }} />
            ) : (
              <iframe src={fullscreenItem.dataURL} title={fullscreenItem.title}
                style={{ width:'100%', height:'100%', border:'none', borderRadius:8, display:'block', background:'white' }} />
            )}
          </div>
          <div style={{ flexShrink:0, padding:'12px 20px 24px', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
            onClick={e => e.stopPropagation()}>
            <span style={{ fontFamily:INTER, fontSize:12, color:'rgba(255,255,255,0.35)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:280 }}>{fullscreenItem.fileName}</span>
            <span style={{ fontFamily:INTER, fontSize:12, color:'rgba(255,255,255,0.20)' }}>·</span>
            <span style={{ fontFamily:INTER, fontSize:12, color:'rgba(255,255,255,0.35)' }}>Tap outside to close</span>
          </div>
        </div>
      )}


    </div>
  );
};

export default CaregiverDashboard;
