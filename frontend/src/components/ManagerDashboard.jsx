import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Calendar, Users, BookOpen, Settings,
  X, ChevronRight, ChevronLeft, Check, Plus,
  User, Package, Waves, Shield, Wrench, ClipboardList,
  HelpCircle, AlertTriangle, Truck,
  LogOut, Phone, Star, Building2, MapPin, ChevronDown,
  CheckCircle, Send, Mail, UserPlus, Archive, ArrowUpDown, Menu, Search, Clock, Bell, Sliders, Lock, ShoppingCart, UserCheck, KeyRound, Sun, Moon,
  Upload, FileText, Eye, EyeOff, Image,
  GraduationCap, Video, Play, Trash2,
} from 'lucide-react';
import { BUILDING_PROFILE, BUILDING_CONTACTS, BUILDING_SOPS } from '../services/mockData';
import { UserRole } from '../types';
import { authApi } from '../services/authApi';
import { useTheme } from '../context/ThemeContext';
import { useSharedData } from '../context/SharedDataContext';

/* ─── Static brand tokens ────────────────────────────────────────────────────── */
const GREEN  = '#34C759';
const BLUE   = '#FF385C';
const RED    = '#FF3B30';
const ORANGE = '#FF9500';
const INTER  = `'Inter','Plus Jakarta Sans',sans-serif`;
const MUTED  = '#717171'; // module-level fallback for static array icon colors

/* ─── Calendar helpers ───────────────────────────────────────────────────────── */
const MONTHS    = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_ABB = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_HDR   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const TODAY_STR = '2026-06-22';

const toDS = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

const getCalCells = (year, month) => {
  const first = new Date(year, month, 1).getDay();
  const last  = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= last; d++) cells.push({ day: d, dateStr: toDS(year, month, d) });
  return cells;
};

/* ─── Mock data ──────────────────────────────────────────────────────────────── */
const MANAGER = {
  name:              BUILDING_CONTACTS.propertyManager.name,
  title:             BUILDING_CONTACTS.propertyManager.title,
  company:           BUILDING_CONTACTS.propertyManager.company,
  initials:          'ST',
  avatar:            BUILDING_CONTACTS.propertyManager.avatar,
  phone:             BUILDING_CONTACTS.propertyManager.phone,
  email:             BUILDING_CONTACTS.propertyManager.email,
  available:         BUILDING_CONTACTS.propertyManager.available,
  rating:            4.8,
  yearsExperience:   8,
  propertiesManaged: 3,
  certifications:    ['CAM Certified', 'Fair Housing', 'OSHA 30-Hr'],
};

const INIT_TEAM = [
  { id:'c1', name:'George Nwachukwu', init:'GN', title:'Head Concierge', co:'Maverick Concierge Services', status:'on_shift', clockIn:'8:00 AM', phone:'(215) 555-0125', email:'george@maverick.com', shifts:847, rating:4.9, since:'Mar 2022'  },
  { id:'c2', name:'Kevin Thompson',   init:'KT', title:'Concierge',      co:'Maverick Concierge Services', status:'off_duty', lastShift:'Jun 21', phone:'(215) 555-0130', email:'kevin@maverick.com',  shifts:312, rating:4.7, since:'Nov 2023'  },
  { id:'c3', name:'Maria Santos',     init:'MS', title:'Concierge',      co:'Maverick Concierge Services', status:'off_duty', lastShift:'Jun 20', phone:'(215) 555-0131', email:'maria@maverick.com',  shifts:198, rating:4.8, since:'Feb 2024'  },
  { id:'c4', name:'David Kim',        init:'DK', title:'Concierge',      co:'Maverick Concierge Services', status:'invited',  invitedAt:'Jun 18', phone:'',               email:'david@maverick.com',  shifts:0,   rating:null, since:null        },
];

const CONCIERGE_SECTIONS = [
  { id:'home',      Icon:Home,          label:"Today's Tasks",     desc:'Daily task list and shift activity log',   color:BLUE,   required:true  },
  { id:'requests',  Icon:Bell,          label:'Requests',          desc:'Resident and visitor request log',         color:BLUE                   },
  { id:'packages',  Icon:Package,       label:'Packages',          desc:'Package delivery and pickup tracking',     color:ORANGE                 },
  { id:'guests',    Icon:UserCheck,     label:'Guests',            desc:'Guest check-in and arrival log',           color:GREEN                  },
  { id:'lockout',   Icon:Lock,          label:'Lockouts',          desc:'Key and access request documentation',     color:RED                    },
  { id:'vendors',   Icon:Wrench,        label:'Vendors',           desc:'Vendor and contractor access log',         color:MUTED                  },
  { id:'tours',     Icon:Users,         label:'Tours',             desc:'Property tour scheduling and log',         color:BLUE                   },
  { id:'loaners',   Icon:ShoppingCart,  label:'Loaners',           desc:'Equipment loan and return tracking',       color:ORANGE                 },
  { id:'incident',  Icon:AlertTriangle, label:'Incident Report',   desc:'Document property incidents formally',     color:RED                    },
  { id:'emergency', Icon:Phone,         label:'Emergency Contacts',desc:'Emergency contact directory access',       color:RED,    required:true  },
];

const DEFAULT_SECTIONS = Object.fromEntries(CONCIERGE_SECTIONS.map(s => [s.id, true]));

const mkAct = (items) => items.map((x, i) => ({ id: i + 1, ...x }));

const SHIFTS = {
  '2026-06-22': {
    concierge: { name:'George Nwachukwu', init:'GN', co:'Maverick Concierge Services' },
    clockIn:'8:00 AM', clockOut:null, status:'active', duration:'6h 45m (ongoing)',
    activities: mkAct([
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
    note: 'All systems operational. Package room at capacity ~noon — leasing notified. Unauthorized vehicle in P2 reported.',
    incidents: ['Unauthorized vehicle – P2','Package room at capacity'],
    metrics: { packages:4, guests:2, vendors:1, lockouts:1, tours:1 },
    leasingTeam: 'The Hannah Leasing',
  },
  '2026-06-21': {
    concierge: { name:'Kevin Thompson', init:'KT', co:'Maverick Concierge Services' },
    clockIn:'8:00 AM', clockOut:'4:00 PM', status:'completed', duration:'8h 0m',
    activities: mkAct([
      { time:'8:00 AM',  title:'Shift started',                           category:'Administrative',      notes:'GPS verified'                         },
      { time:'8:30 AM',  title:'Lobby Opening Check',                     category:'Administrative',      notes:'All clear · lights checked'           },
      { time:'9:00 AM',  title:'Package delivery · FedEx → Unit 108',    category:'Delivery',            notes:'1 package'                            },
      { time:'10:15 AM', title:'Gym opened',                              category:'Amenity',             notes:''                                     },
      { time:'10:45 AM', title:'Vendor check-in · HVAC Services',         category:'Vendor / Contractor', notes:'Roof mechanical · Auth: Mike Rodriguez'},
      { time:'11:20 AM', title:'Vendor check-out · HVAC Services',        category:'Vendor / Contractor', notes:'Work completed'                       },
      { time:'12:30 PM', title:'Package room audit · Match',              category:'Administrative',      notes:'Luxer: 5 · Physical: 5'              },
      { time:'2:00 PM',  title:'Tour · Jennifer Kim · Studio',            category:'Resident Assist',     notes:'Scheduled · Strong interest in 704'   },
      { time:'3:45 PM',  title:'Shift handover notes logged',             category:'Administrative',      notes:'HVAC issue flagged for PM'            },
    ]),
    note: 'Quiet Saturday. HVAC roof inspection completed. Jennifer Kim tour — strong interest in Studio 704, follow-up with leasing recommended.',
    incidents: ['Gym HVAC: slight warm temp reported by resident'],
    metrics: { packages:1, guests:0, vendors:2, lockouts:0, tours:1 },
    leasingTeam: 'The Hannah Leasing',
  },
  '2026-06-20': {
    concierge: { name:'Maria Santos', init:'MS', co:'Maverick Concierge Services' },
    clockIn:'8:00 AM', clockOut:'4:00 PM', status:'completed', duration:'8h 0m',
    activities: mkAct([
      { time:'8:00 AM',  title:'Shift started',                              category:'Administrative',    notes:'GPS verified'                         },
      { time:'8:15 AM',  title:'Move-in setup · Unit 1204 · Elevator booked',category:'Administrative',    notes:'9 AM–1 PM window'                    },
      { time:'9:05 AM',  title:'Package delivery · UPS → Unit 304',          category:'Delivery',          notes:'3 packages'                           },
      { time:'9:30 AM',  title:'Move-in · Emily & David Park · Unit 1204',   category:'Resident Assist',   notes:'Elevator reserved · Luggage cart out' },
      { time:'10:00 AM', title:'Guest arrival · Brian Lee → Unit 504',       category:'Resident Assist',   notes:'Personal visit'                       },
      { time:'11:15 AM', title:'Lockout · Sophia Wright · Unit 302',         category:'Safety / Security', notes:'Key fob issue · Temp access issued'  },
      { time:'12:00 PM', title:'Package room audit · +1 unaccounted',        category:'Administrative',    notes:'Luxer: 7 · Physical: 8 · Reported'   },
      { time:'1:00 PM',  title:'Move-in complete · Unit 1204',               category:'Resident Assist',   notes:'Cart returned · Elevator released'    },
      { time:'2:30 PM',  title:'Package delivery · Amazon → Unit 712',       category:'Delivery',          notes:'2 packages'                           },
      { time:'3:00 PM',  title:'Pool closed · weather advisory',             category:'Amenity',           notes:'Storm approaching · Leasing notified' },
    ]),
    note: 'Move-in for 1204 smooth. Package audit +1 discrepancy — reported to Luxer support. Pool closed early (storm advisory).',
    incidents: ['Package count discrepancy · Luxer +1'],
    metrics: { packages:5, guests:2, vendors:0, lockouts:1, tours:0 },
  },
  '2026-06-19': {
    concierge: { name:'George Nwachukwu', init:'GN', co:'Maverick Concierge Services' },
    clockIn:'8:00 AM', clockOut:'4:00 PM', status:'completed', duration:'8h 0m',
    activities: mkAct([
      { time:'8:00 AM',  title:'Shift started',                          category:'Administrative',      notes:'GPS verified'                         },
      { time:'8:30 AM',  title:'Lobby Opening Check',                    category:'Administrative',      notes:'Broken light #3 — ticket #4435 created'},
      { time:'9:00 AM',  title:'Package delivery · UPS → Unit 901',     category:'Delivery',            notes:'1 package'                            },
      { time:'10:00 AM', title:'Model unit 501 opened · 1 Bed/1 Bath',  category:'Amenity',             notes:''                                     },
      { time:'10:30 AM', title:'Tour · Marcus Bell · 1 Bed / 1 Bath',   category:'Resident Assist',     notes:'Scheduled · Model 501'                },
      { time:'11:30 AM', title:'Vendor check-in · Cleaning Services',    category:'Vendor / Contractor', notes:'Common areas · Auth: Sarah Thompson'  },
      { time:'12:15 PM', title:'Package room audit · Match',             category:'Administrative',      notes:'Luxer: 3 · Physical: 3'              },
      { time:'1:00 PM',  title:'Vendor check-out · Cleaning Services',   category:'Vendor / Contractor', notes:'All common areas complete'            },
      { time:'2:45 PM',  title:'Package delivery · Amazon → Unit 215',  category:'Delivery',            notes:'2 packages'                           },
      { time:'3:30 PM',  title:'Model unit 501 closed',                 category:'Amenity',             notes:''                                     },
    ]),
    note: 'Lobby light #3 flagged, ticket #4435 created. Cleaning vendor on schedule. Marcus Bell tour — interested in 1BR.',
    incidents: ['Lobby light #3 burned out — ticket #4435'],
    metrics: { packages:3, guests:0, vendors:2, lockouts:0, tours:1 },
    leasingTeam: 'The Hannah Leasing',
  },
  '2026-06-18': {
    concierge: { name:'Kevin Thompson', init:'KT', co:'Maverick Concierge Services' },
    clockIn:'8:00 AM', clockOut:'4:00 PM', status:'completed', duration:'8h 0m',
    activities: mkAct([
      { time:'8:00 AM',  title:'Shift started',                           category:'Administrative',    notes:'GPS verified'                         },
      { time:'9:15 AM',  title:'Package delivery · FedEx → Unit 601',    category:'Delivery',          notes:'1 package'                            },
      { time:'9:45 AM',  title:'Package delivery · USPS → Unit 814',     category:'Delivery',          notes:'2 packages'                           },
      { time:'10:30 AM', title:'Guest arrival · Tom Clark → Unit 1105',  category:'Resident Assist',   notes:'Furniture delivery assistance'        },
      { time:'11:00 AM', title:'Loaner checkout · Dolly · Unit 1105',    category:'Amenity',           notes:'Large item move'                      },
      { time:'12:00 PM', title:'Package room audit · Match',              category:'Administrative',    notes:'Luxer: 4 · Physical: 4'              },
      { time:'1:30 PM',  title:'Loaner return · Dolly',                  category:'Amenity',           notes:'Good condition'                       },
      { time:'2:00 PM',  title:'Package pickup · Jennifer K. · Unit 814',category:'Delivery',          notes:''                                     },
      { time:'3:15 PM',  title:'Lockout · Robert Wu · Unit 414',         category:'Safety / Security', notes:'Lost fob · Temp key issued'          },
    ]),
    note: 'Furniture delivery assistance for 1105. Lost fob for Unit 414 flagged for key management follow-up.',
    incidents: [],
    metrics: { packages:4, guests:1, vendors:0, lockouts:1, tours:0 },
  },
};

const SHIFT_DATES = new Set([
  '2026-06-22','2026-06-21','2026-06-20','2026-06-19','2026-06-18',
  '2026-06-17','2026-06-16','2026-06-13','2026-06-12','2026-06-11',
  '2026-06-10','2026-06-09','2026-06-06','2026-06-05','2026-06-04',
  '2026-06-03','2026-06-02',
  '2026-05-30','2026-05-29','2026-05-28','2026-05-27',
  '2026-05-23','2026-05-22','2026-05-21','2026-05-20',
  '2026-05-16','2026-05-15','2026-05-14','2026-05-13',
  '2026-05-09','2026-05-08','2026-05-07','2026-05-06',
  '2026-05-02','2026-05-01',
  '2026-04-30','2026-04-29','2026-04-28',
  '2026-04-25','2026-04-24','2026-04-23','2026-04-22',
  '2026-04-18','2026-04-17','2026-04-16','2026-04-15',
  '2026-04-11','2026-04-10','2026-04-09','2026-04-08',
  '2026-03-31','2026-03-28','2026-03-27','2026-03-26',
  '2026-03-21','2026-03-20','2026-03-19','2026-03-18',
  '2026-03-14','2026-03-13','2026-03-12',
]);

const INIT_TASKS = [
  { id:'t1', title:'Close rooftop pool at 10 PM',                       category:'Amenity',            priority:'High',     assignedTo:'George N.', toId:'c1', dueTime:'10:00 PM',    status:'pending',     createdAt:'2:30 PM · Today',   notes:'' },
  { id:'t2', title:'Escort HVAC vendor to mechanical room on arrival',   category:'Vendor Access',      priority:'Critical', assignedTo:'George N.', toId:'c1', dueTime:'ASAP',         status:'in_progress', createdAt:'1:15 PM · Today',   notes:'Vendor ETA 3:30 PM' },
  { id:'t3', title:'Prepare move-in packet for Unit 1802 — Andersons',   category:'Move In / Move Out', priority:'Standard', assignedTo:'George N.', toId:'c1', dueTime:'5:00 PM',      status:'pending',     createdAt:'11:00 AM · Today',  notes:'Elevator 8–12 AM tomorrow' },
  { id:'t4', title:'Package overflow — notify leasing to clear Luxer',   category:'Administrative',     priority:'High',     assignedTo:'George N.', toId:'c1', dueTime:'ASAP',         status:'completed',   createdAt:'11:30 AM · Today',  notes:'' },
  { id:'t5', title:'Confirm move-in time for Unit 1204 — Park family',   category:'Move In / Move Out', priority:'Standard', assignedTo:'Kevin T.',  toId:'c2', dueTime:'5:00 PM',      status:'completed',   createdAt:'Jun 19',            notes:'' },
  { id:'t6', title:'Issue temporary fob follow-up · Unit 414',           category:'Security',           priority:'High',     assignedTo:'Kevin T.',  toId:'c2', dueTime:'End of shift', status:'completed',   createdAt:'Jun 18',            notes:'Robert Wu · Lost original fob' },
];

const INIT_INCIDENTS = [
  { id:'i1', title:'Unauthorized vehicle – P2',    severity:'medium', filedBy:'George N.', filedAt:'2:15 PM', note:'Awaiting tow approval'            },
  { id:'i2', title:'P2 garage gate running slow',  severity:'low',    filedBy:'Kevin T.',  filedAt:'Jun 7',   note:'Maintenance ticket #4421 created' },
];

const BUILDING_STATUS_DATA = {
  amenities: { open:0, total:5, label:'Amenities', detail:'Pool · Gym · Rooftop · Lounge · Bike Rm'   },
  models:    { open:2, total:4, label:'Models',    detail:'501 (1Bd) & 702 (2Bd) open'                },
  elevators: { status:'clear', label:'Elevators',  detail:'All 3 operational'                         },
  pkgRoom:   { audited:false,  label:'Pkg Room',   detail:'14 parcels awaiting · Audit not logged'    },
};

const CAT_COLOR = {
  'Delivery':'#FF385C','Resident Assist':'#FF385C','Vendor / Contractor':'#FF9500',
  'Vendor Access':'#FF9500','Amenity':'#FF385C','Safety / Security':'#FF3B30',
  'Administrative':'#717171','Maintenance':'#FF9500','Move In / Move Out':'#FF9500',
  'Security':'#FF3B30','Other':'#717171',
};
const CAT_ICON = {
  'Delivery':Package,'Resident Assist':User,'Vendor / Contractor':Building2,
  'Vendor Access':Building2,'Amenity':Waves,'Safety / Security':Shield,
  'Administrative':ClipboardList,'Maintenance':Wrench,'Move In / Move Out':Truck,
  'Security':Shield,'Other':HelpCircle,
};
const PRIORITY_COLOR = { Critical:RED, High:ORANGE, Standard:MUTED };

const TASK_CATS = [
  { id:'Resident Service',   Icon:User,          desc:'Help a resident'         },
  { id:'Vendor Access',      Icon:Building2,     desc:'Vendor coordination'     },
  { id:'Maintenance',        Icon:Wrench,        desc:'Repairs or equipment'    },
  { id:'Move In / Move Out', Icon:Truck,         desc:'Move logistics'          },
  { id:'Security',           Icon:Shield,        desc:'Security check'          },
  { id:'Amenity',            Icon:Waves,         desc:'Common area'             },
  { id:'Administrative',     Icon:ClipboardList, desc:'Documentation or audit'  },
  { id:'Other',              Icon:HelpCircle,    desc:'Unlisted task'           },
];

const EMERGENCY_CONTACTS = [
  { role:'Emergency Services',   number:'911',                                       color:RED    },
  { role:'Police Non-Emergency', number:'(215) 686-8080',                            color:ORANGE },
  { role:'Building Emergency',   number:'(215) 555-0199',                            color:RED    },
  { role:'Property Manager',     number:BUILDING_CONTACTS.propertyManager.phone,     color:BLUE   },
  { role:'Maintenance',          number:BUILDING_CONTACTS.maintenance.phone,         color:ORANGE },
  { role:'Head Concierge',       number:BUILDING_CONTACTS.headConcierge.phone,       color:GREEN  },
  { role:'Maverick Dispatch',    number:BUILDING_CONTACTS.maverickDispatch.phone,    color:MUTED  },
];

const NAV = [
  { id:'home',        Icon:Home,      label:'Overview'            },
  { id:'tasks',       Icon:Send,      label:'Tasks'               },
  { id:'assign-task', Icon:Plus,      label:'Assign Task',        action:'task'      },
  { id:'shifts',      Icon:Calendar,  label:'Shifts'              },
  { id:'team',        Icon:Users,     label:'Team'                },
  { id:'more',        Icon:BookOpen,       label:'SOPs'      },
  { id:'training',    Icon:GraduationCap, label:'Training'  },
  { id:'sections',    Icon:Sliders,       label:'Shift Sections' },
  { id:'emergency',   Icon:Phone,     label:'Emergency Contacts', action:'emergency' },
  { id:'settings',    Icon:Settings,  label:'Settings'            },
];

const EMPTY_ADD  = { name:'', email:'', phone:'', title:'Concierge', co:'Maverick Concierge Services', access:'Full Access' };
const EMPTY_TASK = { title:'', notes:'', category:'', priority:'Standard', assignedTo:'', toId:'', dueTime:'ASAP' };

const sev = (s) => s === 'critical' || s === 'high' ? RED : s === 'medium' ? ORANGE : MUTED;

/* ─── Component ──────────────────────────────────────────────────────────────── */
export const ManagerDashboard = ({ onRoleSwitch, onSignOut, authUser }) => {
  // ── Theme ──────────────────────────────────────────────────────────────────
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const BG     = colors.BG     || '#F8F8F8';
  const CARD   = colors.CARD;
  const CARD2  = colors.CARD2;
  const BORDER = colors.BORDER;
  const TEXT   = colors.TEXT;
  const MUTED  = colors.MUTED;
  const SHADOW = colors.SHADOW;
  const SIDEBAR = colors.SIDEBAR;
  const propertyName = authUser?.property_name || propertyName;
  // ───────────────────────────────────────────────────────────────────────────

  const [tab,       setTab]       = useState('home');
  const [calView,      setCalView]      = useState('month');
  const [calDate,      setCalDate]      = useState(new Date());
  const [shiftDay,     setShiftDay]     = useState(TODAY_STR);
  const [shiftsPage,   setShiftsPage]   = useState(0);
  const [team,      setTeam]      = useState([]);
  const [sectionAccess,    setSectionAccess]    = useState({});
  const [setupConcierge,   setSetupConcierge]   = useState(null);
  const [customSections,   setCustomSections]   = useState([]);
  const [showAddSection,   setShowAddSection]   = useState(false);
  const [newSectionDraft,  setNewSectionDraft]  = useState({ label:'', desc:'' });
  const [tasks,     setTasks]     = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [addOpen,   setAddOpen]   = useState(false);
  const [addStep,   setAddStep]   = useState(1);
  const [addForm,   setAddForm]   = useState(EMPTY_ADD);
  const [addLoading, setAddLoading] = useState(false);
  const [addError,   setAddError]   = useState('');
  const [taskOpen,  setTaskOpen]  = useState(false);
  const [taskStep,  setTaskStep]  = useState(1);
  const [taskForm,  setTaskForm]  = useState(EMPTY_TASK);
  const [taskLoading, setTaskLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError,   setTasksError]   = useState(false);
  const [incidentsError, setIncidentsError] = useState(false);
  const [successIncidentId, setSuccessIncidentId] = useState(null);
  const [srAnnounce,   setSrAnnounce]   = useState('');
  const searchInputRef = useRef(null);
  const taskModalRef   = useRef(null);
  const leasingModalRef = useRef(null);
  const [conOpen,         setConOpen]         = useState(false);
  const [customContacts,  setCustomContacts]  = useState([]);
  const [showAddContact,  setShowAddContact]  = useState(false);
  const [newContactDraft, setNewContactDraft] = useState({ label:'', number:'' });
  const [leasingOpen,     setLeasingOpen]     = useState(false);
  const [leasingForm,     setLeasingForm]     = useState({ teamName:'', contact:'', phone:'', email:'', password:'' });
  const [showPw,          setShowPw]          = useState(false);
  const [profileOpen,     setProfileOpen]     = useState(false);
  const { uploadedSOPs, setUploadedSOPs, trainingItems, setTrainingItems } = useSharedData();
  const [expandedSOPId,    setExpandedSOPId]    = useState(null);
  const [sopUploadOpen,    setSopUploadOpen]    = useState(false);
  const [uploadForm,       setUploadForm]       = useState({ category:'', customCategory:'', title:'', fileName:'', fileType:'', dataURL:'' });
  const [fullscreenDoc,    setFullscreenDoc]    = useState(null);
  const [sopStep,          setSopStep]          = useState(1);
  const uploadFileRef = useRef(null);
  const [expandedTrainingId,  setExpandedTrainingId]  = useState(null);
  const [trainingUploadOpen,  setTrainingUploadOpen]  = useState(false);
  const [trainingForm,        setTrainingForm]        = useState({ category:'', customCategory:'', title:'', fileName:'', fileType:'', dataURL:'' });
  const [fullscreenTraining,  setFullscreenTraining]  = useState(null);
  const [trainingStep,        setTrainingStep]        = useState(1);
  const trainingFileRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [notifMgr,         setNotifMgr]         = useState({ push:true, email:true, shift:true, incident:true });
  const [settingExpMgr,    setSettingExpMgr]    = useState(null);
  const [editInfoMgr,      setEditInfoMgr]      = useState({ name:'', email:'', phone:'' });
  const [pwFormMgr,        setPwFormMgr]        = useState({ current:'', next:'', confirm:'' });
  const [pwStatusMgr,      setPwStatusMgr]      = useState('');
  const [isMobile,         setIsMobile]         = useState(() => { const t = 'ontouchstart' in window || navigator.maxTouchPoints > 0; return window.innerWidth < (t ? 1366 : 768); });
  const [searchQuery,      setSearchQuery]      = useState('');

  const [todayShift,  setTodayShift]  = useState(null); // live DAR from active shift
  const [allShifts,   setAllShifts]   = useState([]);   // full shift history for calendar
  const [shiftFilter, setShiftFilter] = useState('all'); // filter by concierge id or 'all'

  // Converts backend shift data to the shape the DAR renderer expects
  const shiftToDAR = (s) => {
    if (!s) return null;
    return {
      concierge: { name: s.concierge_name },
      clockIn:   s.clock_in ? new Date(s.clock_in).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
      clockOut:  s.clock_out ? new Date(s.clock_out).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : null,
      note:      '',
      incidents: (s.incidents || []).map(i => `${i.type || ''}: ${i.description || ''}`),
      activities: (s.activities || []).map(t => ({
        id:       t.task_id,
        time:     t.created_at ? new Date(t.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
        title:    t.title,
        notes:    t.notes || '',
        category: t.category || 'Other',
      })),
    };
  };

  // Load real data on mount
  useEffect(() => {
    authApi.getConcierges().then(list => {
      setTeam(list);
      if (list.length > 0) setSetupConcierge(list[0].id);
      setSectionAccess(Object.fromEntries(list.map(c => [c.id, { ...DEFAULT_SECTIONS }])));
    }).catch(() => {});
    authApi.getTasks()
      .then(list => { setTasks(list); setTasksLoading(false); setTasksError(false); })
      .catch(() => { setTasksLoading(false); setTasksError(true); });
    authApi.getIncidents()
      .then(list => { setIncidents(list); setIncidentsError(false); })
      .catch(() => setIncidentsError(true));
    authApi.getShiftHistory().then(data => setAllShifts(data?.shifts || [])).catch(() => {});
  }, []);

  // Poll active shift every 30s — live DAR for manager
  useEffect(() => {
    const loadShift = async () => {
      const res = await authApi.getActiveShift();
      if (res?.shifts?.length > 0) {
        setTodayShift(shiftToDAR(res.shifts[0]));
      } else {
        setTodayShift(null);
      }
    };
    loadShift();
    const timer = setInterval(loadShift, 30000);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line

  // Sync authUser into editInfoMgr
  useEffect(() => {
    if (authUser) {
      setEditInfoMgr({ name: authUser.name || '', email: authUser.email || '', phone: authUser.phone || '' });
    }
  }, [authUser]);

  useEffect(() => {
    const onResize = () => { const t = 'ontouchstart' in window || navigator.maxTouchPoints > 0; setIsMobile(window.innerWidth < (t ? 1366 : 768)); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Ctrl+K / Cmd+K → focus the header search bar
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Focus trap — Task Wizard modal
  useEffect(() => {
    if (!taskOpen || !taskModalRef.current) return;
    const el = taskModalRef.current;
    const getFocusable = () => Array.from(el.querySelectorAll('button,input,select,textarea,a[href],[tabindex]:not([tabindex="-1"])'));
    const focusable = getFocusable();
    focusable[0]?.focus();
    const trap = (e) => {
      if (e.key !== 'Tab') return;
      const nodes = getFocusable();
      const first = nodes[0]; const last = nodes[nodes.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus(); } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first?.focus(); } }
    };
    el.addEventListener('keydown', trap);
    return () => el.removeEventListener('keydown', trap);
  }, [taskOpen, taskStep]);

  // Focus trap — Add Team Members modal
  useEffect(() => {
    if (!leasingOpen || !leasingModalRef.current) return;
    const el = leasingModalRef.current;
    const getFocusable = () => Array.from(el.querySelectorAll('button,input,select,textarea,a[href],[tabindex]:not([tabindex="-1"])'));
    const focusable = getFocusable();
    focusable[0]?.focus();
    const trap = (e) => {
      if (e.key !== 'Tab') return;
      const nodes = getFocusable();
      const first = nodes[0]; const last = nodes[nodes.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus(); } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first?.focus(); } }
    };
    el.addEventListener('keydown', trap);
    return () => el.removeEventListener('keydown', trap);
  }, [leasingOpen]);

  const nowStr = () => new Date().toLocaleTimeString('en-US',{ hour:'numeric', minute:'2-digit' });

  const closeAdd  = () => { setAddOpen(false);  setAddStep(1);  setAddForm(EMPTY_ADD); setAddError(''); };
  const closeTask = () => { setTaskOpen(false); setTaskStep(1); setTaskForm(EMPTY_TASK); };

  const submitAdd = async () => {
    if (!addForm.name.trim() || !addForm.email.trim()) return;
    setAddLoading(true); setAddError('');
    try {
      const parts = addForm.name.trim().split(' ');
      const firstName = parts[0];
      const lastName  = parts.slice(1).join(' ') || '.';
      const tempPw = `Concierge${Math.floor(1000 + Math.random() * 9000)}!`;
      const newC = await authApi.addConcierge({
        first_name: firstName,
        last_name:  lastName,
        email:      addForm.email.trim(),
        phone:      addForm.phone || '',
        title:      addForm.title || 'Concierge',
        password:   tempPw,
      });
      setTeam(p => [...p, newC]);
      setSectionAccess(prev => ({ ...prev, [newC.id]: { ...DEFAULT_SECTIONS } }));
      setNewCredentials({ email: addForm.email.trim(), password: tempPw, name: addForm.name.trim() });
      closeAdd();
    } catch (err) {
      setAddError(err?.response?.data?.detail || 'Failed to add concierge. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const submitTask = async () => {
    if (!taskForm.title.trim()) return;
    setTaskLoading(true);
    try {
      const newTask = await authApi.createTask(taskForm);
      setTasks(p => [newTask, ...p]);
      closeTask();
    } catch {
      // keep modal open so user can retry
    } finally {
      setTaskLoading(false);
    }
  };

  const onShift = team.find(c => c.status === 'on_shift');

  /* ── Shared sub-components ─────────────────────────────────────────────────── */
  const StatChip = ({ label, val, color }) => (
    <div style={{ background:CARD, border:`1.5px solid ${BORDER}`, borderRadius:14, padding:'18px 20px' }}>
      <div style={{ fontFamily:INTER, fontSize:28, fontWeight:800, color:color||TEXT, letterSpacing:'-0.04em', lineHeight:1 }}>{val}</div>
      <div style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'0.1em', marginTop:6 }}>{label}</div>
    </div>
  );

  const ActivityRow = ({ a, compact }) => {
    const CIcon = CAT_ICON[a.category] ?? HelpCircle;
    const cc    = CAT_COLOR[a.category] ?? MUTED;
    return (
      <div style={{ display:'flex', alignItems:'center', gap:14, padding:compact?'11px 0':'14px 0', borderBottom:`1px solid ${BORDER}` }}>
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

  const DARSect = ({ title, accent='#8FAEDD' }) => (
    <div style={{ background:accent, padding: isMobile ? '7px 16px' : '7px 28px', marginTop:6 }}>
      <span style={{ fontFamily:INTER, fontSize:13, fontWeight:800, color:TEXT, letterSpacing:'0.10em', textTransform:'uppercase' }}>{title}</span>
    </div>
  );
  const DARField = ({ label, value, sub, last }) => (
    <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', alignItems:'flex-start', gap: isMobile ? 2 : 20, padding: isMobile ? '12px 16px' : '16px 28px', borderBottom:last?'none':`1px solid ${BORDER}` }}>
      <div style={{ width: isMobile ? '100%' : 240, flexShrink:0, fontFamily:INTER, fontSize: isMobile ? 11 : 17, fontWeight: isMobile ? 700 : 600, color:MUTED, lineHeight:1.4, textTransform: isMobile ? 'uppercase' : 'none', letterSpacing: isMobile ? '0.06em' : 'normal' }}>{label}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:INTER, fontSize: isMobile ? 15 : 17, color:TEXT, lineHeight:1.55, whiteSpace:'pre-line' }}>{value}</div>
        {sub && <div style={{ fontFamily:INTER, fontSize: isMobile ? 13 : 15, color:MUTED, marginTop:3 }}>{sub}</div>}
      </div>
    </div>
  );

  /* ── Manager Profile Panel ────────────────────────────────────────────────── */
  const renderProfilePanel = () => (
    <div style={{ flex:1, minHeight:0, overflowY:'auto', paddingBottom:32, background:BG }}>

      {/* Hero */}
      <div style={{ background:CARD, borderBottom:`1px solid ${BORDER}`, padding:'28px 20px 24px', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ position:'relative', marginBottom:16 }}>
          <div style={{ width:108, height:108, borderRadius:'50%', padding:3, background:`linear-gradient(135deg,${BLUE},${ORANGE})` }}>
            <div style={{ width:'100%', height:'100%', borderRadius:'50%', background:`linear-gradient(135deg,${BLUE}22,${ORANGE}22)`, display:'flex', alignItems:'center', justifyContent:'center', border:`3px solid ${CARD}` }}>
              <span style={{ fontFamily:INTER, fontSize:32, fontWeight:800, color:BLUE }}>{(authUser?.name||'M').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</span>
            </div>
          </div>
          <div style={{ position:'absolute', bottom:4, right:4, width:20, height:20, borderRadius:'50%', background:GREEN, border:`3px solid ${CARD}` }} />
        </div>
        <p style={{ fontFamily:INTER, fontSize:22, fontWeight:700, color:TEXT, letterSpacing:'-0.01em', margin:'0 0 4px' }}>{(authUser?.name || 'Manager')}</p>
        <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:'0 0 12px' }}>{(authUser?.job_title || 'Property Manager')} · {(authUser?.property_name || '')}</p>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(52,199,89,0.10)', border:'1px solid rgba(52,199,89,0.20)', borderRadius:999, padding:'6px 14px' }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:GREEN, boxShadow:'0 0 0 2px rgba(52,199,89,0.30)' }} />
          <span style={{ fontFamily:INTER, fontSize:12, fontWeight:700, color:GREEN }}>On Duty · {'Available'}</span>
        </div>
      </div>

      <div style={{ padding:'20px 20px 0', display:'flex', flexDirection:'column', gap:24 }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {[
            { value:5.0,            label:'Rating',         color:'#EAB308', Icon:Star   },
            { value:team.length,   label:'Yrs Experience', color:BLUE,      Icon:Clock  },
            { value:1, label:'Properties',     color:GREEN,     Icon:Building2 },
          ].map(({ value, label, color, Icon:SI }) => (
            <div key={label} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, padding:'16px 12px', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ width:36, height:36, borderRadius:10, background:`${color}14`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
                <SI size={18} color={color} />
              </div>
              <div style={{ fontFamily:INTER, fontSize:'1.6rem', fontWeight:800, color, letterSpacing:'-0.03em', lineHeight:1, marginBottom:4 }}>{value}</div>
              <div style={{ fontFamily:INTER, fontSize:11, color:MUTED, fontWeight:600 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <Phone size={18} color={BLUE} />
            <h3 style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:16, margin:0 }}>Contact</h3>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:16, display:'flex', alignItems:'center', gap:14, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,56,92,0.10)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Mail size={20} color={BLUE} />
              </div>
              <div>
                <p style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:MUTED, letterSpacing:'0.1em', textTransform:'uppercase', margin:'0 0 3px' }}>Email</p>
                <a href={`mailto:${(authUser?.email || '')}`} style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, textDecoration:'none' }}>{(authUser?.email || '')}</a>
              </div>
            </div>
            <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:16, display:'flex', alignItems:'center', gap:14, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ width:44, height:44, borderRadius:12, background:'rgba(52,199,89,0.10)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Phone size={20} color={GREEN} />
              </div>
              <div>
                <p style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:MUTED, letterSpacing:'0.1em', textTransform:'uppercase', margin:'0 0 3px' }}>Phone</p>
                <a href={`tel:${(authUser?.phone || '')?.replace(/\D/g,'')}`} style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, textDecoration:'none' }}>{(authUser?.phone || '')}</a>
              </div>
            </div>
          </div>
        </div>

        {/* Property */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <MapPin size={18} color={ORANGE} />
            <h3 style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:16, margin:0 }}>Property</h3>
          </div>
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:16, display:'flex', alignItems:'center', gap:14, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width:56, height:56, borderRadius:16, background:`${ORANGE}14`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Building2 size={26} color={ORANGE} />
            </div>
            <div>
              <p style={{ fontFamily:INTER, fontSize:15, fontWeight:700, color:TEXT, margin:'0 0 2px' }}>{propertyName}</p>
              <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:'0 0 1px' }}>{BUILDING_PROFILE.company} · {BUILDING_PROFILE.units} units</p>
              <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:0 }}>{BUILDING_PROFILE.address}</p>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <Star size={18} color={'#EAB308'} />
            <h3 style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:16, margin:0 }}>Certifications</h3>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {['Property Manager', 'Fair Housing Certified'].map(cert => (
              <div key={cert} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:16, display:'flex', alignItems:'center', gap:14, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,56,92,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Check size={20} color={BLUE} />
                </div>
                <p style={{ fontFamily:INTER, fontSize:14, fontWeight:700, color:TEXT, margin:0 }}>{cert}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );

  /* ── Concierge Section Assignment ─────────────────────────────────────────── */
  const handleAddCustomSection = () => {
    if (!newSectionDraft.label.trim()) return;
    const newId = `custom_${Date.now()}`;
    const CUSTOM_COLORS = [BLUE, GREEN, ORANGE, RED, MUTED];
    const color = CUSTOM_COLORS[customSections.length % CUSTOM_COLORS.length];
    setCustomSections(prev => [...prev, { id:newId, Icon:Star, label:newSectionDraft.label.trim(), desc:newSectionDraft.desc.trim() || 'Custom section', color, custom:true }]);
    setSectionAccess(prev => {
      const updated = {};
      Object.keys(prev).forEach(cId => { updated[cId] = { ...prev[cId], [newId]: true }; });
      return updated;
    });
    setNewSectionDraft({ label:'', desc:'' });
    setShowAddSection(false);
  };

  const handleDeleteCustomSection = (sectionId) => {
    setCustomSections(prev => prev.filter(s => s.id !== sectionId));
    setSectionAccess(prev => {
      const updated = {};
      Object.keys(prev).forEach(cId => { const { [sectionId]:_, ...rest } = prev[cId]; updated[cId] = rest; });
      return updated;
    });
  };

  const renderConciergeSetup = () => {
    const access = sectionAccess[setupConcierge] || {};
    const allSections = [...CONCIERGE_SECTIONS, ...customSections];
    const toggleSection = (sectionId) => {
      setSectionAccess(prev => ({
        ...prev,
        [setupConcierge]: { ...prev[setupConcierge], [sectionId]: !prev[setupConcierge][sectionId] },
      }));
    };
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:20, padding:'28px 24px 40px' }}>

        {/* Add-section form */}
        {showAddSection && (
          <div style={{ padding:20, background:CARD, border:`2px dashed ${BLUE}50`, borderRadius:16 }}>
            <p style={{ fontFamily:INTER, fontSize:12, fontWeight:800, color:BLUE, letterSpacing:'0.1em', textTransform:'uppercase', margin:'0 0 14px' }}>New Section</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
              <input
                value={newSectionDraft.label}
                onChange={e => setNewSectionDraft(d => ({ ...d, label:e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAddCustomSection()}
                placeholder="Section name  e.g. Key Handovers"
                style={{ fontFamily:INTER, fontSize:14, color:TEXT, background:CARD2, border:`1px solid ${BORDER}`, borderRadius:10, padding:'12px 14px', outline:'none', width:'100%', boxSizing:'border-box' }}
              />
              <input
                value={newSectionDraft.desc}
                onChange={e => setNewSectionDraft(d => ({ ...d, desc:e.target.value }))}
                placeholder="Short description (optional)"
                style={{ fontFamily:INTER, fontSize:14, color:TEXT, background:CARD2, border:`1px solid ${BORDER}`, borderRadius:10, padding:'12px 14px', outline:'none', width:'100%', boxSizing:'border-box' }}
              />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={handleAddCustomSection}
                style={{ flex:1, padding:'11px', background:BLUE, border:'none', borderRadius:10, fontFamily:INTER, fontSize:14, fontWeight:700, color:'white', cursor:'pointer' }}>
                Add Section
              </button>
              <button onClick={() => { setShowAddSection(false); setNewSectionDraft({ label:'', desc:'' }); }}
                style={{ padding:'11px 16px', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:10, fontFamily:INTER, fontSize:14, fontWeight:600, color:MUTED, cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Section toggles */}
        <div>
          <p style={{ fontFamily:INTER, fontSize:11, fontWeight:800, color:MUTED, letterSpacing:'0.14em', textTransform:'uppercase', margin:'0 0 14px' }}>Dashboard Sections</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {allSections.map(({ id, Icon:SI, label, desc, color, required, custom }) => {
              const enabled = access[id] !== false;
              return (
                <div key={id} style={{ display:'flex', alignItems:'center', gap:16, padding:20, background:CARD, border:`1px solid ${enabled ? `${color}25` : BORDER}`, borderRadius:16, boxShadow:'0 2px 8px rgba(0,0,0,0.04)', transition:'border-color 200ms' }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:enabled ? `${color}12` : CARD2, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 200ms' }}>
                    <SI size={22} color={enabled ? color : MUTED} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                      <p style={{ fontFamily:INTER, fontSize:15, fontWeight:700, color:enabled ? TEXT : MUTED, margin:0, transition:'color 200ms' }}>{label}</p>
                      {required && <span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:GREEN, background:'rgba(52,199,89,0.12)', borderRadius:6, padding:'2px 7px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Required</span>}
                      {custom && <span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:BLUE, background:`${BLUE}12`, borderRadius:6, padding:'2px 7px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Custom</span>}
                    </div>
                    <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:0 }}>{desc}</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                    {custom && (
                      <button onClick={() => handleDeleteCustomSection(id)}
                        style={{ width:32, height:32, borderRadius:8, border:`1px solid ${BORDER}`, background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                        <X size={14} color={MUTED} />
                      </button>
                    )}
                    {required ? (
                      <div style={{ width:48, height:28, borderRadius:14, background:GREEN, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Check size={14} color="white" strokeWidth={3} />
                      </div>
                    ) : (
                      <button onClick={() => toggleSection(id)}
                        style={{ width:48, height:28, borderRadius:14, background:enabled ? GREEN : '#D1D5DB', border:'none', cursor:'pointer', position:'relative', transition:'background 200ms' }}>
                        <div style={{ position:'absolute', top:3, left:enabled ? 23 : 3, width:22, height:22, borderRadius:'50%', background:'white', boxShadow:'0 1px 6px rgba(0,0,0,0.25)', transition:'left 200ms' }} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  /* ── Settings ─────────────────────────────────────────────────────────────── */
  const renderSettings = () => {
    const toggle = (id) => setSettingExpMgr(e => e === id ? null : id);
    const inputStyle = { fontFamily:INTER, fontSize:14, color:TEXT, background:CARD2, border:`1px solid ${BORDER}`, borderRadius:10, padding:'12px 14px', outline:'none', width:'100%', boxSizing:'border-box' };
    const sectionLabel = (txt) => <p style={{ fontFamily:INTER, fontSize:11, fontWeight:800, color:MUTED, letterSpacing:'0.14em', textTransform:'uppercase', margin:'0 0 12px' }}>{txt}</p>;
    const row = (id, Icon, color, title, desc, extra) => (
      <div key={id} style={{ borderRadius:16, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
        <button onClick={() => toggle(id)} style={{ width:'100%', display:'flex', alignItems:'center', gap:16, padding:20, background:CARD, border:`1px solid ${settingExpMgr===id ? `${color}35` : BORDER}`, borderRadius: settingExpMgr===id ? '16px 16px 0 0' : 16, cursor:'pointer', textAlign:'left', transition:'all 150ms' }}>
          <div style={{ width:52, height:52, borderRadius:14, background:`${color}12`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Icon size={22} color={color} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontFamily:INTER, fontSize:15, fontWeight:700, color:TEXT, margin:'0 0 3px' }}>{title}</p>
            <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:0 }}>{desc}</p>
          </div>
          <ChevronRight size={18} color={MUTED} style={{ transform: settingExpMgr===id ? 'rotate(90deg)' : 'none', transition:'transform 200ms', flexShrink:0 }} />
        </button>
        {settingExpMgr === id && (
          <div style={{ background:CARD2, border:`1px solid ${color}20`, borderTop:'none', borderRadius:'0 0 16px 16px', padding:'16px 20px 20px' }}>
            {extra}
          </div>
        )}
      </div>
    );
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:28, padding:'28px 24px 40px' }}>

        {/* Profile Hero */}
        <button onClick={() => setProfileOpen(true)}
          style={{ background:`${BLUE}08`, border:`1px solid ${BLUE}20`, borderRadius:20, padding:24, display:'flex', alignItems:'center', gap:20, cursor:'pointer', textAlign:'left', width:'100%', transition:'background 150ms' }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:`${BLUE}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <User size={32} color={BLUE} />
          </div>
          <div>
            <p style={{ fontFamily:INTER, fontSize:20, fontWeight:800, color:TEXT, margin:'0 0 3px', letterSpacing:'-0.02em' }}>{(authUser?.name || 'Manager')}</p>
            <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:'0 0 10px' }}>{(authUser?.job_title || 'Property Manager')}</p>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(52,199,89,0.12)', border:'1px solid rgba(52,199,89,0.25)', borderRadius:999, padding:'5px 12px' }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:GREEN, boxShadow:'0 0 0 2px rgba(52,199,89,0.3)' }} />
              <span style={{ fontFamily:INTER, fontSize:12, fontWeight:700, color:GREEN }}>On Duty</span>
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
                <input style={inputStyle} value={editInfoMgr.name}  onChange={e => setEditInfoMgr(f=>({...f,name:e.target.value}))}  placeholder="Full name" />
                <input style={inputStyle} value={editInfoMgr.email} onChange={e => setEditInfoMgr(f=>({...f,email:e.target.value}))} placeholder="Email address" />
                <input style={inputStyle} value={editInfoMgr.phone} onChange={e => setEditInfoMgr(f=>({...f,phone:e.target.value}))} placeholder="Phone number" />
                <button onClick={() => setSettingExpMgr(null)} style={{ marginTop:4, padding:'12px', background:BLUE, border:'none', borderRadius:10, fontFamily:INTER, fontSize:14, fontWeight:700, color:'white', cursor:'pointer' }}>Save Changes</button>
              </div>
            )}
            {row('change-pw', Lock, RED, 'Change Password', 'Update your account password securely',
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <input style={inputStyle} type="password" value={pwFormMgr.current} onChange={e => { setPwFormMgr(f=>({...f,current:e.target.value})); setPwStatusMgr(''); }} placeholder="Current password" />
                <input style={inputStyle} type="password" value={pwFormMgr.next}    onChange={e => { setPwFormMgr(f=>({...f,next:e.target.value}));    setPwStatusMgr(''); }} placeholder="New password (min 6 chars)" />
                <input style={inputStyle} type="password" value={pwFormMgr.confirm} onChange={e => { setPwFormMgr(f=>({...f,confirm:e.target.value})); setPwStatusMgr(''); }} placeholder="Confirm new password" />
                {pwStatusMgr.startsWith('error') && <p style={{ fontFamily:INTER, fontSize:13, color:RED, margin:0, fontWeight:600 }}>{pwStatusMgr.replace('error:','')}</p>}
                {pwStatusMgr === 'success' && <p style={{ fontFamily:INTER, fontSize:13, color:GREEN, margin:0, fontWeight:600 }}>Password updated successfully.</p>}
                <button
                  disabled={pwStatusMgr === 'saving'}
                  onClick={async () => {
                    if (!pwFormMgr.current || !pwFormMgr.next || !pwFormMgr.confirm) { setPwStatusMgr('error:Please fill in all fields.'); return; }
                    if (pwFormMgr.next !== pwFormMgr.confirm) { setPwStatusMgr('error:New passwords do not match.'); return; }
                    if (pwFormMgr.next.length < 6) { setPwStatusMgr('error:New password must be at least 6 characters.'); return; }
                    setPwStatusMgr('saving');
                    try {
                      await authApi.changePassword(pwFormMgr.current, pwFormMgr.next);
                      setPwStatusMgr('success');
                      setPwFormMgr({ current:'', next:'', confirm:'' });
                      setTimeout(() => { setPwStatusMgr(''); setSettingExpMgr(null); }, 2000);
                    } catch (err) {
                      setPwStatusMgr('error:' + (err?.response?.data?.detail || 'Failed to update password.'));
                    }
                  }}
                  style={{ marginTop:4, padding:'12px', background: pwStatusMgr==='saving' ? MUTED : RED, border:'none', borderRadius:10, fontFamily:INTER, fontSize:14, fontWeight:700, color:'white', cursor: pwStatusMgr==='saving' ? 'not-allowed' : 'pointer' }}>
                  {pwStatusMgr === 'saving' ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security & Privacy */}
        <div>
          {sectionLabel('Security & Privacy')}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {row('2fa',     Shield,      GREEN, 'Two-Factor Authentication', 'Add an extra layer of security to your account', <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:0 }}>Two-factor authentication is managed by your system administrator.</p>)}
            {row('privacy', BookOpen,    BLUE,  'Privacy Settings',          'Control how your data is used and shared',        <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:0 }}>Your data is stored securely and never shared without consent.</p>)}
          </div>
        </div>

        {/* Teams & Conditions */}
        <div>
          {sectionLabel('Teams & Conditions')}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {row('team',  Users,         ORANGE, 'Team Settings',   'Manage team roles, access and permissions',   <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:0 }}>Team roles and permissions are configured at the property level. Contact your administrator to make changes.</p>)}
            {row('terms', ClipboardList, MUTED,  'Terms of Service','Review the platform terms of service',        <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:0 }}>By using this platform you agree to our terms of service and usage policy.</p>)}
            {row('pp',    HelpCircle,    MUTED,  'Privacy Policy',  'How we collect, use and protect your data',   <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:0 }}>We collect only the data necessary to operate the platform and never sell your information.</p>)}
          </div>
        </div>

        {/* Account */}
        <div>
          {sectionLabel('Account')}
          <button
            onClick={onSignOut}
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

  /* ── Overview ──────────────────────────────────────────────────────────────── */
  const renderHome = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>


{/* Two-column: activity + right panel */}
      <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns:'1fr 460px', gap:24 }}>

        {/* Daily Activity Report */}
        <div style={{ background:CARD, border:`1.5px solid ${BORDER}`, borderRadius:20, overflow:'hidden', display:'flex', flexDirection:'column', order: isMobile ? 1 : 0 }}>
          {!todayShift ? (
            <div style={{ padding:40, textAlign:'center', fontFamily:INTER, fontSize:14, color:MUTED }}>No shift active today</div>
          ) : (() => {
            const deliveries = todayShift.activities.filter(a => a.category === 'Delivery');
            const security   = todayShift.activities.filter(a => a.category === 'Safety / Security');
            const residents  = todayShift.activities.filter(a => a.category === 'Resident Assist');
            const vendors    = todayShift.activities.filter(a => a.category === 'Vendor / Contractor');
            const amenities  = todayShift.activities.filter(a => a.category === 'Amenity');
            const audit      = todayShift.activities.find(a => a.category === 'Administrative' && a.title.toLowerCase().includes('audit'));
            const loaners    = amenities.filter(a => a.title.toLowerCase().includes('loaner'));
            const guests     = residents.filter(a => a.title.toLowerCase().includes('guest') || a.title.toLowerCase().includes('arrival'));
            const tours      = residents.filter(a => a.title.toLowerCase().includes('tour') || a.title.toLowerCase().includes('move'));
            const pickups    = deliveries.filter(a => a.title.toLowerCase().includes('pickup'));
            const incoming   = deliveries.filter(a => !a.title.toLowerCase().includes('pickup'));
            const lockouts   = security.filter(a => a.title.toLowerCase().includes('lockout'));
            const rounds     = security.filter(a => !a.title.toLowerCase().includes('lockout'));
            const toStr = arr => arr.length > 0
              ? arr.map(a => `${a.time}: ${a.title}${a.notes ? ' · ' + a.notes : ''}`).join('\n')
              : 'N/A';
            return (
              <>
                {/* DAR Header */}
                <div style={{ background:'#111827', padding:'28px 28px 22px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <div style={{ fontFamily:INTER, fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.4)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:8 }}>Daily Activity Report</div>
                      <div style={{ fontFamily:INTER, fontSize:22, fontWeight:800, color:'white', marginBottom:5 }}>{todayShift.concierge.name}</div>
                      <div style={{ fontFamily:INTER, fontSize:14, color:'rgba(255,255,255,0.55)' }}>
                        {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})} · {todayShift.clockIn}{todayShift.clockOut ? ` – ${todayShift.clockOut}` : ' – Present'}
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
                      <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(52,199,89,0.15)', borderRadius:999, padding:'7px 14px' }}>
                        <div style={{ width:7, height:7, borderRadius:'50%', background:GREEN, boxShadow:'0 0 0 2px rgba(52,199,89,0.3)' }} />
                        <span style={{ fontFamily:INTER, fontSize:13, fontWeight:700, color:GREEN }}>On Duty</span>
                      </div>
                      <button onClick={() => setTab('shifts')} style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.5)', background:'none', border:'none', cursor:'pointer', padding:0 }}>Full log →</button>
                    </div>
                  </div>
                </div>

                {/* DAR body */}
                <div>

                  {/* Start of Shift — blue accent to match brand */}
                  <DARSect title="Start of Shift Package Audit" accent='#8FAEDD' />
                  <DARField label="Package Audit Completed" value="Yes" />
                  <DARField label="Keys Found at Start of Shift" value="Yes" />
                  {audit && <DARField label="Package Room Count" value={audit.notes} last />}

                  {/* Packages — brand pink */}
                  <DARSect title="Packages" accent='#8FAEDD' />
                  <DARField label="Delivered by Couriers" value={toStr(incoming)} />
                  <DARField label="Picked Up by Residents" value={toStr(pickups)} last />

                  {/* Guests — brand pink */}
                  <DARSect title="Guests" accent='#8FAEDD' />
                  <DARField label="Guest Arrivals / Check-ins" value={toStr(guests)} last />

                  {/* Tours — brand pink */}
                  <DARSect title="Tours" accent='#8FAEDD' />
                  <DARField label="Scheduled & Walk-in Tours" value={toStr(tours)} last />

                  {/* Loaners — brand pink */}
                  <DARSect title="Loaners" accent='#8FAEDD' />
                  <DARField label="Checkouts & Returns" value={toStr(loaners)} last />

                  {/* Lockouts — brand pink */}
                  <DARSect title="Lockouts" accent='#8FAEDD' />
                  <DARField label="Keys & Access Requests" value={toStr(lockouts)} last />

                  {/* Vendors — brand pink */}
                  <DARSect title="Vendors" accent='#8FAEDD' />
                  {vendors.length > 0
                    ? vendors.map((a, i, arr) => (
                        <DARField key={a.id} label={a.title} value={a.time} sub={a.notes} last={i === arr.length - 1} />
                      ))
                    : <DARField label="Vendor Activity" value="N/A" last />
                  }

                  {/* Security & Rounds — blue accent */}
                  {rounds.length > 0 && (
                    <>
                      <DARSect title="Security & Rounds" accent='#8FAEDD' />
                      {rounds.map((a, i, arr) => (
                        <DARField key={a.id} label={a.title} value={a.time} sub={a.notes} last={i === arr.length - 1} />
                      ))}
                    </>
                  )}

                  {/* Shift Notes narrative — blue accent */}
                  <DARSect title="Shift Notes" accent='#8FAEDD' />
                  <div style={{ padding:'16px 28px 20px' }}>
                    <p style={{ fontFamily:INTER, fontSize:16, color:TEXT, lineHeight:1.7, margin:0 }}>{todayShift.note}</p>
                  </div>

                  {/* Incidents — red */}
                  {todayShift.incidents.length > 0 && (
                    <>
                      <DARSect title="Incidents Filed" accent={RED} />
                      {todayShift.incidents.map((inc, i, arr) => (
                        <DARField key={i} label={`Incident ${i + 1}`} value={inc} last={i === arr.length - 1} />
                      ))}
                    </>
                  )}

                </div>
              </>
            );
          })()}
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:20, order: isMobile ? 2 : 0 }}>

          {/* Open Incidents */}
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <AlertTriangle size={20} color={RED} />
                <h3 style={{ fontFamily:INTER, fontSize:17, fontWeight:700, color:TEXT, margin:0 }}>Open Incidents</h3>
              </div>
              <span aria-live="polite" aria-label={`${incidents.length} open incidents`} style={{ width:32, height:32, borderRadius:'50%', background: incidents.length>0?`${RED}14`:CARD2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:incidents.length>0?RED:MUTED, flexShrink:0 }}>{incidents.length}</span>
            </div>
            {incidentsError ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'20px 0', textAlign:'center' }}>
                <div style={{ width:48, height:48, borderRadius:14, background:'rgba(255,59,48,0.08)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                  <AlertTriangle size={22} color={RED} />
                </div>
                <p style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, margin:'0 0 4px' }}>Couldn't load incidents</p>
                <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:'0 0 14px' }}>Check your connection and try again</p>
                <button onClick={() => { setIncidentsError(false); authApi.getIncidents().then(list => { setIncidents(list); setIncidentsError(false); }).catch(() => setIncidentsError(true)); }}
                  style={{ padding:'8px 18px', background:BLUE, border:'none', borderRadius:10, fontFamily:INTER, fontSize:13, fontWeight:700, color:'white', cursor:'pointer' }}>
                  Retry
                </button>
              </div>
            ) : incidents.length === 0 ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'20px 0', textAlign:'center' }}>
                <div style={{ width:48, height:48, borderRadius:14, background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                  <CheckCircle size={22} color={GREEN} />
                </div>
                <p style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, margin:'0 0 4px' }}>All clear</p>
                <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:0 }}>No open incidents right now</p>
              </div>
            ) : (
              <div data-card-list role="list" style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {incidents.map(inc => (
                  <div key={inc.id} className="stagger-item" role="listitem"
                    data-card-focusable tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        const list = e.currentTarget.closest('[data-card-list]');
                        if (!list) return;
                        const cards = Array.from(list.querySelectorAll('[data-card-focusable]'));
                        const idx = cards.indexOf(e.currentTarget);
                        const target = e.key === 'ArrowDown' ? cards[idx + 1] : cards[idx - 1];
                        if (target) target.focus();
                      }
                    }}
                    style={{ background: successIncidentId === inc.id ? `rgba(52,199,89,0.08)` : CARD2, border:`1px solid ${successIncidentId === inc.id ? 'rgba(52,199,89,0.35)' : sev(inc.severity)+'30'}`, borderRadius:14, padding:16, display:'flex', alignItems:'center', gap:14, outline:'none', transition:'background 300ms, border-color 300ms' }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:`${sev(inc.severity)}14`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <AlertTriangle size={22} color={sev(inc.severity)} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontFamily:INTER, fontSize:14, fontWeight:700, color:TEXT, margin:'0 0 3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{inc.title}</p>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        {inc.unit_number && <span style={{ fontFamily:INTER, fontSize:12, color:MUTED }}>Unit {inc.unit_number}</span>}
                        {inc.person_involved && <span style={{ fontFamily:INTER, fontSize:12, color:MUTED }}>{inc.unit_number ? '·' : ''} {inc.person_involved}</span>}
                        {inc.filedBy && <span style={{ fontFamily:INTER, fontSize:12, color:MUTED }}>{(inc.unit_number || inc.person_involved) ? '·' : ''} Filed by {inc.filedBy}</span>}
                      </div>
                    </div>
                    <button onClick={() => {
                      setSuccessIncidentId(inc.id);
                      setSrAnnounce('Incident resolved.');
                      setTimeout(() => { setIncidents(p=>p.filter(i=>i.id!==inc.id)); setSuccessIncidentId(null); setSrAnnounce(''); }, 600);
                    }}
                      style={{ flexShrink:0, padding:'8px 14px', background:'rgba(52,199,89,0.10)', border:'1px solid rgba(52,199,89,0.25)', borderRadius:10, fontFamily:INTER, fontSize:12, fontWeight:700, color:GREEN, cursor:'pointer' }}>
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
              <Send size={20} color={BLUE} />
              <h3 style={{ fontFamily:INTER, fontSize:17, fontWeight:700, color:TEXT, margin:0 }}>Quick Actions</h3>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { label:'Assign Task to Concierge', desc:'Dispatch a new task',       Icon:Send,      onClick:()=>setTaskOpen(true),    color:BLUE  },
                { label:'View Shift Calendar',       desc:'Browse shift history',      Icon:Calendar,  onClick:()=>setTab('shifts'),    color:BLUE  },
                { label:'Add Team Members',          desc:'Invite a new team member',  Icon:UserPlus,  onClick:()=>setLeasingOpen(true), color:GREEN },
                { label:'Emergency Contacts',        desc:'Call building contacts',    Icon:Phone,     onClick:()=>setConOpen(true),    color:RED   },
              ].map(({ label, desc, Icon:QI, onClick, color }) => (
                <button key={label} onClick={onClick}
                  style={{ display:'flex', alignItems:'center', gap:14, padding:16, background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14, cursor:'pointer', textAlign:'left', transition:'border-color 150ms' }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:`${color}14`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <QI size={20} color={color} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:INTER, fontSize:14, fontWeight:700, color:TEXT, margin:'0 0 2px' }}>{label}</p>
                    <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:0 }}>{desc}</p>
                  </div>
                  <ChevronRight size={18} color={MUTED} />
                </button>
              ))}
            </div>
          </div>

          {/* Active Tasks */}
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <ClipboardList size={20} color={ORANGE} />
                <h3 style={{ fontFamily:INTER, fontSize:17, fontWeight:700, color:TEXT, margin:0 }}>Active Tasks</h3>
              </div>
              <button onClick={() => setTab('tasks')} style={{ fontFamily:INTER, fontSize:13, fontWeight:700, color:BLUE, background:'none', border:'none', cursor:'pointer', padding:0 }}>See all</button>
            </div>
            {tasksLoading ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[0, 1, 2].map(i => {
                  const sk = isDarkMode ? 'skeleton-dark' : 'skeleton-light';
                  const widths = [[72, 38], [58, 30], [44, 26]];
                  return (
                    <div key={i} style={{ background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14, padding:16, opacity: 1 - i * 0.15 }}>
                      <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:8 }}>
                        <div className={sk} style={{ height:14, borderRadius:6, flex:1, maxWidth: widths[i][0]+'%' }} />
                        <div className={sk} style={{ height:18, borderRadius:6, width:44, flexShrink:0 }} />
                      </div>
                      <div className={sk} style={{ height:12, borderRadius:5, width: widths[i][1]+'%' }} />
                    </div>
                  );
                })}
              </div>
            ) : tasksError ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'20px 0', textAlign:'center' }}>
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
            ) : (
              <div data-card-list role="list" style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {tasks.filter(t=>t.status!=='completed').map(t => {
                  const pc = PRIORITY_COLOR[t.priority] ?? MUTED;
                  return (
                    <div key={t.id} className="stagger-item" role="listitem"
                      data-card-focusable tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                          e.preventDefault();
                          const list = e.currentTarget.closest('[data-card-list]');
                          if (!list) return;
                          const cards = Array.from(list.querySelectorAll('[data-card-focusable]'));
                          const idx = cards.indexOf(e.currentTarget);
                          const target = e.key === 'ArrowDown' ? cards[idx + 1] : cards[idx - 1];
                          if (target) target.focus();
                        }
                      }}
                      style={{ background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14, padding:16, outline:'none' }}>
                      <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:8 }}>
                        <p style={{ fontFamily:INTER, fontSize:14, fontWeight:700, color:TEXT, margin:0, flex:1, lineHeight:1.4 }}>{t.title}</p>
                        <span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:pc, background:`${pc}14`, borderRadius:6, padding:'3px 8px', textTransform:'uppercase', letterSpacing:'0.06em', flexShrink:0 }}>{t.priority}</span>
                      </div>
                      <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:0 }}>→ {t.assignedTo} · {t.dueTime}</p>
                    </div>
                  );
                })}
                {tasks.filter(t=>t.status!=='completed').length === 0 && (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'20px 0', textAlign:'center' }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:'rgba(52,199,89,0.10)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                      <CheckCircle size={24} color={GREEN} />
                    </div>
                    <p style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, margin:'0 0 4px' }}>All caught up</p>
                    <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:0 }}>No active tasks right now</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Shifts Calendar ───────────────────────────────────────────────────────── */
  const renderShifts = () => {
    const year   = calDate.getFullYear();
    const month  = calDate.getMonth();
    const cells  = getCalCells(year, month);
    const prefix = toDS(year, month, 1).slice(0, 7);
    const monthCount = (y, m) => [...shiftDatesSet].filter(d => d.startsWith(toDS(y, m, 1).slice(0,7))).length;

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
      return (
        <>
          {/* DAR Header */}
          <div style={{ background:'#111827', padding:'28px 28px 22px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontFamily:INTER, fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.4)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:8 }}>Daily Activity Report</div>
                <div style={{ fontFamily:INTER, fontSize:22, fontWeight:800, color:'white', marginBottom:5 }}>{s.concierge.name}</div>
                <div style={{ fontFamily:INTER, fontSize:14, color:'rgba(255,255,255,0.55)' }}>
                  {dateLabel} · {s.clockIn}{s.clockOut ? ` – ${s.clockOut}` : ' – Present'}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:7, background: s.status==='active'?'rgba(52,199,89,0.15)':'rgba(255,255,255,0.08)', borderRadius:999, padding:'7px 14px' }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background: s.status==='active'?GREEN:'rgba(255,255,255,0.4)', boxShadow: s.status==='active'?'0 0 0 2px rgba(52,199,89,0.3)':'none' }} />
                  <span style={{ fontFamily:INTER, fontSize:13, fontWeight:700, color: s.status==='active'?GREEN:'rgba(255,255,255,0.6)' }}>
                    {s.status==='active' ? 'On Duty' : 'Completed'}
                  </span>
                </div>
                <div style={{ fontFamily:INTER, fontSize:14, color:'rgba(255,255,255,0.45)' }}>{s.duration}</div>
              </div>
            </div>
          </div>

          {/* DAR Sections */}
          <div>
            <DARSect title="Start of Shift Package Audit" />
            <DARField label="Package Audit Completed" value="Yes" />
            <DARField label="Keys Found at Start of Shift" value="Yes" />
            {audit && <DARField label="Package Room Count" value={audit.notes} last />}

            <DARSect title="Packages" />
            <DARField label="Delivered by Couriers" value={toStr(incoming)} />
            <DARField label="Picked Up by Residents" value={toStr(pickups)} last />

            <DARSect title="Guests" />
            <DARField label="Guest Arrivals / Check-ins" value={toStr(guests)} last />

            <DARSect title="Tours" />
            <DARField label="Scheduled & Walk-in Tours" value={toStr(tours)} last />

            <DARSect title="Loaners" />
            <DARField label="Checkouts & Returns" value={toStr(loaners)} last />

            <DARSect title="Lockouts" />
            <DARField label="Keys & Access Requests" value={toStr(lockouts)} last />

            <DARSect title="Vendors" />
            {vendors.length > 0
              ? vendors.map((a, i, arr) => <DARField key={a.id} label={a.title} value={a.time} sub={a.notes} last={i===arr.length-1} />)
              : <DARField label="Vendor Activity" value="N/A" last />
            }

            {rounds.length > 0 && (
              <>
                <DARSect title="Security & Rounds" />
                {rounds.map((a, i, arr) => <DARField key={a.id} label={a.title} value={a.time} sub={a.notes} last={i===arr.length-1} />)}
              </>
            )}

            {s.note && (
              <>
                <DARSect title="Shift Notes" />
                <div style={{ padding:'16px 28px 20px' }}>
                  <p style={{ fontFamily:INTER, fontSize:16, color:TEXT, lineHeight:1.7, margin:0 }}>{s.note}</p>
                </div>
              </>
            )}

            {s.incidents.length > 0 && (
              <>
                <DARSect title="Incidents Filed" accent={RED} />
                {s.incidents.map((inc, i, arr) => <DARField key={i} label={`Incident ${i+1}`} value={inc} last={i===arr.length-1} />)}
              </>
            )}
          </div>
        </>
      );
    };

    // Build real-data map from backend shift history, filtered by team member
    const filteredRaw = shiftFilter === 'all'
      ? allShifts
      : allShifts.filter(s => s.concierge_id === shiftFilter);
    const shiftDatesMap = {};
    filteredRaw.forEach(s => {
      const dateKey = s.clock_in ? s.clock_in.split('T')[0] : null;
      if (!dateKey) return;
      const clockInDate  = s.clock_in  ? new Date(s.clock_in)  : null;
      const clockOutDate = s.clock_out ? new Date(s.clock_out) : null;
      const ms   = clockInDate && clockOutDate ? clockOutDate - clockInDate : 0;
      const hrs  = Math.floor(ms / 3600000);
      const mins = Math.floor((ms % 3600000) / 60000);
      const cname = s.concierge_name || '';
      const cinit = cname.trim().split(/\s+/).map(w => w[0]).join('').slice(0,2).toUpperCase() || 'C';
      // if same day has multiple shifts, keep the later one
      shiftDatesMap[dateKey] = {
        concierge: { name: cname, init: cinit },
        clockIn:   clockInDate  ? clockInDate.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' }) : '',
        clockOut:  clockOutDate ? clockOutDate.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' }) : null,
        status:    s.status || 'completed',
        duration:  ms > 0 ? `${hrs}h ${mins}m` : (s.status === 'active' ? 'Ongoing' : '—'),
        activities: (s.activities || []).map(t => ({
          id: t.task_id, time: t.created_at ? new Date(t.created_at).toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' }) : '—',
          title: t.title || '', notes: t.notes || '', category: t.category || 'Other',
        })),
        incidents: (s.incidents || []).map(i => `${i.type || 'Incident'}: ${i.description || i.title || ''}`),
        note: '',
      };
    });
    const shiftDatesSet = new Set(Object.keys(shiftDatesMap));

    const monthShifts = [...shiftDatesSet].filter(d=>d.startsWith(prefix)).sort((a,b)=>b.localeCompare(a));
    const totalPages  = Math.ceil(monthShifts.length / 5);
    const pageShifts  = monthShifts.slice(shiftsPage * 5, shiftsPage * 5 + 5);

    const dateLabel = shiftDay ? (() => { const dp=shiftDay.split('-'); return `${MONTHS[parseInt(dp[1])-1]} ${parseInt(dp[2])}, ${dp[0]}`; })() : '';

    // Override selectedShift from real data
    const selectedShift = shiftDay ? shiftDatesMap[shiftDay] : null;

    return (
      <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns:'1fr 400px', gap: isMobile ? 16 : 20, alignItems: isMobile ? 'stretch' : 'start' }}>

        {/* DAR — middle on mobile, left col spanning both rows on desktop */}
        <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', order: isMobile ? 2 : 0, gridColumn: 1, gridRow: '1 / 3' }}>
          {selectedShift ? (
            shiftDARBody(selectedShift, dateLabel)
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

            {/* Calendar section header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                {calView === 'month' ? (
                  <>
                    <button onClick={() => { setCalDate(new Date(year, month-1, 1)); setShiftsPage(0); }} style={{ width:32, height:32, borderRadius:10, background:CARD2, border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                      <ChevronLeft size={15} color={MUTED} />
                    </button>
                    <div>
                      <div style={{ fontFamily:INTER, fontSize:16, fontWeight:800, color:TEXT }}>{MONTHS[month]} {year}</div>
                      <div style={{ fontFamily:INTER, fontSize:11, color:MUTED }}>{[...shiftDatesSet].filter(d=>d.startsWith(prefix)).length} shifts</div>
                    </div>
                    <button onClick={() => { setCalDate(new Date(year, month+1, 1)); setShiftsPage(0); }} style={{ width:32, height:32, borderRadius:10, background:CARD2, border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                      <ChevronRight size={15} color={MUTED} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setCalDate(new Date(year-1, 0, 1))} style={{ width:32, height:32, borderRadius:10, background:CARD2, border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                      <ChevronLeft size={15} color={MUTED} />
                    </button>
                    <div style={{ fontFamily:INTER, fontSize:16, fontWeight:800, color:TEXT }}>{year}</div>
                    <button onClick={() => setCalDate(new Date(year+1, 0, 1))} style={{ width:32, height:32, borderRadius:10, background:CARD2, border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                      <ChevronRight size={15} color={MUTED} />
                    </button>
                  </>
                )}
              </div>
              <div style={{ display:'flex', background:CARD2, borderRadius:10, padding:2, border:`1px solid ${BORDER}` }}>
                {['month','year'].map(v => (
                  <button key={v} onClick={() => setCalView(v)}
                    style={{ padding:'6px 14px', borderRadius:8, background:calView===v?CARD:'transparent', border:calView===v?`1px solid ${BORDER}`:'none', fontFamily:INTER, fontSize:12, fontWeight:700, color:calView===v?TEXT:MUTED, cursor:'pointer', textTransform:'capitalize' }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Month grid */}
            {calView === 'month' && (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:8 }}>
                  {DAY_HDR.map((d,i) => (
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
                        style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', aspectRatio:'1', borderRadius:10,
                          background: isSel ? BLUE : isToday ? 'rgba(255,56,92,0.08)' : 'transparent',
                          border: isSel ? 'none' : isToday ? `2px solid ${BLUE}` : '2px solid transparent',
                          cursor: hasShift ? 'pointer' : 'default' }}>
                        <span style={{ fontFamily:INTER, fontSize:13, fontWeight:isSel||isToday?800:500, color:isSel?'white':isToday?BLUE:hasShift?TEXT:'#ccc' }}>
                          {cell.day}
                        </span>
                        {hasShift && <div style={{ width:4, height:4, borderRadius:'50%', background:isSel?'rgba(255,255,255,0.65)':BLUE, marginTop:2 }} />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Year grid */}
            {calView === 'year' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                {Array.from({ length:12 }, (_,i) => {
                  const count  = monthCount(year, i);
                  const isCurr = i === new Date().getMonth() && year === new Date().getFullYear();
                  return (
                    <button key={i} onClick={() => { setCalDate(new Date(year, i, 1)); setCalView('month'); }}
                      style={{ background:CARD2, border:`1.5px solid ${isCurr?BLUE:BORDER}`, borderRadius:12, padding:'12px 8px', cursor:'pointer', textAlign:'center' }}>
                      <div style={{ fontFamily:INTER, fontSize:12, fontWeight:700, color:isCurr?BLUE:TEXT, marginBottom:4 }}>{MONTH_ABB[i]}</div>
                      <div style={{ fontFamily:INTER, fontSize:18, fontWeight:800, color:count>0?TEXT:MUTED }}>{count > 0 ? count : '—'}</div>
                      {count > 0 && <div style={{ fontFamily:INTER, fontSize:9, color:MUTED, marginTop:2 }}>shifts</div>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        {/* Shifts this month list — bottom on mobile, right col row 2 on desktop */}
        {calView === 'month' && (
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.05)', order: isMobile ? 3 : 0, gridColumn: 2, gridRow: 2 }}>
              <div style={{ marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <Clock size={20} color={BLUE} />
                    <h2 style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:17, margin:0 }}>Shifts This Month</h2>
                  </div>
                  <span style={{ fontFamily:INTER, fontSize:12, color:MUTED }}>{monthShifts.length > 0 ? `${shiftsPage*5+1}–${Math.min(shiftsPage*5+5,monthShifts.length)} of ${monthShifts.length}` : '0'}</span>
                </div>
                {/* Team member filter — role-specific: each concierge can be filtered */}
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  <button onClick={() => { setShiftFilter('all'); setShiftsPage(0); setShiftDay(null); }}
                    style={{ padding:'5px 12px', borderRadius:20, border:`1.5px solid ${shiftFilter==='all'?BLUE:BORDER}`, background:shiftFilter==='all'?`${BLUE}10`:'transparent', fontFamily:INTER, fontSize:11, fontWeight:700, color:shiftFilter==='all'?BLUE:MUTED, cursor:'pointer' }}>
                    All Concierges
                  </button>
                  {team.map(c => (
                    <button key={c.id} onClick={() => { setShiftFilter(c.id); setShiftsPage(0); setShiftDay(null); }}
                      style={{ padding:'5px 12px', borderRadius:20, border:`1.5px solid ${shiftFilter===c.id?BLUE:BORDER}`, background:shiftFilter===c.id?`${BLUE}10`:'transparent', fontFamily:INTER, fontSize:11, fontWeight:700, color:shiftFilter===c.id?BLUE:MUTED, cursor:'pointer' }}>
                      {c.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {pageShifts.map(dateStr => {
                  const s = shiftDatesMap[dateStr];
                  const dp = dateStr.split('-');
                  const label = `${MONTH_ABB[parseInt(dp[1])-1]} ${parseInt(dp[2])}`;
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

  /* ── Tasks list ───────────────────────────────────────────────────────────── */
  const renderTasks = () => {
    const glassCard = { background:CARD, border:`1px solid ${BORDER}`, borderRadius:16 };
    const groups = [
      { key:'in_progress', label:'In Progress', color:ORANGE, SIcon:Send        },
      { key:'pending',     label:'Pending',     color:BLUE,   SIcon:ClipboardList },
      { key:'completed',   label:'Completed',   color:GREEN,  SIcon:CheckCircle  },
    ];
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
        {/* CTA */}
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:24 }}>
          <button onClick={() => setTaskOpen(true)}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 18px', background:BLUE, border:'none', borderRadius:12, fontFamily:INTER, fontSize:13, fontWeight:700, color:'white', cursor:'pointer', boxShadow:`0 4px 14px rgba(255,56,92,0.28)` }}>
            <Plus size={15} color="white" />
            Assign Task
          </button>
        </div>

        {/* Sections */}
        <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
          {groups.map(({ key, label, color, SIcon }) => {
            const items = tasks.filter(t => t.status === key);
            return (
              <div key={key}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <SIcon size={20} color={color} />
                    <h2 style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:17, margin:0 }}>{label}</h2>
                  </div>
                  <span style={{ width:32, height:32, borderRadius:'50%', background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:MUTED, flexShrink:0 }}>
                    {items.length}
                  </span>
                </div>
                {items.length > 0 ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {items.map(t => {
                      const TIcon = CAT_ICON[t.category] ?? HelpCircle;
                      const tc = CAT_COLOR[t.category] ?? MUTED;
                      const pc = PRIORITY_COLOR[t.priority] ?? MUTED;
                      const done = key === 'completed';
                      const ip   = key === 'in_progress';
                      return (
                        <div key={t.id} style={{ ...glassCard, padding:20, display:'flex', alignItems:'flex-start', gap:16 }}>
                          <div style={{ width:48, height:48, borderRadius:14, background:done?CARD2:`${tc}14`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            {done ? <CheckCircle size={24} color={GREEN} /> : <TIcon size={24} color={tc} />}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontFamily:INTER, fontWeight:700, color:done?MUTED:TEXT, fontSize:15, textDecoration:done?'line-through':'none', margin:'0 0 6px', lineHeight:1.35 }}>{t.title}</p>
                            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:6 }}>
                              {t.priority !== 'Standard' && <span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:pc, background:`${pc}14`, borderRadius:6, padding:'3px 7px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{t.priority}</span>}
                              {t.category && <span style={{ fontFamily:INTER, fontSize:11, fontWeight:600, color:MUTED, background:CARD2, border:`1px solid ${BORDER}`, borderRadius:6, padding:'3px 7px' }}>{t.category}</span>}
                              {ip && <span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:ORANGE, background:`${ORANGE}14`, borderRadius:6, padding:'3px 7px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Active</span>}
                            </div>
                            {t.notes && <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, fontStyle:'italic', margin:'0 0 4px' }}>"{t.notes}"</p>}
                            <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:0 }}>→ {t.assignedTo} · Due: {t.dueTime}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ ...glassCard, padding:36, textAlign:'center' }}>
                    <div style={{ width:56, height:56, background:CARD2, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                      <SIcon size={28} color={MUTED} />
                    </div>
                    <p style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:15, margin:'0 0 4px' }}>No {label.toLowerCase()} tasks</p>
                    <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:0 }}>
                      {key==='in_progress'?'Tasks being worked on appear here':key==='pending'?'Tap "Assign New Task" to dispatch work':'Finished tasks appear here'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ── Team ──────────────────────────────────────────────────────────────────── */
  const renderTeam = () => {
    const active  = team.filter(c => c.status !== 'invited');
    const invited = team.filter(c => c.status === 'invited');
    const glassCard = { background:CARD, border:`1px solid ${BORDER}`, borderRadius:16 };
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:0 }}>

        {/* CTA */}
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:24 }}>
          <button onClick={() => setLeasingOpen(true)}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 18px', background:GREEN, border:'none', borderRadius:12, fontFamily:INTER, fontSize:13, fontWeight:700, color:'white', cursor:'pointer', boxShadow:`0 4px 14px rgba(52,199,89,0.28)` }}>
            <UserPlus size={15} color="white" />
            Add Team Member
          </button>
        </div>

        {/* Active members */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Users size={20} color={GREEN} />
              <h2 style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:17, margin:0 }}>Team Members</h2>
            </div>
            <span style={{ width:32, height:32, borderRadius:'50%', background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:MUTED, flexShrink:0 }}>{active.length}</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {active.map(c => {
              const onShift = c.status === 'on_shift';
              const stColor = onShift ? GREEN : MUTED;
              return (
                <div key={c.id} style={{ ...glassCard, padding:20, display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <div style={{ width:56, height:56, borderRadius:16, background:onShift?'rgba(52,199,89,0.12)':CARD2, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontFamily:INTER, fontSize:20, fontWeight:800, color:stColor }}>{c.init}</span>
                    </div>
                    {onShift && <div style={{ position:'absolute', bottom:-2, right:-2, width:14, height:14, borderRadius:'50%', background:GREEN, border:`2px solid ${CARD}` }} />}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                      <p style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:16, margin:0 }}>{c.name}</p>
                      <span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:stColor, background:`${stColor}14`, borderRadius:6, padding:'2px 7px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{onShift?'On Shift':'Off Duty'}</span>
                    </div>
                    <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:'0 0 10px' }}>{c.title}</p>
                    <div style={{ display:'flex', gap:20 }}>
                      {[{l:'Shifts',v:c.shifts.toLocaleString()},{l:'Rating',v:c.rating?`${c.rating} ★`:'—'},{l:'Since',v:c.since??'—'}].map(({l,v}) => (
                        <div key={l}>
                          <span style={{ fontFamily:INTER, fontSize:14, fontWeight:700, color:TEXT }}>{v}</span>
                          <span style={{ fontFamily:INTER, fontSize:11, color:MUTED, marginLeft:4 }}>{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
                    <a href={`tel:${c.phone.replace(/\D/g,'')}`} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:10, textDecoration:'none' }}>
                      <Phone size={14} color={MUTED} /><span style={{ fontFamily:INTER, fontSize:12, fontWeight:700, color:TEXT }}>Call</span>
                    </a>
                    <a href={`mailto:${c.email}`} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:10, textDecoration:'none' }}>
                      <Mail size={14} color={MUTED} /><span style={{ fontFamily:INTER, fontSize:12, fontWeight:700, color:TEXT }}>Email</span>
                    </a>
                    <button
                      onClick={async () => {
                        try {
                          await authApi.resendCredentials(c.concierge_id);
                          alert(`New credentials emailed to ${c.email}`);
                        } catch { alert('Failed to resend credentials.'); }
                      }}
                      style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:10, cursor:'pointer', fontFamily:INTER }}>
                      <KeyRound size={14} color={BLUE} /><span style={{ fontFamily:INTER, fontSize:12, fontWeight:700, color:BLUE }}>Reset PW</span>
                    </button>
                    <button
                      onClick={async () => {
                        if (!window.confirm(`Remove ${c.name} from your team?`)) return;
                        try {
                          await authApi.removeConcierge(c.concierge_id);
                          setTeam(p => p.filter(m => m.concierge_id !== c.concierge_id));
                        } catch { alert('Failed to remove team member.'); }
                      }}
                      style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:10, cursor:'pointer', fontFamily:INTER }}>
                      <Trash2 size={14} color="#ef4444" /><span style={{ fontFamily:INTER, fontSize:12, fontWeight:700, color:'#ef4444' }}>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending invites */}
        {invited.length > 0 && (
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <UserPlus size={20} color={ORANGE} />
                <h2 style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:17, margin:0 }}>Pending Invites</h2>
              </div>
              <span style={{ width:32, height:32, borderRadius:'50%', background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:MUTED, flexShrink:0 }}>{invited.length}</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {invited.map(c => (
                <div key={c.id} style={{ ...glassCard, padding:20, display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ width:56, height:56, borderRadius:16, background:`${ORANGE}14`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontFamily:INTER, fontSize:20, fontWeight:800, color:ORANGE }}>{c.init}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:16, margin:'0 0 2px' }}>{c.name}</p>
                    <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:0 }}>{c.email} · Invited {c.invitedAt} · Awaiting sign-up</p>
                  </div>
                  <span style={{ fontFamily:INTER, fontSize:11, fontWeight:800, color:ORANGE, background:`${ORANGE}12`, borderRadius:8, padding:'4px 12px', flexShrink:0 }}>Pending</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ── More ──────────────────────────────────────────────────────────────────── */
  const SOP_ICON_CONFIG = {
    'Amenity Hours':       Waves,
    'Guest Policy':        User,
    'Noise & Quiet Hours': Phone,
    'Security':            Shield,
    'Move-In / Move-Out':  Truck,
    'Emergency':           AlertTriangle,
    'Package Management':  Package,
    '__uploaded_image__':  Image,
    '__uploaded_pdf__':    FileText,
  };

  const ALL_SOPS = [...uploadedSOPs];
  const SOP_CATEGORIES = ['Amenity Hours','Guest Policy','Noise & Quiet Hours','Security','Move-In / Move-Out','Emergency','Package Management','Other'];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadForm(p => ({ ...p, fileName: file.name, fileType, dataURL: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const saveUploadedSOP = () => {
    const cat = uploadForm.category === 'Other' ? (uploadForm.customCategory.trim() || 'Other') : uploadForm.category;
    if (!cat || !uploadForm.title.trim() || !uploadForm.dataURL) return;
    setUploadedSOPs(p => [...p, {
      id: `upload-${Date.now()}`,
      category: cat,
      title: uploadForm.title.trim(),
      fileName: uploadForm.fileName,
      fileType: uploadForm.fileType,
      dataURL: uploadForm.dataURL,
      _uploaded: true,
    }]);
    setUploadForm({ category:'', customCategory:'', title:'', fileName:'', fileType:'', dataURL:'' });
    setSopUploadOpen(false);
    setSopStep(1);
    if (uploadFileRef.current) uploadFileRef.current.value = '';
  };

  const TRAINING_CATEGORIES = ['Onboarding','Safety & Emergency','Guest Experience','Building Systems','Amenity Operations','Software & Tools','Other'];

  const handleTrainingFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    let fileType = 'pdf';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTrainingForm(p => ({ ...p, fileName: file.name, fileType, dataURL: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const saveTrainingItem = () => {
    const cat = trainingForm.category === 'Other' ? (trainingForm.customCategory.trim() || 'Other') : trainingForm.category;
    if (!cat || !trainingForm.title.trim() || !trainingForm.dataURL) return;
    setTrainingItems(p => [...p, {
      id: `training-${Date.now()}`,
      category: cat,
      title: trainingForm.title.trim(),
      fileName: trainingForm.fileName,
      fileType: trainingForm.fileType,
      dataURL: trainingForm.dataURL,
    }]);
    setTrainingForm({ category:'', customCategory:'', title:'', fileName:'', fileType:'', dataURL:'' });
    setTrainingUploadOpen(false);
    setTrainingStep(1);
    if (trainingFileRef.current) trainingFileRef.current.value = '';
  };

  const renderTraining = () => {
    const CATEGORY_DEFS = [
      { id:'Onboarding',         Icon:UserCheck,  desc:'New hire orientation, building intro, role expectations' },
      { id:'Safety & Emergency', Icon:Shield,     desc:'Emergency protocols, evacuation plans, safety procedures' },
      { id:'Guest Experience',   Icon:Star,       desc:'Check-in, tours, resident relations, hospitality standards' },
      { id:'Building Systems',   Icon:Wrench,     desc:'HVAC, elevators, utilities, mechanical room access' },
      { id:'Amenity Operations', Icon:MapPin,     desc:'Gym, pool, rooftop, lounge — setup, rules, scheduling' },
      { id:'Software & Tools',   Icon:Settings,   desc:'Property management software, access control, apps' },
      { id:'Other',              Icon:HelpCircle, desc:'Any other training material not covered above' },
    ];

    const tInput = {
      width:'100%', padding:'14px 16px', background:CARD2, borderRadius:12,
      color:TEXT, outline:'none', fontSize:16, fontFamily:INTER, boxSizing:'border-box',
    };

    const cancelUpload = () => {
      setTrainingUploadOpen(false);
      setTrainingStep(1);
      setTrainingForm({ category:'', customCategory:'', title:'', fileName:'', fileType:'', dataURL:'' });
      if (trainingFileRef.current) trainingFileRef.current.value = '';
    };

    if (trainingUploadOpen) {
      const step2Valid = trainingForm.title.trim() && trainingForm.dataURL;
      return (
        <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* ── Wizard header ── */}
          <div style={{ flexShrink:0, padding:'16px 0 14px', borderBottom:`1px solid ${BORDER}`, background:CARD, marginBottom:0 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <div>
                <h2 style={{ fontFamily:INTER, fontSize:'1.1rem', fontWeight:700, color:TEXT, letterSpacing:'-0.01em', margin:0 }}>Add Training Material</h2>
                <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:'2px 0 0' }}>Step {trainingStep} of 2</p>
              </div>
              <button onClick={cancelUpload}
                style={{ padding:'10px 20px', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:12, fontSize:14, fontWeight:600, color:TEXT, cursor:'pointer', fontFamily:INTER }}>
                Cancel
              </button>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {[1,2].map(s => (
                <div key={s} style={{ height:4, flex:1, borderRadius:999, background: s <= trainingStep ? RED : `rgba(0,0,0,0.10)` }} />
              ))}
            </div>
          </div>

          {/* ── Step content ── */}
          <div style={{ flex:1, overflowY:'auto' }}>
            <div style={{ padding:'24px 0' }}>

              {/* Step 1: Category selection */}
              {trainingStep === 1 && (
                <div>
                  <h3 style={{ fontFamily:INTER, fontSize:'1.2rem', fontWeight:700, color:TEXT, letterSpacing:'-0.01em', marginBottom:20 }}>
                    What type of training material?
                  </h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {CATEGORY_DEFS.map(({ id, Icon, desc }) => {
                      const sel = trainingForm.category === id;
                      return (
                        <button key={id} onClick={() => setTrainingForm(p => ({ ...p, category:id, customCategory:'' }))}
                          style={{ padding:20, borderRadius:16, textAlign:'left', display:'flex', alignItems:'center', gap:16, cursor:'pointer', width:'100%',
                            background: sel ? 'rgba(239,68,68,0.06)' : CARD,
                            border: sel ? `2px solid ${RED}` : `2px solid ${BORDER}`,
                            boxShadow: sel ? '0 4px 20px rgba(239,68,68,0.12)' : 'none',
                          }}>
                          <div style={{ width:56, height:56, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background: sel ? 'rgba(239,68,68,0.12)' : CARD2 }}>
                            <Icon size={24} color={sel ? RED : MUTED} />
                          </div>
                          <div style={{ flex:1 }}>
                            <p style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:17, margin:'0 0 3px' }}>{id}</p>
                            <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:0, lineHeight:1.4 }}>{desc}</p>
                          </div>
                          {sel && (
                            <div style={{ width:26, height:26, borderRadius:'50%', background:RED, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <Check size={14} color="white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {trainingForm.category === 'Other' && (
                    <div style={{ marginTop:20 }}>
                      <label style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'0.12em', display:'block', marginBottom:10 }}>Custom Category Name</label>
                      <input type="text" placeholder="e.g. Lease Renewals" value={trainingForm.customCategory}
                        onChange={e => setTrainingForm(p => ({ ...p, customCategory:e.target.value }))}
                        style={{ ...tInput, border:`1.5px solid ${trainingForm.customCategory?RED:BORDER}` }} />
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: File + Title */}
              {trainingStep === 2 && (
                <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
                  <div>
                    <h3 style={{ fontFamily:INTER, fontSize:'1.1rem', fontWeight:700, color:TEXT, letterSpacing:'-0.01em', marginBottom:6 }}>Upload your file</h3>
                    <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, marginBottom:16 }}>Attach a PDF document, photo, or video clip.</p>
                    <input ref={trainingFileRef} type="file" accept="image/*,video/*,.pdf,application/pdf"
                      onChange={handleTrainingFileSelect} style={{ display:'none' }} id="training-file-input" />
                    <label htmlFor="training-file-input" style={{ cursor:'pointer' }}>
                      <div style={{ width:'100%', padding: trainingForm.dataURL ? '24px 0' : '48px 0', border:`2px dashed ${trainingForm.dataURL ? RED : BORDER}`, borderRadius:16, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, background: trainingForm.dataURL ? 'rgba(239,68,68,0.04)' : CARD }}>
                        {trainingForm.dataURL ? (
                          <>
                            {trainingForm.fileType === 'image' ? (
                              <img src={trainingForm.dataURL} alt="preview" style={{ maxHeight:140, maxWidth:'90%', borderRadius:10, objectFit:'contain' }} />
                            ) : (
                              <div style={{ width:60, height:60, borderRadius:16, background:'rgba(239,68,68,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                {trainingForm.fileType === 'video' ? <Video size={30} color={RED} /> : <FileText size={30} color={RED} />}
                              </div>
                            )}
                            <p style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:RED, margin:0, textAlign:'center', maxWidth:240, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{trainingForm.fileName}</p>
                            <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:0 }}>Tap to change file</p>
                          </>
                        ) : (
                          <>
                            <Upload size={40} color={MUTED} />
                            <p style={{ fontFamily:INTER, fontSize:15, color:MUTED, fontWeight:600, margin:0 }}>Tap to add file</p>
                            <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:0 }}>PDF, Image, or Video</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>

                  <div>
                    <label style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'0.12em', display:'block', marginBottom:10 }}>Material Title</label>
                    <input type="text" placeholder="e.g. How to Handle a Lockout" value={trainingForm.title}
                      onChange={e => setTrainingForm(p => ({ ...p, title:e.target.value }))}
                      style={{ ...tInput, border:`1.5px solid ${trainingForm.title ? RED : BORDER}` }} />
                  </div>

                  {/* Summary card */}
                  <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, padding:16 }}>
                    <p style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'0.12em', margin:'0 0 8px' }}>Selected Category</p>
                    {(() => {
                      const cat = trainingForm.category === 'Other'
                        ? (trainingForm.customCategory.trim() || 'Other')
                        : trainingForm.category;
                      const def = CATEGORY_DEFS.find(d => d.id === trainingForm.category);
                      const CatIcon = def ? def.Icon : HelpCircle;
                      return (
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{ width:40, height:40, borderRadius:12, background:'rgba(239,68,68,0.10)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <CatIcon size={20} color={RED} />
                          </div>
                          <span style={{ fontFamily:INTER, fontSize:16, fontWeight:700, color:TEXT }}>{cat}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{ flexShrink:0, padding:'12px 0 4px', background:CARD, borderTop:`1px solid ${BORDER}` }}>
            <div style={{ display:'flex', gap:12 }}>
              {trainingStep > 1 && (
                <button onClick={() => setTrainingStep(trainingStep - 1)}
                  style={{ flex:1, padding:'16px 0', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14, fontFamily:INTER, fontSize:16, fontWeight:600, color:TEXT, cursor:'pointer' }}>
                  Back
                </button>
              )}
              {trainingStep === 1 ? (
                <button onClick={() => setTrainingStep(2)} disabled={!trainingForm.category}
                  style={{ flex:2, padding:'16px 0', borderRadius:14, border:'none', background:trainingForm.category?RED:'rgba(255,56,92,0.25)', fontFamily:INTER, fontSize:16, fontWeight:700, color:'white', cursor:trainingForm.category?'pointer':'default' }}>
                  Continue
                </button>
              ) : (
                <button onClick={saveTrainingItem} disabled={!step2Valid}
                  style={{ flex:2, padding:'16px 0', borderRadius:14, border:'none', background:step2Valid?RED:'rgba(255,56,92,0.25)', fontFamily:INTER, fontSize:16, fontWeight:700, color:'white', cursor:step2Valid?'pointer':'default' }}>
                  Save Material
                </button>
              )}
            </div>
          </div>

        </div>
      );
    }

    /* ── List / history view ── */
    return (
      <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column' }}>
        {trainingItems.length === 0 ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', gap:16, padding:'8px 0 0', textAlign:'center' }}>
            <div style={{ width:72, height:72, borderRadius:22, background:'rgba(255,56,92,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <GraduationCap size={36} color={RED} />
            </div>
            <div>
              <p style={{ fontFamily:INTER, fontSize:'1.1rem', fontWeight:700, color:TEXT, margin:'0 0 8px', letterSpacing:'-0.01em' }}>No training materials yet</p>
              <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:0, lineHeight:1.6 }}>Upload documents, images, or videos{'\n'}for your team to reference.</p>
            </div>
          </div>
        ) : (
          <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:12 }}>
            {trainingItems.map((item) => {
              const def = CATEGORY_DEFS.find(d => d.id === item.category);
              const CatIcon = def ? def.Icon : HelpCircle;
              const typeLabel = item.fileType === 'video' ? 'Video' : item.fileType === 'image' ? 'Photo' : 'PDF';
              const typeBadgeColor = item.fileType === 'video' ? BLUE : item.fileType === 'image' ? GREEN : ORANGE;
              const TypeIcon = item.fileType === 'video' ? Video : item.fileType === 'image' ? Image : FileText;
              return (
                <button key={item.id} onClick={() => setFullscreenTraining(item)}
                  style={{ padding:20, borderRadius:16, textAlign:'left', display:'flex', alignItems:'center', gap:16, cursor:'pointer', width:'100%',
                    background:CARD, border:`1px solid ${BORDER}` }}>
                  {/* Icon */}
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
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, flexShrink:0 }}>
                    <button onClick={e => { e.stopPropagation(); setTrainingItems(p=>p.filter(t=>t.id!==item.id)); }}
                      style={{ width:34, height:34, borderRadius:10, border:'none', background:'rgba(255,59,48,0.08)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                      <Trash2 size={15} color={RED} />
                    </button>
                    <ChevronRight size={18} color={MUTED} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div style={{ flexShrink:0, paddingTop:16 }}>
          <button onClick={() => setTrainingUploadOpen(true)}
            style={{ width:'100%', padding:'16px 0', borderRadius:14, border:'none', background:RED, fontFamily:INTER, fontSize:16, fontWeight:700, color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
            <Upload size={18} color="white" />
            Add Training Material
          </button>
        </div>
      </div>
    );
  };

  const SOP_COLOR = {
    'Emergency':          RED,
    'Security':           ORANGE,
    'Move-In / Move-Out': BLUE,
    'Amenity Hours':      GREEN,
    'Guest Policy':       BLUE,
    'Noise & Quiet Hours':ORANGE,
    'Package Management': GREEN,
  };

  const renderMore = () => {
    const SOP_CATEGORY_DEFS = [
      { id:'Amenity Hours',       Icon:Waves,         desc:'Pool, gym, rooftop hours and access rules' },
      { id:'Guest Policy',        Icon:User,          desc:'Visitor registration, guest parking, overnight stays' },
      { id:'Noise & Quiet Hours', Icon:Phone,         desc:'Quiet hours, disturbance policies, common area rules' },
      { id:'Security',            Icon:Shield,        desc:'Key control, access cards, camera systems, lock procedures' },
      { id:'Move-In / Move-Out',  Icon:Truck,         desc:'Elevator reservations, move procedures, inspection checklists' },
      { id:'Emergency',           Icon:AlertTriangle, desc:'Fire evacuations, medical emergencies, power outages' },
      { id:'Package Management',  Icon:Package,       desc:'Package receiving, storage, resident notification' },
      { id:'Other',               Icon:HelpCircle,    desc:'Any other building policy or procedure' },
    ];

    const sInput = {
      width:'100%', padding:'14px 16px', background:CARD2, borderRadius:12,
      color:TEXT, outline:'none', fontSize:16, fontFamily:INTER, boxSizing:'border-box',
    };

    const cancelSop = () => {
      setSopUploadOpen(false);
      setSopStep(1);
      setUploadForm({ category:'', customCategory:'', title:'', fileName:'', fileType:'', dataURL:'' });
      if (uploadFileRef.current) uploadFileRef.current.value = '';
    };

    if (sopUploadOpen) {
      const step2Valid = uploadForm.title.trim() && uploadForm.dataURL;
      return (
        <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* ── Wizard header ── */}
          <div style={{ flexShrink:0, padding:'16px 0 14px', borderBottom:`1px solid ${BORDER}`, background:CARD }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <div>
                <h2 style={{ fontFamily:INTER, fontSize:'1.1rem', fontWeight:700, color:TEXT, letterSpacing:'-0.01em', margin:0 }}>Upload a Binder Document</h2>
                <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:'2px 0 0' }}>Step {sopStep} of 2</p>
              </div>
              <button onClick={cancelSop}
                style={{ padding:'10px 20px', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:12, fontSize:14, fontWeight:600, color:TEXT, cursor:'pointer', fontFamily:INTER }}>
                Cancel
              </button>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {[1,2].map(s => (
                <div key={s} style={{ height:4, flex:1, borderRadius:999, background: s <= sopStep ? RED : 'rgba(0,0,0,0.10)' }} />
              ))}
            </div>
          </div>

          {/* ── Step content ── */}
          <div style={{ flex:1, overflowY:'auto' }}>
            <div style={{ padding:'24px 0' }}>

              {/* Step 1: Category selection */}
              {sopStep === 1 && (
                <div>
                  <h3 style={{ fontFamily:INTER, fontSize:'1.2rem', fontWeight:700, color:TEXT, letterSpacing:'-0.01em', marginBottom:20 }}>
                    What type of procedure is this?
                  </h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {SOP_CATEGORY_DEFS.map(({ id, Icon, desc }) => {
                      const sel = uploadForm.category === id;
                      const catColor = SOP_COLOR[id] || MUTED;
                      return (
                        <button key={id} onClick={() => setUploadForm(p => ({ ...p, category:id, customCategory:'' }))}
                          style={{ padding:20, borderRadius:16, textAlign:'left', display:'flex', alignItems:'center', gap:16, cursor:'pointer', width:'100%',
                            background: sel ? 'rgba(239,68,68,0.06)' : CARD,
                            border: sel ? `2px solid ${RED}` : `2px solid ${BORDER}`,
                            boxShadow: sel ? '0 4px 20px rgba(239,68,68,0.12)' : 'none',
                          }}>
                          <div style={{ width:56, height:56, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background: sel ? 'rgba(239,68,68,0.12)' : CARD2 }}>
                            <Icon size={24} color={sel ? RED : catColor} />
                          </div>
                          <div style={{ flex:1 }}>
                            <p style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:17, margin:'0 0 3px' }}>{id}</p>
                            <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:0, lineHeight:1.4 }}>{desc}</p>
                          </div>
                          {sel && (
                            <div style={{ width:26, height:26, borderRadius:'50%', background:RED, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <Check size={14} color="white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {uploadForm.category === 'Other' && (
                    <div style={{ marginTop:20 }}>
                      <label style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'0.12em', display:'block', marginBottom:10 }}>Custom Category Name</label>
                      <input type="text" placeholder="e.g. Parking Policy" value={uploadForm.customCategory}
                        onChange={e => setUploadForm(p => ({ ...p, customCategory:e.target.value }))}
                        style={{ ...sInput, border:`1.5px solid ${uploadForm.customCategory ? RED : BORDER}` }} />
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: File + Title */}
              {sopStep === 2 && (
                <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
                  <div>
                    <h3 style={{ fontFamily:INTER, fontSize:'1.1rem', fontWeight:700, color:TEXT, letterSpacing:'-0.01em', marginBottom:6 }}>Upload your document</h3>
                    <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, marginBottom:16 }}>Scan pages, take a photo, or upload a PDF from your binder.</p>
                    <input ref={uploadFileRef} type="file" accept="image/*,.pdf,application/pdf"
                      onChange={handleFileSelect} style={{ display:'none' }} id="sop-file-input" />
                    <label htmlFor="sop-file-input" style={{ cursor:'pointer' }}>
                      <div style={{ width:'100%', padding: uploadForm.dataURL ? '24px 0' : '48px 0', border:`2px dashed ${uploadForm.dataURL ? RED : BORDER}`, borderRadius:16, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, background: uploadForm.dataURL ? 'rgba(239,68,68,0.04)' : CARD }}>
                        {uploadForm.dataURL ? (
                          <>
                            {uploadForm.fileType === 'image' ? (
                              <img src={uploadForm.dataURL} alt="preview" style={{ maxHeight:140, maxWidth:'90%', borderRadius:10, objectFit:'contain' }} />
                            ) : (
                              <div style={{ width:60, height:60, borderRadius:16, background:'rgba(239,68,68,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <FileText size={30} color={RED} />
                              </div>
                            )}
                            <p style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:RED, margin:0, textAlign:'center', maxWidth:240, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{uploadForm.fileName}</p>
                            <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:0 }}>Tap to change file</p>
                          </>
                        ) : (
                          <>
                            <Upload size={40} color={MUTED} />
                            <p style={{ fontFamily:INTER, fontSize:15, color:MUTED, fontWeight:600, margin:0 }}>Tap to add file</p>
                            <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:0 }}>PDF, JPG, or PNG</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>

                  <div>
                    <label style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'0.12em', display:'block', marginBottom:10 }}>Document Title</label>
                    <input type="text" placeholder="e.g. Building Rules & Regulations" value={uploadForm.title}
                      onChange={e => setUploadForm(p => ({ ...p, title:e.target.value }))}
                      style={{ ...sInput, border:`1.5px solid ${uploadForm.title ? RED : BORDER}` }} />
                  </div>

                  {/* Summary card */}
                  <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, padding:16 }}>
                    <p style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'0.12em', margin:'0 0 8px' }}>Selected Category</p>
                    {(() => {
                      const cat = uploadForm.category === 'Other'
                        ? (uploadForm.customCategory.trim() || 'Other')
                        : uploadForm.category;
                      const def = SOP_CATEGORY_DEFS.find(d => d.id === uploadForm.category);
                      const CatIcon = def ? def.Icon : HelpCircle;
                      const catColor = SOP_COLOR[uploadForm.category] || MUTED;
                      return (
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{ width:40, height:40, borderRadius:12, background:'rgba(239,68,68,0.10)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <CatIcon size={20} color={RED} />
                          </div>
                          <div>
                            <span style={{ fontFamily:INTER, fontSize:16, fontWeight:700, color:TEXT }}>{cat}</span>
                            {def && <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:'2px 0 0' }}>{def.desc}</p>}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{ flexShrink:0, padding:'12px 0 4px', background:CARD, borderTop:`1px solid ${BORDER}` }}>
            <div style={{ display:'flex', gap:12 }}>
              {sopStep > 1 && (
                <button onClick={() => setSopStep(sopStep - 1)}
                  style={{ flex:1, padding:'16px 0', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14, fontFamily:INTER, fontSize:16, fontWeight:600, color:TEXT, cursor:'pointer' }}>
                  Back
                </button>
              )}
              {sopStep === 1 ? (
                <button onClick={() => setSopStep(2)} disabled={!uploadForm.category}
                  style={{ flex:2, padding:'16px 0', borderRadius:14, border:'none', background:uploadForm.category?RED:'rgba(255,56,92,0.25)', fontFamily:INTER, fontSize:16, fontWeight:700, color:'white', cursor:uploadForm.category?'pointer':'default' }}>
                  Continue
                </button>
              ) : (
                <button onClick={saveUploadedSOP} disabled={!step2Valid}
                  style={{ flex:2, padding:'16px 0', borderRadius:14, border:'none', background:step2Valid?RED:'rgba(255,56,92,0.25)', fontFamily:INTER, fontSize:16, fontWeight:700, color:'white', cursor:step2Valid?'pointer':'default' }}>
                  Save Document
                </button>
              )}
            </div>
          </div>

        </div>
      );
    }

    return (
      <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column' }}>
        {/* ── SOP list view ── */}
        <>
          {/* CTA button */}
          <div style={{ paddingBottom:16, flexShrink:0 }}>
            <button onClick={() => setSopUploadOpen(true)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:16, padding:'20px', background:BLUE, border:'none', borderRadius:18, cursor:'pointer', textAlign:'left', boxShadow:'0 8px 28px rgba(255,56,92,0.32)' }}>
              <div style={{ width:56, height:56, borderRadius:16, background:'rgba(255,255,255,0.20)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Upload size={26} color="white" strokeWidth={2.5} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:INTER, fontSize:17, fontWeight:700, color:'white', marginBottom:3 }}>Upload Document</div>
                <div style={{ fontFamily:INTER, fontSize:13, color:'rgba(255,255,255,0.75)' }}>Scan or photo pages from your binder</div>
              </div>
              <ChevronRight size={22} color="rgba(255,255,255,0.75)" />
            </button>
          </div>

          {/* Procedures section header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <BookOpen size={20} color={BLUE} />
              <h2 style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:17, margin:0 }}>Procedures</h2>
            </div>
            <span style={{ width:32, height:32, borderRadius:'50%', background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:MUTED, flexShrink:0 }}>{ALL_SOPS.length}</span>
          </div>

          {/* SOP accordion list */}
          <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:10, paddingBottom:24 }}>
            {ALL_SOPS.map((sop) => {
              const open = expandedSOPId === sop.id;
              const isUploaded = !!sop._uploaded;
              const SopIcon = isUploaded
                ? (sop.fileType === 'image' ? Image : FileText)
                : (SOP_ICON_CONFIG[sop.category] || BookOpen);
              const catColor = SOP_COLOR[sop.category] || MUTED;
              const isEmergency = sop.category === 'Emergency';
              return (
                <div key={sop.id} style={{ background:CARD, border:`1.5px solid ${open ? catColor : BORDER}`, borderRadius:16, overflow:'hidden', transition:'border-color 150ms', boxShadow: open && isEmergency ? '0 4px 20px rgba(255,59,48,0.10)' : open ? '0 4px 20px rgba(0,0,0,0.06)' : 'none' }}>
                  <button onClick={() => setExpandedSOPId(open?null:sop.id)}
                    style={{ width:'100%', display:'flex', alignItems:'center', gap:16, padding:20, background:'none', border:'none', cursor:'pointer', textAlign:'left' }}>
                    <div style={{ width:56, height:56, borderRadius:16, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:open?`${catColor}14`:CARD2, transition:'background 150ms' }}>
                      <SopIcon size={24} color={open?catColor:MUTED} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4, flexWrap:'wrap' }}>
                        <span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:open?catColor:MUTED, letterSpacing:'0.12em', textTransform:'uppercase', transition:'color 150ms' }}>{sop.category}</span>
                        {isUploaded && <span style={{ fontFamily:INTER, fontSize:9, fontWeight:700, color:GREEN, background:'rgba(52,199,89,0.10)', borderRadius:4, padding:'1px 6px', textTransform:'uppercase' }}>{sop.fileType === 'image' ? 'Photo' : 'PDF'}</span>}
                      </div>
                      <div style={{ fontFamily:INTER, fontSize:16, fontWeight:700, color:TEXT, lineHeight:1.3 }}>{sop.title}</div>
                      {isUploaded && sop.fileName && (
                        <div style={{ fontFamily:INTER, fontSize:11, color:MUTED, marginTop:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sop.fileName}</div>
                      )}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                      {isUploaded && (
                        <button onClick={e => {
                          e.stopPropagation();
                          setUploadedSOPs(p=>p.filter(s=>s.id!==sop.id));
                          if(expandedSOPId===sop.id) setExpandedSOPId(null);
                        }} style={{ width:30, height:30, borderRadius:8, border:'none', background:'rgba(255,59,48,0.08)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                          <X size={14} color={RED} />
                        </button>
                      )}
                      <ChevronDown size={20} color={MUTED} strokeWidth={2} style={{ transform:open?'rotate(180deg)':'none', transition:'transform 200ms' }} />
                    </div>
                  </button>

                  {open && (
                    <div style={{ borderTop:`1px solid ${BORDER}` }}>
                      {isUploaded ? (
                        /* Document thumbnail — tap to go fullscreen */
                        <div style={{ padding:'16px 20px 20px' }}>
                          <button onClick={e => { e.stopPropagation(); setFullscreenDoc(sop); }}
                            style={{ width:'100%', background:'none', border:'none', padding:0, cursor:'pointer', display:'block' }}>
                            <div style={{ position:'relative', borderRadius:12, overflow:'hidden', border:`1px solid ${BORDER}` }}>
                              {sop.fileType === 'image' ? (
                                <img src={sop.dataURL} alt={sop.title}
                                  style={{ width:'100%', display:'block', maxHeight:220, objectFit:'cover', background:CARD2 }} />
                              ) : (
                                <iframe src={sop.dataURL} title={sop.title}
                                  style={{ width:'100%', height:200, border:'none', display:'block', pointerEvents:'none' }}
                                  tabIndex={-1} />
                              )}
                              {/* Tap-to-fullscreen overlay */}
                              <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.30)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
                                <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(255,255,255,0.95)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px rgba(0,0,0,0.25)' }}>
                                  <Eye size={22} color="#111" />
                                </div>
                                <span style={{ fontFamily:INTER, fontSize:13, fontWeight:700, color:'white', letterSpacing:'-0.01em' }}>Tap to view full screen</span>
                              </div>
                            </div>
                          </button>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:10, padding:'9px 13px', background:CARD2, borderRadius:10 }}>
                            <Eye size={14} color={MUTED} />
                            <span style={{ fontFamily:INTER, fontSize:12, color:MUTED, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sop.fileName}</span>
                          </div>
                        </div>
                      ) : (
                        /* Text content */
                        <div style={{ padding:'0 20px 20px' }}>
                          <p style={{ fontFamily:INTER, fontSize:14, color:TEXT, lineHeight:1.8, margin:'16px 0 0', whiteSpace:'pre-line' }}>{sop.content}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      </div>
    );
  };

  /* ── Layout ───────────────────────────────────────────────────────────────── */
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:BG, fontFamily:INTER }}>
      {/* Screen-reader live region */}
      <div role="status" aria-live="polite" aria-atomic="true" style={{ position:'absolute', width:1, height:1, margin:-1, padding:0, overflow:'hidden', clip:'rect(0,0,0,0)', whiteSpace:'nowrap', border:0 }}>
        {srAnnounce}
      </div>

      {/* ── Full-width desktop header ─────────────────────────────────────────── */}
      {!isMobile && (
        <div style={{ height:52, background:'#111827', display:'flex', alignItems:'center', padding:'0 20px', flexShrink:0, gap:14, zIndex:20 }}>
          {/* Left: branding — compact */}
          <div style={{ display:'flex', alignItems:'center', gap:9, flexShrink:0 }}>
            <div style={{ width:28, height:28, borderRadius:7, background:'rgba(255,255,255,0.10)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Building2 size={15} color="white" />
            </div>
            <span style={{ fontFamily:INTER, fontSize:13, fontWeight:700, color:'white', letterSpacing:'-0.01em', whiteSpace:'nowrap' }}>{propertyName}</span>
          </div>

          {/* Search — fills all remaining space */}
          <div style={{ flex:1, position:'relative', marginRight:520, marginLeft:220 }}>
            <Search size={14} color="#6B7280" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
            <input
              ref={searchInputRef}
              aria-label="Search residents, tasks, shifts, incidents"
              placeholder="Search residents, tasks, shifts, incidents…"
              style={{ width:'100%', height:34, background:'#FFFFFF', border:'none', borderRadius:6, paddingLeft:36, paddingRight:14, fontFamily:INTER, fontSize:13, color:'#111827', outline:'none', boxSizing:'border-box' }}
            />
          </div>

          {/* Dark/light toggle */}
          <button
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{ flexShrink:0, width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.10)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'background 150ms' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.10)'}
          >
            {isDarkMode
              ? <Sun size={15} color="#FFD60A" />
              : <Moon size={15} color="rgba(255,255,255,0.80)" />}
          </button>
        </div>
      )}

      {/* ── Body row: sidebar + content ───────────────────────────────────────── */}
      <div style={{ display:'flex', flex:1, minHeight:0 }}>

      {/* ── DESKTOP SIDEBAR — persistent, always visible ≥768px ──────────────── */}
      {!isMobile && (
        <div style={{ width: sidebarCollapsed ? 64 : 248, minWidth: sidebarCollapsed ? 64 : 248, flexShrink:0, background:CARD, borderRight:`1px solid ${BORDER}`, display:'flex', flexDirection:'column', overflow:'hidden', zIndex:10, height:'100%', transition:'width 220ms ease, min-width 220ms ease' }}>
          <nav style={{ padding: sidebarCollapsed ? '16px 8px 4px' : '12px 8px 4px', overflow:'hidden' }}>
            {NAV.map(({ id, Icon:NavIcon, label, action }) => {
              const active = !action && tab === id;
              const handleClick = () => {
                if (sidebarCollapsed) setSidebarCollapsed(false);
                if (action === 'task')           setTaskOpen(true);
                else if (action === 'leasing')   setLeasingOpen(true);
                else if (action === 'emergency') setConOpen(true);
                else setTab(id);
              };
              return (
                <button key={id} onClick={handleClick} title={sidebarCollapsed ? label : undefined}
                  className="nav-btn touch-target"
                  style={{ display:'flex', alignItems:'center', gap: sidebarCollapsed ? 0 : 12, justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding:'11px 12px', marginBottom:2, border:'none', cursor:'pointer', textAlign:'left', background:active?'rgba(255,56,92,0.08)':'transparent', borderRadius:12, width:'100%', position:'relative', transition:'background 120ms', minHeight:44 }}>
                  <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:active?'rgba(255,56,92,0.12)':CARD2, display:'flex', alignItems:'center', justifyContent:'center', transition:'background 120ms', position:'relative' }}>
                    <NavIcon size={18} color={active?BLUE:MUTED} strokeWidth={active?2.2:1.6} />
                    {id==='home' && incidents.length>0 && sidebarCollapsed && (
                      <div style={{ position:'absolute', top:2, right:2, width:14, height:14, borderRadius:'50%', background:RED, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontFamily:INTER, fontSize:7, fontWeight:800, color:'white' }}>{incidents.length}</span>
                      </div>
                    )}
                  </div>
                  {!sidebarCollapsed && <span style={{ fontFamily:INTER, fontSize:15, fontWeight:active?700:500, color:active?TEXT:MUTED, flex:1, letterSpacing:active?'-0.01em':'normal', overflow:'hidden', whiteSpace:'nowrap' }}>{label}</span>}
                  {!sidebarCollapsed && id==='home' && incidents.length>0 && (
                    <div style={{ width:18, height:18, borderRadius:'50%', background:RED, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:'white' }}>{incidents.length}</span>
                    </div>
                  )}
                  {!sidebarCollapsed && id==='home' && (
                    <button onClick={(e) => { e.stopPropagation(); setSidebarCollapsed(true); }}
                      aria-label="Collapse sidebar"
                      style={{ width:28, height:28, borderRadius:7, border:'none', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                      <X size={16} color={MUTED} />
                    </button>
                  )}
                  {!sidebarCollapsed && id!=='home' && active && <div style={{ width:6, height:6, borderRadius:'50%', background:BLUE, flexShrink:0 }} />}
                </button>
              );
            })}
          </nav>
          <div style={{ marginTop:'auto', padding: sidebarCollapsed ? '12px 0' : '20px 20px 32px', display:'flex', alignItems:'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
            {!sidebarCollapsed && <span style={{ fontFamily:"'Helvetica Neue','Arial',sans-serif", fontSize:11, fontWeight:300, color:TEXT, letterSpacing:'0.22em', textTransform:'uppercase' }}>onepermit</span>}
          </div>
        </div>
      )}

      {/* ── MOBILE DRAWER — overlay, <768px ──────────────────────────────────── */}
      {isMobile && (
        <>
          {!sidebarOpen && (
            <div style={{ position:'fixed', top:0, left:0, right:0, height:56, background:CARD, borderBottom:`1px solid ${BORDER}`, display:'flex', alignItems:'center', padding:'0 14px', zIndex:48, gap:10 }}>
              <button onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation menu"
                style={{ width:36, height:36, borderRadius:10, border:'none', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                <Menu size={20} color={TEXT} />
              </button>
              <div style={{ flex:1, textAlign:'center', fontFamily:INTER, fontSize:15, fontWeight:700, color:TEXT, letterSpacing:'-0.01em' }}>
                {propertyName}
              </div>
              <button onClick={toggleTheme}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{ width:36, height:36, borderRadius:10, border:'none', background: isDarkMode ? 'rgba(255,214,10,0.12)' : BORDER, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                {isDarkMode ? <Sun size={17} color="#FFD60A" /> : <Moon size={17} color={MUTED} />}
              </button>
            </div>
          )}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div key="mgr-sb-bg"
                  initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  transition={{ duration:0.18 }}
                  onClick={() => setSidebarOpen(false)}
                  style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(2px)' }} />
                <motion.div key="mgr-sb-panel"
                  initial={{ x:-260 }} animate={{ x:0 }} exit={{ x:-260 }}
                  transition={{ type:'spring', damping:28, stiffness:280 }}
                  style={{ position:'fixed', left:0, top:0, height:'100vh', width:248, background:CARD, borderRight:`1px solid ${BORDER}`, display:'flex', flexDirection:'column', overflow:'hidden', zIndex:55 }}>
                  {/* Profile — top on mobile, Latch-style */}
                  <div style={{ position:'relative', padding:'24px 20px 16px', flexShrink:0, borderBottom:`1px solid ${BORDER}` }}>
                    <button onClick={() => setSidebarOpen(false)}
                      aria-label="Close navigation menu"
                      style={{ position:'absolute', top:12, right:12, width:32, height:32, borderRadius:8, border:'none', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                      <X size={20} color={MUTED} />
                    </button>
                    <div style={{ fontFamily:INTER, fontSize:18, fontWeight:700, color:TEXT, lineHeight:1.3, letterSpacing:'-0.01em' }}>
                      Welcome,<br />{(authUser?.name || 'Manager')}!
                    </div>
                    <div style={{ fontFamily:INTER, fontSize:13, color:MUTED, marginTop:6 }}>{(authUser?.email || '')}</div>
                  </div>
                  <nav style={{ padding:'8px 8px 4px', overflow:'hidden' }}>
                    {NAV.map(({ id, Icon:NavIcon, label, action }) => {
                      const active = !action && tab === id;
                      const handleClick = () => {
                        setSidebarOpen(false);
                        if (action === 'task')           setTaskOpen(true);
                        else if (action === 'leasing')   setLeasingOpen(true);
                        else if (action === 'emergency') setConOpen(true);
                        else setTab(id);
                      };
                      return (
                        <button key={id} onClick={handleClick}
                          className="nav-btn touch-target"
                          style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 12px', marginBottom:2, border:'none', cursor:'pointer', textAlign:'left', background:active?'rgba(255,56,92,0.08)':'transparent', borderRadius:12, width:'100%', position:'relative', transition:'background 120ms', minHeight:44 }}>
                          <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:active?'rgba(255,56,92,0.12)':CARD2, display:'flex', alignItems:'center', justifyContent:'center', transition:'background 120ms' }}>
                            <NavIcon size={18} color={active?BLUE:MUTED} strokeWidth={active?2.2:1.6} />
                          </div>
                          <span style={{ fontFamily:INTER, fontSize:15, fontWeight:active?700:500, color:active?TEXT:MUTED, flex:1, letterSpacing:active?'-0.01em':'normal' }}>{label}</span>
                          {active && <div style={{ width:6, height:6, borderRadius:'50%', background:BLUE, flexShrink:0 }} />}
                        </button>
                      );
                    })}
                  </nav>
                  {/* Bottom branding */}
                  <div style={{ marginTop:'auto', padding:'20px 20px 32px' }}>
                    <span style={{ fontFamily:"'Helvetica Neue','Arial',sans-serif", fontSize:11, fontWeight:300, color:TEXT, letterSpacing:'0.22em', textTransform:'uppercase' }}>onepermit</span>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Home content — always visible */}
        <div style={{ flex:1, overflowY:'auto', padding: isMobile ? '64px 16px 48px' : '28px 28px 48px' }}>
          {renderHome()}
        </div>
      </div>

      </div>{/* end body row */}

      {/* ── Tab panels — slide in from right like concierge ───────────────────── */}
      <AnimatePresence>
        {tab !== 'home' && (
          <>
            <motion.div key="panel-bg"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              transition={{ duration:0.2 }}
              onClick={() => setTab('home')}
              style={{ position:'fixed', inset:0, zIndex:65, background:'rgba(0,0,0,0.32)', backdropFilter:'blur(2px)' }} />

            <motion.div key={tab}
              initial={{ x:'110%' }} animate={{ x:0 }} exit={{ x:'110%' }}
              transition={{ type:'spring', damping:32, stiffness:300 }}
              style={{ position:'fixed', top:16, bottom:16, right:16, background:BG, zIndex:66, display:'flex', flexDirection:'column', borderRadius:24, overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.20)', ...(tab==='shifts' ? { left: isMobile?16:(sidebarCollapsed?80:264) } : { width:Math.min(isMobile ? 700 : 640, window.innerWidth-(isMobile?32:280)) }) }}>

              {/* Panel header */}
              <div style={{ background:CARD, borderBottom:`1px solid ${BORDER}`, padding:'20px 32px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <p style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:MUTED, letterSpacing:'0.1em', textTransform:'uppercase', margin:'0 0 2px' }}>{propertyName}</p>
                  <h2 style={{ fontFamily:INTER, fontSize:20, fontWeight:700, color:TEXT, margin:0, letterSpacing:'-0.01em' }}>
                    {{ shifts:'Shift Calendar', tasks:'Tasks', team:'Team', more:'Building SOPs', training:'Training', sections:'Shift Sections', settings:'Settings' }[tab]}
                  </h2>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {tab === 'sections' && (
                    <button onClick={() => { setShowAddSection(s => !s); setNewSectionDraft({ label:'', desc:'' }); }}
                      style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:showAddSection ? CARD2 : BLUE, border:`1px solid ${showAddSection ? BORDER : BLUE}`, borderRadius:10, cursor:'pointer', transition:'all 150ms' }}>
                      <Plus size={14} color={showAddSection ? MUTED : 'white'} />
                      <span style={{ fontFamily:INTER, fontSize:13, fontWeight:700, color:showAddSection ? MUTED : 'white' }}>Add</span>
                    </button>
                  )}
                  <button onClick={() => setTab('home')}
                    style={{ width:36, height:36, borderRadius:10, border:`1px solid ${BORDER}`, background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                    <X size={16} color={MUTED} />
                  </button>
                </div>
              </div>

              {/* Panel content */}
              <div style={{ flex:1, overflowY:'auto', padding: tab === 'settings' ? 0 : (isMobile ? '16px 16px 48px' : '28px 32px 48px') }}>
                {tab==='shifts'    && renderShifts()}
                {tab==='tasks'     && renderTasks()}
                {tab==='team'      && renderTeam()}
                {tab==='more'      && renderMore()}
                {tab==='training'  && renderTraining()}
                {tab==='sections'  && renderConciergeSetup()}
                {tab==='settings'  && renderSettings()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>

        {/* Backdrop — shared for all panels */}
        {(taskOpen || conOpen || leasingOpen) && (
          <motion.div key="backdrop"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}
            onClick={() => { closeTask(); setConOpen(false); setLeasingOpen(false); }}
            style={{ position:'fixed', inset:0, zIndex:67, background:'rgba(0,0,0,0.32)', backdropFilter:'blur(2px)' }}
          />
        )}


        {/* Task Wizard */}
        {taskOpen && (
          <motion.div key="task-modal" ref={taskModalRef}
            role="dialog" aria-modal="true" aria-label="Assign Task"
            initial={{ x:'110%' }} animate={{ x:0 }} exit={{ x:'110%' }}
            transition={{ type:'spring', damping:32, stiffness:300 }}
            style={{ position:'fixed', right:16, top:16, bottom:16, width:Math.min(isMobile ? 700 : 640, window.innerWidth - (isMobile ? 32 : 280)), zIndex:68, background:BG, borderRadius:24, boxShadow:'0 24px 64px rgba(0,0,0,0.20)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

            <div style={{ padding:'16px 20px 14px', borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div>
                  <div style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:MUTED, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:2 }}>{propertyName}</div>
                  <div style={{ fontFamily:INTER, fontSize:20, fontWeight:700, color:TEXT, letterSpacing:'-0.01em', margin:'0 0 2px' }}>Assign Task</div>
                  <div style={{ fontFamily:INTER, fontSize:13, color:MUTED }}>Step {taskStep} of 2</div>
                </div>
                <button onClick={closeTask} style={{ width:36, height:36, borderRadius:10, border:`1px solid ${BORDER}`, background:CARD, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                  <X size={18} color={MUTED} />
                </button>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {[1,2].map(s => <div key={s} style={{ flex:1, height:4, borderRadius:999, background:s<=taskStep?RED:'rgba(0,0,0,0.10)', transition:'background 200ms' }} />)}
              </div>
            </div>

            <div style={{ flex:1, overflowY:'auto', padding:'24px 20px' }}>
              {taskStep === 1 ? (
                <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
                  <h3 style={{ fontFamily:INTER, fontSize:'1.2rem', fontWeight:700, color:TEXT, letterSpacing:'-0.01em', margin:0 }}>What needs to be done?</h3>

                  <div>
                    <label style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, display:'block', marginBottom:10 }}>Task Title *</label>
                    <input type="text" placeholder="e.g. Close rooftop pool at 10 PM" value={taskForm.title}
                      onChange={e=>setTaskForm(p=>({...p,title:e.target.value}))}
                      style={{ width:'100%', padding:'14px 16px', borderRadius:12, border:taskForm.title?`1.5px solid ${BLUE}`:`1.5px solid ${BORDER}`, fontFamily:INTER, fontSize:16, color:TEXT, background:CARD2, outline:'none', boxSizing:'border-box' }} />
                  </div>

                  <div>
                    <label style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, display:'block', marginBottom:10 }}>Notes (Optional)</label>
                    <textarea placeholder="Details or context…" value={taskForm.notes} rows={4}
                      onChange={e=>setTaskForm(p=>({...p,notes:e.target.value}))}
                      style={{ width:'100%', padding:'14px 16px', borderRadius:12, border:taskForm.notes?`1.5px solid ${BLUE}`:`1.5px solid ${BORDER}`, fontFamily:INTER, fontSize:16, color:TEXT, background:CARD2, outline:'none', resize:'none', boxSizing:'border-box', lineHeight:1.5 }} />
                  </div>

                  <div>
                    <label style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, display:'block', marginBottom:12 }}>Due Time</label>
                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                      {[
                        { id:'ASAP',         Icon:AlertTriangle, desc:'Needs immediate attention'       },
                        { id:'End of shift', Icon:LogOut,        desc:'Complete before shift ends'      },
                        { id:'Tonight',      Icon:Archive,       desc:'By end of the day'               },
                        { id:'Tomorrow AM',  Icon:Calendar,      desc:'First thing in the morning'      },
                      ].map(({ id:dt, Icon:DTIcon, desc }) => {
                        const sel = taskForm.dueTime === dt;
                        return (
                          <button key={dt} onClick={()=>setTaskForm(p=>({...p,dueTime:dt}))}
                            style={{ padding:20, borderRadius:16, textAlign:'left', display:'flex', alignItems:'center', gap:16, cursor:'pointer', border:`2px solid ${sel?BLUE:BORDER}`, background:sel?'rgba(255,56,92,0.06)':CARD, boxShadow:sel?`0 4px 20px rgba(255,56,92,0.12)`:'0 2px 8px rgba(0,0,0,0.05)' }}>
                            <div style={{ width:56, height:56, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:sel?'rgba(255,56,92,0.12)':CARD2 }}>
                              <DTIcon size={24} color={sel?BLUE:MUTED} />
                            </div>
                            <div style={{ flex:1 }}>
                              <p style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:16, margin:'0 0 2px' }}>{dt}</p>
                              <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:0 }}>{desc}</p>
                            </div>
                            {sel && <div style={{ width:24, height:24, borderRadius:'50%', background:BLUE, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Check size={12} color="white" strokeWidth={3} /></div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
                  <h3 style={{ fontFamily:INTER, fontSize:'1.2rem', fontWeight:700, color:TEXT, letterSpacing:'-0.01em', margin:0 }}>Who should handle this?</h3>

                  <div>
                    <label style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, display:'block', marginBottom:12 }}>Assign To *</label>
                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                      {team.filter(c=>c.status!=='invited').map(c => {
                        const sel = taskForm.toId === c.id;
                        const onShift = c.status === 'on_shift';
                        return (
                          <button key={c.id} onClick={()=>setTaskForm(p=>({...p,assignedTo:`${c.name.split(' ')[0]} ${c.name.split(' ')[1]?.[0]}.`,toId:c.id}))}
                            style={{ display:'flex', alignItems:'center', gap:16, padding:20, background:sel?'rgba(255,56,92,0.06)':CARD, border:`2px solid ${sel?BLUE:BORDER}`, borderRadius:16, cursor:'pointer', textAlign:'left', boxShadow:sel?`0 4px 20px rgba(255,56,92,0.12)`:'0 2px 8px rgba(0,0,0,0.05)' }}>
                            <div style={{ width:56, height:56, borderRadius:16, background:onShift?'rgba(52,199,89,0.12)':'rgba(255,56,92,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <span style={{ fontFamily:INTER, fontSize:20, fontWeight:800, color:onShift?GREEN:BLUE }}>{c.init}</span>
                            </div>
                            <div style={{ flex:1 }}>
                              <p style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:16, margin:'0 0 2px' }}>{c.name}</p>
                              <p style={{ fontFamily:INTER, fontSize:14, color:MUTED, margin:0 }}>{c.title}{onShift?' · On shift now':c.lastShift?` · Last: ${c.lastShift}`:''}</p>
                            </div>
                            {sel && <div style={{ width:24, height:24, borderRadius:'50%', background:BLUE, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Check size={12} color="white" strokeWidth={3} /></div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, display:'block', marginBottom:12 }}>Category</label>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      {TASK_CATS.map(({ id:cid, Icon:CIcon, desc }) => {
                        const sel = taskForm.category === cid;
                        return (
                          <button key={cid} onClick={()=>setTaskForm(p=>({...p,category:p.category===cid?'':cid}))}
                            style={{ display:'flex', alignItems:'center', gap:12, padding:16, background:sel?'rgba(255,56,92,0.06)':CARD, border:`2px solid ${sel?BLUE:BORDER}`, borderRadius:14, cursor:'pointer', textAlign:'left', boxShadow:sel?`0 4px 20px rgba(255,56,92,0.12)`:'0 2px 8px rgba(0,0,0,0.05)' }}>
                            <div style={{ width:44, height:44, borderRadius:12, background:sel?'rgba(255,56,92,0.12)':CARD2, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <CIcon size={20} color={sel?BLUE:MUTED} />
                            </div>
                            <div style={{ minWidth:0 }}>
                              <p style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:13, margin:'0 0 1px', lineHeight:1.2 }}>{cid}</p>
                              <p style={{ fontFamily:INTER, fontSize:11, color:MUTED, margin:0 }}>{desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, display:'block', marginBottom:12 }}>Priority</label>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                      {[{id:'Standard',color:MUTED,desc:'Normal'},{id:'High',color:ORANGE,desc:'Urgent'},{id:'Critical',color:RED,desc:'Immediate'}].map(({ id:pid, color, desc:pdesc }) => {
                        const sel = taskForm.priority === pid;
                        return (
                          <button key={pid} onClick={()=>setTaskForm(p=>({...p,priority:pid}))}
                            style={{ padding:'14px 10px', borderRadius:12, border:`2px solid ${sel?color:BORDER}`, background:sel?`${color}10`:CARD, cursor:'pointer', textAlign:'center' }}>
                            <div style={{ width:10, height:10, borderRadius:'50%', background:sel?color:BORDER, margin:'0 auto 8px' }} />
                            <p style={{ fontFamily:INTER, fontSize:13, fontWeight:700, color:sel?color:MUTED, margin:'0 0 2px' }}>{pid}</p>
                            <p style={{ fontFamily:INTER, fontSize:11, color:MUTED, margin:0 }}>{pdesc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ flexShrink:0, padding:'12px 20px 20px', background:CARD, borderTop:`1px solid ${BORDER}` }}>
              <div style={{ display:'flex', gap:12 }}>
                {taskStep > 1 && (
                  <button onClick={()=>setTaskStep(1)}
                    style={{ flex:1, padding:'16px 0', background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, fontFamily:INTER, fontSize:16, fontWeight:600, color:TEXT, cursor:'pointer' }}>
                    Back
                  </button>
                )}
                {taskStep === 1
                  ? <button onClick={()=>setTaskStep(2)} disabled={!taskForm.title.trim()}
                      style={{ flex:1, padding:'16px 0', background:!taskForm.title.trim()?CARD2:BLUE, border:!taskForm.title.trim()?`1px solid ${BORDER}`:'none', borderRadius:14, fontFamily:INTER, fontSize:16, fontWeight:700, color:!taskForm.title.trim()?MUTED:'white', cursor:!taskForm.title.trim()?'not-allowed':'pointer', boxShadow:!taskForm.title.trim()?'none':`0 8px 24px rgba(255,56,92,0.30)` }}>
                      Continue
                    </button>
                  : <button onClick={submitTask} disabled={!taskForm.toId}
                      style={{ flex:1, padding:'16px 0', background:!taskForm.toId?CARD2:BLUE, border:!taskForm.toId?`1px solid ${BORDER}`:'none', borderRadius:14, fontFamily:INTER, fontSize:16, fontWeight:700, color:!taskForm.toId?MUTED:'white', cursor:!taskForm.toId?'not-allowed':'pointer', boxShadow:!taskForm.toId?'none':`0 8px 24px rgba(255,56,92,0.30)` }}>
                      Dispatch Task
                    </button>
                }
              </div>
            </div>
          </motion.div>
        )}

        {/* Emergency Contacts slide-in */}
        {conOpen && (
          <motion.div key="con-panel"
            initial={{ x: '110%' }} animate={{ x: 0 }} exit={{ x: '110%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            style={{ position: 'fixed', right: 16, top: 16, bottom: 16, width: Math.min(isMobile ? 700 : 640, window.innerWidth - (isMobile ? 32 : 280)), background: BG, zIndex: 68, display: 'flex', flexDirection: 'column', borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.20)' }}>

            {/* Header */}
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER}`, background: CARD, flexShrink: 0 }}>
              <div>
                <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{propertyName}</div>
                <h2 style={{ fontFamily: INTER, fontSize: 20, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>Emergency Contacts</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => { setShowAddContact(s => !s); setNewContactDraft({ label:'', number:'' }); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: showAddContact ? CARD2 : BLUE, border: `1px solid ${showAddContact ? BORDER : BLUE}`, borderRadius: 10, cursor: 'pointer', transition: 'all 150ms' }}>
                  <Plus size={14} color={showAddContact ? MUTED : 'white'} />
                  <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: showAddContact ? MUTED : 'white' }}>Add</span>
                </button>
                <button onClick={() => { setConOpen(false); setShowAddContact(false); }}
                  style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${BORDER}`, background: CARD, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <X size={18} color={MUTED} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 28 }}>

              {/* Add contact form — shown at top so it's immediately visible */}
              {showAddContact && (
                <div style={{ padding: 20, background: CARD, border: `2px dashed ${BLUE}50`, borderRadius: 16 }}>
                  <p style={{ fontFamily: INTER, fontSize: 12, fontWeight: 800, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 14px' }}>New Contact</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    <input
                      value={newContactDraft.label}
                      onChange={e => setNewContactDraft(d => ({ ...d, label: e.target.value }))}
                      placeholder="Name or role  e.g. Night Security"
                      style={{ fontFamily: INTER, fontSize: 14, color: TEXT, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 14px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                    />
                    <input
                      value={newContactDraft.number}
                      onChange={e => setNewContactDraft(d => ({ ...d, number: e.target.value }))}
                      placeholder="Phone number  e.g. (215) 555-0199"
                      style={{ fontFamily: INTER, fontSize: 14, color: TEXT, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 14px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => {
                        if (!newContactDraft.label.trim() || !newContactDraft.number.trim()) return;
                        setCustomContacts(prev => [...prev, { id: Date.now(), label: newContactDraft.label.trim(), number: newContactDraft.number.trim() }]);
                        setNewContactDraft({ label:'', number:'' });
                        setShowAddContact(false);
                      }}
                      style={{ flex: 1, padding: '11px', background: BLUE, border: 'none', borderRadius: 10, fontFamily: INTER, fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
                      Add Contact
                    </button>
                    <button onClick={() => { setShowAddContact(false); setNewContactDraft({ label:'', number:'' }); }}
                      style={{ padding: '11px 16px', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, fontFamily: INTER, fontSize: 14, fontWeight: 600, color: MUTED, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Emergency Numbers section */}
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
                    { label: 'Police / Fire / EMS',    number: '911',                                               urgent: true  },
                    { label: 'Non-Emergency Police',    number: BUILDING_CONTACTS.emergency.nonEmergencyPolice,     urgent: false },
                    { label: 'Building Emergency Line', number: BUILDING_CONTACTS.emergency.buildingEmergency,      urgent: false },
                    { label: 'Elevator Emergency',      number: BUILDING_CONTACTS.emergency.elevatorEmergency,      urgent: false },
                    { label: 'Gas Emergency',           number: BUILDING_CONTACTS.emergency.gasEmergency,           urgent: false },
                    { label: 'Electricity Outage',      number: BUILDING_CONTACTS.emergency.electricityOutage,      urgent: false },
                    { label: 'Poison Control',          number: BUILDING_CONTACTS.emergency.poisonControl,          urgent: false },
                  ].map(({ label, number, urgent }) => (
                    <div key={label} style={{ background: CARD, border: `1px solid ${urgent ? `rgba(255,59,48,0.3)` : BORDER}`, borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 16, boxShadow: urgent ? '0 4px 20px rgba(255,59,48,0.08)' : '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: urgent ? 'rgba(255,59,48,0.10)' : CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Phone size={22} color={urgent ? RED : MUTED} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 15, margin: '0 0 2px' }}>{label}</p>
                        <p style={{ fontFamily: INTER, fontSize: 14, color: MUTED, margin: 0 }}>{number}</p>
                      </div>
                      <a href={`tel:${number.replace(/\D/g, '')}`}
                        style={{ padding: '10px 18px', background: urgent ? RED : BLUE, color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none', flexShrink: 0, boxShadow: urgent ? '0 4px 14px rgba(255,59,48,0.30)' : '0 4px 14px rgba(255,56,92,0.28)' }}>
                        Call
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Property Team section */}
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

              {/* Custom contacts */}
              {customContacts.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Star size={20} color={ORANGE} />
                    <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Custom Contacts</h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {customContacts.map(c => (
                      <div key={c.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${ORANGE}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Phone size={22} color={ORANGE} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 15, margin: '0 0 2px' }}>{c.label}</p>
                          <p style={{ fontFamily: INTER, fontSize: 14, color: MUTED, margin: 0 }}>{c.number}</p>
                        </div>
                        <a href={`tel:${c.number.replace(/\D/g,'')}`}
                          style={{ padding: '10px 18px', background: BLUE, color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none', flexShrink: 0, boxShadow: '0 4px 14px rgba(255,56,92,0.28)' }}>
                          Call
                        </a>
                        <button onClick={() => setCustomContacts(prev => prev.filter(x => x.id !== c.id))}
                          style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                          <X size={14} color={MUTED} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}

        {/* Add Team Members */}
        {leasingOpen && (
          <>
            <motion.div key="leasing-bg"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}
              onClick={() => { setLeasingOpen(false); setLeasingForm({ teamName:'', contact:'', phone:'', email:'', password:'' }); setShowPw(false); }}
              style={{ position:'fixed', inset:0, zIndex:67, background:'rgba(0,0,0,0.32)', backdropFilter:'blur(2px)' }} />
            <motion.div key="leasing-modal" ref={leasingModalRef}
              role="dialog" aria-modal="true" aria-label="Add Team Members"
              initial={{ x:'110%' }} animate={{ x:0 }} exit={{ x:'110%' }}
              transition={{ type:'spring', damping:32, stiffness:300 }}
              style={{ position:'fixed', right:16, top:16, bottom:16, width:Math.min(isMobile ? 700 : 640, window.innerWidth - (isMobile ? 32 : 280)), zIndex:68, background:BG, borderRadius:24, boxShadow:'0 24px 64px rgba(0,0,0,0.20)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${BORDER}`, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:MUTED, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:2 }}>{propertyName}</div>
                <h2 style={{ fontFamily:INTER, fontSize:20, fontWeight:700, color:TEXT, margin:0, letterSpacing:'-0.01em' }}>Add Team Members</h2>
              </div>
              <button onClick={() => { setLeasingOpen(false); setLeasingForm({ teamName:'', contact:'', phone:'', email:'', password:'' }); setShowPw(false); }}
                style={{ width:36, height:36, borderRadius:10, border:`1px solid ${BORDER}`, background:CARD, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                <X size={18} color={MUTED} />
              </button>
            </div>

            <div style={{ flex:1, overflowY:'auto', padding:'24px 20px' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
                <h3 style={{ fontFamily:INTER, fontSize:'1.2rem', fontWeight:700, color:TEXT, letterSpacing:'-0.01em', margin:0 }}>Who are you adding?</h3>

                {[
                  { field:'teamName', label:'Full Name *',        placeholder:'e.g. George Nwachukwu',   type:'text',     ac:'off'          },
                  { field:'phone',    label:'Phone Number',       placeholder:'e.g. (215) 555-0140',     type:'tel',      ac:'off'          },
                  { field:'email',    label:'Email / Username *', placeholder:'e.g. george@example.com', type:'email',    ac:'off'          },
                  { field:'password', label:'Password *',         placeholder:'Min. 8 characters',       type:'password', ac:'new-password' },
                ].map(({ field, label, placeholder, type, ac }) => (
                  <div key={field}>
                    <label style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, display:'block', marginBottom:10 }}>{label}</label>
                    <div style={{ position:'relative' }}>
                      <input
                        type={field === 'password' ? (showPw ? 'text' : 'password') : type}
                        placeholder={placeholder}
                        value={leasingForm[field]}
                        onChange={e => setLeasingForm(p=>({...p,[field]:e.target.value}))}
                        autoComplete={ac}
                        style={{ width:'100%', padding:'14px 16px', paddingRight: field === 'password' ? 48 : 16, borderRadius:12, border:leasingForm[field]?`1.5px solid ${GREEN}`:`1.5px solid ${BORDER}`, fontFamily:INTER, fontSize:16, color:TEXT, background:CARD2, outline:'none', boxSizing:'border-box' }}
                      />
                      {field === 'password' && (
                        <button type="button" onClick={() => setShowPw(p => !p)}
                          style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:4, display:'flex', alignItems:'center' }}>
                          {showPw ? <EyeOff size={18} color={MUTED} /> : <Eye size={18} color={MUTED} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div>
                  <label style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, display:'block', marginBottom:12 }}>Department / Role</label>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {[
                      { id:'Leasing',             Icon:Building2,     desc:'Leasing & rentals'       },
                      { id:'Maintenance',          Icon:Wrench,        desc:'Repairs & upkeep'        },
                      { id:'Management',           Icon:Users,         desc:'Property management'     },
                      { id:'Concierge',            Icon:User,          desc:'Front desk & services'   },
                      { id:'Corporate Leasing',    Icon:Building2,     desc:'Corporate accounts'      },
                      { id:'Third Party / Vendor', Icon:Truck,         desc:'External contractors'    },
                    ].map(({ id:t, Icon:RIcon, desc }) => {
                      const sel = leasingForm.role === t;
                      return (
                        <button key={t} onClick={() => setLeasingForm(p=>({...p,role:t}))}
                          style={{ display:'flex', alignItems:'center', gap:12, padding:16, background:sel?'rgba(52,199,89,0.06)':CARD, border:`2px solid ${sel?GREEN:BORDER}`, borderRadius:14, cursor:'pointer', textAlign:'left', boxShadow:sel?'0 4px 20px rgba(52,199,89,0.12)':'0 2px 8px rgba(0,0,0,0.05)' }}>
                          <div style={{ width:44, height:44, borderRadius:12, background:sel?'rgba(52,199,89,0.12)':CARD2, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <RIcon size={20} color={sel?GREEN:MUTED} />
                          </div>
                          <div style={{ minWidth:0 }}>
                            <p style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:13, margin:'0 0 1px', lineHeight:1.2 }}>{t}</p>
                            <p style={{ fontFamily:INTER, fontSize:11, color:MUTED, margin:0 }}>{desc}</p>
                          </div>
                          {sel && <div style={{ width:20, height:20, borderRadius:'50%', background:GREEN, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginLeft:'auto' }}><Check size={10} color="white" strokeWidth={3} /></div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {(() => {
              const lValid = (leasingForm.teamName || '').trim() && (leasingForm.email || '').trim() && (leasingForm.password || '').trim().length >= 8;
              const handleAddMember = async () => {
                if (!lValid || addLoading) return;
                setAddLoading(true); setAddError('');
                try {
                  const fullName = (leasingForm.teamName || leasingForm.contact || '').trim();
                  const parts = fullName.split(/\s+/);
                  const firstName = parts[0] || 'Concierge';
                  const lastName  = parts.slice(1).join(' ') || '';
                  const newC = await authApi.addConcierge({
                    first_name: firstName,
                    last_name:  lastName,
                    email:      leasingForm.email.trim(),
                    phone:      leasingForm.phone || '',
                    title:      leasingForm.role || 'Concierge',
                    password:   leasingForm.password.trim(),
                  });
                  setTeam(p => [...p, newC]);
                  setSectionAccess(prev => ({ ...prev, [newC.id]: { ...DEFAULT_SECTIONS } }));
                  setLeasingOpen(false);
                  setLeasingForm({ teamName:'', contact:'', phone:'', email:'', password:'' });
                  setAddError('');
                } catch (err) {
                  setAddError(err?.response?.data?.detail || 'Failed to add member. Check the email is not already in use.');
                } finally { setAddLoading(false); }
              };
              return (
                <div style={{ flexShrink:0, padding:'12px 20px 20px', background:CARD, borderTop:`1px solid ${BORDER}` }}>
                  {addError && <p style={{ fontFamily:INTER, fontSize:13, color:RED, marginBottom:10, fontWeight:600 }}>{addError}</p>}
                  <button
                    disabled={!lValid || addLoading}
                    onClick={handleAddMember}
                    style={{ width:'100%', padding:'16px 0', background:(!lValid||addLoading)?CARD2:GREEN, border:(!lValid||addLoading)?`1px solid ${BORDER}`:'none', borderRadius:14, fontFamily:INTER, fontSize:16, fontWeight:700, color:(!lValid||addLoading)?MUTED:'white', cursor:(!lValid||addLoading)?'not-allowed':'pointer', boxShadow:(!lValid||addLoading)?'none':'0 8px 24px rgba(52,199,89,0.30)' }}>
                    {addLoading ? 'Adding...' : 'Add Member'}
                  </button>
                </div>
              );
            })()}
          </motion.div>
          </>
        )}

      </AnimatePresence>

      {/* ── Profile Panel ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {profileOpen && (
          <>
            <motion.div key="prof-bg"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}
              onClick={() => setProfileOpen(false)}
              style={{ position:'fixed', inset:0, zIndex:69, background:'rgba(0,0,0,0.32)', backdropFilter:'blur(2px)' }} />
            <motion.div key="prof-panel"
              initial={{ x:'110%' }} animate={{ x:0 }} exit={{ x:'110%' }}
              transition={{ type:'spring', damping:32, stiffness:300 }}
              style={{ position:'fixed', right:16, top:16, bottom:16, width:Math.min(isMobile ? 700 : 640, window.innerWidth - (isMobile ? 32 : 280)), zIndex:70, background:BG, borderRadius:24, boxShadow:'0 24px 64px rgba(0,0,0,0.20)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
              {/* Header */}
              <div style={{ padding:'20px 20px 14px', borderBottom:`1px solid ${BORDER}`, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <p style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:MUTED, letterSpacing:'0.1em', textTransform:'uppercase', margin:'0 0 2px' }}>{propertyName}</p>
                  <h2 style={{ fontFamily:INTER, fontSize:20, fontWeight:700, color:TEXT, margin:0, letterSpacing:'-0.01em' }}>My Profile</h2>
                </div>
                <button onClick={() => setProfileOpen(false)}
                  style={{ width:36, height:36, borderRadius:10, border:`1px solid ${BORDER}`, background:BG, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                  <X size={18} color={TEXT} />
                </button>
              </div>
              {renderProfilePanel()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Fullscreen document viewer ────────────────────────────────────────── */}
      {fullscreenDoc && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.96)', display:'flex', flexDirection:'column' }}
          onClick={() => setFullscreenDoc(null)}>

          {/* Header bar */}
          <div style={{ flexShrink:0, display:'flex', alignItems:'center', gap:14, padding:'14px 20px', background:'rgba(0,0,0,0.7)', backdropFilter:'blur(10px)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.45)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:2 }}>{fullscreenDoc.category}</div>
              <div style={{ fontFamily:INTER, fontSize:16, fontWeight:700, color:'white', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{fullscreenDoc.title}</div>
            </div>
            <button onClick={() => setFullscreenDoc(null)}
              style={{ width:40, height:40, borderRadius:12, background:'rgba(255,255,255,0.12)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
              <X size={20} color="white" />
            </button>
          </div>

          {/* Document */}
          <div style={{ flex:1, minHeight:0, display:'flex', alignItems:'center', justifyContent:'center', padding:'12px', overflowY:'auto' }}
            onClick={e => e.stopPropagation()}>
            {fullscreenDoc.fileType === 'image' ? (
              <img src={fullscreenDoc.dataURL} alt={fullscreenDoc.title}
                style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain', borderRadius:8, display:'block' }} />
            ) : (
              <iframe src={fullscreenDoc.dataURL} title={fullscreenDoc.title}
                style={{ width:'100%', height:'100%', border:'none', borderRadius:8, display:'block', background:'white' }} />
            )}
          </div>

          {/* Footer */}
          <div style={{ flexShrink:0, padding:'12px 20px 24px', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
            onClick={e => e.stopPropagation()}>
            <span style={{ fontFamily:INTER, fontSize:12, color:'rgba(255,255,255,0.35)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:280 }}>{fullscreenDoc.fileName}</span>
            <span style={{ fontFamily:INTER, fontSize:12, color:'rgba(255,255,255,0.20)' }}>·</span>
            <span style={{ fontFamily:INTER, fontSize:12, color:'rgba(255,255,255,0.35)' }}>Tap outside to close</span>
          </div>
        </div>
      )}

      {/* ── Fullscreen training viewer ───────────────────────────────────────── */}
      {fullscreenTraining && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.96)', display:'flex', flexDirection:'column' }}
          onClick={() => setFullscreenTraining(null)}>

          {/* Header bar */}
          <div style={{ flexShrink:0, display:'flex', alignItems:'center', gap:14, padding:'14px 20px', background:'rgba(0,0,0,0.7)', backdropFilter:'blur(10px)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.45)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:2 }}>{fullscreenTraining.category}</div>
              <div style={{ fontFamily:INTER, fontSize:16, fontWeight:700, color:'white', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{fullscreenTraining.title}</div>
            </div>
            <button onClick={() => setFullscreenTraining(null)}
              style={{ width:40, height:40, borderRadius:12, background:'rgba(255,255,255,0.12)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
              <X size={20} color="white" />
            </button>
          </div>

          {/* Content */}
          <div style={{ flex:1, minHeight:0, display:'flex', alignItems:'center', justifyContent:'center', padding:'12px', overflowY:'auto' }}
            onClick={e => e.stopPropagation()}>
            {fullscreenTraining.fileType === 'image' ? (
              <img src={fullscreenTraining.dataURL} alt={fullscreenTraining.title}
                style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain', borderRadius:8, display:'block' }} />
            ) : fullscreenTraining.fileType === 'video' ? (
              <video src={fullscreenTraining.dataURL} controls autoPlay
                style={{ maxWidth:'100%', maxHeight:'100%', borderRadius:8, display:'block', outline:'none' }} />
            ) : (
              <iframe src={fullscreenTraining.dataURL} title={fullscreenTraining.title}
                style={{ width:'100%', height:'100%', border:'none', borderRadius:8, display:'block', background:'white' }} />
            )}
          </div>

          {/* Footer */}
          <div style={{ flexShrink:0, padding:'12px 20px 24px', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
            onClick={e => e.stopPropagation()}>
            <span style={{ fontFamily:INTER, fontSize:12, color:'rgba(255,255,255,0.35)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:280 }}>{fullscreenTraining.fileName}</span>
            <span style={{ fontFamily:INTER, fontSize:12, color:'rgba(255,255,255,0.20)' }}>·</span>
            <span style={{ fontFamily:INTER, fontSize:12, color:'rgba(255,255,255,0.35)' }}>Tap outside to close</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManagerDashboard;
