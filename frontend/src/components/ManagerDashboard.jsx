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
  BarChart2, UserCog,
  ClipboardCheck, CalendarClock, RefreshCw, Activity, Pencil, Sparkles, MessageSquare,
} from 'lucide-react';
import { NotedAssistant } from '../assistant/NotedAssistant';
import { PlannedTasksPage } from './manager/PlannedTasksPage';
import { TeamMessagesPage } from './TeamMessagesPage';
import { BUILDING_PROFILE, BUILDING_CONTACTS, BUILDING_SOPS } from '../services/mockData';
import { UserRole } from '../types';
import { authApi, normalizeTask, normalizeIncident } from '../services/authApi';
import { useTheme } from '../context/ThemeContext';
import { useAuthSession } from '../context/AuthSessionContext';
import { useSharedData, MAX_KNOWLEDGE_FILE_BYTES } from '../context/SharedDataContext';
import MicButton from './MicButton';
import { KnowledgeCard, KnowledgeEmpty, KnowledgeFilters, KnowledgeProgress, KnowledgeStatusBadge } from './knowledge/KnowledgeUI';
import { toNarrative } from '../lib/toNarrative';
import {
  DASHBOARD_ACCENT, DASHBOARD_ACTIVE_NAV, DASHBOARD_DANGER, DASHBOARD_FONT,
  DASHBOARD_SIDEBAR_COLLAPSED, DASHBOARD_SIDEBAR_EXPANDED,
  DASHBOARD_SUCCESS, DASHBOARD_WARNING, DashboardCard, DashboardEyebrow,
  DashboardPage, DashboardSectionTitle, DashboardSidebar, DashboardStatusBadge, DailyActivityReport, ShiftViewHeader,
} from './dashboard';

/* ─── Static brand tokens ────────────────────────────────────────────────────── */
const GREEN  = DASHBOARD_SUCCESS;
const BLUE   = DASHBOARD_ACCENT;
const RED    = DASHBOARD_DANGER;
const ORANGE = DASHBOARD_WARNING;
const INTER  = DASHBOARD_FONT;
const MUTED  = '#717171'; // module-level fallback for static array icon colors

/* ─── Calendar helpers ───────────────────────────────────────────────────────── */
const MONTHS    = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_ABB = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_HDR   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const _now = new Date();
const TODAY_STR = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2,'0')}-${String(_now.getDate()).padStart(2,'0')}`;

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
const CUSTOM_SECTION_COLORS = [BLUE, GREEN, ORANGE, RED, MUTED];
const decorateCustomSection = (section, index) => ({
  ...section, Icon:Star, desc:section.desc || 'Custom section', custom:true,
  color:CUSTOM_SECTION_COLORS[index % CUSTOM_SECTION_COLORS.length],
});

const mkAct = (items) => items.map((x, i) => ({ id: i + 1, ...x }));


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


const NAV = [
  { id:'home',        Icon:Home,          label:'Overview'            },
  { id:'tasks',       Icon:Send,          label:'Tasks'               },
  { id:'incidents',   Icon:AlertTriangle, label:'Incidents'           },
  { id:'assign-task', Icon:Plus,          label:'Assign Task',        action:'task'      },
  { id:'assistant',   Icon:Sparkles,      label:'Assistant',          action:'assistant' },
  { id:'messages',    Icon:MessageSquare, label:'Messages'            },
  { id:'shifts',      Icon:Calendar,      label:'Shifts'              },
  { id:'team',        Icon:Users,         label:'Team'                },
  { id:'residents',   Icon:UserCog,       label:'Residents'           },
  { id:'analytics',   Icon:BarChart2,     label:'Analytics'           },
  { id:'scheduled',   Icon:CalendarClock, label:'Planned tasks'      },
  { id:'more',        Icon:BookOpen,      label:'SOPs'                },
  { id:'training',    Icon:GraduationCap, label:'Training'            },
  { id:'sections',    Icon:Sliders,       label:'Shift Sections'      },
  { id:'emergency',   Icon:Phone,         label:'Emergency Contacts', action:'emergency' },
  { id:'settings',    Icon:Settings,      label:'Settings'            },
];

const MANAGER_NAV_GROUPS = [
  { label:'Command center', ids:['home', 'tasks', 'scheduled', 'assign-task', 'incidents', 'messages', 'assistant'] },
  { label:'People & coverage', ids:['shifts', 'team', 'residents'] },
  { label:'Operations setup', ids:['sections'] },
  { label:'Property guide', ids:['more', 'training'] },
  { label:'Insights', ids:['analytics'] },
  { label:'Account & support', ids:['settings', 'emergency'] },
].map(group => ({
  ...group,
  items: group.ids.map(id => {
    const item = NAV.find(navItem => navItem.id === id);
    return id === 'emergency' ? { ...item, urgent:true } : item;
  }),
}));

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
  const propertyName = authUser?.property_name || 'Your property';
  // ───────────────────────────────────────────────────────────────────────────

  const [tab,       setTab]       = useState('home');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [managerSummaryView, setManagerSummaryView] = useState('dar');
  const [managerMedia, setManagerMedia] = useState(null);
  const [calView,      setCalView]      = useState('month');
  const [calDate,      setCalDate]      = useState(new Date());
  const [shiftDay,     setShiftDay]     = useState(TODAY_STR);
  const [shiftsPage,   setShiftsPage]   = useState(0);
  const [team,      setTeam]      = useState([]);
  const [removeTarget,  setRemoveTarget]  = useState(null);   // team member or pending invite awaiting delete confirmation
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeError,   setRemoveError]   = useState('');
  const confirmRemove = async () => {
    const target = removeTarget;
    if (!target || removeLoading) return;
    setRemoveLoading(true);
    setRemoveError('');
    try {
      if (target.status === 'invited') await authApi.cancelInvitation(target.invitation_id);
      else await authApi.removeConcierge(target.concierge_id);
      setTeam(p => p.filter(m => m.id !== target.id));
      setRemoveTarget(null);
    } catch (err) {
      if (err?.response?.status === 404) {
        // Already gone (e.g. the invite was just accepted) — refresh the list.
        try { setTeam(await authApi.getConcierges()); } catch { /* keep current list */ }
        setRemoveTarget(null);
      } else {
        setRemoveError(target.status === 'invited' ? 'Could not delete the invite. Please try again.' : 'Could not remove this team member. Please try again.');
      }
    } finally {
      setRemoveLoading(false);
    }
  };
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
  const [inviteNotice, setInviteNotice] = useState(null); // { email, link, reason } when the invite email didn't go out
  const [taskOpen,  setTaskOpen]  = useState(false);
  const [taskStep,  setTaskStep]  = useState(1);
  const [taskForm,  setTaskForm]  = useState(EMPTY_TASK);
  const [taskTitleInterim, setTaskTitleInterim] = useState('');
  const [taskNotesInterim, setTaskNotesInterim] = useState('');
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskSubmitError, setTaskSubmitError] = useState('');
  const [taskSuccess, setTaskSuccess] = useState('');
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError,   setTasksError]   = useState(false);
  const [taskSearch,   setTaskSearch]   = useState('');
  const [taskFilter,   setTaskFilter]   = useState('open');
  const [taskAssignee, setTaskAssignee] = useState('all');
  const [incidentsError, setIncidentsError] = useState(false);
  const [successIncidentId, setSuccessIncidentId] = useState(null);
  const [srAnnounce,   setSrAnnounce]   = useState('');
  const searchInputRef = useRef(null);
  const taskModalRef   = useRef(null);
  const taskOpenerRef  = useRef(null);
  const leasingModalRef = useRef(null);
  const contactsPanelRef = useRef(null);
  const contactsOpenerRef = useRef(null);
  const [conOpen,         setConOpen]         = useState(false);
  const [customContacts,  setCustomContacts]  = useState([]);
  const propertyContacts = customContacts;
  const propertyTeam = team.filter(c => c.phone || c.email).map(c => ({ id: c.concierge_id || c.id, name: c.name, title: c.title || 'Concierge', phone: c.phone || '', email: c.email || '', available: c.status === 'on_shift' ? 'On shift now' : '' }));
  useEffect(() => { authApi.getContacts().then(r => setCustomContacts(r.contacts)).catch(() => {}); }, []);
  const [showAddContact,  setShowAddContact]  = useState(false);
  const [newContactDraft, setNewContactDraft] = useState({ label:'', number:'' });
  const [leasingOpen,     setLeasingOpen]     = useState(false);
  useEffect(() => { if (!leasingOpen) setInviteNotice(null); }, [leasingOpen]);
  const [leasingForm,     setLeasingForm]     = useState({ teamName:'', contact:'', phone:'', email:'' });
  const [showPw,          setShowPw]          = useState(false);
  const [profileOpen,     setProfileOpen]     = useState(false);
  const { uploadedSOPs, setUploadedSOPs, trainingItems, setTrainingItems, setKnowledgeItemStatus, refreshKnowledge, knowledgeError, clearKnowledgeError } = useSharedData();
  const [expandedSOPId,    setExpandedSOPId]    = useState(null);
  const [sopUploadOpen,    setSopUploadOpen]    = useState(false);
  const [uploadForm,       setUploadForm]       = useState({ category:'', customCategory:'', title:'', fileName:'', fileType:'', dataURL:'' });
  const [fullscreenDoc,    setFullscreenDoc]    = useState(null);
  const [sopStep,          setSopStep]          = useState(1);
  const [editingSopId,     setEditingSopId]     = useState(null);
  const uploadFileRef = useRef(null);
  const [expandedTrainingId,  setExpandedTrainingId]  = useState(null);
  const [trainingUploadOpen,  setTrainingUploadOpen]  = useState(false);
  const [trainingForm,        setTrainingForm]        = useState({ category:'', customCategory:'', title:'', fileName:'', fileType:'', dataURL:'' });
  const [fullscreenTraining,  setFullscreenTraining]  = useState(null);
  const [trainingStep,        setTrainingStep]        = useState(1);
  const [sopSearch, setSopSearch] = useState('');
  const [sopFilter, setSopFilter] = useState('All');
  const [trainingSearch, setTrainingSearch] = useState('');
  const [trainingFilter, setTrainingFilter] = useState('All');
  const knowledgeStatus = Object.fromEntries(uploadedSOPs.map(item => [item.id, item.status || 'published']));
  const [fileError, setFileError] = useState('');
  const [teamNotice, setTeamNotice] = useState(null); // { tone, text, link }
  const [sectionSaved, setSectionSaved] = useState('');
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [sectionsError, setSectionsError] = useState(false);
  const trainingFileRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const { completeAuthentication } = useAuthSession();
  const [notifMgr,         setNotifMgr]         = useState({ incident:true, package:true });
  const [notifState,       setNotifState]       = useState('');
  // Settings inputs keep one identity between renders so typing never loses focus.
  const fieldImpl  = useRef(() => null);
  const switchImpl = useRef(() => null);
  const [Field]     = useState(() => (props) => fieldImpl.current(props));
  const [SwitchRow] = useState(() => (props) => switchImpl.current(props));
  const [settingExpMgr,    setSettingExpMgr]    = useState(null);
  const [editInfoMgr,      setEditInfoMgr]      = useState({ name:'', email:'', phone:'' });
  const [pwFormMgr,        setPwFormMgr]        = useState({ current:'', next:'', confirm:'' });
  const [pwStatusMgr,      setPwStatusMgr]      = useState('');
  const [profileSaveState, setProfileSaveState] = useState('saved');
  const [isMobile,         setIsMobile]         = useState(() => { const t = 'ontouchstart' in window || navigator.maxTouchPoints > 0; return window.innerWidth < (t ? 1366 : 768); });
  const [isPhone,          setIsPhone]          = useState(() => window.innerWidth < 768);
  const [searchQuery,      setSearchQuery]      = useState('');

  const [activeShifts, setActiveShifts] = useState([]);  // every concierge on shift right now
  const [activeShiftId, setActiveShiftId] = useState('');
  const todayShift = activeShifts.find(shift => shift.shiftId === activeShiftId) || activeShifts[0] || null; // live DAR
  const [allShifts,   setAllShifts]   = useState([]);   // full shift history for calendar
  const [shiftFilter, setShiftFilter] = useState('all'); // filter by concierge id or 'all'

  // Converts backend shift data to the shape the DAR renderer expects.
  // Only includes activities logged today so overnight shifts don't bleed yesterday's entries.
  const shiftToDAR = (s, onlyToday = true) => {
    if (!s) return null;
    // A live shift shows everything since it began, so a night shift keeps its
    // entries after midnight. Anything older than a day belongs to a shift that
    // was never closed and is left out.
    const cutoff = Date.now() - 24 * 3600 * 1000;
    const recent = iso => !onlyToday || new Date(iso).getTime() >= cutoff;
    return {
      concierge: { name: s.concierge_name },
      clockIn:   s.clock_in ? new Date(s.clock_in).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
      clockOut:  s.clock_out ? new Date(s.clock_out).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : null,
      shiftId:   s.shift_id,
      dateLabel: s.clock_in ? new Date(s.clock_in).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' }) : undefined,
      note:      s.handover_notes || '',
      openItems: s.open_items || [],
      incidents: (s.incidents || []).filter(i => {
        if (!i.created_at) return true;
        return recent(i.created_at);
      }).map(i => {
        const tod = i.created_at
          ? new Date(i.created_at).toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' }).replace(/\s*(AM|PM)$/i, (_, m) => m.toLowerCase())
          : '';
        return {
          id: i.incident_id,
          text: `${tod ? tod + ' — ' : ''}${i.type || ''}: ${i.description || ''}`,
          title: i.description || i.type || 'Incident',
          time: tod,
          category: 'Incident',
          evidenceUrls: Array.isArray(i.evidence_urls) ? i.evidence_urls : [],
        };
      }),
      activities: (s.activities || []).filter(t => {
        if (!t.created_at) return !onlyToday;
        return recent(t.created_at);
      }).map(t => ({
        id:       t.task_id,
        time:     new Date(t.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        title:    t.created_by_type === 'manager' ? (t.source_section === 'scheduled' ? `Planned task done · ${t.title}` : `Request completed · ${t.title}`) : t.title,
        notes:    t.notes || '',
        category: t.category || 'Other',
        sourceSection: t.created_by_type === 'manager' ? 'tasks' : (t.source_section || ''),
        evidenceUrls: Array.isArray(t.evidence_urls) ? t.evidence_urls : (t.evidence_url ? [t.evidence_url] : []),
      })),
    };
  };

  // Load real data on mount
  useEffect(() => {
    authApi.getConcierges().then(list => {
      setTeam(list);
      setSectionsLoading(false);
      setSectionsError(false);
      const active = list.filter(c => c.concierge_id);
      if (active.length > 0) setSetupConcierge(active[0].id);
      setSectionAccess(Object.fromEntries(active.map(c => [c.id, { ...DEFAULT_SECTIONS, ...c.sectionAccess }])));
    }).catch(() => { setSectionsLoading(false); setSectionsError(true); });
    authApi.getCustomSections()
      .then(list => setCustomSections(list.map((s, i) => decorateCustomSection(s, i))))
      .catch(() => {});
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
      authApi.getShiftHistory().then(history => setAllShifts(history?.shifts || [])).catch(() => {});
      setActiveShifts((res?.shifts || []).filter(shift => !shift.clock_out).map(shift => shiftToDAR(shift)));
      authApi.getConcierges().then(setTeam).catch(() => {});
      authApi.getIncidents().then(list => { setIncidents(list); setIncidentsError(false); }).catch(() => {});
    };
    loadShift();
    const timer = setInterval(loadShift, 30000);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line

  // Real-time SSE — new tasks/incidents appear without polling
  useEffect(() => {
    const es = authApi.openEventStream(({ tasks: newTasks = [], incidents: newInc = [] }) => {
      if (newTasks.length) {
        setTasks(prev => {
          const ids = new Set(prev.map(x => x.task_id));
          const fresh = newTasks
            .filter(t => !ids.has(t.task_id))
            .map(normalizeTask);
          return fresh.length ? [...fresh, ...prev] : prev;
        });
      }
      if (newInc.length) {
        setIncidents(prev => {
          const ids = new Set(prev.map(x => x.incident_id || x.id));
          const fresh = newInc.filter(i => !ids.has(i.incident_id)).map(normalizeIncident);
          return fresh.length ? [...fresh, ...prev] : prev;
        });
      }
    });
    return () => es.close();
  }, []);

  // Sync authUser into editInfoMgr
  useEffect(() => {
    if (authUser) {
      setEditInfoMgr({ name: authUser.name || '', email: authUser.email || '', phone: authUser.phone || '' });
      setNotifMgr({ incident: authUser.notification_prefs?.incident !== false, package: authUser.notification_prefs?.package !== false });
    }
  }, [authUser]);

  useEffect(() => {
    const onResize = () => { const t = 'ontouchstart' in window || navigator.maxTouchPoints > 0; setIsMobile(window.innerWidth < (t ? 1366 : 768)); setIsPhone(window.innerWidth < 768); };
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
    (el.querySelector('[data-autofocus="true"]') || focusable[0])?.focus();
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

  // Escape closes any open modal or tab panel (accessibility)
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key !== 'Escape') return;
      if (taskOpen) { closeTask(); return; }
      if (conOpen) { setConOpen(false); return; }
      if (leasingOpen) { setLeasingOpen(false); return; }
      if (tab !== 'home') setTab('home');
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [taskOpen, conOpen, leasingOpen, tab]);

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

  // Keep keyboard focus inside the emergency directory and return it to the
  // control that opened the drawer when the directory closes.
  useEffect(() => {
    if (!conOpen || !contactsPanelRef.current) return undefined;
    contactsOpenerRef.current = document.activeElement;
    const panel = contactsPanelRef.current;
    const getFocusable = () => Array.from(panel.querySelectorAll('button,input,select,textarea,a[href],[tabindex]:not([tabindex="-1"])'));
    getFocusable()[0]?.focus();
    const trap = event => {
      if (event.key !== 'Tab') return;
      const nodes = getFocusable();
      const first = nodes[0]; const last = nodes[nodes.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    panel.addEventListener('keydown', trap);
    return () => {
      panel.removeEventListener('keydown', trap);
      requestAnimationFrame(() => contactsOpenerRef.current?.focus?.());
    };
  }, [conOpen]);

  const nowStr = () => new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  const closeAdd  = () => { setAddOpen(false);  setAddStep(1);  setAddForm(EMPTY_ADD); setAddError(''); };
  const openTask = () => { taskOpenerRef.current = document.activeElement; setTaskSubmitError(''); setTaskOpen(true); };
  const closeTask = () => {
    setTaskOpen(false); setTaskStep(1); setTaskForm(EMPTY_TASK); setTaskSubmitError('');
    requestAnimationFrame(() => taskOpenerRef.current?.focus?.());
  };

  const submitTask = async () => {
    if (!taskForm.title.trim() || !taskForm.toId) return;
    setTaskLoading(true); setTaskSubmitError('');
    try {
      const newTask = await authApi.createTask(taskForm);
      setTasks(p => [newTask, ...p]);
      setTaskSuccess(`“${taskForm.title.trim()}” was assigned.`);
      closeTask();
      window.setTimeout(() => setTaskSuccess(''), 5000);
    } catch (err) {
      setTaskSubmitError(err?.response?.data?.detail || 'The task could not be assigned. Check your connection and try again.');
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

  const DARSect = ({ title, accent=BLUE }) => (
    <div style={{ background:'transparent', borderTop:`1px solid ${BORDER}`, padding: isPhone ? '11px 12px 3px' : '12px 16px 3px', marginTop:8, display:'flex', alignItems:'center', gap:7 }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:accent, flexShrink:0 }} />
      <span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:accent === RED ? RED : MUTED, letterSpacing:'0.16em', textTransform:'uppercase' }}>{title}</span>
    </div>
  );
  const DARSectionRow = ({ activities, strings, last }) => {
    const hasActs = activities && activities.length > 0;
    const hasStrs = strings && strings.length > 0;
    const coloredEntry = (text) => {
      const d = text.indexOf(' — ');
      if (d === -1) return <span style={{ color:TEXT }}>{text}</span>;
      return <><span style={{ color:TEXT, fontWeight:600 }}>{text.slice(0, d)} – </span><span style={{ color:TEXT }}>{text.slice(d + 3)}</span></>;
    };
    return (
      <div style={{ borderBottom: last ? 'none' : `1px solid ${BORDER}`, padding: isPhone ? '4px 4px' : '5px 6px', display:'flex', flexDirection:'column', gap:4 }}>
        {hasActs ? activities.map((a, i) => (
          <div key={a.id||i} style={{ display:'flex', alignItems:'flex-start', gap:2 }}>
            <span style={{ color:BLUE, fontSize:15, fontWeight:700, lineHeight:1.55, flexShrink:0, userSelect:'none' }}>•</span>
            <span style={{ fontFamily:INTER, fontSize:isPhone?13:14, lineHeight:1.55 }}>{coloredEntry(toNarrative(a))}</span>
          </div>
        )) : hasStrs ? strings.map((item, i) => {
          const text = typeof item === 'string' ? item : item.text;
          return (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:2 }}>
            <span style={{ color:BLUE, fontSize:15, fontWeight:700, lineHeight:1.55, flexShrink:0, userSelect:'none' }}>•</span>
              <span style={{ fontFamily:INTER, fontSize:isPhone?13:14, lineHeight:1.55 }}>{coloredEntry(text)}</span>
            </div>
          );
        }) : (
          <span style={{ fontFamily:INTER, fontSize:isPhone?13:14, color:MUTED, fontStyle:'italic' }}>N/A</span>
        )}
      </div>
    );
  };

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
  const persistCustomSections = (next) => {
    setSectionSaved('Saving…');
    authApi.saveCustomSections(next)
      .then(() => setSectionSaved('Saved'))
      .catch(() => setSectionSaved('Could not save'));
  };

  const handleAddCustomSection = () => {
    if (!newSectionDraft.label.trim()) return;
    const newId = `custom_${Date.now()}`;
    const next = [...customSections, decorateCustomSection({ id:newId, label:newSectionDraft.label.trim(), desc:newSectionDraft.desc.trim() }, customSections.length)];
    setCustomSections(next);
    persistCustomSections(next);
    setNewSectionDraft({ label:'', desc:'' });
    setShowAddSection(false);
  };

  const handleDeleteCustomSection = (sectionId) => {
    const next = customSections.filter(s => s.id !== sectionId);
    setCustomSections(next);
    persistCustomSections(next);
  };

  const renderConciergeSetup = () => {
    const glassCard  = { background:CARD, border:`1px solid ${BORDER}`, borderRadius:16 };
    const baseInput  = { width:'100%', padding:'14px 16px', background:CARD2, borderRadius:12, color:TEXT, outline:'none', fontSize:16, fontFamily:INTER, boxSizing:'border-box' };
    // Only people who have accepted their invite have a desk to configure.
    const sectionTeam = team.filter(person => person.concierge_id);
    const activeConcierge = sectionTeam.some(person => person.id === setupConcierge) ? setupConcierge : (sectionTeam[0]?.id || null);
    const access     = sectionAccess[activeConcierge] || {};
    const allSections = [...CONCIERGE_SECTIONS, ...customSections];
    const toggleSection = (sectionId) => {
      if (!activeConcierge) return;
      const previous = sectionAccess[activeConcierge] || {};
      const next = { ...previous, [sectionId]: !(previous[sectionId] !== false) };
      setSectionAccess(prev => ({ ...prev, [activeConcierge]: next }));
      setSectionSaved('Saving…');
      authApi.saveConciergeSections(activeConcierge, next)
        .then(() => setSectionSaved('Saved'))
        .catch(() => {
          // Put the switch back so the screen never claims something that was not saved.
          setSectionAccess(prev => ({ ...prev, [activeConcierge]: { ...prev[activeConcierge], [sectionId]: previous[sectionId] !== false } }));
          setSectionSaved('Could not save');
        });
    };

    const canSubmit = !!newSectionDraft.label.trim();

    return (
      <div style={{ fontFamily:INTER, display:'flex', flexDirection:'column', gap:0 }}>

        <div style={{ ...glassCard, padding:18, marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:12 }}><div><p style={{ margin:'0 0 3px', fontSize:16, fontWeight:800, color:TEXT }}>Choose a concierge</p><p style={{ margin:0, fontSize:12, color:MUTED }}>Each person gets their own DAR workspace access.</p></div>{sectionSaved&&<KnowledgeStatusBadge status={sectionSaved==='Saved'?'published':'review'} label={sectionSaved} colors={{accent:BLUE,success:GREEN,warning:ORANGE,muted:MUTED,surface:CARD2}}/>}</div>
          {sectionsLoading ? <div role="status" style={{ padding:24,borderRadius:14,background:CARD2,color:MUTED,textAlign:'center',fontSize:13 }}><RefreshCw size={18} style={{ marginBottom:8 }}/> <div>Loading concierge access…</div></div> : sectionsError ? <KnowledgeEmpty icon={AlertTriangle} title="Concierge access could not be loaded" description="Check your connection and reopen Shift Sections to try again." colors={{accent:BLUE,success:GREEN,warning:ORANGE,card:CARD,surface:CARD2,border:BORDER,text:TEXT,muted:MUTED,shadow:SHADOW}}/> : sectionTeam.length===0 ? <KnowledgeEmpty icon={Users} title="No concierges to configure" description="Add a concierge to the property before assigning shift sections." colors={{accent:BLUE,success:GREEN,warning:ORANGE,card:CARD,surface:CARD2,border:BORDER,text:TEXT,muted:MUTED,shadow:SHADOW}}/> : <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2 }}>{sectionTeam.map(person=>{const selected=person.id===activeConcierge; const enabledCount=allSections.filter(section=>section.required||sectionAccess[person.id]?.[section.id]!==false).length; return <button key={person.id} onClick={()=>{setSetupConcierge(person.id);setSectionSaved('');}} style={{ minWidth:180,padding:13,borderRadius:13,border:`1.5px solid ${selected?BLUE:BORDER}`,background:selected?`${BLUE}08`:CARD2,textAlign:'left',cursor:'pointer' }}><span style={{ display:'block',fontSize:13,fontWeight:800,color:TEXT }}>{person.name}</span><span style={{ display:'block',fontSize:10,color:MUTED,marginTop:4 }}>{enabledCount} of {allSections.length} sections accessible</span></button>})}</div>}
        </div>

        {/* CTA — full-width incident-style */}
        <div style={{ paddingBottom:20 }}>
          <button onClick={() => { setNewSectionDraft({ label:'', desc:'' }); setShowAddSection(s => !s); }}
            style={{ width:'100%', padding:20, background:BLUE, borderRadius:20, border:'none', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', boxShadow:`0 8px 24px ${BLUE}40` }}>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:56, height:56, background:'rgba(255,255,255,0.2)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Plus size={28} color="white" />
              </div>
              <div>
                <p style={{ fontFamily:INTER, fontSize:'1rem', fontWeight:700, color:'white', letterSpacing:'-0.01em', margin:0 }}>Add New Section</p>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.7)', margin:0 }}>Create a custom shift section for concierges</p>
              </div>
            </div>
            <ChevronRight size={24} color="rgba(255,255,255,0.7)" />
          </button>
        </div>

        {/* Inline add form — drops in below CTA, list stays visible underneath */}
        {showAddSection && (
          <div style={{ ...glassCard, padding:20, marginBottom:20 }}>
            {/* Form header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:`${BLUE}12`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Plus size={18} color={BLUE} />
                </div>
                <p style={{ fontFamily:INTER, fontSize:15, fontWeight:700, color:TEXT, margin:0 }}>New Shift Section</p>
              </div>
              <button onClick={() => { setShowAddSection(false); setNewSectionDraft({ label:'', desc:'' }); }}
                style={{ width:32, height:32, borderRadius:8, background:CARD2, border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <X size={14} color={MUTED} />
              </button>
            </div>
            {/* Inputs */}
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:16 }}>
              <input
                value={newSectionDraft.label}
                onChange={e => setNewSectionDraft(d => ({ ...d, label:e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && canSubmit && handleAddCustomSection()}
                placeholder="Section name  e.g. Key Handovers"
                style={{ ...baseInput, border:newSectionDraft.label ? `1.5px solid ${BLUE}` : `1.5px solid ${BORDER}` }}
              />
              <input
                value={newSectionDraft.desc}
                onChange={e => setNewSectionDraft(d => ({ ...d, desc:e.target.value }))}
                placeholder="Short description (optional)"
                style={{ ...baseInput, border:newSectionDraft.desc ? `1.5px solid ${BLUE}` : `1.5px solid ${BORDER}` }}
              />
            </div>
            {/* Action buttons */}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => { setShowAddSection(false); setNewSectionDraft({ label:'', desc:'' }); }}
                style={{ flex:1, padding:'13px 0', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:12, fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, cursor:'pointer' }}>
                Cancel
              </button>
              <button onClick={handleAddCustomSection} disabled={!canSubmit}
                style={{ flex:2, padding:'13px 0', background:canSubmit ? BLUE : CARD2, border:canSubmit ? 'none' : `1px solid ${BORDER}`, borderRadius:12, fontFamily:INTER, fontSize:14, fontWeight:700, color:canSubmit ? 'white' : MUTED, cursor:canSubmit ? 'pointer' : 'not-allowed', boxShadow:canSubmit ? `0 8px 24px ${BLUE}40` : 'none' }}>
                Add Section
              </button>
            </div>
          </div>
        )}

        {/* Section header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Sliders size={20} color={MUTED} />
            <h2 style={{ fontWeight:700, color:TEXT, fontSize:17, margin:0 }}>Shift Sections</h2>
          </div>
          <span style={{ width:32, height:32, borderRadius:'50%', background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:MUTED }}>
            {allSections.length}
          </span>
        </div>

        {/* Section toggle cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {allSections.map(({ id, Icon:SI, label, desc, color, required, custom }) => {
            const enabled = access[id] !== false;
            return (
              <div key={id} style={{ ...glassCard, padding:20, display:'flex', alignItems:'center', gap:16 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:enabled ? `${color}12` : CARD2, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 200ms' }}>
                  <SI size={22} color={enabled ? color : MUTED} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                    <p style={{ fontFamily:INTER, fontSize:16, fontWeight:700, color:enabled ? TEXT : MUTED, margin:0, transition:'color 200ms' }}>{label}</p>
                    {required && <span style={{ fontSize:10, fontWeight:800, color:GREEN, background:'rgba(52,199,89,0.12)', borderRadius:6, padding:'2px 7px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Required</span>}
                    {custom   && <span style={{ fontSize:10, fontWeight:800, color:BLUE,  background:`${BLUE}12`,             borderRadius:6, padding:'2px 7px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Custom</span>}
                  </div>
                  <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:0 }}>{desc}</p>
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
    );
  };

  /* ── Residents Directory ──────────────────────────────────────────────────── */
  const [residents,      setResidents]      = useState([]);
  const [resLoading,     setResLoading]     = useState(false);
  const [resForm,        setResForm]        = useState({ name:'', unit:'', phone:'', email:'', notes:'' });
  const [resAddOpen,     setResAddOpen]     = useState(false);
  const [resEditId,      setResEditId]      = useState(null);
  const [resSaving,      setResSaving]      = useState(false);
  const [resSearch,      setResSearch]      = useState('');
  const [resError,       setResError]       = useState(false);
  const [teamSearch,     setTeamSearch]     = useState('');

  useEffect(() => {
    setResLoading(true);
    authApi.getResidents().then(list => { setResidents(list); setResError(false); setResLoading(false); }).catch(() => { setResError(true); setResLoading(false); });
  }, []);

  const saveResident = async () => {
    if (!resForm.name.trim() || !resForm.unit.trim()) return;
    setResSaving(true);
    try {
      if (resEditId) {
        const updated = await authApi.updateResident(resEditId, resForm);
        setResidents(prev => prev.map(r => r.resident_id === resEditId ? updated : r));
        setResEditId(null);
      } else {
        const created = await authApi.createResident(resForm);
        setResidents(prev => [created, ...prev]);
      }
      setResForm({ name:'', unit:'', phone:'', email:'', notes:'' });
      setResAddOpen(false);
    } catch {} finally { setResSaving(false); }
  };

  const deleteResident = async (id) => {
    try {
      await authApi.deleteResident(id);
      setResidents(prev => prev.filter(r => r.resident_id !== id));
    } catch {}
  };

  const renderResidents = () => {
    const glassCard = { background:CARD, border:`1px solid ${BORDER}`, borderRadius:16 };
    const baseInput = { width:'100%', padding:'14px 16px', background:CARD2, borderRadius:12, color:TEXT, outline:'none', fontSize:16, fontFamily:INTER, boxSizing:'border-box' };
    const valid = resForm.name.trim() && resForm.unit.trim();
    const residentQuery = resSearch.trim().toLowerCase();
    const filteredResidents = residents.filter(r => !residentQuery || [r.name, r.unit, r.phone, r.email, r.notes].some(value => String(value || '').toLowerCase().includes(residentQuery)));

    /* ── Add / Edit form view ── */
    if (resAddOpen) {
      return (
        <div style={{ fontFamily:INTER, display:'flex', flexDirection:'column', gap:0 }}>

          {/* Wizard header — matches incident report form header */}
          <div style={{ flexShrink:0, paddingBottom:14, borderBottom:`1px solid ${BORDER}`, marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div>
                <h2 style={{ fontFamily:INTER, fontSize:'1.1rem', fontWeight:700, color:TEXT, letterSpacing:'-0.01em', margin:0 }}>
                  {resEditId ? 'Edit Resident' : 'New Resident'}
                </h2>
                <p style={{ fontSize:13, color:MUTED, margin:'2px 0 0' }}>Residents Directory</p>
              </div>
              <button onClick={() => { setResAddOpen(false); setResEditId(null); }}
                style={{ padding:'10px 20px', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:12, fontSize:14, fontWeight:600, color:TEXT, cursor:'pointer', fontFamily:INTER }}>
                Cancel
              </button>
            </div>
            {/* Step bar — 1 step */}
            <div style={{ display:'flex', gap:6 }}>
              <div style={{ height:4, flex:1, borderRadius:999, background:BLUE }} />
            </div>
          </div>

          {/* Form fields — styled like incident report step 2 */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <h3 style={{ fontFamily:INTER, fontSize:'1.2rem', fontWeight:700, color:TEXT, letterSpacing:'-0.01em', margin:0 }}>
              Who are you adding?
            </h3>

            {/* Name + Unit row */}
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:12 }}>
              <div>
                <h3 style={{ fontFamily:INTER, fontSize:'1rem', fontWeight:700, color:TEXT, letterSpacing:'-0.01em', marginBottom:10 }}>Full Name *</h3>
                <input value={resForm.name} onChange={e => setResForm(p => ({ ...p, name:e.target.value }))} placeholder="e.g. Maria Lopez"
                  style={{ ...baseInput, border:resForm.name ? `1.5px solid ${BLUE}` : `1.5px solid ${BORDER}` }} />
              </div>
              <div>
                <h3 style={{ fontFamily:INTER, fontSize:'1rem', fontWeight:700, color:TEXT, letterSpacing:'-0.01em', marginBottom:10 }}>Unit Number *</h3>
                <input value={resForm.unit} onChange={e => setResForm(p => ({ ...p, unit:e.target.value }))} placeholder="e.g. 312"
                  style={{ ...baseInput, border:resForm.unit ? `1.5px solid ${BLUE}` : `1.5px solid ${BORDER}` }} />
              </div>
            </div>

            {/* Phone + Email row */}
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:12 }}>
              <div>
                <h3 style={{ fontFamily:INTER, fontSize:'1rem', fontWeight:700, color:TEXT, letterSpacing:'-0.01em', marginBottom:10 }}>Phone</h3>
                <input value={resForm.phone} onChange={e => setResForm(p => ({ ...p, phone:e.target.value }))} placeholder="(555) 000-0000" type="tel"
                  style={{ ...baseInput, border:resForm.phone ? `1.5px solid ${BLUE}` : `1.5px solid ${BORDER}` }} />
              </div>
              <div>
                <h3 style={{ fontFamily:INTER, fontSize:'1rem', fontWeight:700, color:TEXT, letterSpacing:'-0.01em', marginBottom:10 }}>Email</h3>
                <input value={resForm.email} onChange={e => setResForm(p => ({ ...p, email:e.target.value }))} placeholder="resident@email.com" type="email"
                  style={{ ...baseInput, border:resForm.email ? `1.5px solid ${BLUE}` : `1.5px solid ${BORDER}` }} />
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 style={{ fontFamily:INTER, fontSize:'1rem', fontWeight:700, color:TEXT, letterSpacing:'-0.01em', marginBottom:10 }}>Notes</h3>
              <textarea value={resForm.notes} onChange={e => setResForm(p => ({ ...p, notes:e.target.value }))} rows={4}
                placeholder="Pet policy, parking, vehicle info, special instructions…"
                style={{ ...baseInput, border:resForm.notes ? `1.5px solid ${BLUE}` : `1.5px solid ${BORDER}`, resize:'none' }} />
            </div>

            {/* Footer — full-width button matching incident Continue button */}
            <div style={{ paddingTop:8, borderTop:`1px solid ${BORDER}` }}>
              <div style={{ display:'flex', gap:12 }}>
                <button onClick={() => { setResAddOpen(false); setResEditId(null); }}
                  style={{ flex:1, padding:'16px 0', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14, fontFamily:INTER, fontSize:16, fontWeight:600, color:TEXT, cursor:'pointer' }}>
                  Back
                </button>
                <button onClick={saveResident} disabled={resSaving || !valid}
                  style={{ flex:2, padding:'16px 0', background:(!valid || resSaving) ? CARD2 : BLUE, border:(!valid || resSaving) ? `1px solid ${BORDER}` : 'none', borderRadius:14, fontFamily:INTER, fontSize:16, fontWeight:700, color:(!valid || resSaving) ? MUTED : 'white', cursor:(!valid || resSaving) ? 'not-allowed' : 'pointer', boxShadow:(!valid || resSaving) ? 'none' : `0 8px 24px ${BLUE}40` }}>
                  {resSaving ? 'Saving…' : resEditId ? 'Save Changes' : 'Add Resident'}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    /* ── List view ── */
    return (
      <div style={{ fontFamily:INTER, display:'flex', flexDirection:'column', gap:0 }}>

        {/* CTA — exact incident report button pattern, blue brand color */}
        <div style={{ padding:'0 0 20px' }}>
          <button onClick={() => { setResAddOpen(true); setResEditId(null); setResForm({ name:'', unit:'', phone:'', email:'', notes:'' }); }}
            style={{ width:'100%', padding:20, background:BLUE, borderRadius:20, border:'none', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', boxShadow:`0 8px 24px ${BLUE}40` }}>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:56, height:56, background:'rgba(255,255,255,0.2)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <UserPlus size={28} color="white" />
              </div>
              <div>
                <p style={{ fontFamily:INTER, fontSize:'1rem', fontWeight:700, color:'white', letterSpacing:'-0.01em', margin:0 }}>Add Resident</p>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.7)', margin:0 }}>Register a new resident to the directory</p>
              </div>
            </div>
            <ChevronRight size={24} color="rgba(255,255,255,0.7)" />
          </button>
        </div>

        {/* Section header — exact "Past Reports" pattern */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Users size={20} color={MUTED} />
            <h2 style={{ fontWeight:700, color:TEXT, fontSize:17, margin:0 }}>Residents Directory</h2>
          </div>
          <span style={{ width:32, height:32, borderRadius:'50%', background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:MUTED }}>
            {residents.length}
          </span>
        </div>

        <label style={{ position:'relative', marginBottom:14 }}>
          <span className="sr-only">Search residents</span>
          <Search size={17} color={MUTED} style={{ position:'absolute', left:14, top:13 }} />
          <input value={resSearch} onChange={e => setResSearch(e.target.value)} placeholder="Search by resident, unit, phone, email, or notes" aria-label="Search residents"
            style={{ width:'100%', minHeight:44, boxSizing:'border-box', padding:'0 14px 0 42px', border:`1px solid ${BORDER}`, borderRadius:12, background:CARD, color:TEXT, fontFamily:INTER, fontSize:13, outline:'none' }} />
        </label>

        {/* Loading */}
        {resLoading ? (
          <div aria-label="Loading residents" style={{ display:'flex', flexDirection:'column', gap:8 }}>{[1,2,3].map(i => <div key={i} style={{ height:76, borderRadius:14, background:CARD2, border:`1px solid ${BORDER}`, opacity:1-i*.15 }} />)}</div>
        ) : resError ? (
          <div role="alert" style={{ ...glassCard, padding:32, textAlign:'center' }}><AlertTriangle size={28} color={RED} /><p style={{fontWeight:700,color:TEXT,margin:'12px 0 5px'}}>Residents couldn’t load</p><p style={{fontSize:13,color:MUTED,margin:0}}>Refresh the page to try the directory again.</p></div>
        ) : residents.length === 0 ? (
          /* Empty state — exact incident pattern: 80×80 icon */
          <div style={{ ...glassCard, padding:40, textAlign:'center' }}>
            <div style={{ width:80, height:80, background:CARD2, borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <UserCog size={40} color={MUTED} />
            </div>
            <p style={{ fontWeight:700, color:TEXT, fontSize:17, marginBottom:6 }}>No residents yet</p>
            <p style={{ fontSize:14, color:MUTED }}>Add residents so concierges can look them up by name or unit</p>
          </div>
        ) : filteredResidents.length === 0 ? (
          <div style={{ ...glassCard, padding:32, textAlign:'center' }}><Search size={28} color={MUTED}/><p style={{fontWeight:700,color:TEXT,margin:'12px 0 5px'}}>No residents match</p><p style={{fontSize:13,color:MUTED,margin:0}}>Try a different name, unit, or contact detail.</p></div>
        ) : (
          /* Resident cards — exact incident history card pattern */
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filteredResidents.map(r => {
              const initials = String(r.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={r.resident_id} style={{ ...glassCard, padding:isMobile?14:18, display:'grid', gridTemplateColumns:isMobile?'42px minmax(0,1fr)':'48px minmax(0,1fr) auto', alignItems:'center', gap:isMobile?12:16 }}>

                  {/* 48×48 avatar, borderRadius:14 — matches incident icon container */}
                  <div style={{ width:48, height:48, background:`${BLUE}12`, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontFamily:INTER, fontSize:16, fontWeight:800, color:BLUE }}>{initials}</span>
                  </div>

                  {/* Content — flex:1, matches incident card info block */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:700, color:TEXT, fontSize:16, margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.name}</p>
                    <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginTop:4, minWidth:0 }}>
                      {r.phone && <span style={{ fontSize:12, color:MUTED }}>{r.phone}</span>}
                      {r.email && <span style={{ fontSize:12, color:MUTED }}>· {r.email}</span>}
                      {r.notes && <span title={r.notes} style={{ fontSize:12, color:MUTED, fontStyle:'italic', maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>· {r.notes}</span>}
                    </div>
                    {/* Action buttons — small, inside info block, no divider */}
                    <div style={{ display:'flex', gap:6, marginTop:10 }}>
                      <button onClick={() => { setResForm({ name:r.name, unit:r.unit, phone:r.phone||'', email:r.email||'', notes:r.notes||'' }); setResEditId(r.resident_id); setResAddOpen(true); }}
                        style={{ padding:'6px 12px', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:8, cursor:'pointer', fontFamily:INTER, fontSize:12, fontWeight:600, color:TEXT }}>
                        Edit
                      </button>
                      <button onClick={() => deleteResident(r.resident_id)}
                        style={{ padding:'6px 12px', background:'rgba(255,59,48,0.08)', border:`1px solid rgba(255,59,48,0.20)`, borderRadius:8, cursor:'pointer', fontFamily:INTER, fontSize:12, fontWeight:600, color:RED }}>
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Unit badge — exact severity badge pill pattern */}
                  <span title={`Unit ${r.unit}`} style={{ gridColumn:isMobile?'2':'auto', justifySelf:isMobile?'start':'auto', maxWidth:isMobile?'100%':180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', padding:'6px 12px', borderRadius:10, fontSize:11, fontWeight:750, background:`${BLUE}14`, color:BLUE, border:`1px solid ${BLUE}28`, flexShrink:0 }}>
                    UNIT {r.unit}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* ── Analytics ─────────────────────────────────────────────────────────────── */
  const [analyticsData,    setAnalyticsData]    = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError,   setAnalyticsError]   = useState('');
  const [analyticsRange,   setAnalyticsRange]   = useState('all');
  const [analyticsFrom,    setAnalyticsFrom]    = useState('');
  const [analyticsTo,      setAnalyticsTo]      = useState('');

  const loadAnalytics = (fromDate = null, toDate = null) => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    authApi.getAnalytics(fromDate, toDate)
      .then(d => { setAnalyticsData(d); setAnalyticsLoading(false); })
      .catch(() => { setAnalyticsError('Analytics could not be loaded. Check your connection and try again.'); setAnalyticsLoading(false); });
  };

  const applyRange = (range, from = analyticsFrom, to = analyticsTo) => {
    setAnalyticsRange(range);
    const now = new Date();
    let fromDate = null, toDate = null;
    if (range === 'today') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    } else if (range === 'week') {
      const d = new Date(now); d.setDate(d.getDate() - 7);
      fromDate = d.toISOString();
    } else if (range === 'month') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    } else if (range === 'custom') {
      fromDate = from  ? new Date(from).toISOString()              : null;
      toDate   = to    ? new Date(to + 'T23:59:59').toISOString()  : null;
    }
    loadAnalytics(fromDate, toDate);
  };

  useEffect(() => { if (tab === 'analytics') loadAnalytics(); }, [tab]); // eslint-disable-line
  useEffect(() => { if (tab === 'training' || tab === 'more') refreshKnowledge(); if (tab === 'team') authApi.getConcierges().then(setTeam).catch(() => {}); }, [tab]); // eslint-disable-line

  const renderAnalytics = () => {
    const glassCard  = { background:CARD, border:`1px solid ${BORDER}`, borderRadius:16 };
    const BAR_H      = 10;
    const barMax     = (arr) => Math.max(1, ...arr.map(x => x.count));
    const SEV_COLOR  = { critical:RED, high:RED, medium:ORANGE, low:GREEN };
    const RANGES     = [
      { id:'all',    label:'All Time' },
      { id:'today',  label:'Today'    },
      { id:'week',   label:'7 Days'   },
      { id:'month',  label:'Month'    },
      { id:'custom', label:'Custom'   },
    ];

    /* Shared bar row component */
    const BarRow = ({ label, count, max, color }) => (
      <div style={{ display:'grid', gridTemplateColumns:isPhone?'minmax(82px, 1fr) minmax(100px, 2fr) 28px':'120px minmax(120px, 1fr) 28px', alignItems:'center', gap:isPhone?8:12, marginBottom:12 }}>
        <div title={label} style={{ minWidth:0, fontFamily:INTER, fontSize:13, color:TEXT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{label}</div>
        <div style={{ flex:1, background:CARD2, borderRadius:BAR_H/2, height:BAR_H, overflow:'hidden' }}>
          <div style={{ width:`${Math.round(count/max*100)}%`, minWidth:count?4:0, height:BAR_H, background:color, borderRadius:BAR_H/2, transition:'width 500ms ease' }} />
        </div>
        <div style={{ width:28, flexShrink:0, fontFamily:INTER, fontSize:13, fontWeight:700, color:TEXT, textAlign:'right' }}>{count}</div>
      </div>
    );

    /* Section header — exact "Past Reports" pattern */
    const SecHead = ({ Icon, title, count, color:ic = MUTED }) => (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Icon size={20} color={ic} />
          <h2 style={{ fontWeight:700, color:TEXT, fontSize:17, margin:0 }}>{title}</h2>
        </div>
        {count !== undefined && (
          <span style={{ width:32, height:32, borderRadius:'50%', background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:MUTED }}>
            {count}
          </span>
        )}
      </div>
    );

    /* Loading state — exact incident empty state pattern */
    if (analyticsLoading) return (
      <div role="status" aria-live="polite" style={{ ...glassCard, padding:40, textAlign:'center' }}>
        <div style={{ width:80, height:80, background:CARD2, borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
          <Activity size={40} color={MUTED} strokeWidth={1.5} />
        </div>
        <p style={{ fontWeight:700, color:TEXT, fontSize:17, marginBottom:6 }}>Loading analytics…</p>
        <p style={{ fontSize:14, color:MUTED }}>Crunching the numbers for you</p>
      </div>
    );

    if (analyticsError) return (
      <div role="alert" style={{ ...glassCard, padding:isPhone?24:40, textAlign:'center' }}>
        <div style={{ width:64, height:64, background:`${RED}10`, borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
          <AlertTriangle size={30} color={RED} strokeWidth={1.7} />
        </div>
        <p style={{ fontWeight:700, color:TEXT, fontSize:17, margin:'0 0 6px' }}>Analytics unavailable</p>
        <p style={{ fontSize:14, lineHeight:1.5, color:MUTED, margin:'0 auto 18px', maxWidth:360 }}>{analyticsError}</p>
        <button type="button" onClick={() => applyRange(analyticsRange)} style={{ minHeight:44, padding:'0 18px', border:0, borderRadius:12, background:BLUE, color:'#fff', fontWeight:700, cursor:'pointer' }}>Try again</button>
      </div>
    );

    /* No data state */
    if (!analyticsData) return (
      <div style={{ ...glassCard, padding:40, textAlign:'center' }}>
        <div style={{ width:80, height:80, background:CARD2, borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
          <BarChart2 size={40} color={MUTED} strokeWidth={1.5} />
        </div>
        <p style={{ fontWeight:700, color:TEXT, fontSize:17, marginBottom:6 }}>No analytics yet</p>
        <p style={{ fontSize:14, color:MUTED }}>Analytics appear once shifts are logged</p>
      </div>
    );

    const { totals, by_category, incidents_by_severity, by_concierge, hourly_activity } = analyticsData;

    return (
      <div style={{ fontFamily:INTER, display:'flex', flexDirection:'column', gap:24 }}>

        {/* ── Date range card ── */}
        <div style={{ ...glassCard, padding:20 }}>
          <SecHead Icon={Calendar} title="Date Range" />
          {/* Range chips — severity-button style from incident report step 2 */}
          <div role="group" aria-label="Analytics date range" style={{ display:'grid', gridTemplateColumns:isPhone?'repeat(2,minmax(0,1fr))':'repeat(5,minmax(0,1fr))', gap:8, marginBottom: analyticsRange === 'custom' ? 16 : 0 }}>
            {RANGES.map(r => (
              <button key={r.id} type="button" aria-pressed={analyticsRange === r.id} onClick={() => applyRange(r.id)}
                style={{ minHeight:44, padding:'10px 8px', borderRadius:12, textAlign:'center', fontFamily:INTER, fontSize:13, fontWeight:600, cursor:'pointer',
                  background: analyticsRange === r.id ? BLUE : CARD2,
                  border:     analyticsRange === r.id ? 'none' : `1px solid ${BORDER}`,
                  color:      analyticsRange === r.id ? 'white' : MUTED,
                }}>
                {r.label}
              </button>
            ))}
          </div>
          {analyticsRange === 'custom' && (
            <div style={{ display:'grid', gridTemplateColumns:isPhone?'1fr':'1fr 1fr auto', gap:10, alignItems:'flex-end' }}>
              <div>
                <label htmlFor="analytics-from" style={{ display:'block', fontFamily:INTER, fontSize:13, fontWeight:700, color:TEXT, marginBottom:8 }}>From</label>
                <input id="analytics-from" type="date" value={analyticsFrom} onChange={e => setAnalyticsFrom(e.target.value)}
                  style={{ width:'100%', padding:'14px 16px', background:CARD2, borderRadius:12, border:analyticsFrom?`1.5px solid ${BLUE}`:`1.5px solid ${BORDER}`, fontFamily:INTER, fontSize:14, color:TEXT, outline:'none', boxSizing:'border-box' }} />
              </div>
              <div>
                <label htmlFor="analytics-to" style={{ display:'block', fontFamily:INTER, fontSize:13, fontWeight:700, color:TEXT, marginBottom:8 }}>To</label>
                <input id="analytics-to" type="date" min={analyticsFrom || undefined} value={analyticsTo} onChange={e => setAnalyticsTo(e.target.value)}
                  style={{ width:'100%', padding:'14px 16px', background:CARD2, borderRadius:12, border:analyticsTo?`1.5px solid ${BLUE}`:`1.5px solid ${BORDER}`, fontFamily:INTER, fontSize:14, color:TEXT, outline:'none', boxSizing:'border-box' }} />
              </div>
              <button onClick={() => applyRange('custom', analyticsFrom, analyticsTo)} disabled={!analyticsFrom}
                style={{ padding:'14px 20px', background:analyticsFrom?BLUE:CARD2, border:analyticsFrom?'none':`1px solid ${BORDER}`, borderRadius:12, fontFamily:INTER, fontSize:14, fontWeight:700, color:analyticsFrom?'white':MUTED, cursor:analyticsFrom?'pointer':'not-allowed', boxShadow:analyticsFrom?`0 4px 12px ${BLUE}40`:'none' }}>
                Apply
              </button>
            </div>
          )}
        </div>

        {/* ── KPI tiles — 3-col grid with icon + number + label ── */}
        <div>
          <SecHead Icon={BarChart2} title="Overview" />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(142px,1fr))', gap:10 }}>
            {[
              { label:'Total Activities', value:totals.tasks ?? 0,                    color:BLUE,   Icon:Activity      },
              { label:'Completed',        value:totals.completed_tasks ?? 0,          color:GREEN,  Icon:CheckCircle   },
              { label:'Completion Rate',  value:`${totals.completion_rate ?? 0}%`,    color:GREEN,  Icon:Check         },
              { label:'Incidents',        value:totals.incidents ?? 0,                color:ORANGE, Icon:AlertTriangle },
              { label:'Open Incidents',   value:totals.open_incidents ?? 0,           color:RED,    Icon:Clock         },
              { label:'Total Shifts',     value:totals.shifts ?? 0,                    color:BLUE,   Icon:Calendar      },
            ].map(({ label, value, color, Icon }) => (
              <div key={label} style={{ ...glassCard, padding:'16px 10px', textAlign:'center' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:`${color}12`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
                  <Icon size={18} color={color} />
                </div>
                <div style={{ fontFamily:INTER, fontSize:'clamp(1.25rem,5vw,1.5rem)', fontWeight:800, color, letterSpacing:'-0.02em', lineHeight:1, marginBottom:5, overflowWrap:'anywhere' }}>{value}</div>
                <div style={{ fontFamily:INTER, fontSize:11, color:MUTED, fontWeight:600, lineHeight:1.3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Activity by category ── */}
        {by_category?.length > 0 && (
          <div>
            <SecHead Icon={ClipboardList} title="Activity by Category" count={by_category.length} />
            <div style={{ ...glassCard, padding:20 }}>
              {by_category.map(r => <BarRow key={r.category} label={r.category} count={r.count} max={barMax(by_category)} color={BLUE} />)}
            </div>
          </div>
        )}

        {/* ── Incidents by severity ── */}
        {incidents_by_severity?.length > 0 && (
          <div>
            <SecHead Icon={AlertTriangle} title="Incidents by Severity" count={incidents_by_severity.length} color={ORANGE} />
            <div style={{ ...glassCard, padding:20 }}>
              {incidents_by_severity.map(r => <BarRow key={r.severity} label={r.severity.charAt(0).toUpperCase()+r.severity.slice(1)} count={r.count} max={barMax(incidents_by_severity)} color={SEV_COLOR[r.severity]||ORANGE} />)}
            </div>
          </div>
        )}

        {/* ── Activity by concierge ── */}
        {by_concierge?.length > 0 && (
          <div>
            <SecHead Icon={Users} title="Activity by Concierge" count={by_concierge.length} color={GREEN} />
            <div style={{ ...glassCard, padding:20 }}>
              {by_concierge.map(r => <BarRow key={r.name} label={r.name} count={r.count} max={barMax(by_concierge)} color={GREEN} />)}
            </div>
          </div>
        )}

        {/* ── Hourly heatmap ── */}
        {hourly_activity?.length > 0 && (
          <div>
            <SecHead Icon={Clock} title={`Activity by Hour — ${RANGES.find(r => r.id === analyticsRange)?.label || 'All Time'}`} />
            <div style={{ ...glassCard, padding:20, overflowX:'auto' }}>
              <div role="img" aria-label="Activity count for each hour of the day" style={{ display:'grid', gridTemplateColumns:'repeat(24,minmax(38px,1fr))', gap:5, minWidth:912 }}>
                {Array.from({length:24}).map((_,h) => {
                  const entry     = hourly_activity.find(x => x.hour === h);
                  const cnt       = entry?.count || 0;
                  const maxH      = Math.max(1, ...hourly_activity.map(x => x.count));
                  const intensity = Math.round(cnt/maxH*10)/10;
                  const ampm      = h < 12 ? 'AM' : 'PM';
                  const h12       = h === 0 ? 12 : h > 12 ? h-12 : h;
                  return (
                    <div key={h} title={`${h12}${ampm}: ${cnt} activities`} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                      <div style={{ width:'100%', height:40, borderRadius:6, background:`rgba(255,56,92,${0.08 + intensity * 0.72})`, transition:'background 300ms' }} />
                      <span style={{ fontFamily:INTER, fontSize:9, color:MUTED }}>{h12}{ampm}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Refresh — full-width button matching incident Continue style ── */}
        <button onClick={() => applyRange(analyticsRange)}
          style={{ width:'100%', padding:'16px 0', background:BLUE, border:'none', borderRadius:14, fontFamily:INTER, fontSize:16, fontWeight:700, color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:`0 8px 24px ${BLUE}40` }}>
          <RefreshCw size={18} color="white" />
          Refresh Analytics
        </button>
      </div>
    );
  };

  /* ── Global Search (replaces Audit Log tab) ────────────────────────────────── */
  const [gsOpen,     setGsOpen]     = useState(false);
  const [gsQuery,    setGsQuery]    = useState('');
  const [gsSection,  setGsSection]  = useState('all');
  const [gsRange,    setGsRange]    = useState('today');
  const [gsDateFrom, setGsDateFrom] = useState('');
  const [gsDateTo,   setGsDateTo]   = useState('');
  const [gsLogs,     setGsLogs]     = useState([]);
  const [gsLoading,  setGsLoading]  = useState(false);
  const [gsLoaded,   setGsLoaded]   = useState(false);

  const GS_SECTIONS = [
    { id:'all',       label:'All'       },
    { id:'task',      label:'Tasks'     },
    { id:'incident',  label:'Incidents' },
    { id:'shift',     label:'Shifts'    },
    { id:'resident',  label:'Residents' },
    { id:'package',   label:'Packages'  },
    { id:'guest',     label:'Guests'    },
    { id:'lockout',   label:'Lockouts'  },
    { id:'vendor',    label:'Vendors'   },
    { id:'tour',      label:'Tours'     },
    { id:'loaner',    label:'Loaners'   },
  ];
  const GS_RANGES = [
    { id:'today',     label:'Today'     },
    { id:'yesterday', label:'Yesterday' },
    { id:'week',      label:'7 Days'    },
    { id:'month',     label:'Month'     },
    { id:'all',       label:'All Time'  },
    { id:'custom',    label:'Custom'    },
  ];
  const ACTION_COLORS = { create:GREEN, update:BLUE, delete:RED, clock_in:GREEN, clock_out:ORANGE };
  const ACTION_LABELS = { create:'Created', update:'Updated', delete:'Deleted', clock_in:'Clocked In', clock_out:'Clocked Out' };
  const SEC_LABELS    = { task:'Task', incident:'Incident', shift:'Shift', resident:'Resident', package:'Package', scheduled_task:'Schedule', guest:'Guest', lockout:'Lockout', vendor:'Vendor', tour:'Tour', loaner:'Loaner' };

  const openGlobalSearch = () => {
    setGsOpen(true);
    if (!gsLoaded) {
      setGsLoading(true);
      authApi.getAuditLog(2000).then(logs => { setGsLogs(logs); setGsLoaded(true); setGsLoading(false); }).catch(() => setGsLoading(false));
    }
  };

  const getGsDar = () => {
    const q = gsQuery.trim().toLowerCase();
    const now = new Date();
    let from = null, to = null;
    if (gsRange === 'today') {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (gsRange === 'yesterday') {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      to   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (gsRange === 'week') {
      from = new Date(now); from.setDate(from.getDate() - 7);
    } else if (gsRange === 'month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (gsRange === 'custom') {
      if (gsDateFrom) from = new Date(gsDateFrom);
      if (gsDateTo)   to   = new Date(gsDateTo + 'T23:59:59');
    }

    let filtered = gsLogs;
    if (gsSection !== 'all') filtered = filtered.filter(l => l.resource_type === gsSection);
    if (from) filtered = filtered.filter(l => new Date(l.created_at) >= from);
    if (to)   filtered = filtered.filter(l => new Date(l.created_at) <= to);
    if (q)    filtered = filtered.filter(l => {
      const detail = Object.values(l.detail || {}).join(' ').toLowerCase();
      return detail.includes(q) || (l.resource_type||'').includes(q) || (l.action||'').includes(q) || (l.user_id||'').toLowerCase().includes(q);
    });

    // Group by calendar day (newest first), then by section within each day
    const dayMap = {};
    [...filtered].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).forEach(l => {
      const dayKey = new Date(l.created_at).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
      if (!dayMap[dayKey]) dayMap[dayKey] = {};
      const sec = l.resource_type || 'other';
      if (!dayMap[dayKey][sec]) dayMap[dayKey][sec] = [];
      dayMap[dayKey][sec].push(l);
    });
    return { dayMap, total: filtered.length };
  };


  /* ── Settings ─────────────────────────────────────────────────────────────── */
  const renderSettings = () => {
    const toggle = (id) => setSettingExpMgr(e => e === id ? null : id);
    const inputStyle = { fontFamily:INTER, fontSize:14, color:TEXT, background:CARD2, border:`1px solid ${BORDER}`, borderRadius:12, minHeight:44, padding:'10px 14px', outline:'none', width:'100%', boxSizing:'border-box' };
    const sectionLabel = (txt) => <p style={{ fontFamily:INTER, fontSize:11, fontWeight:800, color:MUTED, letterSpacing:'0.14em', textTransform:'uppercase', margin:'0 0 12px' }}>{txt}</p>;
    fieldImpl.current = ({ id, label, help, ...props }) => <div><label htmlFor={id} style={{display:'block',fontFamily:INTER,fontSize:13,fontWeight:700,color:TEXT,marginBottom:7}}>{label}</label><input id={id} style={inputStyle} {...props}/>{help&&<span style={{display:'block',fontFamily:INTER,fontSize:12,color:MUTED,lineHeight:1.45,marginTop:6}}>{help}</span>}</div>;
    switchImpl.current = ({ id, label, help, checked, onChange }) => <div style={{display:'flex',alignItems:'center',gap:16,padding:'16px 0',borderBottom:`1px solid ${BORDER}`}}><div style={{flex:1,minWidth:0}}><label htmlFor={id} style={{display:'block',fontFamily:INTER,fontSize:14,fontWeight:700,color:TEXT}}>{label}</label><span style={{display:'block',fontFamily:INTER,fontSize:12,color:MUTED,lineHeight:1.45,marginTop:3}}>{help}</span></div><button id={id} type="button" role="switch" aria-checked={checked} onClick={()=>onChange(!checked)} style={{position:'relative',width:46,height:28,borderRadius:999,border:`1px solid ${checked?BLUE:BORDER}`,background:checked?BLUE:CARD2,cursor:'pointer',flexShrink:0}}><span aria-hidden="true" style={{position:'absolute',top:3,left:checked?21:3,width:20,height:20,borderRadius:'50%',background:'#fff',boxShadow:'0 1px 4px rgba(0,0,0,.22)',transition:'left 160ms'}}/></button></div>;
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
      <div style={{ display:'flex', flexDirection:'column', gap:28, padding:isPhone?'20px 16px 40px':'28px 24px 40px' }}>

        <div role="status" aria-live="polite" style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',borderRadius:12,background:profileSaveState==='error'?`${RED}0D`:profileSaveState==='unsaved'?`${ORANGE}0D`:`${GREEN}0D`,border:`1px solid ${profileSaveState==='error'?RED:profileSaveState==='unsaved'?ORANGE:GREEN}26`}}>
          {profileSaveState==='saving'?<RefreshCw size={16} color={BLUE}/>:profileSaveState==='unsaved'?<Pencil size={16} color={ORANGE}/>:profileSaveState==='error'?<AlertTriangle size={16} color={RED}/>:<CheckCircle size={16} color={GREEN}/>}<span style={{fontSize:13,fontWeight:700,color:profileSaveState==='error'?RED:profileSaveState==='unsaved'?ORANGE:profileSaveState==='saving'?BLUE:GREEN}}>{{saved:'All changes saved',saving:'Saving changes…',error:'Changes could not be saved',unsaved:'You have unsaved changes'}[profileSaveState]}</span>
        </div>

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

        <section aria-labelledby="property-settings-heading">
          <div id="property-settings-heading">{sectionLabel('Property')}</div>
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:20}}>
            <Field id="settings-property" label="Property name" value={propertyName} readOnly help={authUser?.property_address ? `${authUser.property_address}. Set when the property was registered.` : 'Set when the property was registered.'} />
          </div>
        </section>

        <section aria-labelledby="appearance-settings-heading">
          <div id="appearance-settings-heading">{sectionLabel('Appearance')}</div>
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:'0 20px'}}>
            <SwitchRow id="settings-dark-mode" label="Dark mode" help="Use the darker dashboard palette on this device." checked={isDarkMode} onChange={toggleTheme}/>
            <div style={{padding:'13px 0',fontSize:12,color:MUTED}}>Theme changes are saved automatically.</div>
          </div>
        </section>

        <section aria-labelledby="notification-settings-heading">
          <div id="notification-settings-heading">{sectionLabel('Notifications')}</div>
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:'0 20px'}}>
            {[
              ['incident','Incident emails','Email me as soon as the front desk files an incident report.'],
              ['package','Package emails','Email me a copy when a package notice is sent to a resident.'],
            ].map(([id,label,help])=><SwitchRow key={id} id={`settings-${id}`} label={label} help={help} checked={notifMgr[id]} onChange={async value=>{ const next={...notifMgr,[id]:value}; setNotifMgr(next); setNotifState('saving'); try { const updated = await authApi.updateProfile({ notification_prefs: next }); completeAuthentication(updated); setNotifState('saved'); } catch { setNotifMgr(notifMgr); setNotifState('error'); } }}/>)}
            <div role="status" style={{padding:'13px 0',fontSize:12,color:notifState==='error'?RED:MUTED}}>{notifState==='saving'?'Saving…':notifState==='error'?'That change could not be saved. Try again.':notifState==='saved'?'Saved. Emails go to your account address.':'Emails go to your account address. Changes save automatically.'}</div>
          </div>
        </section>

        {/* My Profile */}
        <div>
          {sectionLabel('My Profile')}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {row('update-info', User, BLUE, 'Update Information', 'Edit your name and phone number',
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <Field id="manager-name" label="Full name" value={editInfoMgr.name} onChange={e => {setEditInfoMgr(f=>({...f,name:e.target.value}));setProfileSaveState('unsaved');}} autoComplete="name" />
                <Field id="manager-email" label="Email address" type="email" value={editInfoMgr.email} readOnly help="Your email is your sign-in and cannot be changed here." />
                <Field id="manager-phone" label="Phone number" type="tel" value={editInfoMgr.phone} onChange={e => {setEditInfoMgr(f=>({...f,phone:e.target.value}));setProfileSaveState('unsaved');}} autoComplete="tel" />
                <button disabled={profileSaveState!=='unsaved' && profileSaveState!=='error'} onClick={async () => {
                  const parts = editInfoMgr.name.trim().split(/\s+/).filter(Boolean);
                  if (!parts.length) { setProfileSaveState('error'); return; }
                  setProfileSaveState('saving');
                  try {
                    const updated = await authApi.updateProfile({ first_name: parts[0], last_name: parts.slice(1).join(' '), phone: editInfoMgr.phone.trim() });
                    completeAuthentication(updated);
                    setProfileSaveState('saved');
                    setSettingExpMgr(null);
                  } catch { setProfileSaveState('error'); }
                }} style={{ minHeight:44, marginTop:4, padding:'0 16px', background:profileSaveState==='unsaved'?BLUE:CARD2, border:profileSaveState==='unsaved'?'none':`1px solid ${BORDER}`, borderRadius:12, fontFamily:INTER, fontSize:14, fontWeight:700, color:profileSaveState==='unsaved'?'white':MUTED, cursor:profileSaveState==='unsaved'?'pointer':'not-allowed' }}>{profileSaveState==='saving'?'Saving…':'Save Changes'}</button>
              </div>
            )}
            {row('change-pw', Lock, RED, 'Change Password', 'Update your account password securely',
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <Field id="current-password" label="Current password" style={inputStyle} type="password" value={pwFormMgr.current} onChange={e => { setPwFormMgr(f=>({...f,current:e.target.value})); setPwStatusMgr(''); }} autoComplete="current-password" />
                <Field id="new-password" label="New password" help="Use at least 8 characters." style={inputStyle} type="password" value={pwFormMgr.next} onChange={e => { setPwFormMgr(f=>({...f,next:e.target.value})); setPwStatusMgr(''); }} autoComplete="new-password" />
                <Field id="confirm-password" label="Confirm new password" style={inputStyle} type="password" value={pwFormMgr.confirm} onChange={e => { setPwFormMgr(f=>({...f,confirm:e.target.value})); setPwStatusMgr(''); }} autoComplete="new-password" />
                {pwStatusMgr.startsWith('error') && <p role="alert" style={{ fontFamily:INTER, fontSize:13, color:RED, margin:0, fontWeight:600 }}>{pwStatusMgr.replace('error:','')}</p>}
                {pwStatusMgr === 'success' && <p role="status" style={{ fontFamily:INTER, fontSize:13, color:GREEN, margin:0, fontWeight:600 }}>Password updated successfully.</p>}
                <button
                  disabled={pwStatusMgr === 'saving'}
                  onClick={async () => {
                    if (!pwFormMgr.current || !pwFormMgr.next || !pwFormMgr.confirm) { setPwStatusMgr('error:Please fill in all fields.'); return; }
                    if (pwFormMgr.next !== pwFormMgr.confirm) { setPwStatusMgr('error:New passwords do not match.'); return; }
                    if (pwFormMgr.next.length < 8) { setPwStatusMgr('error:New password must be at least 8 characters.'); return; }
                    setPwStatusMgr('saving');
                    try {
                      await authApi.changePassword(pwFormMgr.current, pwFormMgr.next);
                      setPwStatusMgr('success');
                      setPwFormMgr({ current:'', next:'', confirm:'' });
                      setTimeout(() => { setPwStatusMgr(''); setSettingExpMgr(null); }, 2000);
                    } catch (err) {
                      setPwStatusMgr('error:' + (typeof err?.response?.data?.detail === 'string' ? err.response.data.detail : 'The password could not be updated.'));
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
  const renderManagerOverview = () => {
    const displayedDAR = todayShift;
    const hasDesk = team.some(m => m.concierge_id);
    const hasInvite = team.some(m => !m.concierge_id);
    const previousRawShift = allShifts.find(shift => shift.status === 'completed' || !!shift.clock_out);
    const previousDAR = previousRawShift ? shiftToDAR(previousRawShift, false) : null;
    const shiftViews = [
      { id:'previous', label:'Previous shift', aria:'Show the previous completed shift report', disabled:!previousDAR },
      { id:'dar', label:'Current shift', aria:`Current shift report: ${todayShift?(todayShift.clockOut?'complete':'live'):'not started'}` },
    ].map(view => ({ ...view, current:managerSummaryView===view.id, onSelect:() => setManagerSummaryView(view.id) }));
    return <main style={{width:'100%',maxWidth:1280,margin:'0 auto',display:'flex',flexDirection:'column',gap:isMobile?16:20}}>
      <ShiftViewHeader
        onAsk={() => setAssistantOpen(true)}
        navLabel="Operational summary"
        isPhone={isPhone}
        colors={{ card:CARD, card2:CARD2, text:TEXT, muted:MUTED, border:BORDER }}
        views={shiftViews}
      />

      {openIncidents.length > 0 && <button type="button" onClick={() => setTab('incidents')} data-testid="open-incidents-banner" style={{display:'flex',alignItems:'center',gap:12,width:'100%',padding:'13px 16px',border:`1px solid ${RED}40`,borderRadius:14,background:`${RED}0d`,cursor:'pointer',textAlign:'left',fontFamily:INTER}}>
        <AlertTriangle size={18} color={RED} style={{flexShrink:0}}/>
        <span style={{flex:1,minWidth:0,fontSize:14,fontWeight:700,color:TEXT}}>{openIncidents.length} open incident{openIncidents.length===1?'':'s'} need{openIncidents.length===1?'s':''} your review</span>
        <span style={{fontSize:13,fontWeight:700,color:RED,flexShrink:0}}>Review</span>
      </button>}

      {managerSummaryView === 'dar' && activeShifts.length > 1 && <div role="tablist" aria-label="Concierges on shift" style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {activeShifts.map(shift => { const current = shift.shiftId === todayShift?.shiftId; return <button key={shift.shiftId} type="button" role="tab" aria-selected={current} onClick={() => setActiveShiftId(shift.shiftId)} style={{padding:'8px 14px',borderRadius:999,border:`1px solid ${current?TEXT:BORDER}`,background:current?TEXT:CARD,color:current?BG:TEXT,fontFamily:INTER,fontSize:13,fontWeight:700,cursor:'pointer'}}>{shift.concierge?.name || 'Concierge'} · since {shift.clockIn}</button>; })}
      </div>}

      <div id="manager-live-dar-section" style={{scrollMarginTop:20}}>
        <DailyActivityReport
          testId="manager-live-dar"
          mode="manager"
          shift={managerSummaryView === 'previous' ? previousDAR : displayedDAR}
          editable={false}
          showConciergeIdentity
          onPrint={() => window.print()}
          printLabel="Export DAR as PDF"
          propertyName={propertyName}
          propertyAddress={authUser?.property_address || ''}
          incidents={(managerSummaryView === 'previous' ? previousDAR : displayedDAR)?.incidents}
          customSections={customSections}
          onOpenEvidence={(urls) => setManagerMedia({ urls, index:0, title:'Shift photo' })}
          emptyTitle={hasDesk ? 'No one is on shift right now' : hasInvite ? 'Your invite is waiting to be accepted' : 'Invite your first concierge'}
          emptyHint={hasDesk ? 'This report fills in live as soon as a concierge starts a shift. You can assign a request now and it will be waiting for them.' : hasInvite ? 'Once your concierge sets a password and starts a shift, their report appears here live.' : 'Add the people who work your front desk. Their shift report appears here as they log packages, guests and requests.'}
          emptyAction={hasDesk ? openTask : () => { setTab('team'); if (!hasInvite) setLeasingOpen(true); }}
          emptyActionLabel={hasDesk ? 'Assign a request' : hasInvite ? 'View team' : 'Invite a concierge'}
          colors={{ card:CARD, card2:CARD2, text:TEXT, muted:MUTED, border:BORDER, shadow:SHADOW }}
        />
      </div>
      {managerMedia && <div role="dialog" aria-modal="true" aria-label={managerMedia.title} onClick={()=>setManagerMedia(null)} style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,.88)',display:'grid',placeItems:'center',padding:24}}><button type="button" aria-label="Close media viewer" onClick={()=>setManagerMedia(null)} style={{position:'absolute',top:20,right:20,width:44,height:44,border:0,borderRadius:'50%',background:'rgba(255,255,255,.14)',color:'#fff',cursor:'pointer'}}><X size={22}/></button><img onClick={event=>event.stopPropagation()} src={managerMedia.urls[managerMedia.index]} alt={managerMedia.title} style={{maxWidth:'100%',maxHeight:'88vh',objectFit:'contain',borderRadius:12}}/></div>}
    </main>;
  };

  /* ── Incidents ─────────────────────────────────────────────────────────────── */
  const openIncidents = incidents.filter(i => i.status !== 'resolved');
  const resolveIncident = async (inc) => {
    setSuccessIncidentId(inc.id);
    try {
      const saved = await authApi.resolveIncident(inc.incident_id || inc.id);
      setIncidents(list => list.map(item => item.id === inc.id ? saved : item));
      setSrAnnounce('Incident resolved.');
    } catch {
      setSrAnnounce('The incident could not be resolved. Try again.');
      setIncidentsError(true);
    } finally {
      setSuccessIncidentId(null);
      setTimeout(() => setSrAnnounce(''), 1500);
    }
  };
  const renderIncidents = () => {
    const resolved = incidents.filter(i => i.status === 'resolved');
    const card = (inc, done) => (
      <article key={inc.id} role="listitem" data-testid="incident-card" style={{ background:CARD, border:`1px solid ${done ? BORDER : sev(inc.severity)+'45'}`, borderRadius:16, padding:18, opacity:done?.78:1 }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:`${done?MUTED:sev(inc.severity)}14`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            {done ? <CheckCircle size={20} color={GREEN}/> : <AlertTriangle size={20} color={sev(inc.severity)}/>}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:4 }}>
              <span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, letterSpacing:'.12em', textTransform:'uppercase', color:done?MUTED:sev(inc.severity) }}>{inc.type || 'Incident'}</span>
              <span style={{ fontFamily:INTER, fontSize:10, fontWeight:700, color:MUTED, textTransform:'uppercase', letterSpacing:'.08em' }}>{inc.severity}</span>
            </div>
            <p style={{ fontFamily:INTER, fontSize:15, fontWeight:700, color:TEXT, margin:'0 0 6px', lineHeight:1.4, overflowWrap:'anywhere' }}>{inc.title || 'No description given'}</p>
            <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:0, lineHeight:1.6 }}>
              {[inc.location, inc.unit_number && !String(inc.location).includes(inc.unit_number) ? `Unit ${inc.unit_number}` : '', inc.person_involved, inc.filedBy ? `Filed by ${inc.filedBy}` : '', inc.filedAt].filter(Boolean).join(' · ')}
            </p>
            {inc.note && <p style={{ fontFamily:INTER, fontSize:13, color:TEXT, margin:'10px 0 0', lineHeight:1.55, overflowWrap:'anywhere' }}><b>Actions taken:</b> {inc.note}</p>}
            {inc.evidenceUrls?.length > 0 && <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:12 }}>{inc.evidenceUrls.map((url, index) => <button key={index} type="button" onClick={() => setManagerMedia({ urls:inc.evidenceUrls, index, title:inc.title || 'Incident photo' })} aria-label={`Open photo ${index + 1}`} style={{ width:64, height:64, padding:0, borderRadius:10, overflow:'hidden', border:`1px solid ${BORDER}`, cursor:'pointer', background:CARD2 }}><img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/></button>)}</div>}
            {done && inc.resolvedAt && <p style={{ fontFamily:INTER, fontSize:12, color:GREEN, fontWeight:700, margin:'10px 0 0' }}>Resolved {inc.resolvedAt}</p>}
          </div>
        </div>
        {!done && <div style={{ display:'flex', justifyContent:'flex-end', marginTop:14 }}>
          <button type="button" onClick={() => resolveIncident(inc)} disabled={successIncidentId === inc.id} data-testid="resolve-incident-btn" className="touch-target" style={{ minHeight:44, padding:'0 20px', background:GREEN, border:0, borderRadius:999, fontFamily:INTER, fontSize:13, fontWeight:750, color:'#fff', cursor:successIncidentId === inc.id ? 'wait' : 'pointer', display:'inline-flex', alignItems:'center', gap:8 }}><Check size={15}/>{successIncidentId === inc.id ? 'Saving…' : 'Mark resolved'}</button>
        </div>}
      </article>
    );
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
        {incidentsError && <div role="alert" style={{ padding:'12px 16px', borderRadius:12, border:`1px solid ${RED}40`, background:`${RED}0d`, fontFamily:INTER, fontSize:13, color:TEXT, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <span>Incidents could not be loaded or saved. Check your connection.</span>
          <button type="button" onClick={() => authApi.getIncidents().then(list => { setIncidents(list); setIncidentsError(false); }).catch(() => setIncidentsError(true))} style={{ padding:'8px 16px', border:0, borderRadius:999, background:TEXT, color:BG, fontFamily:INTER, fontSize:12, fontWeight:700, cursor:'pointer' }}>Retry</button>
        </div>}
        <section aria-label="Open incidents">
          <h3 style={{ fontFamily:INTER, fontSize:12, fontWeight:800, color:MUTED, letterSpacing:'.14em', textTransform:'uppercase', margin:'0 0 12px' }}>Open · {openIncidents.length}</h3>
          {openIncidents.length === 0 ? <div style={{ padding:'36px 20px', border:`1px solid ${BORDER}`, borderRadius:16, background:CARD, textAlign:'center' }}>
            <CheckCircle size={26} color={GREEN}/>
            <p style={{ fontFamily:INTER, fontSize:16, fontWeight:750, color:TEXT, margin:'10px 0 4px' }}>All clear</p>
            <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:0, lineHeight:1.55 }}>When the front desk files an incident report it appears here for your review, and you get an email.</p>
          </div> : <div role="list" style={{ display:'flex', flexDirection:'column', gap:12 }}>{openIncidents.map(inc => card(inc, false))}</div>}
        </section>
        {resolved.length > 0 && <section aria-label="Resolved incidents">
          <h3 style={{ fontFamily:INTER, fontSize:12, fontWeight:800, color:MUTED, letterSpacing:'.14em', textTransform:'uppercase', margin:'0 0 12px' }}>Resolved · {resolved.length}</h3>
          <div role="list" style={{ display:'flex', flexDirection:'column', gap:12 }}>{resolved.slice(0, 30).map(inc => card(inc, true))}</div>
        </section>}
      </div>
    );
  };

  /* ── Shifts Calendar ───────────────────────────────────────────────────────── */
  const renderShifts = () => {
    const year   = calDate.getFullYear();
    const month  = calDate.getMonth();
    const cells  = getCalCells(year, month);
    const prefix = toDS(year, month, 1).slice(0, 7);
    const monthCount = (y, m) => [...shiftDatesSet].filter(d => d.startsWith(toDS(y, m, 1).slice(0,7))).length;

    const shiftDARBody = (shift, reportDate) => (
      <DailyActivityReport mode="manager" shift={shift} editable={false} showConciergeIdentity
        propertyName={propertyName} dateLabel={reportDate} customSections={customSections}
        colors={{ card:CARD, card2:CARD2, text:TEXT, muted:MUTED, border:BORDER }} />
    );

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
    const shiftStatus = shift => {
      const status = String(shift?.status || '').toLowerCase();
      if (['active','on_shift','in_progress'].includes(status)) return { label:'Active', color:GREEN };
      if (['missed','no_show','no-show'].includes(status)) return { label:'Missed', color:RED };
      if (['upcoming','scheduled','pending'].includes(status)) return { label:'Upcoming', color:ORANGE };
      return { label:'Completed', color:BLUE };
    };

    return (
      <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns:'1fr 400px', gap: isMobile ? 16 : 20, alignItems: isMobile ? 'stretch' : 'start' }}>

        {/* DAR — middle on mobile, left col spanning both rows on desktop */}
        <div style={{ background:CARD, border:`1px solid ${selectedShift?BLUE:BORDER}`, borderRadius:20, overflow:'hidden', boxShadow:selectedShift?`0 0 0 3px ${BLUE}10`:'0 2px 8px rgba(0,0,0,0.05)', order: isMobile ? 2 : 0, gridColumn: 1, gridRow: '1 / 3' }}>
          {selectedShift ? (
            <><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'13px 16px',borderBottom:`1px solid ${BORDER}`,background:`${BLUE}08`}}><div style={{minWidth:0}}><DashboardEyebrow>Selected shift</DashboardEyebrow><strong style={{display:'block',fontSize:14,color:TEXT,marginTop:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{dateLabel} · {selectedShift.concierge.name}</strong></div><div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}><DashboardStatusBadge color={shiftStatus(selectedShift).color}>{shiftStatus(selectedShift).label}</DashboardStatusBadge><span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 11px',borderRadius:9,background:BLUE,color:'white',fontSize:11,fontWeight:800}}><ClipboardCheck size={14}/>DAR</span></div></div>{shiftDARBody(selectedShift, dateLabel)}</>
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
                    const cellStatus = hasShift ? shiftStatus(shiftDatesMap[cell.dateStr]) : null;
                    return (
                      <button key={cell.dateStr}
                        onClick={() => hasShift && setShiftDay(isSel ? null : cell.dateStr)}
                        style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', aspectRatio:'1', borderRadius:10,
                          background: isSel ? BLUE : isToday ? `${BLUE}10` : 'transparent',
                          border: isSel ? 'none' : isToday ? `2px solid ${BLUE}` : '2px solid transparent',
                          cursor: hasShift ? 'pointer' : 'default' }}>
                        <span style={{ fontFamily:INTER, fontSize:13, fontWeight:isSel||isToday?800:500, color:isSel?'white':isToday?BLUE:hasShift?TEXT:'#ccc' }}>
                          {cell.day}
                        </span>
                        {hasShift && <div style={{ width:5, height:5, borderRadius:'50%', background:isSel?'rgba(255,255,255,0.8)':cellStatus.color, marginTop:2 }} />}
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
                  const statusMeta = shiftStatus(s);
                  const onDuty = statusMeta.label === 'Active';
                  const stColor = statusMeta.color;
                  return (
                    <button key={dateStr} onClick={() => setShiftDay(dateStr)}
                      aria-pressed={isSel} aria-label={`${label}, ${s.concierge.name}, ${statusMeta.label}. View daily activity report`}
                      style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:16, background:isSel?`${BLUE}0A`:CARD2, border:`1.5px solid ${isSel?BLUE:BORDER}`, boxShadow:isSel?`inset 3px 0 0 ${BLUE}`:'none', borderRadius:14, cursor:'pointer', textAlign:'left', transition:'border-color 150ms' }}>
                      <div style={{ width:48, height:48, borderRadius:14, background:onDuty?'rgba(52,199,89,0.12)':'rgba(255,56,92,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span style={{ fontFamily:INTER, fontSize:16, fontWeight:800, color:stColor }}>{s.concierge.init}</span>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
                          <span style={{ fontFamily:INTER, fontSize:14, fontWeight:700, color:TEXT }}>{s.concierge.name}</span>
                          <span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:stColor, background:`${stColor}14`, borderRadius:6, padding:'2px 6px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{statusMeta.label}</span>
                        </div>
                        <div style={{ fontFamily:INTER, fontSize:12, color:MUTED }}>{label} · {s.clockIn}{s.clockOut?` – ${s.clockOut}`:''} · {s.activities.length} actions</div>
                      </div>
                      <span style={{display:'flex',alignItems:'center',gap:4,color:isSel?BLUE:MUTED,fontSize:10,fontWeight:800}}><ClipboardCheck size={14}/><span style={{display:isMobile?'none':'inline'}}>DAR</span><ChevronRight size={14}/></span>
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
    const managerTasks = tasks.filter(t => !t.createdByType || t.createdByType === 'manager');
    const isOverdue = t => t.status !== 'declined' && (t.status === 'overdue' || t.isOverdue || (t.dueAt && new Date(t.dueAt) < new Date() && t.status !== 'completed'));
    const counts = {
      overdue: managerTasks.filter(isOverdue).length,
      active: managerTasks.filter(t => t.status === 'in_progress' && !isOverdue(t)).length,
      pending: managerTasks.filter(t => t.status === 'pending' && !isOverdue(t)).length,
      completed: managerTasks.filter(t => t.status === 'completed').length,
      declined: managerTasks.filter(t => t.status === 'declined').length,
    };
    const q = taskSearch.trim().toLowerCase();
    const filtered = managerTasks.filter(t => {
      const bucket = isOverdue(t) ? 'overdue' : t.status === 'in_progress' ? 'active' : t.status;
      const statusMatch = taskFilter === 'all' || (taskFilter === 'open' ? bucket !== 'completed' : bucket === taskFilter) /* declined stays in open work: the manager has to act on it */;
      const assigneeMatch = taskAssignee === 'all' || t.toId === taskAssignee;
      const textMatch = !q || [t.title,t.notes,t.category,t.assignedTo,t.priority].some(v => String(v || '').toLowerCase().includes(q));
      return statusMatch && assigneeMatch && textMatch;
    });
    const groupDefs = [
      { key:'declined', label:'Declined by the desk', color:RED, Icon:AlertTriangle, test:t => t.status === 'declined' },
      { key:'overdue', label:'Overdue', color:RED, Icon:AlertTriangle, test:t => isOverdue(t) },
      { key:'active', label:'In progress', color:ORANGE, Icon:RefreshCw, test:t => t.status === 'in_progress' && !isOverdue(t) },
      { key:'pending', label:'Waiting for the desk', color:TEXT, Icon:ClipboardList, test:t => t.status === 'pending' && !isOverdue(t) },
      { key:'completed', label:'Completed', color:GREEN, Icon:CheckCircle, test:t => t.status === 'completed' },
    ];
    const updateStatus = async (task, status) => {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status } : t));
      try { const updated = await authApi.updateTask(task.id, { status }); setTasks(prev => prev.map(t => t.id === task.id ? updated : t)); }
      catch { setTasks(prev => prev.map(t => t.id === task.id ? task : t)); setTasksError(true); }
    };
    const control = { minHeight:42, border:`1px solid ${BORDER}`, borderRadius:12, background:CARD, color:TEXT, fontFamily:INTER, fontSize:13, outline:'none' };
    const EmptyState = ({ error=false }) => <DashboardCard style={{ padding:isMobile?28:38, textAlign:'center', border:`1px solid ${BORDER}`, boxShadow:'none' }}><div style={{ width:44,height:44,borderRadius:13,background:error?`${RED}12`:CARD2,display:'grid',placeItems:'center',margin:'0 auto 12px' }}>{error?<AlertTriangle size={20} color={RED}/>:<ClipboardCheck size={20} color={MUTED}/>}</div><strong style={{display:'block',fontSize:15,color:TEXT}}>{error?'Tasks couldn’t load':q || taskFilter !== 'open' || taskAssignee !== 'all'?'No tasks match these filters':'Everything is covered'}</strong><span style={{display:'block',fontSize:13,color:MUTED,marginTop:5}}>{error?'Try loading the task list again.':q || taskFilter !== 'open' || taskAssignee !== 'all'?'Clear or adjust the filters to see more work.':'There are no open manager assignments right now.'}</span>{error&&<button onClick={()=>{setTasksLoading(true);setTasksError(false);authApi.getTasks().then(setTasks).catch(()=>setTasksError(true)).finally(()=>setTasksLoading(false));}} style={{...control,padding:'0 16px',marginTop:16,cursor:'pointer'}}>Try again</button>}</DashboardCard>;

    return <div style={{fontFamily:INTER,display:'flex',flexDirection:'column',gap:22}}>
      {taskSuccess && <div role="status" style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',border:`1px solid ${GREEN}40`,borderRadius:12,background:`${GREEN}10`,color:TEXT,fontSize:13}}><CheckCircle size={17} color={GREEN}/><span style={{flex:1}}>{taskSuccess}</span><button aria-label="Dismiss" onClick={()=>setTaskSuccess('')} style={{border:0,background:'transparent',color:MUTED,cursor:'pointer'}}><X size={16}/></button></div>}
      <div style={{display:'flex',alignItems:isMobile?'stretch':'center',flexDirection:isMobile?'column':'row',justifyContent:'space-between',gap:14}}>
        <div><DashboardEyebrow>Work queue</DashboardEyebrow><DashboardSectionTitle as="h3" style={{margin:'5px 0 0'}}>Assignments at a glance</DashboardSectionTitle></div>
        <button onClick={openTask} style={{...control,minHeight:44,padding:'0 16px',border:0,background:BLUE,color:'white',fontWeight:750,cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8}}><Plus size={17}/>Assign task</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:isMobile?'repeat(2,minmax(0,1fr))':'repeat(4,minmax(0,1fr))',gap:10}}>
        {[[counts.declined?'Declined':'Overdue',counts.declined||counts.overdue,RED],['In progress',counts.active,ORANGE],['Waiting',counts.pending,TEXT],['Completed',counts.completed,GREEN]].map(([label,value,color])=><div key={label} style={{padding:'14px 15px',border:`1px solid ${BORDER}`,borderRadius:14,background:CARD}}><strong style={{fontSize:22,color,lineHeight:1}}>{value}</strong><span style={{display:'block',fontSize:11,fontWeight:700,color:MUTED,textTransform:'uppercase',letterSpacing:'.08em',marginTop:6}}>{label}</span></div>)}
      </div>
      <div aria-label="Task filters" style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'minmax(220px,1fr) auto auto',gap:10}}>
        <label style={{position:'relative'}}><span className="sr-only">Search tasks</span><Search size={16} color={MUTED} style={{position:'absolute',left:14,top:13}}/><input value={taskSearch} onChange={e=>setTaskSearch(e.target.value)} placeholder="Search title, assignee, or category" style={{...control,width:'100%',padding:'0 14px 0 40px',boxSizing:'border-box'}}/></label>
        <select aria-label="Filter task status" value={taskFilter} onChange={e=>setTaskFilter(e.target.value)} style={{...control,padding:'0 34px 0 12px'}}><option value="open">Open work</option><option value="all">All statuses</option><option value="overdue">Overdue</option><option value="active">In progress</option><option value="pending">Waiting for the desk</option><option value="declined">Declined</option><option value="completed">Completed</option></select>
        <select aria-label="Filter task assignee" value={taskAssignee} onChange={e=>setTaskAssignee(e.target.value)} style={{...control,padding:'0 34px 0 12px'}}><option value="all">All assignees</option>{team.filter(c=>c.status!=='invited').map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
      </div>
      {tasksLoading ? <div aria-label="Loading tasks" style={{display:'flex',flexDirection:'column',gap:10}}>{[1,2,3].map(i=><div key={i} style={{height:96,borderRadius:16,background:CARD2,border:`1px solid ${BORDER}`,opacity:1-i*.15}}/>)}</div> : tasksError ? <EmptyState error/> : filtered.length===0 ? <EmptyState/> : groupDefs.map(group=>{
        const items=filtered.filter(group.test); if(!items.length)return null;
        return <section key={group.key} aria-labelledby={`task-group-${group.key}`}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}><group.Icon size={17} color={group.color}/><h4 id={`task-group-${group.key}`} style={{fontSize:14,color:TEXT,margin:0}}>{group.label}</h4><span style={{fontSize:12,color:MUTED}}>({items.length})</span></div><div style={{border:`1px solid ${BORDER}`,borderRadius:16,overflow:'hidden',background:CARD}}>{items.map((t,index)=>{
          const done=t.status==='completed'; const declined=t.status==='declined'; const overdue=isOverdue(t); const TIcon=CAT_ICON[t.category]||ClipboardList; const pc=PRIORITY_COLOR[t.priority]||MUTED;
          return <article key={t.id} data-testid="manager-task-row" style={{display:'grid',gridTemplateColumns:isMobile?'36px minmax(0,1fr)':'40px minmax(0,1fr) auto',gap:12,padding:isMobile?'15px 14px':'17px 18px',borderTop:index?`1px solid ${BORDER}`:'none',alignItems:'start'}}><div style={{width:36,height:36,borderRadius:11,background:done?`${GREEN}12`:overdue?`${RED}12`:CARD2,display:'grid',placeItems:'center'}}><TIcon size={17} color={done?GREEN:overdue?RED:MUTED}/></div><div style={{minWidth:0}}><div style={{display:'flex',gap:7,alignItems:'center',flexWrap:'wrap'}}><strong style={{fontSize:14,lineHeight:1.4,color:done?MUTED:TEXT,textDecoration:done?'line-through':'none'}}>{t.title}</strong>{t.priority&&t.priority!=='Standard'&&<DashboardStatusBadge dot={false} color={pc} style={{fontSize:9,padding:'3px 6px'}}>{t.priority}</DashboardStatusBadge>}</div><div style={{display:'flex',gap:6,flexWrap:'wrap',fontSize:12,color:MUTED,marginTop:5}}><span>{t.assignedTo||'Unassigned'}</span><span>·</span><span style={{color:overdue?RED:MUTED}}>Due {t.dueTime||'not set'}</span><span>·</span><span>{t.category||'Other'}</span>{done&&t.completedAt&&<><span>·</span><span>Done {t.completedAt}{t.completedByName?` by ${t.completedByName}`:''}</span></>}{declined&&<><span>·</span><span style={{color:RED}}>Declined{t.declinedByName?` by ${t.declinedByName}`:''}{t.declinedAt?` · ${t.declinedAt}`:''}</span></>}</div>{t.notes&&<p style={{fontSize:12,color:MUTED,lineHeight:1.5,margin:'7px 0 0'}}>{t.notes}</p>}{(done||declined)&&t.completionNote&&<p style={{fontSize:12,color:TEXT,lineHeight:1.5,margin:'7px 0 0',overflowWrap:'anywhere'}}><b>{declined?'Reason:':'Desk note:'}</b> {t.completionNote}</p>}{done&&t.evidenceUrls?.length>0&&<div style={{display:'flex',gap:6,marginTop:8}}>{t.evidenceUrls.map((url,i)=><button key={i} type="button" onClick={()=>setManagerMedia({urls:t.evidenceUrls,index:i,title:t.title})} aria-label={`Open photo ${i+1}`} style={{width:44,height:44,padding:0,border:`1px solid ${BORDER}`,borderRadius:8,overflow:'hidden',cursor:'pointer',background:CARD2}}><img src={url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/></button>)}</div>}<div style={{display:'flex',gap:7,marginTop:11}}>{declined&&<button onClick={()=>updateStatus(t,'pending')} style={{...control,minHeight:34,padding:'0 12px',fontSize:12,fontWeight:700,cursor:'pointer'}}>Send to the desk again</button>}{!done&&!declined&&<button onClick={()=>updateStatus(t,'completed')} style={{...control,minHeight:34,padding:'0 12px',fontSize:12,fontWeight:700,cursor:'pointer',background:TEXT,color:BG,borderColor:TEXT}}>Mark done</button>}</div></div><DashboardStatusBadge color={done?GREEN:(overdue||declined)?RED:t.status==='in_progress'?ORANGE:MUTED} style={{display:isMobile?'none':'inline-flex'}}>{done?'Completed':declined?'Declined':overdue?'Overdue':t.status==='in_progress'?'Active':'Waiting'}</DashboardStatusBadge></article>;
        })}</div></section>})}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:4,borderTop:`1px solid ${BORDER}`,fontSize:12,color:MUTED}}><span>Recurring work is planned separately.</span><button onClick={()=>setTab('scheduled')} style={{border:0,background:'transparent',color:TEXT,fontWeight:700,cursor:'pointer',padding:8}}>Planned tasks <ChevronRight size={13} style={{verticalAlign:'middle'}}/></button></div>
    </div>;
  };

  /* ── Team ──────────────────────────────────────────────────────────────────── */
  const renderTeam = () => {
    const teamQuery = teamSearch.trim().toLowerCase();
    const matchesTeamSearch = c => !teamQuery || [c.name,c.title,c.co,c.company,c.phone,c.email,c.access,c.status].some(value => String(value || '').toLowerCase().includes(teamQuery));
    const active  = team.filter(c => c.status !== 'invited' && matchesTeamSearch(c));
    const invited = team.filter(c => c.status === 'invited' && matchesTeamSearch(c));
    const glassCard = { background:CARD, border:`1px solid ${BORDER}`, borderRadius:16 };

    return (
      <div style={{ flex:1, minHeight:0, background:BG, paddingBottom:32, fontFamily:INTER }}>

        {/* ── CTA — exact copy of incident report top button ── */}
        <div style={{ padding:'16px 0 20px' }}>
          <button onClick={() => setLeasingOpen(true)}
            style={{ width:'100%', padding:20, background:GREEN, borderRadius:20, border:'none', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', boxShadow:'0 8px 24px rgba(52,199,89,0.3)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:56, height:56, background:'rgba(255,255,255,0.2)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <UserPlus size={28} color="white" />
              </div>
              <div>
                <p style={{ fontFamily:INTER, fontSize:'1rem', fontWeight:700, color:'white', letterSpacing:'-0.01em', margin:0 }}>Add Team Member</p>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.7)', margin:0 }}>Invite a concierge to your property</p>
              </div>
            </div>
            <ChevronRight size={24} color="rgba(255,255,255,0.7)" />
          </button>
        </div>

        {teamNotice && <div role="status" data-testid="team-notice" style={{ marginBottom:16, padding:'12px 14px', borderRadius:12, border:`1px solid ${(teamNotice.tone==='ok'?GREEN:teamNotice.tone==='warn'?ORANGE:BORDER)}55`, background:teamNotice.tone==='ok'?`${GREEN}10`:teamNotice.tone==='warn'?`${ORANGE}10`:CARD2, display:'flex', alignItems:'flex-start', gap:10, fontSize:13, color:TEXT, lineHeight:1.5 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div>{teamNotice.text}</div>
            {teamNotice.link && <div style={{ display:'flex', gap:8, marginTop:8, alignItems:'center' }}>
              <input readOnly value={teamNotice.link} aria-label="Password reset link" onFocus={e => e.target.select()} style={{ flex:1, minWidth:0, minHeight:38, padding:'0 10px', border:`1px solid ${BORDER}`, borderRadius:8, background:CARD, color:TEXT, fontFamily:INTER, fontSize:12 }} />
              <button type="button" onClick={() => { try { navigator.clipboard?.writeText(teamNotice.link); setTeamNotice(n => n && ({ ...n, copied:true })); } catch {} }} style={{ minHeight:38, padding:'0 14px', border:0, borderRadius:8, background:TEXT, color:BG, fontFamily:INTER, fontSize:12, fontWeight:700, cursor:'pointer' }}>{teamNotice.copied ? 'Copied' : 'Copy link'}</button>
            </div>}
          </div>
          <button type="button" aria-label="Dismiss" onClick={() => setTeamNotice(null)} style={{ border:0, background:'transparent', cursor:'pointer', display:'inline-flex', padding:2 }}><X size={16} color={MUTED}/></button>
        </div>}

        <label style={{ position:'relative', display:'block', marginBottom:18 }}>
          <span className="sr-only">Search team</span>
          <Search size={17} color={MUTED} style={{ position:'absolute', left:14, top:13 }} />
          <input value={teamSearch} onChange={e=>setTeamSearch(e.target.value)} placeholder="Search name, role, company, or contact" aria-label="Search team"
            style={{ width:'100%', minHeight:44, boxSizing:'border-box', padding:'0 14px 0 42px', border:`1px solid ${BORDER}`, borderRadius:12, background:CARD, color:TEXT, fontFamily:INTER, fontSize:13, outline:'none' }} />
        </label>

        {/* ── Team Members section ── */}
        <div>
          {/* Section header — exact copy of "Past Reports" header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Users size={20} color={MUTED} />
              <h2 style={{ fontWeight:700, color:TEXT, fontSize:17, margin:0 }}>Team Members</h2>
            </div>
            <span style={{ width:32, height:32, borderRadius:'50%', background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:MUTED }}>
              {active.length}
            </span>
          </div>

          {active.length > 0 ? (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {active.map(c => {
                const onShift = c.status === 'on_shift';
                const stBg    = onShift ? GREEN : '#717171';
                const stLabel = onShift ? (c.onShiftSince ? `ON SHIFT · SINCE ${c.onShiftSince}` : 'ON SHIFT') : 'OFF DUTY';
                const stColor = onShift ? GREEN : MUTED;
                return (
                  <div key={c.id} style={{ ...glassCard, padding:isMobile?15:20, display:'grid', gridTemplateColumns:isMobile?'48px minmax(0,1fr)':'48px minmax(0,1fr) auto', alignItems:'center', gap:16 }}>

                    {/* Avatar — 48×48 borderRadius:14, matches incident icon container */}
                    <div style={{ position:'relative', flexShrink:0 }}>
                      <div style={{ width:48, height:48, background: onShift ? 'rgba(52,199,89,0.1)' : CARD2, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontFamily:INTER, fontSize:18, fontWeight:800, color:stColor }}>{c.init}</span>
                      </div>
                      {onShift && <div style={{ position:'absolute', bottom:-2, right:-2, width:12, height:12, borderRadius:'50%', background:GREEN, border:`2px solid ${CARD}` }} />}
                    </div>

                    {/* Info — flex:1 content block, matches incident card layout */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <p title={c.name} style={{ fontWeight:700, color:TEXT, fontSize:16, margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</p>
                      <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginTop:3 }}>
                        <span style={{ fontSize:12, color:TEXT, fontWeight:650 }}>{c.title || c.role || 'Concierge'}</span>
                        {(c.co || c.company) && <span style={{ fontSize:12, color:MUTED }}>· {c.co || c.company}</span>}
                        <span style={{ fontSize:12, color:MUTED }}>· {c.shifts ?? c.shift_count ?? 0} {(c.shifts ?? c.shift_count ?? 0) === 1 ? 'shift' : 'shifts'}</span>
                        {c.since && <span style={{ fontSize:12, color:MUTED }}>· Since {c.since}</span>}
                      </div>
                      <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:6,fontSize:11,color:MUTED}}>
                        {c.phone && <span>{c.phone}</span>}{c.email && <span>· {c.email}</span>}<span>· {c.access || c.access_level || 'Property access'}</span>
                      </div>
                      {/* Action buttons — smaller, inside the info block */}
                      <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
                        <button onClick={() => { setSetupConcierge(c.id); setTab('sections'); }}
                          style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', background:`${BLUE}10`, border:`1px solid ${BLUE}28`, borderRadius:8, cursor:'pointer', fontFamily:INTER }}>
                          <Sliders size={12} color={BLUE} />
                          <span style={{ fontSize:12, fontWeight:650, color:BLUE }}>Manage access</span>
                        </button>
                        {c.phone && <a href={`tel:${c.phone.replace(/\D/g,'')}`}
                          style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:8, textDecoration:'none' }}>
                          <Phone size={12} color={MUTED} />
                          <span style={{ fontFamily:INTER, fontSize:12, fontWeight:600, color:TEXT }}>Call</span>
                        </a>}
                        <a href={`mailto:${c.email}`}
                          style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:8, textDecoration:'none' }}>
                          <Mail size={12} color={MUTED} />
                          <span style={{ fontFamily:INTER, fontSize:12, fontWeight:600, color:TEXT }}>Email</span>
                        </a>
                        <button onClick={async () => { setTeamNotice({ tone:'info', text:`Sending a reset link to ${c.email}…` }); try { const res = await authApi.resendCredentials(c.concierge_id); setTeamNotice(res.email_sent === false ? { tone:'warn', text:`The reset email to ${c.email} could not be sent${res.email_error ? ` (${res.email_error})` : ''}. Copy this link and send it to ${c.name} yourself. It works once and expires in 1 hour.`, link:res.reset_link || '' } : { tone:'ok', text:`A password reset link was emailed to ${c.email}.` }); } catch { setTeamNotice({ tone:'warn', text:'The reset link could not be created. Check your connection and try again.' }); } }}
                          style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:8, cursor:'pointer', fontFamily:INTER }}>
                          <KeyRound size={12} color={BLUE} />
                          <span style={{ fontSize:12, fontWeight:600, color:BLUE }}>Reset PW</span>
                        </button>
                        <button aria-label={`Remove ${c.name}`} title="Remove team member" onClick={() => { setRemoveError(''); setRemoveTarget(c); }}
                          style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', background:`${RED}10`, border:`1px solid ${RED}28`, borderRadius:8, cursor:'pointer', fontFamily:INTER }}>
                          <Trash2 size={12} color={RED} />
                          <span style={{ fontSize:12, fontWeight:600, color:RED }}>Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* Status badge — exact copy of incident severity badge */}
                    <span style={{ gridColumn:isMobile?'2':'auto', justifySelf:isMobile?'start':'auto', padding:'6px 12px', borderRadius:999, fontSize:10, fontWeight:800, background:`${stBg}16`, color:stColor, border:`1px solid ${stBg}30`, flexShrink:0 }}>
                      {stLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty state — exact copy of incident empty state */
            <div style={{ ...glassCard, padding:40, textAlign:'center' }}>
              <div style={{ width:80, height:80, background:CARD2, borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <Users size={40} color={MUTED} />
              </div>
              <p style={{ fontWeight:700, color:TEXT, fontSize:17, marginBottom:6 }}>{teamSearch ? 'No team members match' : 'No team members yet'}</p>
              <p style={{ fontSize:14, color:MUTED }}>{teamSearch ? 'Try a different name, role, company, or contact.' : 'Tap "Add Team Member" to invite your first concierge'}</p>
            </div>
          )}
        </div>

        {/* ── Pending Invites ── */}
        {invited.length > 0 && (
          <div style={{ marginTop:28 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <UserPlus size={20} color={ORANGE} />
                <h2 style={{ fontWeight:700, color:TEXT, fontSize:17, margin:0 }}>Pending Invites</h2>
              </div>
              <span style={{ width:32, height:32, borderRadius:'50%', background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:MUTED }}>
                {invited.length}
              </span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {invited.map(c => (
                <div key={c.id} style={{ ...glassCard, padding:20, display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ width:48, height:48, background:`${ORANGE}12`, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontFamily:INTER, fontSize:18, fontWeight:800, color:ORANGE }}>{c.init}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:700, color:TEXT, fontSize:16, margin:'0 0 2px' }}>{c.name}</p>
                    <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:3 }}>
                      <span style={{ fontSize:12, color:MUTED }}>{c.email}</span>
                      <span style={{ fontSize:12, color:MUTED }}>· Awaiting sign-up</span>
                    </div>
                  </div>
                  <span style={{ padding:'6px 14px', borderRadius:10, fontSize:12, fontWeight:700, background:ORANGE, color:'white', flexShrink:0 }}>PENDING</span>
                  <button aria-label={`Delete invite for ${c.name}`} title="Delete invite" onClick={() => { setRemoveError(''); setRemoveTarget(c); }}
                    style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', background:`${RED}10`, border:`1px solid ${RED}28`, borderRadius:8, cursor:'pointer', fontFamily:INTER, flexShrink:0 }}>
                    <Trash2 size={12} color={RED} />
                    <span style={{ fontSize:12, fontWeight:600, color:RED }}>Delete</span>
                  </button>
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
    if (file.size > MAX_KNOWLEDGE_FILE_BYTES) { setFileError('That file is too large to share with the desk. Please choose a file under 6 MB.'); e.target.value = ''; return; }
    setFileError('');
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
    const newSopId = editingSopId || `upload-${Date.now()}`;
    if (editingSopId) {
      setUploadedSOPs(items=>items.map(item=>item.id===editingSopId?{...item,category:cat,title:uploadForm.title.trim(),fileName:uploadForm.fileName,fileType:uploadForm.fileType,dataURL:uploadForm.dataURL}:item));
    } else {
    setUploadedSOPs(p => [...p, {
      id: newSopId,
      category: cat,
      title: uploadForm.title.trim(),
      fileName: uploadForm.fileName,
      fileType: uploadForm.fileType,
      dataURL: uploadForm.dataURL,
      _uploaded: true,
    }]);
    }
    setUploadForm({ category:'', customCategory:'', title:'', fileName:'', fileType:'', dataURL:'' });
    setSopUploadOpen(false);
    setSopStep(1);
    setEditingSopId(null);
    if (uploadFileRef.current) uploadFileRef.current.value = '';
  };

  const TRAINING_CATEGORIES = ['Onboarding','Safety & Emergency','Guest Experience','Building Systems','Amenity Operations','Software & Tools','Other'];

  const handleTrainingFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    let fileType = 'pdf';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    if (file.size > MAX_KNOWLEDGE_FILE_BYTES) { setFileError('That file is too large to share with the desk. Please choose a file under 6 MB.'); e.target.value = ''; return; }
    setFileError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTrainingForm(p => ({ ...p, fileName: file.name, fileType, dataURL: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const saveTrainingItem = () => {
    const cat = trainingForm.category === 'Other' ? (trainingForm.customCategory.trim() || 'Other') : trainingForm.category;
    if (!cat || !trainingForm.title.trim() || !trainingForm.dataURL) return;
    const newTrainingId = `training-${Date.now()}`;
    setTrainingItems(p => [...p, {
      id: newTrainingId,
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
                    {fileError && <p role="alert" style={{ fontFamily:INTER, fontSize:13, fontWeight:600, color:RED, margin:'0 0 10px' }}>{fileError}</p>}
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
    const knowledgeColors = { accent:BLUE, success:GREEN, warning:ORANGE, danger:RED, card:CARD, surface:CARD2, border:BORDER, text:TEXT, muted:MUTED, shadow:SHADOW };
    const trainingCategories = ['All', ...Array.from(new Set(trainingItems.map(item=>item.category).filter(Boolean)))];
    const visibleTraining = trainingItems.filter(item => (trainingFilter==='All'||item.category===trainingFilter) && (!trainingSearch.trim() || `${item.title} ${item.category} ${item.fileName||''}`.toLowerCase().includes(trainingSearch.trim().toLowerCase())));
    const deskCount = team.filter(m => m.concierge_id).length;
    const completions = trainingItems.reduce((sum, item) => sum + Math.min((item.completedBy || []).length, deskCount || Infinity), 0);
    const completionTotal = trainingItems.length * deskCount;
    return (
      <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column', gap:16 }}>
        <KnowledgeFilters search={trainingSearch} onSearch={setTrainingSearch} placeholder="Search training by topic or building system…" categories={trainingCategories} selected={trainingFilter} onSelect={setTrainingFilter} colors={knowledgeColors}/>
        <KnowledgeProgress value={completionTotal?Math.round(completions/completionTotal*100):0} detail={`${completions} of ${completionTotal} reviews completed by the desk · ${trainingItems.length} material${trainingItems.length===1?'':'s'}`} colors={knowledgeColors}/>
        {trainingItems.length===0 ? <KnowledgeEmpty icon={GraduationCap} title="No training materials yet" description="Upload documents, visual guides, or videos and assign them to the concierge team." colors={knowledgeColors}/> : visibleTraining.length===0 ? <KnowledgeEmpty icon={Search} title="No training matches this view" description="Try a broader search or choose another category." colors={knowledgeColors}/> : <div style={{ flex:1, overflowY:'auto', display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(2,minmax(0,1fr))', gap:10 }}>{visibleTraining.map(item=>{ const def=CATEGORY_DEFS.find(d=>d.id===item.category); return <KnowledgeCard key={item.id} item={{...item,assignmentCount:deskCount}} kind="training" icon={def?.Icon||HelpCircle} onOpen={setFullscreenTraining} status={deskCount>0 && (item.completedBy||[]).length>=deskCount ? 'reviewed' : 'assigned'} colors={knowledgeColors} actions={<button onClick={()=>setTrainingItems(list=>list.filter(entry=>entry.id!==item.id))} aria-label={`Remove ${item.title}`} title={(item.completedBy||[]).length ? `Reviewed by ${(item.completedBy||[]).join(', ')}` : 'Remove this material'} style={{ width:34,height:34,borderRadius:9,border:`1px solid ${BORDER}`,background:CARD2,cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center' }}><Trash2 size={14} color={MUTED}/></button>}/>})}</div>}

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
    const knowledgeColors = { accent:BLUE, success:GREEN, warning:ORANGE, danger:RED, card:CARD, surface:CARD2, border:BORDER, text:TEXT, muted:MUTED, shadow:SHADOW };
    const managerSopCategories = ['All', ...Array.from(new Set(ALL_SOPS.map(s=>s.category).filter(Boolean)))];
    const visibleSops = ALL_SOPS.filter(sop => (sopFilter==='All'||sop.category===sopFilter) && (!sopSearch.trim() || `${sop.title} ${sop.category} ${sop.fileName||''}`.toLowerCase().includes(sopSearch.trim().toLowerCase())));
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
      setEditingSopId(null);
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
                <h2 style={{ fontFamily:INTER, fontSize:'1.1rem', fontWeight:700, color:TEXT, letterSpacing:'-0.01em', margin:0 }}>{editingSopId?'Edit procedure':'Upload a Binder Document'}</h2>
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
                    {fileError && <p role="alert" style={{ fontFamily:INTER, fontSize:13, fontWeight:600, color:RED, margin:'0 0 10px' }}>{fileError}</p>}
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

          <KnowledgeFilters search={sopSearch} onSearch={setSopSearch} placeholder="Search procedures, policies, or building systems…" categories={managerSopCategories} selected={sopFilter} onSelect={setSopFilter} colors={knowledgeColors}/>

          {/* Procedures section header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <BookOpen size={20} color={BLUE} />
              <h2 style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:17, margin:0 }}>Procedures</h2>
            </div>
            <span style={{ fontSize:11, fontWeight:700, color:MUTED }}>{visibleSops.length} / {ALL_SOPS.length}</span>
          </div>

          {/* SOP accordion list */}
          <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:10, paddingBottom:24 }}>
            {visibleSops.length===0 ? <KnowledgeEmpty icon={Search} title={ALL_SOPS.length?'No procedures match this view':'No procedures yet'} description={ALL_SOPS.length?'Try a broader search or choose another category.':'Create the first approved procedure for the concierge team.'} colors={knowledgeColors}/> : visibleSops.map((sop) => {
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
                        <KnowledgeStatusBadge status={knowledgeStatus[sop.id] || 'published'} colors={knowledgeColors}/>
                      </div>
                      <div style={{ fontFamily:INTER, fontSize:16, fontWeight:700, color:TEXT, lineHeight:1.3 }}>{sop.title}</div>
                      {isUploaded && sop.fileName && (
                        <div style={{ fontFamily:INTER, fontSize:11, color:MUTED, marginTop:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sop.fileName}</div>
                      )}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                      {isUploaded&&<button onClick={e=>{e.stopPropagation();setEditingSopId(sop.id);setUploadForm({category:SOP_CATEGORIES.includes(sop.category)?sop.category:'Other',customCategory:SOP_CATEGORIES.includes(sop.category)?'':sop.category,title:sop.title,fileName:sop.fileName,fileType:sop.fileType,dataURL:sop.dataURL});setSopStep(2);setSopUploadOpen(true);}} aria-label={`Edit ${sop.title}`} style={{ width:30,height:30,borderRadius:8,border:`1px solid ${BORDER}`,background:CARD2,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}><Pencil size={14} color={MUTED}/></button>}
                      <button onClick={e => { e.stopPropagation(); setKnowledgeItemStatus(sop.id, (knowledgeStatus[sop.id]||'published')==='published'?'review':'published'); }} aria-label={(knowledgeStatus[sop.id]||'published')==='published'?'Hide from the desk (mark as in review)':'Publish to the desk'} title={(knowledgeStatus[sop.id]||'published')==='published'?'Published to the desk. Click to hide while you review it.':'Hidden from the desk. Click to publish.'} style={{ width:30,height:30,borderRadius:8,border:`1px solid ${BORDER}`,background:CARD2,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}><CheckCircle size={14} color={(knowledgeStatus[sop.id]||'published')==='published'?GREEN:ORANGE}/></button>
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
    <DashboardPage style={{ overflow:'visible' }}>
      {/* Screen-reader live region */}
      <div role="status" aria-live="polite" aria-atomic="true" style={{ position:'absolute', width:1, height:1, margin:-1, padding:0, overflow:'hidden', clip:'rect(0,0,0,0)', whiteSpace:'nowrap', border:0 }}>
        {srAnnounce}
      </div>

      {/* ── Full-width desktop header ─────────────────────────────────────────── */}
      {false && (
        <header style={{ height:72, background:CARD, borderBottom:`1px solid ${BORDER}`, display:'flex', alignItems:'center', padding:'0 24px', flexShrink:0, gap:16, zIndex:20, boxShadow:'0 2px 10px rgba(0,0,0,0.03)' }}>
          <button onClick={() => setSidebarCollapsed(c => !c)} aria-label={sidebarCollapsed ? 'Expand workspace navigation' : 'Collapse workspace navigation'} style={{ width:40, height:40, borderRadius:12, border:`1px solid ${BORDER}`, background:CARD, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
            <Menu size={18} color={TEXT} />
          </button>
          <button onClick={() => setTab('home')} style={{ display:'flex', alignItems:'center', gap:10, minWidth:0, border:'none', padding:0, background:'transparent', cursor:'pointer', textAlign:'left', flexShrink:0 }}>
            <div style={{ width:36, height:36, borderRadius:11, background:DASHBOARD_ACTIVE_NAV, display:'flex', alignItems:'center', justifyContent:'center' }}><Building2 size={17} color="white" /></div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:BLUE, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:2 }}>Noted workspace</div>
              <div style={{ fontFamily:INTER, fontSize:14, fontWeight:750, color:TEXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:210 }}>{propertyName}</div>
            </div>
          </button>

          <div style={{ flex:1, maxWidth:640, position:'relative', margin:'0 auto' }}>
            <Search size={14} color="#717171" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
            <input
              ref={searchInputRef}
              aria-label="Search residents, tasks, shifts, incidents"
              placeholder="Search residents, tasks, incidents, units…"
              value={gsQuery}
              onChange={e => { setGsQuery(e.target.value); if (!gsOpen) openGlobalSearch(); }}
              onFocus={openGlobalSearch}
              style={{ width:'100%', height:44, background:CARD2, border:`1px solid ${BORDER}`, borderRadius:12, paddingLeft:38, paddingRight: gsQuery ? 30 : 14, fontFamily:INTER, fontSize:13, color:TEXT, outline:'none', boxSizing:'border-box' }}
            />
            {gsQuery && (
              <button onClick={() => setGsQuery('')}
                style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:2, display:'flex', alignItems:'center' }}>
                <X size={13} color="#717171" />
              </button>
            )}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, border:`1px solid ${BORDER}`, background:CARD2, borderRadius:999, padding:'7px 11px' }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:GREEN, boxShadow:'0 0 0 3px rgba(52,199,89,.12)' }} />
              <span style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:TEXT }}>Operations live</span>
            </div>
            <button aria-label={`View incidents, ${openIncidents.length} open`} title="Incidents" onClick={() => setTab('incidents')} style={{ position:'relative', width:40, height:40, borderRadius:12, border:`1px solid ${BORDER}`, background:CARD, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><Bell size={17} color={TEXT} />{openIncidents.length > 0 && <span aria-label={`${openIncidents.length} open incidents`} style={{ position:'absolute', top:7, right:7, width:7, height:7, borderRadius:'50%', background:RED }} />}</button>
          <button
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{ flexShrink:0, width:40, height:40, borderRadius:12, background:CARD, border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'background 150ms' }}
            onMouseEnter={e => e.currentTarget.style.background=CARD2}
            onMouseLeave={e => e.currentTarget.style.background=CARD}
          >
            {isDarkMode
              ? <Sun size={17} color="#D18A00" />
              : <Moon size={17} color={MUTED} />}
          </button>
          </div>
        </header>
      )}

      {/* ── Global Search DAR Overlay ──────────────────────────────────────────── */}
      {gsOpen && !isMobile && (() => {
        const { dayMap, total } = getGsDar();
        const days = Object.keys(dayMap);
        const CHIP = (active, onClick, label) => (
          <button onClick={onClick} style={{ padding:'5px 12px', borderRadius:7, border:`1px solid ${active ? BLUE : 'rgba(255,255,255,0.15)'}`, background: active ? BLUE : 'rgba(255,255,255,0.08)', fontFamily:INTER, fontSize:12, fontWeight: active ? 700 : 400, color: active ? 'white' : 'rgba(255,255,255,0.70)', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
            {label}
          </button>
        );
        return (
          <div style={{ position:'relative', zIndex:400 }}>
            {/* Backdrop */}
            <div onClick={() => setGsOpen(false)} style={{ position:'fixed', inset:0, top:52, background:'rgba(0,0,0,0.45)', zIndex:390 }} />
            {/* Panel */}
            <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', width:'min(780px, calc(100vw - 40px))', background:CARD, border:`1px solid ${BORDER}`, borderRadius:'0 0 18px 18px', boxShadow:'0 12px 48px rgba(0,0,0,0.18)', zIndex:400, maxHeight:'calc(100vh - 80px)', display:'flex', flexDirection:'column' }}>

              {/* ── Controls bar ── */}
              <div style={{ background:'#0b0b0b', padding:'12px 18px', display:'flex', flexDirection:'column', gap:10, borderRadius:'0 0 0 0' }}>
                {/* Date range row */}
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em', textTransform:'uppercase', marginRight:4, flexShrink:0 }}>Date</span>
                  {GS_RANGES.map(r => CHIP(gsRange === r.id, () => setGsRange(r.id), r.label))}
                </div>
                {/* Custom date inputs */}
                {gsRange === 'custom' && (
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <input type="date" value={gsDateFrom} onChange={e => setGsDateFrom(e.target.value)}
                      style={{ padding:'6px 10px', borderRadius:7, border:'1px solid rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.08)', fontFamily:INTER, fontSize:12, color:'white', outline:'none' }} />
                    <span style={{ color:'rgba(255,255,255,0.4)', fontFamily:INTER, fontSize:12 }}>to</span>
                    <input type="date" value={gsDateTo} onChange={e => setGsDateTo(e.target.value)}
                      style={{ padding:'6px 10px', borderRadius:7, border:'1px solid rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.08)', fontFamily:INTER, fontSize:12, color:'white', outline:'none' }} />
                  </div>
                )}
                {/* Section row */}
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em', textTransform:'uppercase', marginRight:4, flexShrink:0 }}>Section</span>
                  {GS_SECTIONS.map(s => CHIP(gsSection === s.id, () => setGsSection(s.id), s.label))}
                </div>
              </div>

              {/* ── Results ── */}
              <div style={{ overflowY:'auto', flex:1, padding:'0 18px 18px' }}>
                {/* Summary row */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0 8px' }}>
                  <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:0 }}>
                    {gsLoading ? 'Loading…' : `${total} entr${total === 1 ? 'y' : 'ies'}${gsQuery ? ` matching "${gsQuery}"` : ''}`}
                  </p>
                  <button onClick={() => setGsOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:INTER, fontSize:13, color:MUTED, padding:'4px 8px' }}>✕ Close</button>
                </div>

                {gsLoading ? (
                  <div style={{ textAlign:'center', padding:'40px 0', fontFamily:INTER, fontSize:14, color:MUTED }}>Loading activity log…</div>
                ) : days.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'48px 0' }}>
                    <Search size={28} color={MUTED} strokeWidth={1.5} style={{ marginBottom:12 }} />
                    <p style={{ fontFamily:INTER, fontSize:15, fontWeight:700, color:TEXT, margin:'0 0 6px' }}>No activity found</p>
                    <p style={{ fontFamily:INTER, fontSize:13, color:MUTED, margin:0 }}>Try a different date range, section, or search term.</p>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                    {days.map(day => (
                      <div key={day}>
                        {/* Day header */}
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                          <div style={{ height:1, flex:1, background:BORDER }} />
                          <span style={{ fontFamily:INTER, fontSize:12, fontWeight:700, color:MUTED, whiteSpace:'nowrap' }}>{day}</span>
                          <div style={{ height:1, flex:1, background:BORDER }} />
                        </div>
                        {/* Sections within the day */}
                        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                          {Object.entries(dayMap[day]).map(([sec, entries]) => (
                            <div key={sec} style={{ background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14, overflow:'hidden' }}>
                              {/* Section header */}
                              <div style={{ padding:'10px 14px', borderBottom:`1px solid ${BORDER}`, display:'flex', alignItems:'center', gap:8 }}>
                                <span style={{ fontFamily:INTER, fontSize:12, fontWeight:800, color:TEXT, textTransform:'uppercase', letterSpacing:'0.08em' }}>{SEC_LABELS[sec] || sec}s</span>
                                <span style={{ fontFamily:INTER, fontSize:11, color:MUTED, background:CARD, border:`1px solid ${BORDER}`, borderRadius:5, padding:'1px 7px' }}>{entries.length}</span>
                              </div>
                              {/* Entries */}
                              {entries.map((log, i) => {
                                const actColor = ACTION_COLORS[log.action] || MUTED;
                                const actLabel = ACTION_LABELS[log.action] || log.action;
                                const ts = log.created_at ? new Date(log.created_at).toLocaleString('en-US', { hour:'numeric', minute:'2-digit' }) : '';
                                const details = Object.entries(log.detail || {});
                                return (
                                  <div key={log.log_id || i} style={{ padding:'10px 14px', borderTop: i === 0 ? 'none' : `1px solid ${BORDER}`, display:'flex', gap:12, alignItems:'flex-start' }}>
                                    {/* Time */}
                                    <span style={{ fontFamily:INTER, fontSize:11, color:MUTED, whiteSpace:'nowrap', flexShrink:0, marginTop:2, minWidth:60 }}>{ts}</span>
                                    {/* Action badge */}
                                    <span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:actColor, background:`${actColor}15`, borderRadius:5, padding:'2px 7px', textTransform:'uppercase', letterSpacing:'0.06em', flexShrink:0, marginTop:1 }}>{actLabel}</span>
                                    {/* Details */}
                                    <div style={{ flex:1, minWidth:0 }}>
                                      {details.map(([k,v]) => (
                                        <span key={k} style={{ fontFamily:INTER, fontSize:13, color:TEXT, marginRight:10 }}>
                                          <span style={{ color:MUTED, fontSize:11 }}>{k.replace(/_/g,' ')}: </span>
                                          <span style={{ fontWeight:600 }}>{String(v)}</span>
                                        </span>
                                      ))}
                                      {details.length === 0 && <span style={{ fontFamily:INTER, fontSize:12, color:MUTED, fontStyle:'italic' }}>No detail</span>}
                                    </div>
                                    {/* Who */}
                                    <span style={{ fontFamily:INTER, fontSize:11, color:MUTED, flexShrink:0 }}>{log.user_type === 'manager' ? 'Manager' : 'Concierge'}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Body row: sidebar + content ───────────────────────────────────────── */}
      <div style={{ display:'flex', flex:1, minHeight:0 }}>

      <DashboardSidebar
        ariaLabel="Manager workspace"
        eyebrow="Manager desk"
        title="Property operations"
        groups={MANAGER_NAV_GROUPS}
        activeId={tab}
        onSelect={({ id, action }) => {
          if (action === 'task') openTask();
          else if (action === 'emergency') setConOpen(true);
          else if (action === 'assistant') setAssistantOpen(true);
          else setTab(id);
        }}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        drawerOpen={sidebarOpen}
        onDrawerOpenChange={setSidebarOpen}
        isMobile={isMobile}
        user={{ name:authUser?.name || 'Property manager', email:authUser?.email || '' }}
        profileStatus="Property manager"
        onProfile={() => setProfileOpen(true)}
        colors={{ CARD, BORDER, TEXT, MUTED, NAV_SURFACE:CARD, isDarkMode }}
        badges={{ incidents:openIncidents.length }}
      />

      {/* ── DESKTOP SIDEBAR — persistent, always visible ≥768px ──────────────── */}
      {false && !isMobile && (
        <aside aria-label="Workspace navigation" style={{ width: sidebarCollapsed ? DASHBOARD_SIDEBAR_COLLAPSED : DASHBOARD_SIDEBAR_EXPANDED, minWidth: sidebarCollapsed ? DASHBOARD_SIDEBAR_COLLAPSED : DASHBOARD_SIDEBAR_EXPANDED, flexShrink:0, background:BG, borderRight:`1px solid ${BORDER}`, padding:12, display:'flex', flexDirection:'column', overflow:'hidden', zIndex:10, height:'100%', transition:'width 220ms ease, min-width 220ms ease' }}>
          <nav style={{ padding: sidebarCollapsed ? '8px 6px' : '12px 8px', overflowY:'auto', overflowX:'hidden', flex:1, minHeight:0, background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, boxShadow:'0 2px 8px rgba(0,0,0,.035)' }}>
            {!sidebarCollapsed && <div style={{ padding:'4px 10px 13px' }}><div style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:BLUE, letterSpacing:'.2em', textTransform:'uppercase' }}>Workspace</div><div style={{ fontFamily:INTER, fontSize:18, fontWeight:800, color:TEXT, letterSpacing:'-.03em', marginTop:5 }}>Operations</div></div>}
            {NAV.map(({ id, Icon:NavIcon, label, action }) => {
              const active = !action && tab === id;
              const handleClick = () => {
                if (sidebarCollapsed) setSidebarCollapsed(false);
                if (action === 'task')           openTask();
                else if (action === 'leasing')   setLeasingOpen(true);
                else if (action === 'emergency') setConOpen(true);
                else setTab(id);
              };
              return (
                <button key={id} onClick={handleClick} title={sidebarCollapsed ? label : undefined}
                  className={`nav-btn touch-target${active ? ' nav-btn--active' : ''}`}
                  style={{ display:'flex', alignItems:'center', gap: sidebarCollapsed ? 0 : 12, justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: sidebarCollapsed ? '9px 0' : '9px 10px', marginBottom:3, border:'none', cursor:'pointer', textAlign:'left', background:active?(isDarkMode?'rgba(255,255,255,0.10)':DASHBOARD_ACTIVE_NAV):'transparent', borderRadius:12, width:'100%', position:'relative', transition:'background 150ms, transform 150ms', minHeight:44 }}>
                  <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:active?'rgba(255,255,255,0.14)':CARD2, display:'flex', alignItems:'center', justifyContent:'center', transition:'background 150ms', position:'relative' }}>
                    <NavIcon size={18} color={active?'#FFFFFF':MUTED} strokeWidth={active?2.2:1.6} />
                    {id==='home' && incidents.length>0 && sidebarCollapsed && (
                      <div style={{ position:'absolute', top:2, right:2, width:14, height:14, borderRadius:'50%', background:RED, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontFamily:INTER, fontSize:7, fontWeight:800, color:'white' }}>{incidents.length}</span>
                      </div>
                    )}
                  </div>
                  {!sidebarCollapsed && <span style={{ fontFamily:INTER, fontSize:15, fontWeight:active?700:500, color:active?'#FFFFFF':MUTED, flex:1, letterSpacing:active?'-0.01em':'normal', overflow:'hidden', whiteSpace:'nowrap' }}>{label}</span>}
                  {!sidebarCollapsed && id==='home' && incidents.length>0 && (
                    <div style={{ width:18, height:18, borderRadius:'50%', background:RED, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontFamily:INTER, fontSize:9, fontWeight:800, color:'white' }}>{incidents.length}</span>
                    </div>
                  )}
                  {!sidebarCollapsed && id==='home' && (
                    <button onClick={(e) => { e.stopPropagation(); setSidebarCollapsed(true); }}
                      aria-label="Collapse sidebar"
                      style={{ width:28, height:28, borderRadius:7, border:'none', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                      <X size={16} color={active ? 'rgba(255,255,255,0.7)' : MUTED} />
                    </button>
                  )}
                  {!sidebarCollapsed && id!=='home' && active && <div style={{ width:6, height:6, borderRadius:'50%', background:BLUE, flexShrink:0 }} />}
                </button>
              );
            })}
          </nav>
          <div style={{ flexShrink:0, padding: sidebarCollapsed ? '12px 0 0' : '12px 8px 0', display:'flex', alignItems:'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
            {!sidebarCollapsed && <span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:MUTED, letterSpacing:'0.18em', textTransform:'uppercase' }}>Noted · Operations desk</span>}
          </div>
        </aside>
      )}

      {/* ── MOBILE DRAWER — overlay, <768px ──────────────────────────────────── */}
      {false && isMobile && (
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
                  style={{ position:'fixed', left:0, top:0, bottom:0, width:248, background:CARD, borderRight:`1px solid ${BORDER}`, display:'flex', flexDirection:'column', overflow:'hidden', zIndex:55 }}>
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
                  <nav style={{ padding:'8px 8px 4px', overflowY:'auto', flex:1, minHeight:0 }}>
                    {NAV.map(({ id, Icon:NavIcon, label, action }) => {
                      const active = !action && tab === id;
                      const handleClick = () => {
                        setSidebarOpen(false);
                        if (action === 'task')           openTask();
                        else if (action === 'leasing')   setLeasingOpen(true);
                        else if (action === 'emergency') setConOpen(true);
                        else setTab(id);
                      };
                      return (
                        <button key={id} onClick={handleClick}
                          className={`nav-btn touch-target${active ? ' nav-btn--active' : ''}`}
                          style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 12px', marginBottom:2, border:'none', cursor:'pointer', textAlign:'left', background:active?(isDarkMode?'rgba(255,255,255,0.10)':DASHBOARD_ACTIVE_NAV):'transparent', borderRadius:12, width:'100%', position:'relative', transition:'background 120ms', minHeight:44 }}>
                          <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:active?'rgba(255,255,255,0.14)':CARD2, display:'flex', alignItems:'center', justifyContent:'center', transition:'background 120ms' }}>
                            <NavIcon size={18} color={active?'#FFFFFF':MUTED} strokeWidth={active?2.2:1.6} />
                          </div>
                          <span style={{ fontFamily:INTER, fontSize:15, fontWeight:active?700:500, color:active?'#FFFFFF':MUTED, flex:1, letterSpacing:active?'-0.01em':'normal' }}>{label}</span>
                          {active && <div style={{ width:6, height:6, borderRadius:'50%', background:BLUE, flexShrink:0 }} />}
                        </button>
                      );
                    })}
                  </nav>
                  {/* Bottom branding */}
                  <div style={{ flexShrink:0, padding:'20px 20px 0', paddingBottom:'max(24px, env(safe-area-inset-bottom))', display:'flex', alignItems:'center' }}>
                    <span style={{ fontFamily:INTER, fontSize:10, fontWeight:800, color:MUTED, letterSpacing:'0.24em', textTransform:'uppercase' }}>Noted</span>
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
        <div style={{ flex:1, overflowY:'auto', padding: isMobile ? '12px 16px 48px' : '20px 28px 48px' }}>
          {renderManagerOverview()}
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
              style={{ position:'fixed', top:0, bottom:0, right:0, background:BG, zIndex:66, display:'flex', flexDirection:'column', borderRadius:0, borderLeft:`1px solid ${BORDER}`, overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.18)', ...(isPhone ? {left:0,borderLeft:'none'} : tab==='shifts' ? { left: isMobile?0:(sidebarCollapsed?64:248) } : isMobile ? {left:0,borderLeft:'none'} : {width:Math.min(720, window.innerWidth-280)}) }}>

              {/* Panel header — editorial drawer */}
              <div style={{ background:BG, borderBottom:`1px solid ${BORDER}`, padding: isMobile ? '22px 20px 18px' : '30px 32px 24px', flexShrink:0, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontFamily:INTER, fontSize:12, fontWeight:800, color:BLUE, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:12 }}>{propertyName}</div>
                  <h2 style={{ fontFamily:INTER, fontSize: isMobile ? 32 : 42, fontWeight:800, color:TEXT, margin:0, letterSpacing:'-0.045em', lineHeight:0.95 }}>
                    {{ shifts:'Shift Calendar', tasks:'Tasks', incidents:'Incidents', team:'Team', residents:'Residents Directory', analytics:'Analytics', scheduled:'Planned Tasks', more:'Building SOPs', training:'Training', sections:'Shift Sections', settings:'Settings', messages:'Messages' }[tab]}
                  </h2>
                  <p style={{ fontFamily:INTER, fontSize:15, color:MUTED, margin:'10px 0 0', lineHeight:1.5 }}>
                    {{ incidents:'Reports filed by the front desk, for your review', messages:'One thread for the manager and the front desk', shifts:'Browse shift history and daily activity reports', tasks:'Assign, track, and verify shift tasks', team:'Concierge accounts and property access', residents:'Every resident and unit at a glance', analytics:'Performance across shifts, tasks, and incidents', scheduled:'Tasks planned ahead for each team member', more:'Standard operating procedures for the desk', training:'Onboarding guides and desk reference', sections:'Configure the concierge shift checklist', settings:'Property, account, and appearance' }[tab]}
                  </p>
                </div>
                <button onClick={() => setTab('home')} aria-label="Close panel" data-testid="panel-close-btn"
                  style={{ width:44, height:44, borderRadius:999, border:`1px solid ${BORDER}`, background:BG, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                  <X size={19} color={TEXT} />
                </button>
              </div>

              {/* Panel content */}
              <div style={{ flex:1, overflowY:'auto', padding: tab === 'settings' ? 0 : (isMobile ? '16px 16px 48px' : '28px 32px 48px') }}>
                {knowledgeError && (tab==='more' || tab==='training') && <div role="alert" style={{ marginBottom:16, padding:'12px 16px', borderRadius:12, border:`1px solid ${RED}40`, background:`${RED}0d`, fontFamily:INTER, fontSize:13, color:TEXT, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}><span>{knowledgeError}</span><button type="button" onClick={clearKnowledgeError} aria-label="Dismiss" style={{ border:0, background:'transparent', cursor:'pointer', display:'inline-flex' }}><X size={16} color={MUTED}/></button></div>}
                {tab==='shifts'    && renderShifts()}
                {tab==='tasks'     && renderTasks()}
                {tab==='incidents' && renderIncidents()}
                {tab==='team'      && renderTeam()}
                {tab==='residents' && renderResidents()}
                {tab==='analytics' && renderAnalytics()}
                {tab==='scheduled' && <PlannedTasksPage team={team} isMobile={isMobile} />}
                {tab==='more'      && renderMore()}
                {tab==='training'  && renderTraining()}
                {tab==='sections'  && renderConciergeSetup()}
                {tab==='settings'  && renderSettings()}
                {tab==='messages'  && <TeamMessagesPage user={authUser} isPhone={isPhone} />}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Assistant ────────────────────────────────────────────────────────── */}
      <NotedAssistant isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} role="manager" user={authUser} propertyName={propertyName} isPhone={isPhone}
        requests={tasks} incidents={incidents}
        team={team.map(c => ({ ...c, onShift: c.status === 'on_shift' }))}
        actions={{
          createRequest: async (form) => { const saved = await authApi.createTask(form); setTasks(p => [saved, ...p]); },
          open: (place) => { if (place === 'contacts') setConOpen(true); else setTab(place); },
        }} />

      {/* ── Confirm delete of a team member / pending invite ── */}
      {removeTarget && (
        <div role="dialog" aria-modal="true" aria-labelledby="remove-member-title"
          onClick={() => { if (!removeLoading) setRemoveTarget(null); }}
          onKeyDown={e => { if (e.key === 'Escape' && !removeLoading) setRemoveTarget(null); }}
          style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.45)', display:'grid', placeItems:'center', padding:20, fontFamily:INTER }}>
          <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:400, background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:24, boxShadow:'0 24px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ width:48, height:48, borderRadius:14, background:`${RED}12`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
              <Trash2 size={22} color={RED} />
            </div>
            <h2 id="remove-member-title" style={{ fontSize:18, fontWeight:800, color:TEXT, margin:'0 0 8px' }}>
              {removeTarget.status === 'invited' ? `Delete the invite for ${removeTarget.name}?` : `Remove ${removeTarget.name} from your team?`}
            </h2>
            <p style={{ fontSize:14, lineHeight:1.6, color:MUTED, margin:'0 0 6px' }}>
              {removeTarget.status === 'invited'
                ? 'The invitation link in their email will stop working.'
                : 'Their account will be deleted and they will be signed out right away. This cannot be undone.'}
            </p>
            <p style={{ fontSize:14, lineHeight:1.6, color:MUTED, margin:0 }}>
              You can invite {removeTarget.email || 'this email'} again at any time.
            </p>
            {removeError && <p role="alert" style={{ fontSize:13, fontWeight:600, color:RED, margin:'12px 0 0' }}>{removeError}</p>}
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button type="button" autoFocus disabled={removeLoading} onClick={() => setRemoveTarget(null)}
                style={{ flex:1, padding:'12px 16px', background:CARD2, border:`1px solid ${BORDER}`, borderRadius:12, cursor:'pointer', fontFamily:INTER, fontSize:14, fontWeight:700, color:TEXT }}>
                Cancel
              </button>
              <button type="button" disabled={removeLoading} onClick={confirmRemove}
                style={{ flex:1, padding:'12px 16px', background:RED, border:'none', borderRadius:12, cursor:removeLoading?'default':'pointer', opacity:removeLoading?0.7:1, fontFamily:INTER, fontSize:14, fontWeight:700, color:'white' }}>
                {removeLoading ? 'Deleting...' : (removeTarget.status === 'invited' ? 'Delete invite' : 'Remove')}
              </button>
            </div>
          </div>
        </div>
      )}

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
            style={{ position:'fixed', top:0, bottom:0, right:0, ...(isPhone || isMobile ? {left:0} : {width:Math.min(720, window.innerWidth-280), borderLeft:`1px solid ${BORDER}`}), zIndex:68, background:BG, borderRadius:0, boxShadow:'0 24px 64px rgba(0,0,0,0.18)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

            <div style={{ padding: isMobile ? '22px 20px 16px' : '30px 32px 20px', borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:16 }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontFamily:INTER, fontSize:12, fontWeight:800, color:BLUE, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:12 }}>{propertyName}</div>
                  <div style={{ fontFamily:INTER, fontSize: isMobile ? 32 : 42, fontWeight:800, color:TEXT, letterSpacing:'-0.045em', lineHeight:0.95 }}>Assign Task</div>
                  <div style={{ fontFamily:INTER, fontSize:15, color:MUTED, margin:'10px 0 0', lineHeight:1.5 }}>Step {taskStep} of 2 · Dispatch a task to the desk</div>
                </div>
                <button onClick={closeTask} aria-label="Close" data-testid="task-modal-close" style={{ width:44, height:44, borderRadius:999, border:`1px solid ${BORDER}`, background:BG, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                  <X size={19} color={TEXT} />
                </button>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {[1,2].map(s => <div key={s} style={{ flex:1, height:4, borderRadius:999, background:s<=taskStep?RED:'rgba(0,0,0,0.10)', transition:'background 200ms' }} />)}
              </div>
            </div>

            <div style={{ flex:1, overflowY:'auto', padding: isMobile ? '20px 20px 40px' : '28px 32px 48px' }}>
              {taskStep === 1 ? (
                <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
                  <h3 style={{ fontFamily:INTER, fontSize:'1.2rem', fontWeight:700, color:TEXT, letterSpacing:'-0.01em', margin:0 }}>What needs to be done?</h3>

                  <div>
                    <label style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, display:'block', marginBottom:10 }}>Task Title *</label>
                    <div style={{ position:'relative' }}>
                      <input data-autofocus="true" aria-required="true" aria-invalid={!taskForm.title.trim()} aria-describedby="task-title-help" type="text" placeholder="e.g. Close rooftop pool at 10 PM" value={taskForm.title + (taskTitleInterim ? (taskForm.title ? ' ' : '') + taskTitleInterim : '')}
                        onChange={e=>setTaskForm(p=>({...p,title:e.target.value}))}
                        style={{ width:'100%', padding:'14px 44px 14px 16px', borderRadius:12, border:taskForm.title?`1.5px solid ${BLUE}`:`1.5px solid ${BORDER}`, fontFamily:INTER, fontSize:16, color:TEXT, background:CARD2, outline:'none', boxSizing:'border-box' }} />
                      <MicButton onTranscript={t=>setTaskForm(p=>({...p,title:p.title?p.title+' '+t:t}))} onInterim={setTaskTitleInterim} />
                    </div>
                    <p id="task-title-help" style={{fontFamily:INTER,fontSize:12,color:taskForm.title.trim()?MUTED:ORANGE,margin:'7px 0 0'}}>{taskForm.title.trim()?'Keep it specific and action-oriented.':'A task title is required to continue.'}</p>
                  </div>

                  <div>
                    <label style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, display:'block', marginBottom:10 }}>Notes (Optional)</label>
                    <div style={{ position:'relative' }}>
                      <textarea placeholder="Details or context…" value={taskForm.notes + (taskNotesInterim ? (taskForm.notes ? ' ' : '') + taskNotesInterim : '')} rows={4}
                        onChange={e=>setTaskForm(p=>({...p,notes:e.target.value}))}
                        style={{ width:'100%', padding:'14px 44px 14px 16px', borderRadius:12, border:taskForm.notes?`1.5px solid ${BLUE}`:`1.5px solid ${BORDER}`, fontFamily:INTER, fontSize:16, color:TEXT, background:CARD2, outline:'none', resize:'none', boxSizing:'border-box', lineHeight:1.5 }} />
                      <MicButton onTranscript={t=>setTaskForm(p=>({...p,notes:p.notes?p.notes+' '+t:t}))} onInterim={setTaskNotesInterim} />
                    </div>
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
                            style={{ padding:14, borderRadius:14, textAlign:'left', display:'flex', alignItems:'center', gap:13, cursor:'pointer', border:`1px solid ${sel?BLUE:BORDER}`, background:sel?'rgba(255,56,92,0.05)':CARD }}>
                            <div style={{ width:40, height:40, borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:sel?'rgba(255,56,92,0.10)':CARD2 }}>
                              <DTIcon size={18} color={sel?BLUE:MUTED} />
                            </div>
                            <div style={{ flex:1 }}>
                              <p style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:14, margin:'0 0 2px' }}>{dt}</p>
                              <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:0 }}>{desc}</p>
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
                    <div role="radiogroup" aria-label="Assignee" style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {team.filter(c=>c.status!=='invited').map(c => {
                        const sel = taskForm.toId === c.id;
                        const onShift = c.status === 'on_shift';
                        return (
                          <button role="radio" aria-checked={sel} key={c.id} onClick={()=>setTaskForm(p=>({...p,assignedTo:`${c.name.split(' ')[0]} ${c.name.split(' ')[1]?.[0]}.`,toId:c.id}))}
                            style={{ display:'flex', alignItems:'center', gap:13, padding:14, background:sel?'rgba(255,56,92,0.05)':CARD, border:`1px solid ${sel?BLUE:BORDER}`, borderRadius:14, cursor:'pointer', textAlign:'left' }}>
                            <div style={{ width:42, height:42, borderRadius:12, background:onShift?'rgba(52,199,89,0.12)':CARD2, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <span style={{ fontFamily:INTER, fontSize:14, fontWeight:800, color:onShift?GREEN:TEXT }}>{c.init}</span>
                            </div>
                            <div style={{ flex:1 }}>
                              <p style={{ fontFamily:INTER, fontWeight:700, color:TEXT, fontSize:14, margin:'0 0 2px' }}>{c.name}</p>
                              <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:0 }}>{c.title}{onShift?' · On shift now':c.lastShift?` · Last: ${c.lastShift}`:''}</p>
                            </div>
                            {sel && <div style={{ width:24, height:24, borderRadius:'50%', background:BLUE, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Check size={12} color="white" strokeWidth={3} /></div>}
                          </button>
                        );
                      })}
                      {team.filter(c=>c.status!=='invited').length===0&&<div style={{padding:16,border:`1px solid ${BORDER}`,borderRadius:12,color:MUTED,fontSize:13}}>No active concierges are available. Add a team member before assigning this task.</div>}
                    </div>
                    {!taskForm.toId&&<p style={{fontFamily:INTER,fontSize:12,color:ORANGE,margin:'7px 0 0'}}>Choose an assignee before dispatching.</p>}
                  </div>

                  <div>
                    <label style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT, display:'block', marginBottom:12 }}>Category</label>
                    <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:10 }}>
                      {TASK_CATS.map(({ id:cid, Icon:CIcon, desc }) => {
                        const sel = taskForm.category === cid;
                        return (
                          <button key={cid} onClick={()=>setTaskForm(p=>({...p,category:p.category===cid?'':cid}))}
                            style={{ display:'flex', alignItems:'center', gap:11, padding:12, background:sel?'rgba(255,56,92,0.05)':CARD, border:`1px solid ${sel?BLUE:BORDER}`, borderRadius:12, cursor:'pointer', textAlign:'left' }}>
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

            <div style={{ flexShrink:0, padding: isMobile ? '12px 20px 20px' : '16px 32px 24px', background:CARD, borderTop:`1px solid ${BORDER}` }}>
              {taskSubmitError&&<div role="alert" style={{marginBottom:12,padding:'10px 12px',borderRadius:10,background:`${RED}10`,border:`1px solid ${RED}30`,fontSize:13,color:RED}}>{taskSubmitError}</div>}
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
                  : <button onClick={submitTask} disabled={!taskForm.toId||taskLoading}
                      style={{ flex:1, padding:'16px 0', background:!taskForm.toId?CARD2:BLUE, border:!taskForm.toId?`1px solid ${BORDER}`:'none', borderRadius:14, fontFamily:INTER, fontSize:16, fontWeight:700, color:!taskForm.toId?MUTED:'white', cursor:!taskForm.toId||taskLoading?'not-allowed':'pointer', opacity:taskLoading ? .72 : 1 }}>
                      {taskLoading?'Dispatching…':'Dispatch Task'}
                    </button>
                }
              </div>
            </div>
          </motion.div>
        )}

        {/* Emergency Contacts slide-in */}
        {conOpen && (
          <motion.div key="con-panel" ref={contactsPanelRef} role="dialog" aria-modal="true" aria-labelledby="emergency-contacts-title"
            initial={{ x: '110%' }} animate={{ x: 0 }} exit={{ x: '110%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            style={{ position: 'fixed', top:0, bottom:0, right:0, ...(isPhone || isMobile ? {left:0} : {width:Math.min(720, window.innerWidth-280), borderLeft:`1px solid ${BORDER}`}), background: BG, zIndex: 68, display: 'flex', flexDirection: 'column', borderRadius: 0, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>

            {/* Header */}
            <div style={{ padding: isMobile ? '22px 20px 18px' : '30px 32px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap:16, borderBottom: `1px solid ${BORDER}`, background: BG, flexShrink: 0 }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily: INTER, fontSize: 12, fontWeight: 800, color: BLUE, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>{propertyName}</div>
                <h2 id="emergency-contacts-title" style={{ fontFamily: INTER, fontSize: isMobile ? 32 : 42, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: '-0.045em', lineHeight:0.95 }}>Emergency Contacts</h2>
                <p style={{ fontFamily: INTER, fontSize: 15, color: MUTED, margin: '10px 0 0', lineHeight:1.5 }}>Building contact directory for the desk</p>
              </div>
              <button onClick={() => { setConOpen(false); setShowAddContact(false); }} aria-label="Close emergency contacts"
                style={{ width: 44, height: 44, borderRadius: 999, border: `1px solid ${BORDER}`, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <X size={19} color={TEXT} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 20px 40px' : '28px 32px 48px', display: 'flex', flexDirection: 'column', gap: 28 }}>

              {/* CTA — full-width incident-style */}
              <button type="button" aria-expanded={showAddContact} onClick={() => { setNewContactDraft({ label:'', number:'' }); setShowAddContact(s => !s); }}
                style={{ width: '100%', minHeight:64, padding:isPhone?16:20, background:CARD, borderRadius: 16, border:`1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap:12, cursor: 'pointer', boxShadow:SHADOW, textAlign:'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, background:`${BLUE}12`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink:0 }}>
                    <Plus size={21} color={BLUE} />
                  </div>
                  <div>
                    <p style={{ fontFamily: INTER, fontSize: '1rem', fontWeight: 700, color:TEXT, letterSpacing: '-0.01em', margin: 0 }}>Add contact</p>
                    <p style={{ fontSize: 13, color:MUTED, margin:'3px 0 0' }}>Add a trusted building contact</p>
                  </div>
                </div>
                <ChevronRight size={20} color={MUTED} style={{transform:showAddContact?'rotate(90deg)':'none'}} />
              </button>

              {/* Inline add form — drops in below CTA */}
              {showAddContact && (() => {
                const canAdd = !!newContactDraft.label.trim() && !!newContactDraft.number.trim();
                return (
                  <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
                    {/* Form header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,59,48,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Phone size={18} color={RED} />
                        </div>
                        <p style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>New Emergency Contact</p>
                      </div>
                      <button onClick={() => { setShowAddContact(false); setNewContactDraft({ label:'', number:'' }); }}
                        style={{ width: 32, height: 32, borderRadius: 8, background: CARD2, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={14} color={MUTED} />
                      </button>
                    </div>
                    {/* Inputs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                      <label htmlFor="contact-label" style={{fontSize:13,fontWeight:700,color:TEXT}}>Name or role</label>
                      <input id="contact-label"
                        value={newContactDraft.label}
                        onChange={e => setNewContactDraft(d => ({ ...d, label: e.target.value }))}
                        placeholder="Name or role  e.g. Night Security"
                        style={{ width: '100%', padding: '14px 16px', background: CARD2, borderRadius: 12, border: newContactDraft.label ? `1.5px solid ${RED}` : `1.5px solid ${BORDER}`, color: TEXT, outline: 'none', fontSize: 16, fontFamily: INTER, boxSizing: 'border-box' }}
                      />
                      <label htmlFor="contact-number" style={{fontSize:13,fontWeight:700,color:TEXT}}>Phone number</label>
                      <input id="contact-number" type="tel"
                        value={newContactDraft.number}
                        onChange={e => setNewContactDraft(d => ({ ...d, number: e.target.value }))}
                        placeholder="Phone number  e.g. (215) 555-0199"
                        style={{ width: '100%', padding: '14px 16px', background: CARD2, borderRadius: 12, border: newContactDraft.number ? `1.5px solid ${RED}` : `1.5px solid ${BORDER}`, color: TEXT, outline: 'none', fontSize: 16, fontFamily: INTER, boxSizing: 'border-box' }}
                      />
                    </div>
                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => { setShowAddContact(false); setNewContactDraft({ label:'', number:'' }); }}
                        style={{ flex: 1, padding: '13px 0', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 12, fontFamily: INTER, fontSize: 14, fontWeight: 600, color: TEXT, cursor: 'pointer' }}>
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (!canAdd) return;
                          authApi.addContact(newContactDraft.label.trim(), newContactDraft.number.trim())
                            .then(saved => { setCustomContacts(prev => [...prev, saved]); setNewContactDraft({ label:'', number:'' }); setShowAddContact(false); })
                            .catch(() => setTaskSuccess('The contact could not be saved. Check your connection and try again.'));
                        }}
                        disabled={!canAdd}
                        style={{ flex: 2, padding: '13px 0', background: canAdd ? RED : CARD2, border: canAdd ? 'none' : `1px solid ${BORDER}`, borderRadius: 12, fontFamily: INTER, fontSize: 14, fontWeight: 700, color: canAdd ? 'white' : MUTED, cursor: canAdd ? 'pointer' : 'not-allowed', boxShadow: canAdd ? '0 8px 24px rgba(255,59,48,0.35)' : 'none' }}>
                        Add Contact
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Emergency Numbers section */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={20} color={RED} />
                    <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Emergency Numbers</h2>
                  </div>
                  <span style={{ width: 32, height: 32, borderRadius: '50%', background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: MUTED, flexShrink: 0 }}>2</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Police / Fire / EMS',    number: '911',                                               urgent: true  },
                    { label: 'Poison Control',          number: '(800) 222-1222',          urgent: false },
                  ].map(({ label, number, urgent }) => (
                    <div key={label} style={{ background: CARD, border: `1px solid ${urgent ? `rgba(255,59,48,0.35)` : BORDER}`, borderRadius: 16, padding:isPhone?16:20, display: 'flex', alignItems: 'center', flexWrap:isPhone?'wrap':'nowrap', gap:isPhone?12:16, boxShadow: urgent ? '0 4px 20px rgba(255,59,48,0.08)' : SHADOW }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: urgent ? 'rgba(255,59,48,0.10)' : CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Phone size={22} color={urgent ? RED : MUTED} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 15, margin: '0 0 2px' }}>{label}</p>
                        <p style={{ fontFamily: INTER, fontSize: 14, color: MUTED, margin: 0 }}>{number}</p>
                      </div>
                      <a aria-label={`Call ${label} at ${number}`} href={`tel:${number.replace(/\D/g, '')}`}
                        style={{ minHeight:44, padding: '0 18px', background: urgent ? RED : BLUE, color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none', flexShrink: 0, display:'inline-flex',alignItems:'center',justifyContent:'center',marginLeft:isPhone?64:0, boxShadow: urgent ? '0 4px 14px rgba(255,59,48,0.22)' : 'none' }}>
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
                  <span style={{ width: 32, height: 32, borderRadius: '50%', background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: MUTED, flexShrink: 0 }}>{propertyTeam.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {propertyTeam.length === 0 && <p style={{ fontFamily: INTER, fontSize: 14, color: MUTED, margin: 0 }}>Add your concierge team and their phone numbers appear here.</p>}
                    {propertyTeam.map(c => {
                      const key = c.id;
                    return (
                      <div key={key} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding:isPhone?16:20, boxShadow:SHADOW }}>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap:isPhone?'wrap':'nowrap', gap:isPhone?12:16, marginBottom: c.phone ? 14 : 0 }}>
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
                            <a aria-label={`Call ${c.name}`} href={c.phone ? `tel:${c.phone.replace(/\D/g,'')}` : `mailto:${c.email || ''}`}
                              style={{ minHeight:44, padding: '0 20px', background: BLUE, color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center', display:'inline-flex',alignItems:'center',justifyContent:'center' }}>
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
                          <div style={{ paddingTop: 14, borderTop: `1px solid ${BORDER}`, display: 'flex', flexWrap:'wrap', gap:'6px 16px' }}>
                            <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED }}>{c.phone}</span>
                            {c.email && <a href={`mailto:${c.email}`} style={{ fontFamily: INTER, fontSize: 13, color: BLUE, overflowWrap:'anywhere' }}>{c.email}</a>}
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
                    <h2 style={{ fontFamily: INTER, fontWeight: 700, color: TEXT, fontSize: 17, margin: 0 }}>Property Contacts</h2>
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
                        <button aria-label={`Remove ${c.label}`} onClick={() => authApi.deleteContact(c.id).then(() => setCustomContacts(prev => prev.filter(x => x.id !== c.id))).catch(() => {})}
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
              onClick={() => { setLeasingOpen(false); setLeasingForm({ teamName:'', contact:'', phone:'', email:'' }); setShowPw(false); }}
              style={{ position:'fixed', inset:0, zIndex:67, background:'rgba(0,0,0,0.32)', backdropFilter:'blur(2px)' }} />
            <motion.div key="leasing-modal" ref={leasingModalRef}
              role="dialog" aria-modal="true" aria-label="Add Team Members"
              initial={{ x:'110%' }} animate={{ x:0 }} exit={{ x:'110%' }}
              transition={{ type:'spring', damping:32, stiffness:300 }}
              style={{ position:'fixed', top:0, bottom:0, right:0, ...(isPhone || isMobile ? {left:0} : {width:Math.min(720, window.innerWidth-280), borderLeft:`1px solid ${BORDER}`}), zIndex:68, background:BG, borderRadius:0, boxShadow:'0 24px 64px rgba(0,0,0,0.18)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

            <div style={{ padding: isMobile ? '22px 20px 18px' : '30px 32px 24px', borderBottom:`1px solid ${BORDER}`, flexShrink:0, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:INTER, fontSize:12, fontWeight:800, color:BLUE, letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:12 }}>{propertyName}</div>
                <h2 style={{ fontFamily:INTER, fontSize: isMobile ? 32 : 42, fontWeight:800, color:TEXT, margin:0, letterSpacing:'-0.045em', lineHeight:0.95 }}>Add Team Members</h2>
                <p style={{ fontFamily:INTER, fontSize:15, color:MUTED, margin:'10px 0 0', lineHeight:1.5 }}>We’ll email them a link to set their own password</p>
              </div>
              <button onClick={() => { setLeasingOpen(false); setLeasingForm({ teamName:'', contact:'', phone:'', email:'' }); setShowPw(false); }} aria-label="Close"
                style={{ width:44, height:44, borderRadius:999, border:`1px solid ${BORDER}`, background:BG, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                <X size={19} color={TEXT} />
              </button>
            </div>

            <div style={{ flex:1, overflowY:'auto', padding: isMobile ? '20px 20px 40px' : '28px 32px 48px' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
                <h3 style={{ fontFamily:INTER, fontSize:'1.2rem', fontWeight:700, color:TEXT, letterSpacing:'-0.01em', margin:0 }}>Who are you adding?</h3>

                {[
                  { field:'teamName', label:'Full Name *',        placeholder:'e.g. George Nwachukwu',   type:'text',     ac:'off'          },
                  { field:'phone',    label:'Phone Number',       placeholder:'e.g. (215) 555-0140',     type:'tel',      ac:'off'          },
                  { field:'email',    label:'Email / Username *', placeholder:'e.g. george@example.com', type:'email',    ac:'off'          },
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
              const lValid = (leasingForm.teamName || '').trim() && (leasingForm.email || '').trim();
              const handleAddMember = async () => {
                if (!lValid || addLoading) return;
                if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(leasingForm.email.trim())) { setAddError('Enter a valid email address, like name@example.com.'); return; }
                setAddLoading(true); setAddError('');
                try {
                  const fullName = (leasingForm.teamName || leasingForm.contact || '').trim();
                  const parts = fullName.split(/\s+/);
                  const firstName = parts[0] || 'Concierge';
                  const lastName  = parts.slice(1).join(' ') || '';
                  const newC = await authApi.inviteConcierge({
                    first_name: firstName,
                    last_name:  lastName,
                    email:      leasingForm.email.trim(),
                    phone:      leasingForm.phone || '',
                    title:      leasingForm.role || 'Concierge',
                  });
                  setTeam(p => [...p, newC]);
                  setLeasingForm({ teamName:'', contact:'', phone:'', email:'' });
                  setAddError('');
                  if (newC.emailSent) {
                    setLeasingOpen(false);
                    setTab('team');
                    setTeamNotice({ tone:'ok', text:`An invitation was emailed to ${newC.email}. They appear under Team Members as soon as they set a password.` });
                  } else {
                    // Keep the panel open so the manager can share the link by hand.
                    setInviteNotice({ email: newC.email, link: newC.inviteLink, reason: newC.emailError });
                  }
                } catch (err) {
                  setAddError(typeof err?.response?.data?.detail === 'string' ? err.response.data.detail : 'This person could not be added. Check the email address and try again.');
                } finally { setAddLoading(false); }
              };
              return (
                <div style={{ flexShrink:0, padding: isMobile ? '12px 20px 20px' : '16px 32px 24px', background:CARD, borderTop:`1px solid ${BORDER}` }}>
                  {addError && <p style={{ fontFamily:INTER, fontSize:13, color:RED, marginBottom:10, fontWeight:600 }}>{addError}</p>}
                  {inviteNotice && (
                    <div style={{ marginBottom:12, padding:14, borderRadius:12, background:'rgba(255,149,0,0.08)', border:'1px solid rgba(255,149,0,0.35)' }}>
                      <p style={{ fontFamily:INTER, fontSize:13, fontWeight:700, color:TEXT, margin:'0 0 4px' }}>
                        {inviteNotice.email} was added, but the invitation email was not sent.
                      </p>
                      {inviteNotice.reason && <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:'0 0 8px' }}>{inviteNotice.reason}</p>}
                      {inviteNotice.link && (
                        <>
                          <p style={{ fontFamily:INTER, fontSize:12, color:MUTED, margin:'0 0 6px' }}>Send them this link yourself (text or email). It lets them set their password.</p>
                          <div style={{ display:'flex', gap:8 }}>
                            <input readOnly value={inviteNotice.link} onFocus={e => e.target.select()}
                              style={{ flex:1, minWidth:0, padding:'8px 10px', borderRadius:8, border:`1px solid ${BORDER}`, fontFamily:INTER, fontSize:12, color:TEXT, background:CARD }} />
                            <button onClick={() => { try { navigator.clipboard.writeText(inviteNotice.link); } catch (e) {} }}
                              style={{ padding:'8px 12px', borderRadius:8, border:'none', background:GREEN, color:'white', fontFamily:INTER, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                              Copy link
                            </button>
                          </div>
                        </>
                      )}
                      <button onClick={() => { setInviteNotice(null); setLeasingOpen(false); }}
                        style={{ marginTop:10, padding:0, border:'none', background:'none', fontFamily:INTER, fontSize:12, fontWeight:700, color:MUTED, cursor:'pointer', textDecoration:'underline' }}>
                        Done
                      </button>
                    </div>
                  )}
                  <button
                    disabled={!lValid || addLoading}
                    onClick={handleAddMember}
                    style={{ width:'100%', padding:'16px 0', background:(!lValid||addLoading)?CARD2:GREEN, border:(!lValid||addLoading)?`1px solid ${BORDER}`:'none', borderRadius:14, fontFamily:INTER, fontSize:16, fontWeight:700, color:(!lValid||addLoading)?MUTED:'white', cursor:(!lValid||addLoading)?'not-allowed':'pointer', boxShadow:(!lValid||addLoading)?'none':'0 8px 24px rgba(52,199,89,0.30)' }}>
                    {addLoading ? 'Sending...' : 'Send Invitation'}
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
              style={{ position:'fixed', right:16, top:16, bottom:16, ...(isPhone ? {top:0,bottom:0,left:0,right:0,borderRadius:0} : isMobile ? {left:16} : {width:Math.min(640, window.innerWidth-280)}), zIndex:70, background:BG, borderRadius: isPhone ? 0 : 24, boxShadow:'0 24px 64px rgba(0,0,0,0.20)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
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

    </DashboardPage>
  );
};

export default ManagerDashboard;
