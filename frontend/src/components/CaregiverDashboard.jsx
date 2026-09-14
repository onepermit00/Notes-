import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
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
const INTER      = `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
const SF_DISPLAY = INTER;
const SF_TEXT    = INTER;
const GREEN   = '#34C759';
const BLUE    = '#FF385C';
const RED     = '#FF3B30';
const ORANGE  = '#FF9500';

const ROUTE_TO_TAB = {
  today: 'home', handoff: 'home', knowledge: 'sops', tasks: 'requests',
  incidents: 'incident', visitors: 'guests', vendors: 'vendors', packages: 'packages',
  history: 'shift-history', profile: 'profile', settings: 'settings',
};
const TAB_TO_ROUTE = {
  home: 'today', sops: 'knowledge', requests: 'tasks',
  incident: 'incidents', guests: 'visitors', vendors: 'vendors', packages: 'packages',
  'shift-history': 'history', profile: 'profile', settings: 'settings',
};

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

const inferDarSource = ({ source_section, sourceSection, title = '', category = '', created_by_type, createdByType } = {}) => {
  const persisted = source_section || sourceSection;
  if (persisted) return persisted;
  if ((created_by_type || createdByType) === 'manager') return 'requests';
  const value = title.toLowerCase();
  if (/package|delivery|rts|carrier pickup/.test(value) || category === 'Delivery') return 'packages';
  if (/guest|visitor|resident notified/.test(value)) return 'guests';
  if (/lockout/.test(value)) return 'lockout';
  if (/vendor/.test(value) || category === 'Vendor / Contractor') return 'vendors';
  if (/tour|move-in|move-out/.test(value)) return 'tours';
  if (/loaner|luggage cart|key fob|umbrella/.test(value)) return 'loaners';
  if (/incident/.test(value)) return 'incident';
  if (/rounds|security check|patrol/.test(value)) return 'security';
  return 'new-task';
};

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
  const location = useLocation();
  const navigate = useNavigate();
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
  const NAV_SURFACE = isDarkMode ? '#21171A' : '#FFF8FA';
  const HEADER_SURFACE = isDarkMode ? '#1C1718' : colors.WARM;
  const propertyName = authUser?.property_name || BUILDING_PROFILE.name;
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
  const [sectionWorkflow, setSectionWorkflow] = useState(false);
  const [activeTaskTab, setActiveTaskTab]     = useState('today');
  const [requestQueueTab, setRequestQueueTab] = useState('inbox');
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
  const [ntSaving,      setNtSaving]      = useState(false);
  const [tasksLoading,  setTasksLoading]  = useState(true);
  const [tasksError,    setTasksError]    = useState(false);
  const [srAnnounce,    setSrAnnounce]    = useState('');
  const [darReceipt,    setDarReceipt]    = useState(null);
  const [showSOPs, setShowSOPs]                 = useState(false);
  const [expandedSOP, setExpandedSOP]           = useState(null);
  const [expandedSOPId, setExpandedSOPId]       = useState(null);
  const [sopSearch, setSopSearch]                 = useState('');
  const [sopFilter, setSopFilter]                 = useState('All');
  const [trainingSearch, setTrainingSearch]       = useState('');
  const [trainingFilter, setTrainingFilter]       = useState('All');
  const [completedTraining, setCompletedTraining] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('_notedTrainingComplete') || '[]')); } catch { return new Set(); }
  });
  const [lastTrainingId, setLastTrainingId]       = useState(() => localStorage.getItem('_notedLastTraining') || '');
  const [showAmenities, setShowAmenities] = useState(false);
  const [amenities,     setAmenities]     = useState(AMENITIES_INIT);
  const [showPkgAudit,  setShowPkgAudit]  = useState(false);
  const [pkgAudits,     setPkgAudits]     = useState([]);
  const [auditForm,     setAuditForm]     = useState({ luxerCount: '0', physicalCount: '0', notes: '' });
  const [selfTasks,     setSelfTasks]     = useState([]);
  const [showNewTask,   setShowNewTask]   = useState(false);
  const [ntStep,        setNtStep]        = useState(1);
  const [ntForm,        setNTF]           = useState({ title: '', category: '', notes: '', location: '', priority: 'normal', dueDate: '', flagFollowUp: false });
  const [ntTitleInterim, setNtTitleInterim] = useState('');
  const [ntNotesInterim, setNtNotesInterim] = useState('');
  const [auditNotesInterim, setAuditNotesInterim] = useState('');
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
  const [showHandover,      setShowHandover]      = useState(false);
  const [showPreviousDar,    setShowPreviousDar]    = useState(false);
  const [handoverNotes,     setHandoverNotes]     = useState('');
  const [handoverItems,     setHandoverItems]     = useState('');
  const [handoverSaving,    setHandoverSaving]    = useState(false);
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
  const [gallery,    setGallery]    = useState(null); // { urls:[], idx:0 }
  const incidentPhotos = React.useRef(
    (() => { try { return JSON.parse(localStorage.getItem('_incPhotos') || '{}'); } catch { return {}; } })()
  );
  const [isMobile,      setIsMobile]      = useState(() => { const t = 'ontouchstart' in window || navigator.maxTouchPoints > 0; return window.innerWidth < (t ? 1366 : 768); });
  const [isPhone,       setIsPhone]       = useState(() => { const t = 'ontouchstart' in window || navigator.maxTouchPoints > 0; return t && window.innerWidth < 768; });

  const handleTabChange = useCallback((id) => {
    if (id !== 'home') setShowHandover(false);
    setSectionWorkflow(false);
    setActiveTab(id);
    const route = TAB_TO_ROUTE[id];
    if (route && location.pathname !== `/app/${route}`) navigate(`/app/${route}`);
  }, [location.pathname, navigate]);

  // Escape closes the topmost open drawer/modal (accessibility)
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key !== 'Escape') return;
      if (showSearch) return; // search input manages its own Escape
      if (showSummary) { setShowSummary(false); return; }
      if (showHandover) { setShowHandover(false); return; }
      if (showPreviousDar) { setShowPreviousDar(false); return; }
      if (selectedTask) { setSelectedTask(null); return; }
      if (showNewTask) { setShowNewTask(false); setNtStep(1); setNTF({ title: '', category: '', notes: '', location: '', priority: 'normal', dueDate: '' }); return; }
      if (showContacts) { setShowContacts(false); return; }
      if (showPkgAudit) { setShowPkgAudit(false); return; }
      if (showAmenities) { setShowAmenities(false); return; }
      if (showModels) { setShowModels(false); return; }
      if (activeTab !== 'home') handleTabChange('home');
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [showSearch, showSummary, showHandover, showPreviousDar, selectedTask, showNewTask, showContacts, showPkgAudit, showAmenities, showModels, activeTab, handleTabChange]);


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
            _source: inferDarSource(t),
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
          dateLabel: new Date(s.clock_in).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
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
            sourceSection: inferDarSource(t),
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
        const normalized = newInc.map(i => ({
          id: i.incident_id, incident_id: i.incident_id,
          title: i.description || i.title || '', type: i.type || '',
          location: i.location || '', severity: i.severity || 'medium',
          filedBy: i.created_by || '',
          filedAt: i.created_at ? new Date(i.created_at).toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' }) : '',
          note: i.notes || '', status: i.status || 'new',
          unit_number: i.unit_number || '', person_involved: i.person_involved || '',
          photos: (incidentPhotos.current[i.incident_id] || []).map(url => ({ url })),
        }));
        setIncidents(prev => {
          const ids = new Set(prev.map(x => x.incident_id));
          const fresh = normalized.filter(i => !ids.has(i.incident_id));
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
    setNtSaving(true);
    setNtError('');
    try {
      const saved = await authApi.createTask({
        title:      ntForm.title,
        notes:      ntForm.notes || '',
        category:   ntForm.category || 'Other',
        priority:   ntForm.priority === 'high' ? 'High' : ntForm.priority === 'low' ? 'Low' : 'Standard',
        assignedTo: authUser?.name || '',
        toId:       authUser?.user_id || '',
        dueTime:    ntForm.dueDate || 'ASAP',
        sourceSection: 'new-task',
      });
      setTasks(p => [saved, ...p]);
      const t = nowStr();
      const localTask = { ...ntForm, id: saved.id || saved.task_id || Date.now(), startedAt: t, completedAt: t, status: 'completed', _source: 'new-task' };
      setSelfTasks(p => p.some(item => item.id === localTask.id) ? p : [localTask, ...p]);
      if (ntForm.flagFollowUp) followUps.add({ text: ntForm.title + (ntForm.notes ? ` — ${ntForm.notes}` : ''), source: ntForm.category || 'task' });
      const receiptTitle = ntForm.title;
      setNTF({ title: '', category: '', notes: '', location: '', priority: 'normal', dueDate: '', flagFollowUp: false });
      setNtStep(1);
      setShowNewTask(false);
      handleTabChange('home');
      setDarReceipt({ title: receiptTitle, detail: 'New task documented' });
      setTimeout(() => setDarReceipt(null), 4200);
    } catch {
      setNtError('Could not add this entry to the DAR. Your information is still here—check the connection and try again.');
    } finally {
      setNtSaving(false);
    }
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

  useEffect(() => {
    const route = location.pathname.split('/').filter(Boolean)[1] || 'today';
    setSectionWorkflow(false);
    setActiveTab(ROUTE_TO_TAB[route] || 'home');
  }, [location.pathname]);
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
    handleTabChange('home');
    setDarReceipt({ title: updated.title, detail: 'Task completion documented' });
    setTimeout(() => setDarReceipt(null), 4200);
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
  const [showChecklist,     setShowChecklist]     = useState(false);
  const [checklistAcks,     setChecklistAcks]     = useState({});  // id → 'done' | 'escalate'

  const { isOnline, queueLen, isSyncing } = useOfflineQueue();

  const handleClockOut = () => {
    // Open the editorial handoff drawer instead of ending the shift silently
    setShowHandover(true);
  };

  const submitHandover = async (skipNotes = false) => {
    setHandoverSaving(true);
    try {
      const items = skipNotes ? [] : handoverItems.split('\n').map(s => s.trim()).filter(Boolean);
      const res = await authApi.handoverShift(skipNotes ? '' : handoverNotes.trim(), items);
      setIsShiftActive(false);
      setCurrentShiftId(null);
      setClockOutTime(new Date(res.clock_out).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
      setShowHandover(false);
      setHandoverNotes('');
      setHandoverItems('');
      setClockAlertTitle('Shift Ended');
      setClockAlertMsg(skipNotes
        ? 'Your shift has been clocked out. All documentation has been saved.'
        : 'Your shift has been clocked out and your handoff briefing was sent to the next shift.');
      setShowClockAlert(true);
    } catch { /* silently ignore */ }
    finally { setHandoverSaving(false); }
  };
  const openAiSummary = () => {
    const lines = selfTasks.map((t, i) => `${i+1}. [${t.category||'General'}] ${t.title}${t.notes ? ` — ${t.notes}` : ''}${t.location ? ` (${t.location})` : ''}`).join('\n');
    const date = new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    const name = authUser?.name || 'Concierge';
    const text = `SHIFT SUMMARY\n${date} · ${name}\nTime on Duty: ${shiftStartTime ? `${shiftStartTime} – Present` : 'Active shift'}\n\nACTIVITIES LOGGED (${selfTasks.length}):\n${lines || '• No activities logged yet'}\n\nKEY STATS:\n• Packages handled: ${selfTasks.filter(t=>(t.category||'').includes('Delivery')).length}\n• Security events: ${selfTasks.filter(t=>(t.category||'').includes('Safety')).length}\n• Resident assists: ${selfTasks.filter(t=>(t.category||'').includes('Resident')).length}\n\nAll events documented in the activity log. Ready for handoff.`;
    setSummaryText(text);
    setShowSummary(true);
  };

  const handleActivityLogged = useCallback(({ title, category = '', notes = '', evidenceUrls = [], sourceSection = '' }) => {
    const t = nowStr();
    const resolvedSource = sourceSection || inferDarSource({ title, category });
    const local = { id: Date.now(), title, category, notes, evidenceUrls, location: '', priority: 'normal', completedAt: t, startedAt: t, status: 'completed', _source: resolvedSource };
    setSelfTasks(p => [...p, local]);
    // Save activity to backend so manager sees it
    authApi.createTask({
      title, notes, category: category || 'Other',
      priority: 'Standard',
      assignedTo: authUser?.name || '',
      toId: authUser?.user_id || '',
      dueTime: t,
      sourceSection: resolvedSource,
    }).then(saved => setTasks(p => [saved, ...p])).catch(() => {});
  }, [authUser]);

  const handleSectionActivityLogged = (entry) => {
    handleActivityLogged(entry);
    handleTabChange('home');
    setDarReceipt({ title: entry.title, detail: `${entry.category || 'Activity'} added to the DAR` });
    setSrAnnounce(`${entry.title} added to the Daily Activity Report.`);
    setTimeout(() => { setDarReceipt(null); setSrAnnounce(''); }, 4200);
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
      const taskId = task.id || task.task_id;
      await authApi.updateTask(taskId, { status: 'in_progress' });
      setTasks(p => p.map(t => (t.id || t.task_id) === taskId ? { ...t, status: 'in_progress' } : t));
      handleActivityLogged({ title: `Request accepted · ${task.title}`, category: 'Administrative', notes: `Work started${task.dueTime ? ` · Due ${task.dueTime}` : ''}`, sourceSection: 'requests' });
      handleTabChange('home');
      setDarReceipt({ title: task.title, detail: 'Request accepted · now in progress' });
      setTimeout(() => setDarReceipt(null), 4200);
    } catch {}
  }, [handleActivityLogged, handleTabChange]);

  const handleDeclineRequest = useCallback(async (taskId, reason = '') => {
    try {
      await authApi.updateTask(taskId, { status: 'completed' });
      setTasks(p => p.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
      handleActivityLogged({ title: 'Request declined', category: 'Administrative', notes: `Request ${taskId} was reviewed and closed.${reason ? ` Reason: ${reason}.` : ''}`, sourceSection: 'requests' });
      handleTabChange('home');
      setDarReceipt({ title: 'Request updated', detail: 'Decision recorded in the operational record' });
      setTimeout(() => setDarReceipt(null), 4200);
    } catch {}
  }, [handleActivityLogged, handleTabChange]);

  const displayTasks    = tasks.filter(t => t.status !== TaskStatus.PROPOSED);
  const pendingTasks    = displayTasks.filter(t => t.status !== TaskStatus.COMPLETED);
  const filteredTasks   = searchQuery
    ? pendingTasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : pendingTasks;
  const managerRequests = tasks.filter(t => (t.createdByType || t.created_by_type) === 'manager');
  const pendingRequests = managerRequests.filter(t => t.status !== 'completed' && t.status !== TaskStatus.COMPLETED && t.status !== 'in_progress');
  const handledRequests = managerRequests.filter(t => !pendingRequests.some(p => (p.id || p.task_id) === (t.id || t.task_id)));
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
      isShiftActive ? null :
      <motion.button
        onClick={doStart}
        disabled={shiftStarting}
        whileTap={shiftStarting ? {} : { scale: 0.93 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          position: 'fixed',
          bottom: isPhone ? 20 : 28,
          right: isPhone ? 20 : 28,
          zIndex: 20,
          padding: '14px 28px',
          background: shiftStarting ? MUTED : BLUE,
          border: 'none', borderRadius: 999,
          fontFamily: INTER, fontSize: 15, fontWeight: 700, color: 'white',
          cursor: shiftStarting ? 'not-allowed' : 'pointer',
          boxShadow: shiftStarting ? 'none' : `0 6px 28px ${BLUE}55`,
          whiteSpace: 'nowrap', letterSpacing: '-0.01em',
        }}>
        {shiftStarting ? 'Starting…' : 'Start My Shift'}
      </motion.button>
    );

    if (prevShift === undefined) {
      const sk = isDarkMode ? 'skeleton-dark' : 'skeleton-light';
      return (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 80 }}>
          <div style={{ padding: isMobile ? '64px 16px 0' : '20px 16px 0' }}>
            <div style={{ borderRadius: 20, overflow: 'hidden', border: `1.5px solid ${BORDER}` }}>
              {/* Dark header shimmer */}
              <div style={{ background: '#0b0b0b', padding: '28px 28px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
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
    const claimedActIds = new Set([...guests, ...tours, ...loaners, ...pickups, ...incoming, ...lockouts, ...rounds, ...vends, ...(audit ? [audit] : [])].map(a => a.id).filter(Boolean));
    const tasksDone = acts.filter(a => a.id && !claimedActIds.has(a.id));

    // Same Sect/Field/toStr as Manager Dashboard — unified DAR format
    const Sect = ({ title, accent = '#6597FF' }) => (
      <div style={{ background: 'transparent', borderTop: `2px solid ${accent}`, padding: isPhone ? '8px 14px 2px' : isMobile ? '8px 18px 2px' : '10px 32px 2px', marginTop: 10 }}>
        <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 800, color: accent, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{title}</span>
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

    const activeTasks = tasks.filter(t => t.createdByType === 'manager' && t.status !== 'completed');
    const sevColor = (sev) => sev === 'critical' || sev === 'high' ? RED : sev === 'medium' ? ORANGE : BLUE;

    return (
      <div style={{ flex:1, minHeight:0, overflowY:'auto', padding: isMobile ? '64px 16px 80px' : '28px 28px 80px' }}>
        <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection:'column', gridTemplateColumns:'1fr', gap:24, alignItems: isMobile ? 'stretch' : 'start' }}>
          <div style={{ background:CARD, border:`1.5px solid ${BORDER}`, borderRadius:20, overflow:'hidden', display:'flex', flexDirection:'column', order: isMobile ? 1 : 0 }}>
            {/* Header */}
            <div style={{ background: '#0b0b0b', padding: isPhone ? '16px 18px' : isMobile ? '18px 20px 16px' : '20px 32px 18px' }}>
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

              <Sect title="Tasks Completed" />
              <Field label="Logged Tasks" value={toStr(tasksDone)} last />

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

          {/* Right column */}
          <div hidden>

            {/* Assigned by Management */}
            <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <ClipboardList size={20} color={ORANGE} />
                  <h3 style={{ fontFamily:INTER, fontSize:17, fontWeight:700, color:TEXT, margin:0 }}>Assigned by Management</h3>
                </div>
                <span aria-live="polite" style={{ width:32, height:32, borderRadius:'50%', background:activeTasks.length>0?`${ORANGE}14`:CARD2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:activeTasks.length>0?ORANGE:MUTED, flexShrink:0 }}>{activeTasks.length}</span>
              </div>
              {tasksLoading ? (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {[0,1,2].map(i => {
                    const sk = isDarkMode ? 'skeleton-dark' : 'skeleton-light';
                    const widths = [[70,42],[58,35],[44,28]];
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
                  <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:0, lineHeight:1.5 }}>No tasks assigned yet</p>
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
                      <button onClick={() => handleTabChange('incident')} style={{ flexShrink:0, padding:'8px 14px', background:`${BLUE}14`, border:`1px solid ${BLUE}25`, borderRadius:10, fontFamily:INTER, fontSize:12, fontWeight:700, color:BLUE, cursor:'pointer' }}>View</button>
                    </div>
                  ))}
                </div>
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
    const viewingPreviousDar = showPreviousDar;
    const viewingHandoff = showHandover;
    const currentDar = isShiftActive ? {
      concierge: { name: authUser?.name || 'Concierge' },
      clockIn:   shiftStartTime,
      clockOut:  null,
      note:      '',
      incidents: incidents.filter(i => i.status === 'new').map(i => {
        const tod = i.filedAt ? ((i.filedAt.match(/\d{1,2}:\d{2}\s*(?:AM|PM)/i) || [])[0] || '').replace(/\s*(AM|PM)$/i, (_, m) => m.toLowerCase()) : '';
        const pre = tod ? `${tod} — ` : '';
        const urls =
          (incidentPhotos.current[i.incident_id] || []).length
            ? incidentPhotos.current[i.incident_id]
            : Array.isArray(i.photos) && i.photos.length
              ? i.photos.map(p => p.url)
              : Array.isArray(i.evidenceUrls) ? i.evidenceUrls : (i.evidenceUrl ? [i.evidenceUrl] : []);
        return {
          text: `${pre}${i.type || ''}: ${i.title || ''}`,
          evidenceUrls: urls,
        };
      }),
      activities: selfTasks,
    } : null;
    const activeShift = viewingPreviousDar && previousShiftData
      ? { ...previousShiftData, incidents: previousShiftData.incidents || [], activities: previousShiftData.activities || [] }
      : currentDar;
    const activeTasks = tasks.filter(t => t.createdByType === 'manager' && t.status !== 'completed');
    const sevColor    = (sev) => sev === 'critical' || sev === 'high' ? RED : sev === 'medium' ? ORANGE : BLUE;

    const taskCatMap = { packages:'Delivery', mail:'Delivery', patrol:'Safety / Security', amenity:'Amenity', opening:'Administrative', coverage:'Administrative', documentation:'Administrative' };
    const todayLabel = new Date().toLocaleDateString('en-US', { month:'short', day:'numeric' });
    const isToday = ts => ts && ts.startsWith(todayLabel + ',');
    const completedTaskActs = isShiftActive ? displayTasks.filter(t=>t.status===TaskStatus.COMPLETED&&isToday(t.completedAt)).map(t=>({ id:'task-'+t.id, time:t.completedAt, title:t.title, notes:t.completionNote||'', category:taskCatMap[t.category]||'Administrative', evidenceUrls:t.evidenceUrls?.length?t.evidenceUrls:t.evidenceUrl?[t.evidenceUrl]:[] })) : [];
    const selfTaskActs = viewingPreviousDar
      ? (activeShift?.activities || []).map(t=>({ id:`previous-${t.id}`, time:t.time||t.completedAt||'', title:t.title, notes:t.notes||'', category:t.category||'Administrative', evidenceUrls:Array.isArray(t.evidenceUrls)?t.evidenceUrls:t.evidenceUrl?[t.evidenceUrl]:[], _source:t.sourceSection || inferDarSource(t) }))
      : selfTasks.filter(t=>isToday(t.completedAt)).map(t=>({ id:'self-'+t.id, time:t.completedAt||'', title:t.title, notes:t.notes||'', category:t.category||'Administrative', evidenceUrls:Array.isArray(t.evidenceUrls)?t.evidenceUrls:t.evidenceUrl?[t.evidenceUrl]:[], _source:t._source || inferDarSource(t) }));
    // dashboardActs = sub-dashboard inputs (Guests, Vendors, Loaners, Lockout, etc.)
    // wizardActs = Log New Task wizard entries — always go to Tasks Completed
    const dashboardActs = selfTaskActs.filter(a => !['new-task', 'requests'].includes(a._source));
    const wizardActs    = selfTaskActs.filter(a => a._source === 'new-task');
    const requestActs   = selfTaskActs.filter(a => a._source === 'requests');
    const delivery = dashboardActs.filter(a=>a._source==='packages');
    const security = dashboardActs.filter(a=>a._source==='lockout'||a._source==='security');
    const resident = dashboardActs.filter(a=>a._source==='guests'||a._source==='tours');
    const vends    = dashboardActs.filter(a=>a._source==='vendors');
    const amenity  = dashboardActs.filter(a=>a._source==='loaners');
    const audit    = dashboardActs.find(a=>a.category==='Administrative'&&a.title.toLowerCase().includes('audit'));
    const loaners  = amenity.filter(a=>a.title.toLowerCase().includes('loaner'));
    const guests   = resident.filter(a=>a.title.toLowerCase().includes('guest')||a.title.toLowerCase().includes('arrival'));
    const tours    = resident.filter(a=>a.title.toLowerCase().includes('tour')||a.title.toLowerCase().includes('move'));
    const pickups  = delivery.filter(a=>a.title.toLowerCase().includes('pickup'));
    const incoming = delivery.filter(a=>!a.title.toLowerCase().includes('pickup'));
    const lockouts = security.filter(a=>a.title.toLowerCase().includes('lockout'));
    const rounds   = security.filter(a=>!a.title.toLowerCase().includes('lockout'));
    // Tasks Completed: all wizard tasks + all manager-assigned completed tasks
    const claimedIds = new Set([...incoming, ...pickups, ...guests, ...loaners, ...lockouts, ...vends, ...tours, ...rounds, ...(audit ? [audit] : [])].map(item => item.id));
    const taskEntries = (viewingPreviousDar
      ? selfTaskActs.filter(item => !claimedIds.has(item.id))
      : [...wizardActs, ...requestActs, ...completedTaskActs]
    ).sort((a,b) => (a.time || '').localeCompare(b.time || ''));

    const Sect = ({ title, accent='#6597FF' }) => (
      <div className="dar-print-sect-bar" style={{ background:'transparent', borderTop:`2px solid ${accent}`, padding: isPhone ? '7px 12px 2px' : isMobile ? '7px 16px 2px' : '8px 32px 2px', marginTop:10 }}>
        <span className="dar-print-sect" style={{ fontFamily:INTER, fontSize:11, fontWeight:800, color:accent, letterSpacing:'0.18em', textTransform:'uppercase' }}>{title}</span>
      </div>
    );
    const SectionRow = ({ label, activities, strings, last }) => {
      const hasActs = activities && activities.length > 0;
      const hasStrs = strings && strings.length > 0;
      const entryDivider = isDarkMode ? 'rgba(101,151,255,.30)' : 'rgba(101,151,255,.22)';
      const thumb = (urls, node) => urls.length > 0 ? (
        <button onClick={() => setGallery({ urls, idx:0 })}
          style={{ flexShrink:0, width:20, height:20, borderRadius:3, overflow:'hidden', border:`1px solid ${BORDER}`, padding:0, cursor:'pointer', background:CARD2, marginLeft:5, alignSelf:'center' }}>
          <img src={urls[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        </button>
      ) : null;
      return (
        <div style={{ borderBottom: last ? 'none' : `1px solid ${BORDER}`, padding: isPhone ? '4px 4px' : '5px 6px', display:'flex', flexDirection:'column', gap:4 }}>
          {hasActs ? activities.map((a,i) => {
            const urls = Array.isArray(a.evidenceUrls) ? a.evidenceUrls : [];
            const narrative = toNarrative(a);
            const divider = narrative.indexOf(' — ');
            const timeText = divider > -1 ? narrative.slice(0, divider) : '';
            const noteText = divider > -1 ? narrative.slice(divider + 3) : narrative;
            return (
              <div key={a.id||i} style={{ display:'grid', gridTemplateColumns:timeText?(isPhone?'58px minmax(0,1fr) auto':'68px minmax(0,1fr) auto'):'minmax(0,1fr) auto', alignItems:'start', gap:10, padding:'7px 0', borderTop:i?`1px solid ${entryDivider}`:0 }}>
                {timeText && <time style={{ paddingTop:2, fontFamily:INTER, fontSize:10, fontWeight:750, color:MUTED, letterSpacing:'.02em', whiteSpace:'nowrap', textTransform:'uppercase' }}>{timeText}</time>}
                <span className="dar-print-entry" style={{ minWidth:0, fontFamily:INTER, fontSize:isPhone?13:14, color:TEXT, lineHeight:1.65 }}>{noteText}</span>
                {thumb(urls)}
              </div>
            );
          }) : hasStrs ? strings.map((item,i) => {
            const text = typeof item === 'string' ? item : item.text;
            const urls = typeof item === 'string' ? [] : (item.evidenceUrls || []);
            const divider = text.indexOf(' — ');
            const timeText = divider > -1 ? text.slice(0, divider) : '';
            const rawNote = (divider > -1 ? text.slice(divider + 3) : text).replace(/\s+/g, ' ').trim();
            const incidentParts = rawNote.match(/^([^:]{2,40}):\s*(.+)$/);
            const narrativeNote = incidentParts ? `${incidentParts[1]} incident reported. ${incidentParts[2]}` : rawNote;
            const noteText = narrativeNote ? `${narrativeNote.charAt(0).toUpperCase()}${narrativeNote.slice(1)}${/[.!?]$/.test(narrativeNote) ? '' : '.'}` : '';
            return (
              <div key={i} style={{ display:'grid', gridTemplateColumns:timeText?(isPhone?'58px minmax(0,1fr) auto':'68px minmax(0,1fr) auto'):'minmax(0,1fr) auto', alignItems:'start', gap:10, padding:'7px 0', borderTop:i?`1px solid ${entryDivider}`:0 }}>
                {timeText && <time style={{ paddingTop:2, fontFamily:INTER, fontSize:10, fontWeight:750, color:MUTED, letterSpacing:'.02em', whiteSpace:'nowrap', textTransform:'uppercase' }}>{timeText}</time>}
                <span className="dar-print-entry" style={{ minWidth:0, fontFamily:INTER, fontSize:isPhone?13:14, color:TEXT, lineHeight:1.65 }}>{noteText}</span>
                {thumb(urls)}
              </div>
            );
          }) : (
            <span style={{ fontFamily:INTER, fontSize:isPhone?13:14, color:MUTED }}>No activity recorded</span>
          )}
        </div>
      );
    };
    const DarBlock = ({ index, title, activities, strings, children, emptyLabel = 'No activity recorded', populated, critical = false, wide = false, rightColumn = false }) => {
      const count = activities?.length || strings?.length || 0;
      const hasContent = populated ?? (count > 0 || !!children);
      const accent = critical ? RED : BLUE;
      const divider = BORDER;
      return (
        <section className="dar-category-block" style={{ gridColumn: wide && !isMobile ? '1 / -1' : 'auto', background: CARD, minWidth: 0, padding: isPhone ? '16px 14px' : '18px 20px', borderTop: `1px solid ${divider}`, borderLeft: !isMobile && rightColumn ? `1px solid ${divider}` : 0 }}>
          <div style={{ minHeight: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 26, height:26, borderRadius:8, background:hasContent?`${accent}12`:CARD2, display:'inline-flex', alignItems:'center', justifyContent:'center', fontFamily: INTER, fontSize: 8, fontWeight: 800, color: hasContent ? accent : MUTED, letterSpacing: '.08em', flexShrink: 0 }}>{String(index).padStart(2, '0')}</span>
            <h3 style={{ flex: 1, fontFamily: INTER, fontSize: 13, fontWeight: 750, color: TEXT, letterSpacing: '-.01em', margin: 0 }}>{title}</h3>
            {count > 0 && <span style={{ minWidth:24, height:24, padding:'0 7px', borderRadius:999, background:CARD2, display:'inline-flex', alignItems:'center', justifyContent:'center', fontFamily:INTER, fontSize:9, fontWeight:800, color:MUTED }}>{count}</span>}
          </div>
          <div style={{ padding: '8px 0 0 38px', minHeight: 30 }}>
            {children || (count > 0
              ? <SectionRow label={title} activities={activities} strings={strings} last />
              : <span style={{ fontFamily:INTER, fontSize:12, color:MUTED }}>{emptyLabel}</span>)}
          </div>
        </section>
      );
    };

    return (
    <div style={{ flex:1, minHeight:0, overflowY:'auto', padding: isMobile ? '64px 14px 32px' : '24px 28px 40px', overscrollBehavior:'contain' }}>

      <AnimatePresence>
        {darReceipt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            role="status" aria-live="polite" data-testid="dar-return-receipt"
            style={{ maxWidth: 1280, margin: '0 auto 16px', padding: isPhone ? '12px 14px' : '14px 18px', borderRadius: 14, border: `1px solid ${BLUE}35`, background: isDarkMode ? 'rgba(255,56,92,.10)' : 'rgba(255,56,92,.055)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check size={17} color="white" strokeWidth={3} /></div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: BLUE, letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 3 }}>Added to DAR</div>
              <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 750, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{darReceipt.title}</div>
              <div style={{ fontFamily: INTER, fontSize: 11, color: MUTED, marginTop: 2 }}>{darReceipt.detail}</div>
            </div>
            <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, flexShrink: 0 }}>Live record</span>
          </motion.div>
        )}
      </AnimatePresence>

      {isShiftActive && <section aria-label="DAR shift continuity" style={{ maxWidth: 1280, margin: '0 auto 18px', border:`1px solid ${BORDER}`, borderRadius: 20, background: '#fff', overflow: 'hidden', boxShadow: SHADOW }}>
        <div style={{ padding: isPhone ? '20px 20px 15px' : '26px 30px 19px', display: 'flex', alignItems:'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{minWidth:0}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}><span style={{ width: 24, height: 2, background: BLUE }} /><span style={{ fontFamily: INTER, fontSize: 9, fontWeight: 800, color: BLUE, letterSpacing: '.22em', textTransform: 'uppercase' }}>{propertyName}</span></div>
            <h1 style={{ fontFamily: INTER, fontSize: isPhone ? 28 : 34, fontWeight: 800, color: '#222', letterSpacing: '-.045em', lineHeight: .98, margin: 0 }}>{viewingHandoff?'Prepare the handoff':viewingPreviousDar?'Previous shift':'Today’s shift'}</h1>
            <p style={{fontFamily:INTER,fontSize:12,color:'#717171',margin:'9px 0 0',lineHeight:1.5}}>{viewingHandoff?'Leave clear context for the next concierge.':viewingPreviousDar?'Review the completed record from the prior shift.':`Live Daily Activity Report · ${authUser?.name || 'Concierge'}`}</p>
          </div>
          <div style={{display:'flex',gap:8,flexShrink:0}}>
            {!viewingHandoff && <button onClick={() => window.print()} aria-label="Export DAR" className="touch-target" style={{ width:44, height:44, padding:0, borderRadius:999, border:`1px solid ${BORDER}`, background:CARD2, color:'#222', display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><Printer size={17}/></button>}
            {(viewingHandoff || viewingPreviousDar) && <button type="button" onClick={() => {setShowHandover(false);setShowPreviousDar(false);}} aria-label="Close workflow" className="touch-target" style={{width:44,height:44,borderRadius:999,border:`1px solid ${BORDER}`,background:CARD2,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><X size={19} color="#222"/></button>}
          </div>
        </div>
        <nav aria-label="Daily activity report views" style={{padding:isPhone?'0 14px 16px':'0 24px 20px'}}><div style={{display:'flex',padding:4,background:'#f7f7f7',border:`1px solid ${BORDER}`,borderRadius:14}}>
          {[
            { n: '01', label: 'Previous DAR', detail: previousShiftData ? 'Completed shift record' : 'No previous shift', done: !!previousShiftData, current: viewingPreviousDar, disabled: !previousShiftData, action: () => { if (previousShiftData) { setShowHandover(false); setShowPreviousDar(true); } }, aria: 'Show the previous shift DAR' },
            { n: '02', label: 'Current DAR', detail: `Recording since ${shiftStartTime || 'clock-in'}`, current: !viewingPreviousDar && !viewingHandoff, action: () => { setShowHandover(false); setShowPreviousDar(false); }, aria: 'Show the current shift DAR' },
            { n: '03', label: 'Next handoff', detail: 'Prepared at shift end', current: viewingHandoff, action: () => { setShowPreviousDar(false); setShowHandover(true); }, aria: 'Prepare the next shift handoff' },
          ].map((step) => <button type="button" key={step.n} onClick={step.action} disabled={step.disabled} aria-label={step.aria} aria-current={step.current ? 'page' : undefined} className="touch-target" style={{flex:1,minHeight:46,padding:isPhone?'8px 6px':'8px 12px',borderRadius:11,border:step.current?`1px solid ${BORDER}`:'1px solid transparent',background:step.current?'rgba(255,56,92,.055)':'transparent',boxShadow:step.current?'0 2px 8px rgba(0,0,0,.07)':'none',minWidth:0,textAlign:'center',cursor:step.disabled?'not-allowed':'pointer',opacity:step.disabled ? .46 : 1,font:'inherit',transition:'all 160ms'}}>
            <div style={{fontFamily:INTER,fontSize:isPhone?10:11,fontWeight:750,color:'#222',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{step.label}<span style={{fontSize:8,color:step.current?BLUE:'#8a8a8a',marginLeft:6}}>{step.done?'✓':step.n}</span></div>
            {!isPhone&&<div style={{fontFamily:INTER,fontSize:9,color:'#717171',marginTop:3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{step.detail}</div>}
          </button>)}
        </div></nav>
      </section>}

      {/* DAR overview */}
      <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection:'column', gridTemplateColumns:'1fr', gap:24, alignItems: isMobile ? 'stretch' : 'start' }}>

        {/* Left: Daily Activity Report */}
        <div className="dar-print-target" style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, overflow:'hidden', display:'flex', flexDirection:'column', order: isMobile ? 1 : 0, boxShadow:SHADOW }}>
          {!activeShift ? (
            <div style={{ padding:40, textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
              <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:0 }}>No active shift today</p>
              <button onClick={handleClockIn} style={{ padding:'11px 28px', background:GREEN, border:'none', borderRadius:12, fontFamily:INTER, fontSize:14, fontWeight:700, color:'white', cursor:'pointer', boxShadow:`0 4px 16px ${GREEN}40` }}>
                Start Shift
              </button>
            </div>
          ) : (
            <>
              <style>{`
                @keyframes dar-onduty-pulse {
                  0%,100% { box-shadow: 0 0 0 3px rgba(52,199,89,0.25); }
                  50%      { box-shadow: 0 0 0 7px rgba(52,199,89,0.06); }
                }
                .dar-onduty-dot { animation: dar-onduty-pulse 2.6s ease-in-out infinite; }
                .dar-print-only { display: none; }
                @media print {
                  body > *:not(.dar-print-target) { display: none !important; }
                  .dar-print-target {
                    position: static !important; box-shadow: none !important;
                    border: none !important; border-radius: 0 !important;
                    max-width: none !important; width: 100% !important;
                    margin: 0 !important; padding: 0 !important;
                    background: white !important; overflow: visible !important;
                  }
                  .dar-screen-only { display: none !important; }
                  .dar-print-only  { display: block !important; }
                  .dar-print-name {
                    font-family: 'Playfair Display', Georgia, 'Times New Roman', serif !important;
                    font-size: 36pt !important; font-style: italic !important;
                    font-weight: 400 !important; color: #0d1117 !important;
                  }
                  .dar-print-label {
                    font-family: 'Inter', sans-serif !important;
                    font-size: 8pt !important; font-weight: 600 !important;
                    letter-spacing: 0.14em !important; text-transform: uppercase !important;
                    color: rgba(0,0,0,0.4) !important;
                  }
                  .dar-print-date {
                    font-family: 'Playfair Display', Georgia, serif !important;
                    font-size: 11pt !important; font-style: italic !important; color: #0d1117 !important;
                  }
                  .dar-print-sect {
                    font-family: 'Inter', sans-serif !important;
                    font-size: 9pt !important; font-weight: 700 !important;
                    letter-spacing: 0.12em !important; color: #0d1117 !important;
                  }
                  .dar-print-sub-sect {
                    font-family: 'Inter', sans-serif !important;
                    font-size: 7.5pt !important; font-weight: 500 !important;
                    letter-spacing: 0.10em !important; color: #7a9ec0 !important;
                  }
                  .dar-print-entry {
                    font-family: 'Inter', sans-serif !important;
                    font-size: 11pt !important; font-weight: 400 !important;
                    line-height: 1.7 !important; color: #1a1a1a !important;
                  }
                  .dar-print-sect-bar {
                    background: transparent !important;
                    border-top: 1.5pt solid #0d1117 !important;
                    padding: 4pt 0 3pt !important;
                    margin-top: 10pt !important;
                    display: flex !important;
                    align-items: baseline !important;
                  }
                  .dar-print-footer-cols {
                    display: grid !important;
                    grid-template-columns: 1fr 1fr 1fr !important;
                    gap: 20pt !important;
                    padding-top: 14pt !important;
                    border-top: 1.5pt solid #0d1117 !important;
                    margin-top: 18pt !important;
                    page-break-inside: avoid !important;
                  }
                  .dar-screen-grid { display: block !important; background: white !important; padding: 0 32px !important; margin: 0 !important; border: 0 !important; border-radius: 0 !important; }
                  .dar-screen-grid > header { display: none !important; }
                  .dar-category-block { border: 0 !important; border-radius: 0 !important; border-top: 1.5pt solid #0d1117 !important; margin-top: 10pt !important; padding: 0 !important; break-inside: avoid; background: white !important; }
                  .dar-category-block > div:first-child { background: white !important; border-bottom: 0 !important; padding: 4pt 0 3pt !important; min-height: 0 !important; }
                  .dar-category-block > div:last-child { padding: 2pt 0 5pt !important; min-height: 0 !important; }
                  @page { margin: 0.75in; }
                }
              `}</style>

              {viewingHandoff && (
                <section className="dar-screen-only" aria-label="Next shift handoff" style={{ minHeight: isMobile ? 'auto' : 560, padding: isMobile ? '18px 16px 24px' : '28px 32px 32px', background: BG, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', maxWidth: 820, margin: '0 auto' }}>
                    <div style={{ padding: isMobile ? '18px 16px' : '22px', border: `1px solid ${BORDER}`, borderRadius: 16, background: CARD, boxShadow:SHADOW }}>
                      <div style={{ marginBottom: 22 }}>
                        <div style={{fontFamily:INTER,fontSize:9,fontWeight:800,color:BLUE,letterSpacing:'.16em',textTransform:'uppercase',marginBottom:6}}>01 · Shift context</div>
                        <label htmlFor="inline-handoff-notes" style={{ display: 'block', marginBottom: 6, color: TEXT, fontFamily: INTER, fontSize: 17, fontWeight: 800, letterSpacing:'-.02em' }}>Handoff notes</label>
                        <p style={{ margin: '0 0 10px', color: MUTED, fontFamily: INTER, fontSize: 12, lineHeight: 1.5 }}>Building status, expected arrivals, resident follow-ups, or anything requiring attention.</p>
                        <textarea id="inline-handoff-notes" data-testid="handover-notes-input" value={handoverNotes} onChange={e => setHandoverNotes(e.target.value)} rows={5} placeholder="Example: HVAC vendor is expected at 8 PM. Unit 402 is waiting for an oversized delivery." style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${handoverNotes?BLUE:BORDER}`, background: handoverNotes?'rgba(255,56,92,.025)':CARD2, color: TEXT, fontFamily: INTER, fontSize: 16, lineHeight: 1.6, resize: 'vertical', outline: 'none', transition:'border-color 150ms' }} onFocus={e => { e.currentTarget.style.borderColor = BLUE; }} onBlur={e => { e.currentTarget.style.borderColor = handoverNotes?BLUE:BORDER; }} />
                      </div>
                      <div>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:12,marginBottom:8}}><label htmlFor="inline-handoff-items" style={{ color: TEXT, fontFamily: INTER, fontSize: 14, fontWeight: 800 }}>Open items</label><span style={{color:MUTED,fontFamily:INTER,fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.12em'}}>Optional · one per line</span></div>
                        <textarea id="inline-handoff-items" data-testid="handover-items-input" value={handoverItems} onChange={e => setHandoverItems(e.target.value)} rows={3} placeholder={'Follow up on Unit 233 noise complaint\nRelease package #4412 to Unit 108'} style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${handoverItems?BLUE:BORDER}`, background: handoverItems?'rgba(255,56,92,.025)':CARD2, color: TEXT, fontFamily: INTER, fontSize: 16, lineHeight: 1.6, resize: 'vertical', outline: 'none', transition:'border-color 150ms' }} onFocus={e => { e.currentTarget.style.borderColor = BLUE; }} onBlur={e => { e.currentTarget.style.borderColor = handoverItems?BLUE:BORDER; }} />
                      </div>
                    </div>

                    <div style={{ position:'sticky', bottom:-1, margin:'20px -1px -1px', padding:isPhone?'12px 0 0':'14px 0 0', background:BG, display: 'flex', flexDirection: isPhone ? 'column-reverse' : 'row', alignItems: isPhone ? 'stretch' : 'center', justifyContent: 'space-between', gap: 10 }}>
                      <button type="button" onClick={() => submitHandover(true)} disabled={handoverSaving} data-testid="handover-skip-btn" className="touch-target" style={{ minHeight: 48, padding: '0 16px', border: `1px solid ${BORDER}`, borderRadius:999, background: CARD, color: TEXT, fontFamily: INTER, fontSize: 12, fontWeight: 700, cursor: handoverSaving ? 'not-allowed' : 'pointer' }}>End without notes</button>
                      <div style={{ display: 'flex', flexDirection: isPhone ? 'column-reverse' : 'row', gap: 10 }}>
                        <button type="button" onClick={() => submitHandover(false)} disabled={handoverSaving} data-testid="handover-submit-btn" className="touch-target" style={{ minHeight: 48, padding: '0 22px', borderRadius: 999, border: 0, background: handoverSaving ? MUTED : BLUE, color: 'white', fontFamily: INTER, fontSize: 14, fontWeight: 750, cursor: handoverSaving ? 'wait' : 'pointer', boxShadow: handoverSaving ? 'none' : `0 7px 22px ${BLUE}28`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><LogOut size={16} />{handoverSaving ? 'Sending…' : 'End shift & send handoff'}</button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {!viewingHandoff && <>
              {/* ── Print-only: premium document header ─────────────────────────── */}
              <div className="dar-print-only" style={{ padding:'28px 32px 0' }}>
                {/* Masthead: property name + document title */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', paddingBottom:10, borderBottom:'2px solid #0d1117', marginBottom:14 }}>
                  <div>
                    <div style={{ fontFamily:INTER, fontSize:8, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(0,0,0,0.35)', marginBottom:4 }}>
                      The Hannah · Philadelphia
                    </div>
                    <div style={{ fontFamily:"'Playfair Display',Georgia,'Times New Roman',serif", fontSize:30, fontWeight:700, letterSpacing:'0.04em', textTransform:'uppercase', color:'#0d1117', lineHeight:1.1 }}>
                      Daily Shift Notes
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:INTER, fontSize:8, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(0,0,0,0.35)', marginBottom:3 }}>
                      Daily Activity Report
                    </div>
                    <div style={{ fontFamily:INTER, fontSize:9, color:'rgba(0,0,0,0.4)', lineHeight:1.5 }}>
                      1306 Callowhill Street<br />Philadelphia PA 19123
                    </div>
                  </div>
                </div>
                {/* 3-column meta row: Date | Shift | Concierge */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, paddingBottom:14, borderBottom:'1px solid rgba(0,0,0,0.12)', marginBottom:2 }}>
                  <div>
                    <div style={{ fontFamily:INTER, fontSize:8, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(0,0,0,0.4)', marginBottom:4 }}>Date</div>
                    <div className="dar-print-date" style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:12, fontStyle:'italic', color:'#0d1117' }}>
                      {activeShift.dateLabel || new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily:INTER, fontSize:8, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(0,0,0,0.4)', marginBottom:4 }}>Shift</div>
                    <div className="dar-print-date" style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:12, fontStyle:'italic', color:'#0d1117' }}>
                      {activeShift.clockIn} – {activeShift.clockOut || 'Present'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily:INTER, fontSize:8, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(0,0,0,0.4)', marginBottom:4 }}>Concierge</div>
                    <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:13, fontStyle:'italic', color:'#0d1117', fontWeight:400 }}>
                      {activeShift.concierge.name}
                    </div>
                  </div>
                </div>
              </div>
              {/* ── End print header ─────────────────────────────────────────────── */}

              <div className="dar-screen-grid" style={{ background:CARD, margin:isMobile?'12px':'16px', border:`1px solid ${isDarkMode ? 'rgba(255,56,92,.30)' : 'rgba(180,35,60,.20)'}`, borderRadius:16, overflow:'hidden', display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(2,minmax(0,1fr))' }}>

                <DarBlock index={1} title="Packages" activities={[...incoming, ...pickups]} />

                <DarBlock index={2} title="Guests" activities={guests} rightColumn />

                <DarBlock index={3} title="Today's Tasks" activities={taskEntries} populated={!!activeShift.note || taskEntries.length > 0} wide>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {activeShift.note && (
                    <p style={{ fontFamily:INTER, fontSize:isPhone?13:14, color:TEXT, lineHeight:1.65, margin:0 }}>
                      {activeShift.note}
                    </p>
                  )}
                  {taskEntries.length > 0 && <SectionRow activities={taskEntries} last />}
                  {!activeShift.note && taskEntries.length === 0 && (
                    <span style={{ fontFamily:INTER, fontSize:isPhone?13:14, color:MUTED }}>No activity recorded</span>
                  )}
                </div>
                </DarBlock>

                <DarBlock index={4} title="Loaners" activities={loaners} />

                <DarBlock index={5} title="Lockouts" activities={lockouts} rightColumn />

                <DarBlock index={6} title="Vendors" activities={vends} />

                <DarBlock index={7} title="Tours" activities={tours} rightColumn />

                <DarBlock index={8} title="Security & Rounds" activities={rounds} wide />

                <DarBlock index={9} title="Incidents Filed" strings={activeShift.incidents} emptyLabel="No incidents this shift." critical wide />

              </div>


              {/* ── Print-only 3-column handover footer ─────────────────────────── */}
              <div className="dar-print-only" style={{ padding:'0 32px 36px' }}>
                <div className="dar-print-footer-cols">
                  {/* Col 1: Handover Notes */}
                  <div>
                    <div style={{ fontFamily:INTER, fontSize:8, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(0,0,0,0.45)', marginBottom:10 }}>Handover Notes</div>
                    {[0,1,2,3,4].map(i => (
                      <div key={i} style={{ borderBottom:'1px solid rgba(0,0,0,0.18)', height:24, marginBottom:8 }} />
                    ))}
                  </div>
                  {/* Col 2: End of Shift Checklist */}
                  <div>
                    <div style={{ fontFamily:INTER, fontSize:8, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(0,0,0,0.45)', marginBottom:10 }}>End of Shift</div>
                    {['Package log complete','Keys secured & logged','All incidents filed','Incoming concierge briefed','Rounds completed'].map((item,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:9 }}>
                        <div style={{ width:10, height:10, border:'1px solid rgba(0,0,0,0.35)', borderRadius:2, flexShrink:0 }} />
                        <span style={{ fontFamily:INTER, fontSize:9, color:'#1a1a1a' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  {/* Col 3: Sign-Off */}
                  <div>
                    <div style={{ fontFamily:INTER, fontSize:8, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(0,0,0,0.45)', marginBottom:10 }}>Sign-Off</div>
                    <div style={{ fontFamily:INTER, fontSize:8, color:'rgba(0,0,0,0.45)', marginBottom:4 }}>Concierge Signature</div>
                    <div style={{ borderBottom:'1px solid #0d1117', height:32, marginBottom:12 }} />
                    <div style={{ fontFamily:INTER, fontSize:8, color:'rgba(0,0,0,0.45)', marginBottom:4 }}>Shift End Time</div>
                    <div style={{ borderBottom:'1px solid #0d1117', height:22, marginBottom:12 }} />
                    <div style={{ fontFamily:INTER, fontSize:8, color:'rgba(0,0,0,0.45)', marginBottom:4 }}>Printed</div>
                    <div style={{ fontFamily:INTER, fontSize:9, color:'#0d1117' }}>
                      {new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
                    </div>
                  </div>
                </div>
              </div>
              </>}
            </>
          )}
        </div>

        {/* Right column */}
        <div hidden>

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
    <div style={{ flex:1, minHeight:0, overflowY:'auto', background:BG }}>
      <div style={{ padding:isMobile?'18px 16px 28px':'20px 28px 32px', display:'flex', flexDirection:'column', gap:18 }}>
        <div style={{ flexShrink:0, display:'grid', gridTemplateColumns:isPhone?'1fr':'repeat(2,minmax(0,1fr))', background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,.04)' }}>
          <div style={{ minHeight:82, boxSizing:'border-box', padding:'13px 16px', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:`${BLUE}10`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><Bell size={17} color={BLUE} /></div>
            <div><div style={{ fontFamily:INTER,fontSize:9,fontWeight:800,color:MUTED,letterSpacing:'.14em',textTransform:'uppercase',marginBottom:4 }}>Awaiting action</div><div style={{ fontFamily:INTER,fontSize:14,fontWeight:800,color:TEXT }}>{pendingRequests.length} open request{pendingRequests.length === 1 ? '' : 's'}</div></div>
          </div>
          <div style={{ minHeight:82,boxSizing:'border-box',padding:'13px 16px',display:'flex',alignItems:'center',gap:12,borderLeft:isPhone?'none':`1px solid ${BORDER}`,borderTop:isPhone?`1px solid ${BORDER}`:'none' }}>
            <div style={{ width:36,height:36,borderRadius:10,background:CARD2,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><UserCheck size={17} color={TEXT} /></div>
            <div><div style={{ fontFamily:INTER,fontSize:9,fontWeight:800,color:MUTED,letterSpacing:'.14em',textTransform:'uppercase',marginBottom:4 }}>Source</div><div style={{ fontFamily:INTER,fontSize:14,fontWeight:800,color:TEXT }}>Property management</div></div>
          </div>
        </div>

        <div role="tablist" aria-label="Request queue" style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:4, padding:4, background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14 }}>
          {[['inbox', 'Inbox', pendingRequests.length], ['handled', 'Handled', handledRequests.length]].map(([id, label, count]) => {
            const selected = requestQueueTab === id;
            return <button key={id} role="tab" aria-selected={selected} onClick={() => setRequestQueueTab(id)} style={{ minHeight:42,border:selected?`1px solid ${BORDER}`:'1px solid transparent',borderRadius:11,background:selected?CARD:'transparent',boxShadow:selected?'0 2px 8px rgba(0,0,0,.07)':'none',color:selected?TEXT:MUTED,cursor:'pointer',fontFamily:INTER,fontSize:12,fontWeight:750,transition:'all 160ms' }}>{label}<span style={{ marginLeft:7,color:selected?BLUE:MUTED,fontSize:9 }}>{count}</span></button>;
          })}
        </div>

        {requestQueueTab === 'inbox' && (pendingRequests.length > 0 ? (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {pendingRequests.map(task => <TaskRequestCard key={task.id || task.task_id} task={{ ...task, scheduledTime:task.dueTime || task.due_time || 'Today', proposedBy:task.createdBy || task.created_by || 'Management', description:task.notes }} onAccept={() => handleAcceptRequest(task)} onDecline={(_, reason) => handleDeclineRequest(task.id || task.task_id, reason)} />)}
          </div>
        ) : (
          <div style={{ minHeight:240,background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:'34px 20px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',boxShadow:SHADOW }}>
            <div style={{ width:50,height:50,background:`${GREEN}10`,border:`1px solid ${GREEN}25`,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12 }}><Sparkles size={22} color={GREEN} strokeWidth={1.6} /></div>
            <div style={{ fontFamily:INTER,fontSize:15,fontWeight:800,color:TEXT,marginBottom:5,letterSpacing:'-.02em' }}>Inbox zero</div>
            <div style={{ maxWidth:310,fontFamily:INTER,fontSize:12,color:MUTED,lineHeight:1.55 }}>New requests from management will appear here when they need the desk’s attention.</div>
          </div>
        ))}

        {requestQueueTab === 'handled' && (handledRequests.length ? (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {handledRequests.map(task => <div key={task.id || task.task_id} style={{ padding:'13px 15px',background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,display:'grid',gridTemplateColumns:'40px 1fr auto',alignItems:'center',gap:12,boxShadow:SHADOW }}><div style={{width:40,height:40,borderRadius:11,background:`${GREEN}10`,display:'flex',alignItems:'center',justifyContent:'center'}}><Check size={18} color={GREEN}/></div><div style={{minWidth:0}}><div style={{fontFamily:INTER,fontSize:13,fontWeight:750,color:TEXT,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{task.title}</div><div style={{marginTop:4,fontFamily:INTER,fontSize:10,color:MUTED}}>{task.createdBy || task.created_by || 'Property management'}</div></div><span style={{fontFamily:INTER,fontSize:9,fontWeight:800,color:task.status==='in_progress'?BLUE:GREEN,background:task.status==='in_progress'?`${BLUE}10`:`${GREEN}10`,borderRadius:999,padding:'5px 8px',textTransform:'uppercase',letterSpacing:'.06em'}}>{task.status==='in_progress'?'In progress':'Closed'}</span></div>)}
          </div>
        ) : <div style={{ minHeight:180, background:CARD, border:`1px solid ${BORDER}`, borderRadius:18, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:24 }}><CheckCircle size={26} color={GREEN} /><div style={{ fontFamily:INTER, fontSize:16, fontWeight:800, color:TEXT, marginTop:12 }}>No handled requests yet</div><div style={{ fontFamily:INTER, fontSize:13, color:MUTED, marginTop:5 }}>Accepted and closed requests will appear here.</div></div>)}
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
    <div>
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

        {/* Appearance */}
        <div>
          {sectionLabel('Appearance')}
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, padding:20, display:'flex', alignItems:'center', gap:16, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width:52, height:52, borderRadius:14, background:`${BLUE}12`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {isDarkMode ? <Moon size={22} color={BLUE} /> : <Sun size={22} color={BLUE} />}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontFamily:INTER, fontSize:15, fontWeight:700, color:TEXT, margin:'0 0 3px' }}>Dark mode</p>
              <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:0 }}>{isDarkMode ? 'Dark appearance is on' : 'Light appearance is on'}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isDarkMode}
              aria-label="Dark mode"
              onClick={toggleTheme}
              style={{ width:48, height:28, padding:3, border:0, borderRadius:999, background:isDarkMode?BLUE:BORDER, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:isDarkMode?'flex-end':'flex-start', transition:'background 150ms', flexShrink:0 }}
            >
              <span aria-hidden="true" style={{ width:22, height:22, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,.22)', display:'block' }} />
            </button>
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

    const categories = ['All', ...Array.from(new Set(uploadedSOPs.map(s => s.category).filter(Boolean)))];
    const q = sopSearch.trim().toLowerCase();
    const results = uploadedSOPs.filter(sop => (sopFilter === 'All' || sop.category === sopFilter) && (!q || `${sop.title || ''} ${sop.category || ''} ${sop.fileName || ''}`.toLowerCase().includes(q)));
    const prompts = ['How does this work?', 'Where is this located?', 'What do I do if this happens?', 'Who should I contact?'];
    const closeSOPs = () => handleTabChange('home');

    return (
      <div style={{ height:'100%', minHeight:0, display:'flex', flexDirection:'column', background:BG }}>
        <section style={{ flexShrink:0, background:CARD, borderBottom:`1px solid ${BORDER}` }}>
          <div style={{ padding:isMobile?'20px 20px 16px':'26px 30px 20px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
            <div style={{ minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:11 }}><span style={{ width:24, height:2, background:BLUE }} /><span style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:BLUE, letterSpacing:'.22em', textTransform:'uppercase' }}>{propertyName}</span></div>
              <h2 style={{ fontFamily:INTER, fontSize:isMobile?28:34, fontWeight:800, color:TEXT, letterSpacing:'-.045em', lineHeight:.98, margin:0 }}>Property procedures</h2>
              <p style={{ maxWidth:520, fontFamily:INTER, fontSize:12, color:MUTED, lineHeight:1.5, margin:'9px 0 0' }}>Approved instructions and references for the front desk.</p>
            </div>
            <button onClick={closeSOPs} aria-label="Close property procedures" data-testid="sops-close-btn" style={{ width:44, height:44, borderRadius:999, border:`1px solid ${BORDER}`, background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}><X size={19} color={TEXT} /></button>
          </div>
          <div style={{ height:3, background:BLUE }} />
        </section>

        <div style={{ flex:1, minHeight:0, overflowY:'auto', padding:isMobile?'18px':'24px 28px 32px', display:'flex', flexDirection:'column', gap:18, background:BG }}>
          <section style={{ border:`1px solid ${BORDER}`, borderRadius:16, background:CARD, padding:isMobile?16:20, boxShadow:SHADOW }}>
            <div style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:BLUE, letterSpacing:'.16em', textTransform:'uppercase', marginBottom:6 }}>Search the playbook</div>
            <h3 style={{ fontFamily:INTER, fontSize:18, fontWeight:800, color:TEXT, letterSpacing:'-.025em', margin:'0 0 13px' }}>What do you need to know?</h3>
            <div style={{ position:'relative' }}>
              <Search size={18} color={MUTED} style={{ position:'absolute', left:15, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
              <input value={sopSearch} onChange={e=>setSopSearch(e.target.value)} placeholder='Search “elevator keys”, “lockout”, or “package room”…' aria-label="Search property procedures" style={{ width:'100%', minHeight:52, boxSizing:'border-box', border:`1.5px solid ${sopSearch?BLUE:BORDER}`, borderRadius:12, background:sopSearch?'rgba(255,56,92,.025)':CARD2, color:TEXT, padding:'13px 46px', fontFamily:INTER, fontSize:16, outline:'none', transition:'border-color 150ms' }} />
              {sopSearch && <button onClick={()=>setSopSearch('')} aria-label="Clear search" style={{ position:'absolute', right:8, top:8, width:36, height:36, borderRadius:9, border:0, background:CARD, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={15} color={MUTED} /></button>}
            </div>
            <div aria-label="Common property questions" style={{ display:'flex', gap:7, overflowX:'auto', paddingTop:11, scrollbarWidth:'none' }}>{prompts.map(prompt=><button key={prompt} onClick={()=>setSopSearch(prompt)} style={{ minHeight:36, padding:'0 12px', borderRadius:999, border:`1px solid ${BORDER}`, background:CARD, color:TEXT, fontFamily:INTER, fontSize:10, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>{prompt}</button>)}</div>
          </section>

          <section>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:12, marginBottom:12 }}><div><div style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:BLUE, letterSpacing:'.16em', textTransform:'uppercase', marginBottom:6 }}>Property playbook</div><h3 style={{ fontFamily:INTER, fontSize:20, fontWeight:800, color:TEXT, letterSpacing:'-.03em', margin:0 }}>Procedures and references</h3></div><span aria-label={`${results.length} of ${uploadedSOPs.length} procedures shown`} style={{ fontFamily:INTER, fontSize:10, fontWeight:700, color:MUTED, whiteSpace:'nowrap' }}>{results.length} / {uploadedSOPs.length}</span></div>
            <div role="tablist" aria-label="Procedure categories" style={{ display:'flex', gap:4, padding:4, overflowX:'auto', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14, scrollbarWidth:'none' }}>{categories.map(category=>{const selected=sopFilter===category;return <button key={category} role="tab" aria-selected={selected} onClick={()=>setSopFilter(category)} style={{ minHeight:42, padding:'0 14px', border:selected?`1px solid ${BORDER}`:'1px solid transparent', borderRadius:11, background:selected?CARD:'transparent', boxShadow:selected?'0 2px 8px rgba(0,0,0,.07)':'none', color:selected?TEXT:MUTED, fontFamily:INTER, fontSize:11, fontWeight:750, cursor:'pointer', whiteSpace:'nowrap', transition:'all 160ms' }}>{category}</button>})}</div>
          </section>

          {uploadedSOPs.length === 0 ? (
            <div style={{ minHeight:240, border:`1px solid ${BORDER}`, borderRadius:16, background:CARD, padding:isMobile?'30px 20px':'36px 28px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', boxShadow:SHADOW }}>
              <div style={{ width:50, height:50, borderRadius:14, background:`${BLUE}10`, border:`1px solid ${BLUE}20`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}><BookOpen size={22} color={BLUE} strokeWidth={1.6}/></div>
              <h3 style={{ fontFamily:INTER, fontSize:18, fontWeight:800, color:TEXT, letterSpacing:'-.02em', margin:'0 0 7px' }}>No property procedures have been documented yet</h3>
              <p style={{ maxWidth:430, fontFamily:INTER, fontSize:13, color:MUTED, lineHeight:1.6, margin:'0 auto 16px' }}>Noted will never invent an answer. Ask the property manager to add the approved procedure before relying on this section.</p>
              <button onClick={()=>setShowContacts(true)} style={{ minHeight:44, padding:'0 16px', borderRadius:14, border:`1px solid ${BORDER}`, background:CARD2, color:TEXT, fontFamily:INTER, fontSize:12, fontWeight:750, cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7 }}><Phone size={14}/>Open property contacts</button>
            </div>
          ) : results.length === 0 ? (
            <div style={{ border:`1px solid ${BORDER}`, borderRadius:18, background:CARD, padding:'32px 22px', textAlign:'center' }}><Search size={24} color={MUTED}/><h3 style={{ fontFamily:INTER, fontSize:16, fontWeight:800, color:TEXT, margin:'12px 0 6px' }}>That procedure has not been documented</h3><p style={{ fontFamily:INTER, fontSize:12, color:MUTED, lineHeight:1.6, margin:'0 0 14px' }}>Try a broader search or choose another category. Do not guess at a property procedure.</p><button onClick={()=>{setSopSearch('');setSopFilter('All');}} style={{ minHeight:40, padding:'0 14px', borderRadius:999, border:`1px solid ${BORDER}`, background:CARD2, color:TEXT, fontFamily:INTER, fontSize:11, fontWeight:700, cursor:'pointer' }}>Clear search</button></div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(2,minmax(0,1fr))', gap:10 }}>
            {results.map((sop, index) => {
          const CatIcon = sop.fileType === 'image' ? Image : sop.fileType === 'pdf' ? FileText : (SOP_ICON_MAP[sop.category] || BookOpen);
          const catColor = SOP_COLOR_MAP[sop.category] || MUTED;
          const typeLabel = sop.fileType === 'image' ? 'Visual guide' : sop.fileType === 'video' ? 'Video guide' : 'Document';
          return (
            <button key={sop.id} onClick={() => setFullscreenItem(sop)}
              style={{ minHeight:128, padding:14, borderRadius:14, textAlign:'left', display:'grid', gridTemplateColumns:'52px minmax(0,1fr) 18px', alignItems:'center', gap:13, cursor:'pointer', width:'100%', background:CARD, border:`1px solid ${BORDER}`, boxShadow:SHADOW, transition:'border-color 150ms, box-shadow 150ms' }}>
              <div style={{ width:52, height:72, borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:CARD2, overflow:'hidden', position:'relative' }}>
                {sop.fileType === 'image' ? (
                  <img src={sop.dataURL} alt={sop.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                ) : (
                  <CatIcon size={23} color={catColor} />
                )}
                <span style={{ position:'absolute', top:5, left:5, fontFamily:INTER, fontSize:7, fontWeight:800, color:catColor }}>{String(index+1).padStart(2,'0')}</span>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:catColor, textTransform:'uppercase', letterSpacing:'0.14em', margin:'0 0 6px' }}>{sop.category}</p>
                <p style={{ fontFamily:INTER, fontWeight:800, color:TEXT, fontSize:14, lineHeight:1.3, margin:'0 0 8px' }}>{sop.title}</p>
                <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontFamily:INTER, fontSize:10, fontWeight:650, color:MUTED }}><Eye size={12}/>{typeLabel}</span>
              </div>
              <ChevronRight size={18} color={MUTED} style={{ flexShrink:0 }} />
            </button>
          );
        })}
            </div>
          )}
        </div>
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

    const openTraining = (item) => {
      setLastTrainingId(item.id);
      try { localStorage.setItem('_notedLastTraining', item.id); } catch {}
      setFullscreenItem({ ...item, _knowledgeType:'training' });
    };
    const q = trainingSearch.trim().toLowerCase();
    const results = trainingItems.filter(item => (!q || `${item.title || ''} ${item.category || ''} ${item.fileName || ''}`.toLowerCase().includes(q)) && (trainingFilter === 'All' || (trainingFilter === 'Completed' ? completedTraining.has(item.id) : item.fileType === trainingFilter.toLowerCase())));
    const completedCount = trainingItems.filter(item=>completedTraining.has(item.id)).length;
    const resumeItem = trainingItems.find(item=>item.id===lastTrainingId && !completedTraining.has(item.id));
    const progress = trainingItems.length ? Math.round((completedCount/trainingItems.length)*100) : 0;
    const closeTraining = () => handleTabChange('home');

    return (
      <div style={{ height:'100%', minHeight:0, display:'flex', flexDirection:'column', background:BG }}>
        <section style={{ flexShrink:0, background:CARD, borderBottom:`1px solid ${BORDER}` }}>
          <div style={{ padding:isMobile?'20px 20px 16px':'26px 30px 20px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
            <div style={{ minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:11 }}><span style={{ width:24, height:2, background:BLUE }} /><span style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:BLUE, letterSpacing:'.22em', textTransform:'uppercase' }}>{propertyName}</span></div>
              <h2 style={{ fontFamily:INTER, fontSize:isMobile?28:34, fontWeight:800, color:TEXT, letterSpacing:'-.045em', lineHeight:.98, margin:0 }}>Training library</h2>
              <p style={{ maxWidth:520, fontFamily:INTER, fontSize:12, color:MUTED, lineHeight:1.5, margin:'9px 0 0' }}>Property-specific learning for confident front desk operations.</p>
            </div>
            <button onClick={closeTraining} aria-label="Close training library" data-testid="training-close-btn" style={{ width:44, height:44, borderRadius:999, border:`1px solid ${BORDER}`, background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}><X size={19} color={TEXT} /></button>
          </div>
          <div style={{ display:'flex', gap:5, padding:isMobile?'0 20px 16px':'0 30px 20px' }}>
            <div style={{ flex:1, height:3, borderRadius:2, background:BLUE }} />
            <div style={{ flex:1, height:3, borderRadius:2, background:progress===100?BLUE:BORDER, transition:'background 200ms' }} />
          </div>
        </section>

        <div style={{ flex:1, minHeight:0, overflowY:'auto', padding:isMobile?'18px':'24px 28px 32px', display:'flex', flexDirection:'column', gap:18, background:BG }}>
          <section style={{ border:`1px solid ${BORDER}`, borderRadius:16, background:CARD, padding:isMobile?16:20, boxShadow:SHADOW }}>
            <div style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:BLUE, letterSpacing:'.16em', textTransform:'uppercase', marginBottom:6 }}>Search desk learning</div>
            <h3 style={{ fontFamily:INTER, fontSize:18, fontWeight:800, color:TEXT, letterSpacing:'-.025em', margin:'0 0 13px' }}>What would you like to review?</h3>
            <div style={{ position:'relative' }}><Search size={18} color={MUTED} style={{ position:'absolute', left:15, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/><input value={trainingSearch} onChange={e=>setTrainingSearch(e.target.value)} placeholder="Search training by topic or building system…" aria-label="Search property training" style={{ width:'100%', minHeight:52, boxSizing:'border-box', border:`1.5px solid ${trainingSearch?BLUE:BORDER}`, borderRadius:12, background:trainingSearch?'rgba(255,56,92,.025)':CARD2, color:TEXT, padding:'13px 46px', fontFamily:INTER, fontSize:16, outline:'none', transition:'border-color 150ms' }}/>{trainingSearch&&<button onClick={()=>setTrainingSearch('')} aria-label="Clear search" style={{ position:'absolute', right:8, top:8, width:36, height:36, borderRadius:9, border:0, background:CARD, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={15} color={MUTED}/></button>}</div>
          </section>

          <section style={{ border:`1px solid ${BORDER}`, borderRadius:16, background:CARD, padding:isMobile?16:18, display:'grid', gridTemplateColumns:isPhone?'1fr':'1fr auto', alignItems:'center', gap:16, boxShadow:SHADOW }}>
            <div><div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:12, marginBottom:9 }}><span style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:BLUE, letterSpacing:'.16em', textTransform:'uppercase' }}>Property readiness</span><span style={{ fontFamily:INTER, fontSize:12, fontWeight:800, color:TEXT }}>{progress}%</span></div><div style={{ height:5, borderRadius:99, background:CARD2, overflow:'hidden' }}><div style={{ width:`${progress}%`, height:'100%', borderRadius:99, background:BLUE, transition:'width 220ms ease' }}/></div><p style={{ fontFamily:INTER, fontSize:11, color:MUTED, margin:'8px 0 0' }}>{completedCount} of {trainingItems.length} materials reviewed</p></div>
            {resumeItem&&<button onClick={()=>openTraining(resumeItem)} style={{ minHeight:44, padding:'0 16px', borderRadius:14, border:0, background:BLUE, color:'white', fontFamily:INTER, fontSize:11, fontWeight:750, cursor:'pointer', boxShadow:`0 7px 22px ${BLUE}28`, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7 }}><Play size={13}/>Resume</button>}
          </section>

          <section><div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:12, marginBottom:12 }}><div><div style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:BLUE, letterSpacing:'.16em', textTransform:'uppercase', marginBottom:6 }}>Desk learning</div><h3 style={{ fontFamily:INTER, fontSize:20, fontWeight:800, color:TEXT, letterSpacing:'-.03em', margin:0 }}>Assigned materials</h3></div><span aria-label={`${results.length} training materials shown`} style={{ fontFamily:INTER, fontSize:10, fontWeight:700, color:MUTED, whiteSpace:'nowrap' }}>{results.length} / {trainingItems.length}</span></div><div role="tablist" aria-label="Training material types" style={{ display:'flex', gap:4, padding:4, overflowX:'auto', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14, scrollbarWidth:'none' }}>{['All','video','image','pdf','Completed'].map(filter=>{const selected=trainingFilter===filter;return <button key={filter} role="tab" aria-selected={selected} onClick={()=>setTrainingFilter(filter)} style={{ minHeight:42, padding:'0 14px', border:selected?`1px solid ${BORDER}`:'1px solid transparent', borderRadius:11, background:selected?CARD:'transparent', boxShadow:selected?'0 2px 8px rgba(0,0,0,.07)':'none', color:selected?TEXT:MUTED, fontFamily:INTER, fontSize:11, fontWeight:750, textTransform:filter==='pdf'?'uppercase':'capitalize', cursor:'pointer', whiteSpace:'nowrap', transition:'all 160ms' }}>{filter==='image'?'Photos':filter==='video'?'Videos':filter}</button>})}</div></section>

          {trainingItems.length===0 ? <div style={{ minHeight:240, border:`1px solid ${BORDER}`, borderRadius:16, background:CARD, padding:'36px 24px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', boxShadow:SHADOW }}><div style={{ width:50, height:50, borderRadius:14, background:`${BLUE}10`, border:`1px solid ${BLUE}20`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}><GraduationCap size={22} color={BLUE} strokeWidth={1.6}/></div><h3 style={{ fontFamily:INTER, fontSize:18, fontWeight:800, color:TEXT, letterSpacing:'-.02em', margin:'0 0 7px' }}>No property training has been assigned yet</h3><p style={{ maxWidth:430, fontFamily:INTER, fontSize:13, color:MUTED, lineHeight:1.6, margin:0 }}>Your property manager can add approved videos, visual guides, and reference documents.</p></div> : results.length===0 ? <div style={{ minHeight:200, border:`1px solid ${BORDER}`, borderRadius:16, background:CARD, padding:'30px 22px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', boxShadow:SHADOW }}><Search size={24} color={MUTED}/><h3 style={{ fontFamily:INTER, fontSize:16, fontWeight:800, color:TEXT, margin:'12px 0 6px' }}>No training matches this view</h3><button onClick={()=>{setTrainingSearch('');setTrainingFilter('All');}} style={{ minHeight:40, padding:'0 14px', borderRadius:14, border:`1px solid ${BORDER}`, background:CARD2, color:TEXT, fontFamily:INTER, fontSize:11, fontWeight:700, cursor:'pointer' }}>Show all training</button></div> : <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(2,minmax(0,1fr))', gap:10 }}>
        {results.map((item) => {
          const CatIcon = TRAINING_ICON_MAP[item.category] || HelpCircle;
          const typeLabel = item.fileType === 'video' ? 'Video' : item.fileType === 'image' ? 'Photo' : 'PDF';
          const TypeIcon = item.fileType === 'video' ? Video : item.fileType === 'image' ? Image : FileText;
          const done = completedTraining.has(item.id);
          return (
            <button key={item.id} onClick={() => openTraining(item)} style={{ minHeight:130, padding:14, borderRadius:14, textAlign:'left', display:'grid', gridTemplateColumns:'58px minmax(0,1fr) 18px', alignItems:'center', gap:13, cursor:'pointer', width:'100%', background:CARD, border:`1px solid ${done?`${GREEN}45`:BORDER}`, boxShadow:SHADOW, transition:'border-color 150ms, box-shadow 150ms' }}>
              <div style={{ width:58, height:78, borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:CARD2, overflow:'hidden', position:'relative' }}>
                {item.fileType === 'image' ? (
                  <img src={item.dataURL} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                ) : (
                  <CatIcon size={24} color={MUTED} />
                )}
                {item.fileType==='video'&&<span style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,.08)' }}><Play size={18} color={BLUE}/></span>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:BLUE, textTransform:'uppercase', letterSpacing:'0.14em', margin:'0 0 6px' }}>{item.category}</p>
                <p style={{ fontFamily:INTER, fontWeight:800, color:TEXT, fontSize:14, lineHeight:1.3, margin:'0 0 9px' }}>{item.title}</p>
                <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontFamily:INTER, fontSize:10, fontWeight:650, color:done?GREEN:MUTED }}><TypeIcon size={12}/>{done?'Reviewed':typeLabel}</span>
              </div>
              <ChevronRight size={18} color={MUTED} style={{ flexShrink:0 }} />
            </button>
          );
        })}
          </div>}
        </div>
      </div>
    );
  };

  // ── SHELL ──────────────────────────────────────────────────────────────────
  const PAGE_TITLES = {
    home: "Today's Tasks", requests: 'Requests', packages: 'Packages',
    loaners: 'Loaners', lockout: 'Lockouts', tours: 'Tours',
    vendors: 'Vendors', incident: 'Incident Report', calendar: 'Shifts',
    'shift-history': 'Shift History', messages: 'Messages',
    guests: 'Visitors', settings: 'Settings', profile: 'Profile',
    sops: 'Property Knowledge', training: 'Training', followup: 'Follow-up Tracker',
  };

  const PAGE_SUBTITLES = {
    requests: 'Resident requests waiting on the desk',
    packages: 'Log, audit, and release packages',
    loaners: 'Track loaned items and returns',
    lockout: 'Record lockouts and key access',
    tours: 'Prospect tours and walk-ins',
    vendors: 'Vendor arrivals and departures',
    incident: 'Structured reports with photo evidence',
    calendar: 'Your shift schedule and history',
    'shift-history': 'Past shifts and daily reports',
    messages: 'Team messages for this property',
    guests: 'Visitor check-ins and authorizations',
    settings: 'Account, appearance, and preferences',
    profile: 'Your account and certifications',
    sops: 'Standard operating procedures for the desk',
    training: 'Onboarding guides and desk reference',
  };

  const NAV_ITEMS = [
    { id: 'home',          Icon: Home,           label: "Today's"             },
    { id: 'new-task',      Icon: Plus,           label: 'New Task',           action: () => setShowNewTask(true) },
    { id: 'requests',      Icon: Bell,           label: 'Requests'            },
    { id: 'packages',      Icon: Package,        label: 'Packages'            },
    { id: 'guests',        Icon: UserCheck,      label: 'Guests'              },
    { id: 'lockout',       Icon: Lock,           label: 'Lockouts'            },
    { id: 'vendors',       Icon: Wrench,         label: 'Vendors'             },
    { id: 'tours',         Icon: Users,          label: 'Tours'               },
    { id: 'loaners',       Icon: ShoppingCart,   label: 'Loaners'             },
    { id: 'incident',      Icon: AlertTriangle,  label: 'Incident'            },
    { id: 'sops',          Icon: BookOpen,       label: 'SOPs'                },
    { id: 'training',      Icon: GraduationCap,  label: 'Training'            },
    { id: 'calendar',      Icon: Calendar,       label: 'Shifts'              },
    { id: 'settings',      Icon: Settings,       label: 'Settings'            },
    { id: 'emergency',     Icon: Phone,          label: 'Emergency Contacts', action: () => setShowContacts(true) },
  ];
  const NAV_GROUPS = [
    { label: 'Shift record', ids: ['home', 'new-task', 'requests'] },
    { label: 'Front desk', ids: ['packages', 'guests', 'lockout', 'vendors', 'tours', 'loaners', 'incident'] },
    { label: 'Property guide', ids: ['sops', 'training'] },
    { label: 'Account & support', ids: ['calendar', 'settings', 'emergency'] },
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
      const Sect = ({ title, accent=BLUE }) => (
        <div style={{ background:'transparent', borderTop:`1px solid ${BORDER}`, padding: isMobile ? '18px 16px 5px' : '20px 24px 5px', marginTop:4 }}>
          <span style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:accent, letterSpacing:'0.18em', textTransform:'uppercase' }}>{title}</span>
        </div>
      );
      const Field = ({ label, value, sub, last }) => (
        <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', alignItems:'flex-start', gap: isMobile ? 4 : 20, padding: isMobile ? '11px 16px' : '13px 24px', borderBottom:last?'none':`1px solid ${BORDER}` }}>
          <div style={{ width: isMobile ? '100%' : 220, flexShrink:0, fontFamily:INTER, fontSize: isMobile ? 10 : 13, fontWeight:750, color:MUTED, lineHeight:1.4, textTransform: isMobile ? 'uppercase' : 'none', letterSpacing: isMobile ? '0.08em' : 'normal' }}>{label}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:INTER, fontSize: isMobile ? 14 : 14, color:TEXT, lineHeight:1.6, whiteSpace:'pre-line' }}>{value}</div>
            {sub && <div style={{ fontFamily:INTER, fontSize:12, color:MUTED, marginTop:3 }}>{sub}</div>}
          </div>
        </div>
      );
      return (
        <>
          <div style={{ background:CARD2, borderBottom:`1px solid ${BORDER}`, padding:isMobile?'18px 16px':'20px 24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:BLUE, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:7 }}>Daily Activity Report</div>
                <div style={{ fontFamily:INTER, fontSize:isMobile?19:22, fontWeight:800, color:TEXT, letterSpacing:'-.025em', marginBottom:5 }}>{s.concierge.name}</div>
                <div style={{ fontFamily:INTER, fontSize:12, color:MUTED }}>
                  {dateLabel} · {s.clockIn}{s.clockOut ? ` – ${s.clockOut}` : ' – Present'}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:s.status==='active'?'rgba(52,199,89,0.12)':CARD, border:`1px solid ${s.status==='active'?'rgba(52,199,89,.2)':BORDER}`, borderRadius:999, padding:'6px 11px' }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:s.status==='active'?GREEN:MUTED }} />
                  <span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:s.status==='active'?GREEN:MUTED, textTransform:'uppercase', letterSpacing:'.08em' }}>
                    {s.status==='active' ? 'On Duty' : 'Completed'}
                  </span>
                </div>
                <div style={{ fontFamily:INTER, fontSize:11, color:MUTED }}>{s.duration}</div>
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
      <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns:'minmax(0,1fr) minmax(320px,400px)', gap: isMobile ? 14 : 18, alignItems: isMobile ? 'stretch' : 'start', width:'100%', maxWidth:1440, margin:'0 auto', boxSizing:'border-box', padding: isMobile ? '16px 16px 48px' : '22px 28px 48px' }}>

        {/* DAR — top on mobile, left column on desktop */}
        <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, overflow:'hidden', boxShadow:SHADOW, order: isMobile ? 2 : 0, gridColumn: 1, gridRow: '1 / 3', minWidth:0 }}>
          {selectedShift ? (
            shiftDARBody(selectedShift, (() => { const dp=shiftDay.split('-'); return `${SH_MONTHS[parseInt(dp[1])-1]} ${parseInt(dp[2])}, ${dp[0]}`; })())
          ) : (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:isMobile?230:360, padding:'48px 24px', textAlign:'center' }}>
              <div style={{ width:50, height:50, borderRadius:14, background:`${BLUE}10`, border:`1px solid ${BLUE}20`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:13 }}>
                <Calendar size={22} color={BLUE} strokeWidth={1.7} />
              </div>
              <p style={{ fontFamily:INTER, fontSize:18, fontWeight:800, color:TEXT, letterSpacing:'-.02em', margin:'0 0 7px' }}>No shift selected</p>
              <p style={{ maxWidth:390, fontFamily:INTER, fontSize:13, color:MUTED, lineHeight:1.6, margin:0 }}>Choose a highlighted date or a shift card to review its daily activity report.</p>
            </div>
          )}
        </div>

        {/* Calendar card — top on mobile, right col row 1 on desktop */}
        <section aria-label="Shift calendar" style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, padding:isMobile?16:18, boxShadow:SHADOW, order: isMobile ? 1 : 0, gridColumn: 2, gridRow: 1, minWidth:0 }}>
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
              <div role="tablist" aria-label="Calendar view" style={{ display:'flex', background:CARD2, borderRadius:12, padding:4, border:`1px solid ${BORDER}` }}>
                {['month','year'].map(v => (
                  <button key={v} role="tab" aria-selected={shCalView===v} onClick={() => setShCalView(v)}
                    style={{ minHeight:36, padding:'0 13px', borderRadius:9, background:shCalView===v?CARD:'transparent', border:shCalView===v?`1px solid ${BORDER}`:'1px solid transparent', boxShadow:shCalView===v?'0 2px 8px rgba(0,0,0,.07)':'none', fontFamily:INTER, fontSize:11, fontWeight:750, color:shCalView===v?TEXT:MUTED, cursor:'pointer', textTransform:'capitalize', transition:'all 160ms' }}>
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
          </section>

        {/* Shifts this month — bottom on mobile, right col row 2 on desktop */}
        {shCalView === 'month' && (
          <section aria-label="Shifts this month" style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, padding:isMobile?16:18, boxShadow:SHADOW, order: isMobile ? 3 : 0, gridColumn: 2, gridRow: 2, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:`${BLUE}10`, display:'flex', alignItems:'center', justifyContent:'center' }}><Clock size={16} color={BLUE} /></div>
                  <div><div style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:BLUE, letterSpacing:'.14em', textTransform:'uppercase', marginBottom:2 }}>Schedule</div><h2 style={{ fontFamily:INTER, fontWeight:800, color:TEXT, fontSize:16, letterSpacing:'-.02em', margin:0 }}>Shifts this month</h2></div>
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
                      aria-pressed={isSel}
                      style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:13, background:isSel?'rgba(255,56,92,0.045)':CARD, border:`1.5px solid ${isSel?BLUE:BORDER}`, borderRadius:14, cursor:'pointer', textAlign:'left', boxShadow:isSel?'0 5px 18px rgba(255,56,92,.10)':SHADOW, transition:'all 150ms' }}>
                      <div style={{ width:42, height:42, borderRadius:12, background:onDuty?'rgba(52,199,89,0.12)':'rgba(255,56,92,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span style={{ fontFamily:INTER, fontSize:14, fontWeight:800, color:stColor }}>{s.concierge.init}</span>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
                          <span style={{ fontFamily:INTER, fontSize:14, fontWeight:700, color:TEXT }}>{s.concierge.name}</span>
                          <span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:stColor, background:`${stColor}14`, borderRadius:6, padding:'2px 6px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{onDuty?'On Duty':'Completed'}</span>
                        </div>
                        <div style={{ fontFamily:INTER, fontSize:12, color:MUTED }}>{label} · {s.clockIn}{s.clockOut?` – ${s.clockOut}`:''} · {s.activities.length} actions</div>
                      </div>
                      {isSel ? <div style={{ width:22, height:22, borderRadius:'50%', background:BLUE, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Check size={13} color="white" strokeWidth={3}/></div> : <ChevronRight size={16} color={MUTED} />}
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
            </section>
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

        {/* One-level operational index — grouped for scanning, never nested */}
        <nav aria-label="Concierge workspace" style={{ padding: collapsed ? '10px 7px 4px' : '8px 10px 4px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {!collapsed && <div style={{ position:'relative', padding: '4px 38px 13px 8px', borderBottom: `1px solid ${BORDER}`, marginBottom: 8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}><span style={{ width:20, height:2, background:BLUE }} /><span style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:BLUE, letterSpacing:'.20em', textTransform:'uppercase' }}>Concierge desk</span></div>
            <div style={{ fontFamily:INTER, fontSize:13, fontWeight:700, color:TEXT, letterSpacing:'-.01em' }}>Property operations</div>
            {!isDrawer && <button aria-label="Collapse sidebar" onClick={() => setSidebarCollapsed(true)} style={{ position:'absolute', top:2, right:0, width:32, height:32, borderRadius:9, border:`1px solid ${BORDER}`, background:CARD, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><ChevronLeft size={15} color={MUTED} /></button>}
          </div>}
          {NAV_GROUPS.map((group, groupIndex) => (
            <div key={group.label} style={{ paddingTop: groupIndex ? 8 : 0, marginTop: groupIndex ? 5 : 0, borderTop: collapsed && groupIndex ? `1px solid ${BORDER}` : 'none' }}>
              {!collapsed && <div style={{ padding:'4px 10px 6px', fontFamily:INTER, fontSize:9, fontWeight:800, color:MUTED, letterSpacing:'.16em', textTransform:'uppercase' }}>{group.label}</div>}
              {group.ids.map(id => {
                const item = NAV_ITEMS.find(navItem => navItem.id === id);
                if (!item) return null;
                const { Icon, label, action } = item;
                const active = !action && activeTab === id;
                const urgent = id === 'emergency';
                return (
                  <button key={id}
                    className={`nav-btn touch-target${active ? ' nav-btn--active' : ''}`}
                    onClick={() => {
                      if (collapsed) setSidebarCollapsed(false);
                      action ? action() : handleTabChange(id);
                      if (isDrawer) setSidebarOpen(false);
                    }}
                    title={collapsed ? label : undefined}
                    aria-current={active ? 'page' : undefined}
                    style={{
                      display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:collapsed?0:11,
                      width:'100%', minHeight:44, padding:collapsed?'4px':'4px 8px', marginBottom:2,
                    border: urgent && !active ? `1px solid ${RED}28` : '1px solid transparent',
                    borderRadius:10, cursor:'pointer', textAlign:'left', position:'relative',
                      background:active?(isDarkMode?'rgba(255,255,255,.12)':'#222222'):urgent?`${RED}08`:'transparent',
                      transition:'background 120ms ease, border-color 120ms ease',
                    }}>
                    {active && <span aria-hidden="true" style={{ position:'absolute', left:0, top:10, bottom:10, width:3, borderRadius:'0 3px 3px 0', background:'rgba(255,255,255,.88)' }} />}
                    <span style={{ width:32, height:32, borderRadius:9, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', background:active?'rgba(255,255,255,.16)':urgent?`${RED}10`:'transparent' }}>
                      <Icon size={17} color={active?'#fff':urgent?RED:MUTED} strokeWidth={active?2.2:1.7} />
                      {id === 'requests' && pendingRequests.length > 0 && <span aria-label={`${pendingRequests.length} pending requests`} style={{ position:'absolute', top:-1, right:-2, minWidth:15, height:15, borderRadius:99, background:RED, border:`2px solid ${active?BLUE:NAV_SURFACE}`, color:'#fff', fontFamily:INTER, fontSize:7, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 2px' }}>{pendingRequests.length}</span>}
                    </span>
                    {!collapsed && <span style={{ flex:1, minWidth:0, fontFamily:INTER, fontSize:13, fontWeight:active?750:600, color:active?'#fff':urgent?RED:TEXT, letterSpacing:'-.005em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom branding */}
        <div style={{ flexShrink: 0, padding: collapsed ? '12px 0' : '20px 20px 0', paddingBottom: 'max(24px, env(safe-area-inset-bottom))', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          {!collapsed && <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: '0.24em', textTransform: 'uppercase' }}>Noted</span>}
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
      {/* The desktop workspace header was removed to give dashboard content
          the full available height. Navigation remains in the sidebar. */}
      {false && !isMobile && (
        <header style={{ height:72, background:CARD, borderBottom:`1px solid ${BORDER}`, display:'flex', alignItems:'center', padding:'0 24px', flexShrink:0, gap:16, zIndex:20, boxShadow:'0 2px 10px rgba(0,0,0,.03)' }}>
          <button onClick={() => setSidebarCollapsed(c => !c)} aria-label={sidebarCollapsed ? 'Expand workspace navigation' : 'Collapse workspace navigation'} style={{ width:40, height:40, borderRadius:12, border:`1px solid ${BORDER}`, background:CARD, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}><Menu size={18} color={TEXT} /></button>
          <button onClick={() => handleTabChange('home')} style={{ display:'flex', alignItems:'center', gap:10, minWidth:0, border:'none', padding:0, background:'transparent', cursor:'pointer', textAlign:'left', flexShrink:0 }}>
            <div style={{ width:36, height:36, borderRadius:11, background:'#222222', display:'flex', alignItems:'center', justifyContent:'center' }}><Building2 size={17} color="white" /></div>
            <div style={{ minWidth:0 }}><div style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:BLUE, letterSpacing:'.18em', textTransform:'uppercase', marginBottom:2 }}>Noted workspace</div><div style={{ fontFamily:INTER, fontSize:14, fontWeight:750, color:TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:210 }}>{propertyName}</div></div>
          </button>

          {/* Search — fills all remaining space */}
          <div style={{ flex:1, maxWidth:640, position:'relative', margin:'0 auto' }}>
            <Search size={15} color={MUTED} style={{ position: 'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', zIndex:1 }} />
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
              style={{ width:'100%', height:44, background:CARD2, border:`1px solid ${BORDER}`, borderRadius:12, paddingLeft:40, paddingRight:searchQuery?34:14, fontFamily:INTER, fontSize:13, color:TEXT, outline:'none', boxSizing:'border-box' }}
            />
            {searchQuery && (
              <button aria-label="Clear search" onClick={() => { setSearchQuery(''); setShowSearch(false); }}
                style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:2, display:'flex' }}>
                <X size={13} color="#717171" />
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

          <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:8, flexShrink:0 }}>
            <span style={{ minHeight:34, padding:'0 11px', borderRadius:999, background:CARD2, border:`1px solid ${BORDER}`, display:'inline-flex', alignItems:'center', gap:7, fontFamily:INTER, fontSize:11, fontWeight:700, color:TEXT }}><span style={{ width:7, height:7, borderRadius:'50%', background:isShiftActive?GREEN:MUTED, boxShadow:isShiftActive?'0 0 0 3px rgba(52,199,89,.12)':'none' }} />{isShiftActive?'On shift':'Off shift'}</span>
            <button aria-label="View notifications" title="Notifications" style={{ position:'relative', width:40, height:40, borderRadius:12, border:`1px solid ${BORDER}`, background:CARD, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><Bell size={17} color={TEXT} />{pendingRequests.length > 0 && <span aria-label={`${pendingRequests.length} pending requests`} style={{ position:'absolute', top:7, right:7, width:7, height:7, borderRadius:'50%', background:RED }} />}</button>
            <button
              onClick={toggleTheme}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{ flexShrink:0, width:40, height:40, borderRadius:12, background:CARD, border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'background 150ms' }}
              onMouseEnter={e => e.currentTarget.style.background = CARD2}
              onMouseLeave={e => e.currentTarget.style.background = CARD}
            >
              {isDarkMode
                ? <Sun size={17} color="#D18A00" />
                : <Moon size={17} color={MUTED} />}
            </button>
          </div>
        </header>
      )}

      {/* ── Body row: sidebar + content ─────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

      {/* ── DESKTOP SIDEBAR — persistent, always visible ≥768px ─────────── */}
      {!isMobile && (
        <aside aria-label="Concierge workspace navigation" style={{ width:sidebarCollapsed?80:272, minWidth:sidebarCollapsed?80:272, background:BG, borderRight:`1px solid ${BORDER}`, padding:12, display:'flex', flexDirection:'column', overflow:'hidden', zIndex:10, flexShrink:0, height:'100%', transition:'width 220ms ease, min-width 220ms ease' }}>
          <div style={{ minHeight:0, flex:1, display:'flex', flexDirection:'column', background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, boxShadow:'0 2px 8px rgba(0,0,0,.035)', overflow:'hidden' }}>{renderSidebarContent(false)}</div>
        </aside>
      )}

      {/* ── MOBILE DRAWER — overlay, <768px ──────────────────────────────── */}
      {isMobile && (
        <>
          {/* Mobile header */}
          {!sidebarOpen && (
            <div style={{ position:'fixed', top:0, left:0, right:0, background:CARD, borderBottom:`1px solid ${BORDER}`, boxShadow:'0 2px 10px rgba(0,0,0,.03)', zIndex:48 }}>
              {/* Top row */}
              <div style={{ height:64, display:'flex', alignItems:'center', padding:'0 14px', gap:10 }}>
              <button aria-label="Open navigation menu" onClick={() => setSidebarOpen(true)}
                  style={{ width:40, height:40, borderRadius:12, border:`1px solid ${BORDER}`, background:CARD, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                  <Menu size={20} color={TEXT} />
                </button>
                <div style={{ flex:1, minWidth:0, textAlign:'center', fontFamily:INTER, fontSize:14, fontWeight:750, color:TEXT, letterSpacing:'-.01em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {propertyName}
                </div>
                <button aria-label={showSearch ? 'Close search' : 'Open search'} onClick={() => { setShowSearch(s => !s); setSearchQuery(''); }}
                  style={{ width:40, height:40, borderRadius:12, border:`1px solid ${showSearch?BLUE:BORDER}`, background:showSearch?`${BLUE}10`:CARD, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                  {showSearch ? <X size={18} color={BLUE} /> : <Search size={18} color={TEXT} />}
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
                  style={{ position:'fixed', left:0, top:0, bottom:0, width:272, padding:12, background:BG, borderRight:`1px solid ${BORDER}`, zIndex:55, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                  <div style={{ minHeight:0, flex:1, display:'flex', flexDirection:'column', background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, boxShadow:'0 8px 30px rgba(0,0,0,.12)', overflow:'hidden' }}>{renderSidebarContent(true)}</div>
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
            Reconnected — syncing {queueLen} queued {queueLen === 1 ? 'entry' : 'entries'}…
          </span>
        </div>
      )}

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, background: BG, display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0 }}>

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
                  position: 'fixed', right: 0, top: 0, bottom: 0,
                  ...(activeTab === 'calendar'
                    ? (isPhone || isMobile ? {left:0} : { left: sidebarCollapsed ? 64 : 248, borderLeft: `1px solid ${BORDER}` })
                    : (isPhone || isMobile ? {left:0} : { width: Math.min(720, window.innerWidth - 280), borderLeft: `1px solid ${BORDER}` })),
                  background: BG, zIndex: 66,
                  display: 'flex', flexDirection: 'column',
                  borderRadius: 0, overflow: 'hidden',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
                }}>

                {/* Panel title bar — operational sections use the New Task drawer treatment */}
                <div style={{
                  // Only workflow-capable operational drawers can suppress this
                  // header. This prevents a stale child state from affecting the
                  // guest list (or any other panel) after navigation.
                  display: ['sops', 'training', 'loaners', 'tours', 'incident', 'packages'].includes(activeTab) || (sectionWorkflow && ['guests', 'lockout', 'vendors'].includes(activeTab)) ? 'none' : 'flex',
                  background: ['sops', 'training'].includes(activeTab) ? 'transparent' : CARD,
                  borderBottom: ['sops', 'training'].includes(activeTab) || ['requests', 'packages', 'guests', 'lockout', 'vendors'].includes(activeTab) ? 'none' : `1px solid ${BORDER}`,
                  padding: ['sops', 'training'].includes(activeTab) ? (isMobile ? 12 : 18) : (['requests', 'packages', 'guests', 'lockout', 'vendors', 'calendar'].includes(activeTab) ? (isMobile ? '20px 20px 17px' : '26px 30px 20px') : (isMobile ? '22px 20px 18px' : '30px 32px 24px')), flexShrink: 0,
                  alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
                  ...(['sops', 'training'].includes(activeTab) ? { position:'absolute', top:0, right:0, zIndex:2 } : {}),
                }}>
                  {!['sops', 'training'].includes(activeTab) && <div style={{ minWidth: 0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:11 }}><span style={{ width:24, height:2, background:BLUE }} /><span style={{ fontFamily: INTER, fontSize: 9, fontWeight: 800, color: BLUE, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{propertyName}</span></div>
                    <h2 style={{ fontFamily: INTER, fontSize: ['requests', 'packages', 'guests', 'lockout', 'vendors', 'calendar'].includes(activeTab) ? (isMobile ? 28 : 34) : (isMobile ? 32 : 42), fontWeight: 800, color: TEXT, margin: 0, letterSpacing: '-0.045em', lineHeight: 0.98 }}>
                      {PAGE_TITLES[activeTab] || activeTab}
                    </h2>
                    {PAGE_SUBTITLES[activeTab] && (
                      <p style={{ fontFamily: INTER, fontSize: activeTab==='calendar'?12:15, color: MUTED, margin: '9px 0 0', lineHeight: 1.5 }}>
                        {PAGE_SUBTITLES[activeTab]}
                      </p>
                    )}
                  </div>}
                  <button onClick={() => handleTabChange('home')} aria-label="Close panel" data-testid="panel-close-btn"
                    style={{ width:44, height:44, borderRadius:999, border:`1px solid ${BORDER}`, background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                    <X size={19} color={TEXT} strokeWidth={2} />
                  </button>
                </div>

                {/* Panel content — contained */}
                <div className="panel-enter" style={{
                  flex: 1,
                  // These drawers own their scrolling region and fixed action
                  // footer. Keeping a second scrolling container here caused
                  // their top summary cards to be compressed.
                  overflow: ['sops', 'training', 'requests', 'packages', 'guests', 'lockout', 'vendors', 'loaners', 'tours', 'incident'].includes(activeTab) ? 'hidden' : 'auto',
                  display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative'
                }}>
                  {activeTab === 'requests'      && renderRequestsContent()}
                  {activeTab === 'packages'      && <PackageDashboard propertyName={propertyName} isPhone={isPhone} onClose={() => handleTabChange('home')} onWorkflowChange={setSectionWorkflow} onActivityLogged={entry => handleSectionActivityLogged({ ...entry, sourceSection: 'packages' })} />}
                  {activeTab === 'loaners'       && <LoanersDashboard propertyName={propertyName} isPhone={isPhone} onClose={() => handleTabChange('home')} onActivityLogged={entry => handleSectionActivityLogged({ ...entry, sourceSection: 'loaners' })} />}
                  {activeTab === 'lockout'       && <LockoutPage propertyName={propertyName} isPhone={isPhone} onWorkflowChange={setSectionWorkflow} onActivityLogged={entry => handleSectionActivityLogged({ ...entry, sourceSection: 'lockout' })} />}
                  {activeTab === 'incident'      && <IncidentReportPage patientName={propertyName} incidents={incidents} isPhone={isPhone} onClose={() => handleTabChange('home')} onAddIncident={async (inc) => {
                    try {
                      const saved = await authApi.createIncident(inc);
                      if (saved.incident_id && inc.photos?.length) {
                        incidentPhotos.current[saved.incident_id] = inc.photos.map(p => p.url);
                        try { localStorage.setItem('_incPhotos', JSON.stringify(incidentPhotos.current)); } catch {}
                      }
                      const withPhotos = { ...saved, photos: inc.photos || [] };
                      setIncidents(prev => {
                        const exists = prev.some(i => i.incident_id === saved.incident_id);
                        if (exists) return prev.map(i => i.incident_id === saved.incident_id ? withPhotos : i);
                        return [withPhotos, ...prev];
                      });
                      handleTabChange('home');
                      setDarReceipt({ title: inc.description || inc.title || inc.type || 'Incident report', detail: 'Incident filed and linked to this shift’s DAR' });
                      setTimeout(() => setDarReceipt(null), 4200);
                    } catch (error) {
                      throw error;
                    }
                  }} />}
                  {activeTab === 'tours'         && <ToursDashboard propertyName={propertyName} isPhone={isPhone} onClose={() => handleTabChange('home')} onWorkflowChange={setSectionWorkflow} onActivityLogged={entry => handleSectionActivityLogged({ ...entry, sourceSection: 'tours' })} />}
                  {activeTab === 'vendors'       && <VendorsDashboard propertyName={propertyName} isPhone={isPhone} onWorkflowChange={setSectionWorkflow} onActivityLogged={entry => handleSectionActivityLogged({ ...entry, sourceSection: 'vendors' })} />}
                  {activeTab === 'guests'        && <GuestsDashboard propertyName={propertyName} isPhone={isPhone} onWorkflowChange={setSectionWorkflow} onActivityLogged={entry => handleSectionActivityLogged({ ...entry, sourceSection: 'guests' })} />}
                  {activeTab === 'calendar'      && renderShifts()}
                  {activeTab === 'shift-history' && <HistoryPage />}
                  {activeTab === 'profile'       && renderProfileContent()}
                  {activeTab === 'messages'      && <TeamMessagesPage />}
                  {activeTab === 'settings'      && renderSettingsContent()}
                  {activeTab === 'sops'          && renderSOPs()}
                  {activeTab === 'training'      && renderTrainingContent()}
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
                position: 'fixed', right: 0, top: 0, bottom: 0,
                ...(isPhone || isMobile ? {left:0} : {width:Math.min(720, window.innerWidth-280), borderLeft:`1px solid ${BORDER}`}),
                background: CARD, zIndex: 68,
                display: 'flex', flexDirection: 'column',
                borderRadius: 0, overflow: 'hidden',
                boxShadow: '0 24px 64px rgba(0,0,0,0.20)',
              }}>
              <TaskCompletionModal task={selectedTask} onClose={() => setSelectedTask(null)} onComplete={handleCompleteTask} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Shift Summary modal */}
      {/* ── End-Shift Handoff drawer ─────────────────────────────────────── */}
      <AnimatePresence>
        {showHandover && activeTab !== 'home' && (
          <>
            <motion.div key="ho-bg"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => !handoverSaving && setShowHandover(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 67, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(2px)' }} />
            <motion.div key="ho-panel"
              role="dialog" aria-modal="true" aria-label="End shift handoff"
              initial={{ x: '110%' }} animate={{ x: 0 }} exit={{ x: '110%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
              style={{ position: 'fixed', right: 0, top: 0, bottom: 0, ...(isPhone || isMobile ? {left:0} : {width:Math.min(720, window.innerWidth-280), borderLeft:`1px solid ${BORDER}`}), background: BG, zIndex: 68, display: 'flex', flexDirection: 'column', borderRadius: 0, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>

              {/* Header — editorial */}
              <div style={{ padding: isMobile ? '22px 20px 18px' : '30px 32px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, borderBottom: `1px solid ${BORDER}`, background: BG, flexShrink: 0 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: INTER, fontSize: 12, fontWeight: 800, color: BLUE, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>{propertyName}</div>
                  <h2 style={{ fontFamily: INTER, fontSize: isMobile ? 32 : 42, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: '-0.045em', lineHeight: 0.95 }}>Shift Handoff</h2>
                  <p style={{ fontFamily: INTER, fontSize: 15, color: MUTED, margin: '10px 0 0', lineHeight: 1.5 }}>Brief the next shift before you clock out</p>
                </div>
                <button onClick={() => setShowHandover(false)} aria-label="Close" data-testid="handover-close-btn"
                  style={{ width: 44, height: 44, borderRadius: 999, border: `1px solid ${BORDER}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <X size={19} color={TEXT} />
                </button>
              </div>

              {/* Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 20px 40px' : '28px 32px 48px', display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Shift recap — dark editorial chapter card */}
                <div style={{ background: '#0b0b0b', borderRadius: 16, padding: isMobile ? '20px' : '24px 28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <span style={{ width: 28, height: 2, background: BLUE, display: 'inline-block' }} />
                    <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.24em', textTransform: 'uppercase' }}>Your shift at a glance</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                    {[
                      { label: 'On duty since', value: shiftStartTime || '—' },
                      { label: 'Tasks logged', value: String(selfTasks.length) },
                      { label: 'Open requests', value: String(tasks.filter(t => t.status !== TaskStatus.COMPLETED && t.status !== 'completed').length) },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div style={{ fontFamily: INTER, fontSize: isMobile ? 20 : 26, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
                        <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Handoff notes */}
                <div>
                  <label htmlFor="handover-notes" style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, display: 'block', marginBottom: 4 }}>Handoff notes</label>
                  <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: '0 0 10px', lineHeight: 1.5 }}>What should the next concierge know the moment they sit down?</p>
                  <textarea
                    id="handover-notes"
                    data-testid="handover-notes-input"
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    placeholder="e.g. HVAC tech expected around 8 PM — let them into the mechanical room. Resident in 402 is waiting on an oversized delivery."
                    rows={5}
                    style={{ width: '100%', boxSizing: 'border-box', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 16px', fontFamily: INTER, fontSize: 16, color: TEXT, lineHeight: 1.6, outline: 'none', resize: 'vertical' }}
                    onFocus={(e) => { e.target.style.borderColor = BLUE; }}
                    onBlur={(e) => { e.target.style.borderColor = BORDER; }}
                  />
                </div>

                {/* Open items */}
                <div>
                  <label htmlFor="handover-items" style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, display: 'block', marginBottom: 4 }}>Open items <span style={{ fontWeight: 500, color: MUTED }}>(optional)</span></label>
                  <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: '0 0 10px', lineHeight: 1.5 }}>Unfinished follow-ups — one per line. They appear as a checklist in the next shift's briefing.</p>
                  <textarea
                    id="handover-items"
                    data-testid="handover-items-input"
                    value={handoverItems}
                    onChange={(e) => setHandoverItems(e.target.value)}
                    placeholder={"Follow up on unit 233 noise complaint\nRelease package #4412 to unit 108"}
                    rows={3}
                    style={{ width: '100%', boxSizing: 'border-box', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 16px', fontFamily: INTER, fontSize: 16, color: TEXT, lineHeight: 1.6, outline: 'none', resize: 'vertical' }}
                    onFocus={(e) => { e.target.style.borderColor = BLUE; }}
                    onBlur={(e) => { e.target.style.borderColor = BORDER; }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: isMobile ? '12px 20px 20px' : '16px 32px 24px', background: CARD, borderTop: `1px solid ${BORDER}`, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => submitHandover(false)}
                  disabled={handoverSaving}
                  data-testid="handover-submit-btn"
                  style={{ width: '100%', minHeight: 52, background: BLUE, border: 'none', borderRadius: 14, fontFamily: INTER, fontSize: 16, fontWeight: 700, color: 'white', cursor: handoverSaving ? 'not-allowed' : 'pointer', opacity: handoverSaving ? 0.55 : 1, boxShadow: handoverSaving ? 'none' : `0 8px 24px ${BLUE}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {handoverSaving ? 'Ending shift…' : (<><LogOut size={17} /> End Shift & Send Handoff</>)}
                </button>
                <button
                  onClick={() => submitHandover(true)}
                  disabled={handoverSaving}
                  data-testid="handover-skip-btn"
                  style={{ width: '100%', minHeight: 44, background: 'transparent', border: 'none', fontFamily: INTER, fontSize: 13, fontWeight: 600, color: MUTED, cursor: handoverSaving ? 'not-allowed' : 'pointer' }}>
                  End shift without notes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showSummary && (
        <>
          <div onClick={() => setShowSummary(false)} style={{ position:'fixed', inset:0, zIndex:90, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)' }} />
          <div role="dialog" aria-modal="true" aria-label="AI shift summary" style={{ position:'fixed', left:'50%', top:'50%', transform:'translate(-50%,-50%)', zIndex:91, width: isPhone ? 'calc(100% - 32px)' : 560, maxHeight: '82vh', background:BG, borderRadius:20, display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.25)', border:`1px solid ${BORDER}` }}>
            <div style={{ padding: isPhone ? '20px 20px 16px' : '26px 28px 20px', borderBottom:`1px solid ${BORDER}`, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
              <div style={{ minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                  <Sparkles size={13} color={BLUE} />
                  <span style={{ fontFamily:INTER, fontSize:11, fontWeight:800, color:BLUE, letterSpacing:'0.18em', textTransform:'uppercase' }}>AI Summary</span>
                </div>
                <div style={{ fontFamily:INTER, fontSize: isPhone ? 26 : 30, fontWeight:800, color:TEXT, letterSpacing:'-0.04em', lineHeight:0.97 }}>Shift Summary</div>
                <div style={{ fontFamily:INTER, fontSize:14, color:MUTED, marginTop:8 }}>Ready to copy or share with the next shift</div>
              </div>
              <button onClick={() => setShowSummary(false)} aria-label="Close" style={{ width:44, height:44, borderRadius:999, border:`1px solid ${BORDER}`, background:BG, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                <X size={18} color={TEXT} />
              </button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding: isPhone ? 20 : '24px 28px' }}>
              <pre style={{ fontFamily:INTER, fontSize:13, color:TEXT, lineHeight:1.7, whiteSpace:'pre-wrap', wordBreak:'break-word', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14, padding:18, margin:0 }}>{summaryText}</pre>
            </div>
            <div style={{ padding: isPhone ? '14px 20px 18px' : '16px 28px 22px', borderTop:`1px solid ${BORDER}`, display:'flex', gap:10, background:CARD }}>
              <button onClick={() => { navigator.clipboard.writeText(summaryText).then(() => { setSummaryCopied(true); setTimeout(() => setSummaryCopied(false), 2500); }); }}
                style={{ flex:1, minHeight:48, background: summaryCopied ? GREEN : BLUE, border:'none', borderRadius:14, fontFamily:INTER, fontSize:15, fontWeight:700, color:'white', cursor:'pointer', boxShadow: summaryCopied ? 'none' : `0 8px 24px ${BLUE}40` }}>
                {summaryCopied ? '✓ Copied!' : 'Copy Summary'}
              </button>
              <a href={`sms:?body=${encodeURIComponent(summaryText)}`}
                style={{ flex:1, minHeight:48, background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14, fontFamily:INTER, fontSize:15, fontWeight:700, color:TEXT, cursor:'pointer', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
                Send SMS
              </a>
            </div>
          </div>
        </>
      )}

      {/* AI Copilot */}
      <AICopilot isOpen={showCopilot} onClose={() => setShowCopilot(false)} role="concierge" patientName={propertyName} />

      {/* Clock alert */}
      <AnimatePresence>
        {showClockAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}
            data-testid="clock-alert-modal">
            <motion.div initial={{ scale: 0.88, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.88, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              style={{ ...glass(), borderRadius: 24, margin: '0 20px', maxWidth: 360, width: '100%', overflow: 'hidden' }}>
              {/* Colored top band — success stays green, shift end is editorial dark */}
              <div style={{ background: clockAlertTitle === 'Clocked In' ? GREEN : '#0b0b0b', padding: '28px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: clockAlertTitle === 'Clocked In' ? 'rgba(255,255,255,0.22)' : 'rgba(255,56,92,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {clockAlertTitle === 'Clocked In' ? <Check size={36} color="white" strokeWidth={2.5} /> : <LogOut size={34} color={BLUE} strokeWidth={2} />}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: INTER, fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: 4 }}>{clockAlertTitle}</div>
                  <p style={{ fontFamily: INTER, fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.55, margin: 0 }}>{clockAlertMsg}</p>
                </div>
              </div>
              {/* Action */}
              <div style={{ padding: '16px 20px 20px', background: CARD }}>
                <button onClick={() => setShowClockAlert(false)} data-testid="clock-alert-ok-btn"
                  style={{ width: '100%', padding: '14px 0', background: clockAlertTitle === 'Clocked In' ? GREEN : BLUE, border: 'none', borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: `0 6px 20px ${clockAlertTitle === 'Clocked In' ? GREEN : BLUE}50` }}>
                  Got it
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
              style={{ position: 'fixed', right: 0, top: 0, bottom: 0, ...(isPhone || isMobile ? {left:0} : {width:Math.min(720, window.innerWidth-280), borderLeft:`1px solid ${BORDER}`}), background: BG, zIndex: 66, display: 'flex', flexDirection: 'column', borderRadius: 0, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.20)' }}>

              {/* Header */}
              <div style={{ padding: isMobile ? '22px 20px 18px' : '28px 32px 22px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER}`, background: BG, flexShrink: 0 }}>
                <div>
                  <div style={{ fontFamily: INTER, fontSize: 12, fontWeight: 800, color: BLUE, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>{propertyName}</div>
                  <h2 style={{ fontFamily: INTER, fontSize: isMobile ? 28 : 34, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: '-0.04em', lineHeight: 0.97 }}>Emergency Contacts</h2>
                </div>
                <button onClick={() => setShowContacts(false)}
                  style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${BORDER}`, background: CARD, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <X size={18} color={MUTED} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 20px 40px' : '28px 32px 48px', display: 'flex', flexDirection: 'column', gap: 28 }}>

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
                position: 'fixed', right: 0, top: 0, bottom: 0,
                ...(isPhone || isMobile ? {left:0} : {width:Math.min(720, window.innerWidth-280), borderLeft:`1px solid ${BORDER}`}),
                background: CARD, zIndex: 66,
                display: 'flex', flexDirection: 'column',
                borderRadius: 0,
                boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
                overflow: 'hidden',
              }}>

              {/* Wizard header — editorial document drawer */}
              <div style={{ flexShrink: 0, background: CARD, borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ padding: isMobile ? '20px 20px 14px' : '26px 30px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:11 }}><span style={{ width:24, height:2, background:BLUE }} /><span style={{ fontFamily: INTER, fontSize: 9, fontWeight: 800, color: BLUE, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{propertyName}</span></div>
                    <div style={{ fontFamily: INTER, fontSize: isMobile ? 28 : 34, fontWeight: 800, color: TEXT, letterSpacing: '-0.045em', lineHeight: 0.98 }}>
                      {ntStep === 1 ? 'Describe the task' : ntStep === 2 ? 'Choose a category' : 'Priority & details'}
                    </div>
                    <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginTop: 9 }}>Step {ntStep} of 3 · New DAR entry</div>
                  </div>
                  <button onClick={() => { setShowNewTask(false); setNtStep(1); setNTF({ title: '', category: '', notes: '', location: '', priority: 'normal', dueDate: '' }); }}
                    aria-label="Close"
                    style={{ width: 44, height: 44, borderRadius: 999, border: `1px solid ${BORDER}`, background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <X size={19} color={TEXT} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 5, padding: isMobile ? '0 20px 16px' : '0 30px 20px' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= ntStep ? BLUE : BORDER, transition: 'background 200ms' }} />
                  ))}
                </div>
              </div>

              {/* Step content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '18px' : '24px 28px', display: 'flex', flexDirection: 'column', gap: 18, background: BG }}>

                {/* ── Step 1: Describe ── */}
                {ntStep === 1 && (
                  <>
                    <div style={{ display:'grid', gridTemplateColumns:isPhone?'1fr':'1fr 1fr', border:`1px solid ${BORDER}`, borderRadius:14, background:CARD, overflow:'hidden', boxShadow:SHADOW }}>
                      <div style={{ minHeight:64, padding:'11px 14px', display:'flex', alignItems:'center', gap:11, borderRight:isPhone?'none':`1px solid ${BORDER}`, borderBottom:isPhone?`1px solid ${BORDER}`:'none' }}>
                        <div style={{ width:34, height:34, borderRadius:10, background:`${BLUE}12`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:BLUE }}>{(authUser?.name||'C').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</span></div>
                        <div><p style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:MUTED, textTransform:'uppercase', letterSpacing:'.14em', margin:'0 0 4px' }}>Assignee</p><span style={{ fontFamily:INTER, fontSize:13, fontWeight:750, color:TEXT }}>{(authUser?.name || 'Concierge').split(' ')[0]}</span></div>
                      </div>
                      <div style={{ minHeight:64, padding:'11px 14px', display:'flex', alignItems:'center', gap:11 }}>
                        <div style={{ width:34, height:34, borderRadius:10, background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Clock size={15} color={BLUE} /></div>
                        <div><p style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:MUTED, textTransform:'uppercase', letterSpacing:'.14em', margin:'0 0 4px' }}>Time</p><span style={{ fontFamily:INTER, fontSize:13, fontWeight:750, color:TEXT }}>{nowStr()}</span></div>
                      </div>
                    </div>
                    <section style={{ border:`1px solid ${BORDER}`, borderRadius:16, background:CARD, padding:isPhone?'16px':'20px', boxShadow:SHADOW }}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:13 }}>
                        <div><div style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:BLUE, letterSpacing:'.16em', textTransform:'uppercase', marginBottom:6 }}>01 · Required</div><h3 style={{ fontFamily:INTER, fontSize:18, fontWeight:800, color:TEXT, letterSpacing:'-.025em', margin:0 }}>What happened?</h3></div>
                        <span style={{ fontFamily:INTER, fontSize:10, color:MUTED, textAlign:'right', lineHeight:1.4 }}>Write it as it should<br/>appear in the DAR</span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <textarea
                          placeholder="Example: Assisted maintenance with the P2 shut-off valve and documented the completed inspection."
                          value={ntForm.title + (ntTitleInterim ? (ntForm.title ? ' ' : '') + ntTitleInterim : '')}
                          onChange={e => setNTF(p => ({ ...p, title: e.target.value }))}
                          rows={isPhone ? 5 : 7}
                          autoFocus={!isPhone}
                          style={{
                            width: '100%', padding: '16px 46px 16px 16px', borderRadius: 12,
                            border: `1.5px solid ${ntForm.title ? BLUE : BORDER}`,
                            fontFamily: INTER, fontSize: 16, color: TEXT,
                            background: ntForm.title ? 'rgba(255,56,92,0.025)' : CARD2,
                            outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6,
                            transition: 'border-color 0.15s',
                          }} />
                        <MicButton onTranscript={t => setNTF(p => ({ ...p, title: p.title ? p.title + ' ' + t : t }))} onInterim={setNtTitleInterim} />
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', gap:12, marginTop:9 }}><span style={{ fontFamily:INTER, fontSize:10, color:MUTED }}>Use names, unit, location, action, and outcome when relevant.</span><span style={{ fontFamily:INTER, fontSize:10, fontWeight:700, color:ntForm.title.length>300?ORANGE:MUTED }}>{ntForm.title.length}</span></div>
                    </section>
                  </>
                )}

                {/* ── Step 2: Category ── */}
                {ntStep === 2 && <>
                  <div style={{ marginBottom:2 }}><div style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:BLUE, letterSpacing:'.16em', textTransform:'uppercase', marginBottom:6 }}>02 · Classification</div><h3 style={{ fontFamily:INTER, fontSize:20, fontWeight:800, color:TEXT, letterSpacing:'-.03em', margin:'0 0 5px' }}>Where does this belong?</h3><p style={{ fontFamily:INTER, fontSize:12, color:MUTED, lineHeight:1.5, margin:0 }}>Choose one category so the entry lands in the correct DAR section.</p></div>
                  <div style={{ display:'grid', gridTemplateColumns:isPhone?'1fr':'repeat(2,minmax(0,1fr))', gap:9 }}>
                  {TASK_CATEGORY_CONFIG.map(({ id, Icon, desc }, categoryIndex) => {
                  const sel = ntForm.category === id;
                  return (
                    <button key={id} onClick={() => setNTF(p => ({ ...p, category: sel ? '' : id }))}
                      style={{
                        minHeight:92, display:'grid', gridTemplateColumns:'36px 1fr 22px', alignItems:'center', gap:11, padding:'13px',
                        borderRadius: 14, border: `1.5px solid ${sel ? BLUE : BORDER}`,
                        background: sel ? 'rgba(255,56,92,0.045)' : CARD,
                        cursor: 'pointer', textAlign: 'left', width: '100%',
                        boxShadow: sel ? '0 5px 18px rgba(255,56,92,0.10)' : SHADOW,
                        transition: 'all 150ms',
                      }}>
                      <div style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', background:sel?'rgba(255,56,92,.12)':CARD2, position:'relative' }}>
                        <Icon size={18} color={sel ? BLUE : MUTED} />
                        <span style={{ position:'absolute', top:-6, left:-6, fontFamily:INTER, fontSize:7, fontWeight:800, color:sel?BLUE:MUTED }}>{String(categoryIndex+1).padStart(2,'0')}</span>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: INTER, fontSize: 13, fontWeight: 750, color: TEXT, marginBottom: 4 }}>{id}</div>
                        <div style={{ fontFamily: INTER, fontSize: 11, color: MUTED, lineHeight:1.4 }}>{desc}</div>
                      </div>
                      {sel && (
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Check size={13} color="white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
                  </div>
                </>}

                {/* ── Step 3: Priority & details ── */}
                {ntStep === 3 && (
                  <>
                    <div><div style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:BLUE, letterSpacing:'.16em', textTransform:'uppercase', marginBottom:6 }}>03 · Routing details</div><h3 style={{ fontFamily:INTER, fontSize:20, fontWeight:800, color:TEXT, letterSpacing:'-.03em', margin:'0 0 5px' }}>Set the operational context</h3><p style={{ fontFamily:INTER, fontSize:12, color:MUTED, lineHeight:1.5, margin:0 }}>Add only the details the next concierge or manager will need.</p></div>
                    <section style={{ border:`1px solid ${BORDER}`, borderRadius:16, background:CARD, padding:isPhone?'15px':'18px', boxShadow:SHADOW }}>
                      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:12, marginBottom:12 }}><h3 style={{ fontFamily: INTER, fontSize: 15, fontWeight: 800, color: TEXT, margin:0 }}>Priority</h3><span style={{ fontFamily:INTER, fontSize:10, color:MUTED }}>How quickly does this need attention?</span></div>
                      <div style={{ display:'grid', gridTemplateColumns:isPhone?'1fr':'repeat(3,minmax(0,1fr))', gap:8 }}>
                        {[
                          { val: 'normal', label: 'Normal', desc: 'Routine task, no rush',    Icon: CheckCircle,   color: GREEN  },
                          { val: 'high',   label: 'High',   desc: 'Needs attention soon',      Icon: AlertTriangle, color: ORANGE },
                          { val: 'urgent', label: 'Urgent', desc: 'Address immediately',       Icon: Zap,           color: RED    },
                        ].map(({ val, label, desc, Icon, color }) => {
                          const sel = ntForm.priority === val;
                          return (
                            <button key={val} onClick={() => setNTF(p => ({ ...p, priority: val }))}
                              style={{
                                minHeight:isPhone?68:112, display:'flex', flexDirection:isPhone?'row':'column', alignItems:isPhone?'center':'flex-start', justifyContent:'center', gap:isPhone?11:8, padding:'12px',
                                borderRadius: 12, border: `1.5px solid ${sel ? color : BORDER}`,
                                background: sel ? `${color}0D` : CARD,
                                cursor: 'pointer', textAlign: 'left', width: '100%',
                                boxShadow: sel ? `0 4px 14px ${color}18` : 'none',
                                transition: 'all 150ms',
                              }}>
                              <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:sel?`${color}18`:CARD2 }}>
                                <Icon size={16} color={sel ? color : MUTED} />
                              </div>
                              <div style={{ flex:isPhone?1:'none', minWidth:0 }}>
                                <div style={{ fontFamily: INTER, fontSize: 13, fontWeight: 750, color: TEXT, marginBottom: 3 }}>{label}</div>
                                <div style={{ fontFamily: INTER, fontSize: 10, color: MUTED, lineHeight:1.35 }}>{desc}</div>
                              </div>
                              {sel && isPhone && (
                                <div style={{ width: 22, height: 22, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <Check size={13} color="white" strokeWidth={3} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                    <section style={{ border:`1px solid ${BORDER}`, borderRadius:16, background:CARD, padding:isPhone?'15px':'18px', boxShadow:SHADOW, display:'grid', gap:17 }}>
                    <div>
                      <label htmlFor="new-task-location" style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:12, fontFamily: INTER, fontSize: 14, fontWeight: 800, color: TEXT, margin: '0 0 9px' }}><span>Location / Unit</span><span style={{ fontWeight: 500, fontSize: 10, color: MUTED, textTransform:'uppercase', letterSpacing:'.12em' }}>Optional</span></label>
                      <input type="text" placeholder="e.g. Unit 412, Lobby, P2 Garage…"
                        id="new-task-location"
                        value={ntForm.location} onChange={e => setNTF(p => ({ ...p, location: e.target.value }))}
                        style={{ width: '100%', minHeight:48, padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${ntForm.location ? BLUE : BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: ntForm.location ? 'rgba(255,56,92,0.025)' : CARD2, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }} />
                    </div>
                    <div>
                      <label htmlFor="new-task-notes" style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:12, fontFamily: INTER, fontSize: 14, fontWeight: 800, color: TEXT, margin: '0 0 9px' }}><span>Entry notes</span><span style={{ fontWeight: 500, fontSize: 10, color: MUTED, textTransform:'uppercase', letterSpacing:'.12em' }}>Optional</span></label>
                      <div style={{ position: 'relative' }}>
                        <textarea placeholder="Resident name, outcome, follow-up needed…"
                          id="new-task-notes"
                          value={ntForm.notes + (ntNotesInterim ? (ntForm.notes ? ' ' : '') + ntNotesInterim : '')} onChange={e => setNTF(p => ({ ...p, notes: e.target.value }))}
                          rows={3}
                          style={{ width: '100%', padding: '13px 44px 13px 14px', borderRadius: 12, border: `1.5px solid ${BORDER}`, fontFamily: INTER, fontSize: 16, color: TEXT, background: CARD2, outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight:1.5 }} />
                        <MicButton onTranscript={t => setNTF(p => ({ ...p, notes: p.notes ? p.notes + ' ' + t : t }))} onInterim={setNtNotesInterim} />
                      </div>
                    </div>
                    </section>
                    {/* Flag for Follow-up */}
                    <button onClick={() => setNTF(p => ({ ...p, flagFollowUp: !p.flagFollowUp }))}
                      aria-pressed={ntForm.flagFollowUp}
                      style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 15px', borderRadius: 14, border: `1.5px solid ${ntForm.flagFollowUp ? ORANGE : BORDER}`, background: ntForm.flagFollowUp ? 'rgba(255,149,0,0.055)' : CARD, cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow:SHADOW }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: ntForm.flagFollowUp ? 'rgba(255,149,0,0.14)' : CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Flag size={18} color={ntForm.flagFollowUp ? ORANGE : MUTED} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: INTER, fontSize: 13, fontWeight: 750, color: TEXT }}>Carry into handoff</div>
                        <div style={{ fontFamily: INTER, fontSize: 11, color: MUTED, marginTop: 3 }}>Keep this item visible for follow-up and the next shift.</div>
                      </div>
                      <div style={{ width: 22, height: 22, borderRadius: 7, background: ntForm.flagFollowUp ? ORANGE : 'transparent', border: ntForm.flagFollowUp ? 'none' : `2px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {ntForm.flagFollowUp && <Check size={13} color="white" strokeWidth={3} />}
                      </div>
                    </button>
                  </>
                )}
              </div>

              {/* Wizard footer */}
              <div style={{ flexShrink: 0, background: CARD, borderTop: `1px solid ${BORDER}`, boxShadow:'0 -8px 24px rgba(0,0,0,.04)' }}>
                {ntError && (
                  <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={13} color={RED} />
                    <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 600, color: RED }}>{ntError}</span>
                  </div>
                )}
                <div style={{ padding: isPhone ? '12px 20px 30px' : '14px 28px 20px', display: 'flex', gap: 10 }}>
                  {ntStep > 1 && (
                    <button onClick={() => { setNtStep(p => p - 1); setNtError(''); }}
                      style={{ flex: 1, padding: '15px 0', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, cursor: 'pointer' }}>
                      Back
                    </button>
                  )}
                  {ntStep < 3 ? (
                      <button onClick={() => {
                        if (ntStep === 1 && !ntForm.title.trim()) { setNtError('Please describe what you did before continuing.'); return; }
                        if (ntStep === 2 && !ntForm.category) { setNtError('Choose the DAR category for this entry.'); return; }
                        setNtError(''); setNtStep(p => p + 1);
                      }}
                      style={{ flex: 1, minHeight:48, padding: '0 20px', background: BLUE, border: 'none', borderRadius: 999, fontFamily: INTER, fontSize: 14, fontWeight: 750, color: 'white', cursor: 'pointer', boxShadow: `0 7px 22px ${BLUE}28`, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      Continue <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button onClick={submitNewTask} disabled={ntSaving}
                      style={{ flex: 1, minHeight:48, padding: '0 20px', background: ntSaving ? MUTED : BLUE, border: 'none', borderRadius: 999, fontFamily: INTER, fontSize: 14, fontWeight: 750, color: 'white', cursor: ntSaving ? 'wait' : 'pointer', boxShadow: ntSaving ? 'none' : `0 7px 22px ${BLUE}28`, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      <Check size={16} /> {ntSaving ? 'Adding…' : 'Add to DAR'}
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
              style={{ position: 'fixed', right: 0, top: 0, bottom: 0, ...(isPhone || isMobile ? {left:0} : {width:Math.min(720, window.innerWidth-280), borderLeft:`1px solid ${BORDER}`}), background: BG, zIndex: 61, display: 'flex', flexDirection: 'column', borderRadius: 0, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.20)' }}>

              {/* Header */}
              <div style={{ background: BG, borderBottom: `1px solid ${BORDER}`, padding: isMobile ? '22px 20px 18px' : '28px 32px 22px', flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(255,56,92,0.10)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={22} color={BLUE} />
                  </div>
                  <div>
                    <p style={{ fontFamily: INTER, fontSize: 12, fontWeight: 800, color: BLUE, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '0 0 12px' }}>{propertyName}</p>
                    <h2 style={{ fontFamily: INTER, fontSize: isMobile ? 28 : 34, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: '-0.04em', lineHeight: 0.97 }}>Package Room Audit</h2>
                  </div>
                </div>
                <button onClick={() => setShowPkgAudit(false)}
                  style={{ width: 44, height: 44, borderRadius: 999, border: `1px solid ${BORDER}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
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
                        value={auditForm.notes + (auditNotesInterim ? (auditForm.notes ? ' ' : '') + auditNotesInterim : '')} onChange={e => setAuditForm(p => ({ ...p, notes: e.target.value }))} rows={3}
                        style={{ width: '100%', padding: '14px 44px 14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 14, color: TEXT, background: CARD2, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                      <MicButton onTranscript={t => setAuditForm(p => ({ ...p, notes: p.notes ? p.notes + ' ' + t : t }))} onInterim={setAuditNotesInterim} />
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
              style={{ position: 'fixed', right: 0, top: 0, bottom: 0, ...(isPhone || isMobile ? {left:0} : {width:Math.min(720, window.innerWidth-280), borderLeft:`1px solid ${BORDER}`}), background: BG, zIndex: 61, display: 'flex', flexDirection: 'column', borderRadius: 0, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.20)' }}>

              {/* Header */}
              <div style={{ background: BG, borderBottom: `1px solid ${BORDER}`, padding: isMobile ? '22px 20px 18px' : '28px 32px 22px', flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(255,56,92,0.10)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Waves size={22} color={BLUE} />
                  </div>
                  <div>
                    <p style={{ fontFamily: INTER, fontSize: 12, fontWeight: 800, color: BLUE, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '0 0 12px' }}>{propertyName}</p>
                    <h2 style={{ fontFamily: INTER, fontSize: isMobile ? 28 : 34, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: '-0.04em', lineHeight: 0.97 }}>Amenity Spaces</h2>
                  </div>
                </div>
                <button onClick={() => setShowAmenities(false)}
                  style={{ width: 44, height: 44, borderRadius: 999, border: `1px solid ${BORDER}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
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
              style={{ position: 'fixed', right: 0, top: 0, bottom: 0, ...(isPhone || isMobile ? {left:0} : {width:Math.min(720, window.innerWidth-280), borderLeft:`1px solid ${BORDER}`}), background: BG, zIndex: 61, display: 'flex', flexDirection: 'column', borderRadius: 0, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.20)' }}>

              {/* Header */}
              <div style={{ background: BG, borderBottom: `1px solid ${BORDER}`, padding: isMobile ? '22px 20px 18px' : '28px 32px 22px', flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(255,56,92,0.10)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DoorOpen size={22} color={BLUE} />
                  </div>
                  <div>
                    <p style={{ fontFamily: INTER, fontSize: 12, fontWeight: 800, color: BLUE, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '0 0 12px' }}>{propertyName}</p>
                    <h2 style={{ fontFamily: INTER, fontSize: isMobile ? 28 : 34, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: '-0.04em', lineHeight: 0.97 }}>Open Models</h2>
                  </div>
                </div>
                <button onClick={() => setShowModels(false)}
                  style={{ width: 44, height: 44, borderRadius: 999, border: `1px solid ${BORDER}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
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
              style={{ position: 'fixed', right: 0, top: 0, bottom: 0, ...(isPhone || isMobile ? {left:0} : {width:Math.min(720, window.innerWidth-280), borderLeft:`1px solid ${BORDER}`}), background: BG, zIndex: 61, display: 'flex', flexDirection: 'column', borderRadius: 0, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.20)' }}>

              {/* Header */}
              <div style={{ background: BG, borderBottom: `1px solid ${BORDER}`, padding: isMobile ? '22px 20px 18px' : '28px 32px 22px', flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(255,56,92,0.10)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={22} color={BLUE} />
                  </div>
                  <div>
                    <p style={{ fontFamily: INTER, fontSize: 12, fontWeight: 800, color: BLUE, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '0 0 12px' }}>{propertyName}</p>
                    <h2 style={{ fontFamily: INTER, fontSize: isMobile ? 28 : 34, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: '-0.04em', lineHeight: 0.97 }}>Move Activity</h2>
                  </div>
                </div>
                <button onClick={() => { setShowElevators(false); setShowElevForm(false); }}
                  style={{ width: 44, height: 44, borderRadius: 999, border: `1px solid ${BORDER}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
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

      {/* ── DAR Image Gallery Viewer ─────────────────────────────────────── */}
      <AnimatePresence>
        {gallery && (
          <motion.div key="gallery-viewer"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setGallery(null)}
            style={{ position:'fixed', inset:0, zIndex:201, background:'rgba(0,0,0,0.92)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
            <motion.div initial={{ scale:0.92, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.92, opacity:0 }}
              onClick={e => e.stopPropagation()}
              style={{ position:'relative', maxWidth:680, width:'100%', borderRadius:20, overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.5)' }}>
              <img src={gallery.urls[gallery.idx]} alt="Evidence" style={{ width:'100%', display:'block', maxHeight:'80vh', objectFit:'contain', background:'#111' }} />
              <button onClick={() => setGallery(null)}
                style={{ position:'absolute', top:12, right:12, width:36, height:36, borderRadius:'50%', background:'rgba(0,0,0,0.6)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <X size={18} color="white" />
              </button>
              {gallery.urls.length > 1 && (
                <>
                  <button onClick={() => setGallery(g => ({ ...g, idx:(g.idx - 1 + g.urls.length) % g.urls.length }))}
                    style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:36, height:36, borderRadius:'50%', background:'rgba(0,0,0,0.6)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                    <ChevronLeft size={18} color="white" />
                  </button>
                  <button onClick={() => setGallery(g => ({ ...g, idx:(g.idx + 1) % g.urls.length }))}
                    style={{ position:'absolute', right:54, top:'50%', transform:'translateY(-50%)', width:36, height:36, borderRadius:'50%', background:'rgba(0,0,0,0.6)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                    <ChevronRight size={18} color="white" />
                  </button>
                  <div style={{ position:'absolute', bottom:12, left:'50%', transform:'translateX(-50%)', background:'rgba(0,0,0,0.55)', borderRadius:12, padding:'3px 10px', fontFamily:INTER, fontSize:12, color:'white' }}>
                    {gallery.idx + 1} / {gallery.urls.length}
                  </div>
                </>
              )}
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
            {fullscreenItem._knowledgeType === 'training' ? (
              <button onClick={() => {
                setCompletedTraining(prev => {
                  const next = new Set(prev);
                  if (next.has(fullscreenItem.id)) next.delete(fullscreenItem.id); else next.add(fullscreenItem.id);
                  try { localStorage.setItem('_notedTrainingComplete', JSON.stringify([...next])); } catch {}
                  return next;
                });
              }} aria-pressed={completedTraining.has(fullscreenItem.id)} style={{ minHeight:42, padding:'0 15px', marginLeft:10, borderRadius:999, border:`1px solid ${completedTraining.has(fullscreenItem.id)?GREEN:'rgba(255,255,255,.22)'}`, background:completedTraining.has(fullscreenItem.id)?GREEN:'rgba(255,255,255,.10)', color:'white', fontFamily:INTER, fontSize:11, fontWeight:750, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:7 }}><Check size={14}/>{completedTraining.has(fullscreenItem.id)?'Reviewed':'Mark reviewed'}</button>
            ) : <><span style={{ fontFamily:INTER, fontSize:12, color:'rgba(255,255,255,0.20)' }}>·</span><span style={{ fontFamily:INTER, fontSize:12, color:'rgba(255,255,255,0.35)' }}>Tap outside to close</span></>}
          </div>
        </div>
      )}


    </div>
  );
};

export default CaregiverDashboard;
