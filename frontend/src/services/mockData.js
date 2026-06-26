import { TaskStatus, Priority } from '../types';

// ─── Building Profile ────────────────────────────────────────────────────────
export const BUILDING_PROFILE = {
  id: 'building-1',
  name: 'The Hannah',
  address: '1306 Callowhill Street, Philadelphia, PA 19123',
  company: 'Greystar',
  units: 286,
  floors: 18,
  yearBuilt: 2018,
  photo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  amenities: [
    'Rooftop Pool',
    'Fitness Center',
    'Rooftop Terrace',
    'Dog Park',
    'Package Room',
    'Business Center',
    'Club Room',
    'Parking Garage (P1 & P2)',
    'Mail Room',
    'Bike Storage',
  ],
};

// ─── Emergency Contacts ───────────────────────────────────────────────────────
export const BUILDING_CONTACTS = {
  propertyManager: {
    name: 'Sarah Thompson',
    title: 'Property Manager',
    company: 'Greystar',
    phone: '(215) 555-0123',
    email: 'sthompson@greystar.com',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    available: 'Mon–Fri, 9am–6pm',
  },
  maintenance: {
    name: 'Mike Rodriguez',
    title: 'Maintenance Supervisor',
    company: 'Greystar',
    phone: '(215) 555-0124',
    afterHoursLine: '(215) 555-0199',
    email: 'mrodriguez@greystar.com',
    avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
    available: 'Mon–Fri, 7am–4pm · After-hours emergency line 24/7',
  },
  headConcierge: {
    name: 'George Nwachukwu',
    title: 'Head Concierge',
    company: 'Greystar',
    phone: '(215) 555-0125',
    email: 'george@greystar.com',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    available: 'Mon–Fri, 8am–5pm',
  },
  leasing: {
    name: 'Leasing Office',
    title: 'Leasing Team',
    company: 'Greystar',
    phone: '(215) 555-0126',
    email: 'leasing.hannah@greystar.com',
    avatar: null,
    available: 'Mon–Sat, 9am–6pm',
  },
  maverickDispatch: {
    name: 'Maverick Dispatch',
    title: 'Third-Party Concierge – Dispatch',
    company: 'Maverick Concierge Services',
    phone: '(215) 555-0127',
    supervisor: 'Paul Wilson',
    email: 'dispatch@maverickcs.com',
    avatar: null,
    available: '24/7 Dispatch',
  },
  emergency: {
    police911:             '911',
    fire911:               '911',
    nonEmergencyPolice:    '(215) 686-8080',
    buildingEmergency:     '(215) 555-0199',
    elevatorEmergency:     '(800) 233-6935',
    gasEmergency:          '(215) 235-1212',
    electricityOutage:     '(800) 494-4000',
    poisonControl:         '(800) 222-1222',
  },
};

// ─── Concierge Profile ────────────────────────────────────────────────────────
export const CONCIERGE_PROFILE = {
  id: 'concierge-1',
  name: 'George Nwachukwu',
  title: 'Head Concierge',
  company: 'Greystar',
  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  phone: '(215) 555-0125',
  email: 'george@greystar.com',
  yearsExperience: 12,
  certifications: ['Certified Concierge Professional', 'CPR / First Aid', 'Fire Safety', 'AED Certified'],
  shiftsCompleted: 847,
  rating: 4.9,
  previousEmployers: ['Maverick Concierge Services', 'Four Seasons Hotels'],
};

// legacy export alias
export const CAREGIVER_PROFILE = CONCIERGE_PROFILE;

// ─── Shift Tasks ──────────────────────────────────────────────────────────────
export const INITIAL_TASKS = [
  {
    id: '1',
    title: 'Lobby Opening Check',
    description: 'Inspect and prepare lobby for the day',
    instructions: 'Check all lobby lights are operational. Ensure lobby furniture is clean and properly arranged. Verify entry doors and fob readers are functional. Check overnight maintenance log for any pending issues. Report any deficiencies immediately.',
    scheduledTime: '08:00 AM',
    timeWindow: '7:45 AM – 8:30 AM',
    priority: Priority.CRITICAL,
    status: TaskStatus.PENDING,
    requiresPhoto: true,
    category: 'opening',
    location: 'Main Lobby',
    completedAt: null,
    completionNote: '',
    evidenceUrls: [],
    missedReason: null,
  },
  {
    id: '2',
    title: 'Package Room Audit',
    description: 'Log all overnight deliveries and flag aged packages',
    instructions: 'Scan and log every package that arrived overnight. Flag any packages older than 3 days with an orange sticker and notify leasing. Note any damaged, leaking, or suspicious packages and photograph. Update the package log spreadsheet.',
    scheduledTime: '08:30 AM',
    timeWindow: '8:15 AM – 9:15 AM',
    priority: Priority.STANDARD,
    status: TaskStatus.PENDING,
    requiresPhoto: true,
    category: 'packages',
    location: 'Package Room',
    completedAt: null,
    completionNote: '',
    evidenceUrls: [],
    missedReason: null,
  },
  {
    id: '3',
    title: 'Parking Garage Patrol – P1 & P2',
    description: 'Walk both garage levels, verify all vehicles are authorized',
    instructions: 'Walk the full perimeter of P1 then P2. Note any vehicles without a resident parking sticker. Photograph unauthorized or suspicious vehicles with the license plate clearly visible. Check that both garage entry gates are operational and report any obstructions.',
    scheduledTime: '09:00 AM',
    timeWindow: '8:45 AM – 9:30 AM',
    priority: Priority.CRITICAL,
    status: TaskStatus.PENDING,
    requiresPhoto: true,
    category: 'patrol',
    location: 'Parking Garage',
    completedAt: null,
    completionNote: '',
    evidenceUrls: [],
    missedReason: null,
  },
  {
    id: '4',
    title: 'Amenity Inspection',
    description: 'Inspect pool, fitness center, and rooftop terrace',
    instructions: 'Pool: verify gate is locked, water is clear, safety ring and first aid kit are present, no hazards on deck. Fitness center: all equipment operational, no damage, floor clean. Rooftop: furniture secured or stored, no debris, access door locked after inspection.',
    scheduledTime: '10:00 AM',
    timeWindow: '9:45 AM – 10:30 AM',
    priority: Priority.STANDARD,
    status: TaskStatus.PENDING,
    requiresPhoto: true,
    category: 'amenity',
    location: 'Pool / Gym / Rooftop',
    completedAt: null,
    completionNote: '',
    evidenceUrls: [],
    missedReason: null,
  },
];

// ─── Proposed Tasks (from property management) ────────────────────────────────
export const PROPOSED_TASKS = [
  {
    id: 'p1',
    title: 'New Resident Welcome – Unit 1204',
    description: 'New move-in today. Prepare welcome basket and escort to unit.',
    instructions: 'New resident: Jordan Lee, Unit 1204. Moving company expected 10am–2pm. Prepare welcome basket from storage room B. Ensure freight elevator is reserved for the move window. Issue fob and parking pass. Walk resident through amenity hours.',
    scheduledTime: '10:00 AM',
    timeWindow: '9:45 AM – 11:00 AM',
    priority: Priority.STANDARD,
    status: TaskStatus.PROPOSED,
    requiresPhoto: true,
    proposedBy: 'Sarah Thompson (Property Manager)',
    proposedAt: new Date().toISOString(),
    location: 'Unit 1204',
  },
  {
    id: 'p2',
    title: 'HVAC Contractor Access – Comfort Systems Inc.',
    description: '3 technicians arriving for annual HVAC preventive maintenance',
    instructions: 'Verify IDs and work order #WO-2026-0492 before allowing access. Escort all three technicians to Mechanical Room B2. Issue temporary access badges; collect on departure. Log names, company, arrival/departure times in the visitor log.',
    scheduledTime: '01:00 PM',
    timeWindow: '12:45 PM – 3:00 PM',
    priority: Priority.HIGH,
    status: TaskStatus.PROPOSED,
    requiresPhoto: false,
    proposedBy: 'Mike Rodriguez (Maintenance)',
    proposedAt: new Date().toISOString(),
    location: 'Mechanical Room B2',
  },
];

// ─── Building Status (replaces Vitals) ───────────────────────────────────────
export const BUILDING_STATUS = {
  pool:        { label: 'Pool',            status: 'open',    note: 'Open 6am–10pm' },
  gym:         { label: 'Fitness Center',  status: 'open',    note: 'Open 24/7' },
  rooftop:     { label: 'Rooftop',         status: 'open',    note: 'Open 8am–11pm' },
  elevators:   { label: 'Elevators',       status: 'nominal', note: 'All 3 operational' },
  mainGate:    { label: 'Main Gate',       status: 'nominal', note: 'Operational' },
  garageGate:  { label: 'Garage Gate',     status: 'issue',   note: 'P2 gate slow — reported' },
  cameras:     { label: 'CCTV',            status: 'nominal', note: '42/42 cameras online' },
  packageRoom: { label: 'Package Room',    status: 'open',    note: '14 parcels awaiting pickup' },
};

// ─── Building SOPs / Rules ────────────────────────────────────────────────────
export const BUILDING_SOPS = [
  {
    id: 'sop-1',
    category: 'Amenity Hours',
    title: 'Amenity Operating Hours',
    content: `Rooftop Pool: 6:00 AM – 10:00 PM daily. No glass allowed in pool area.
Fitness Center: 24 hours, 7 days a week (key fob required after hours).
Rooftop Terrace: 8:00 AM – 11:00 PM Sunday–Thursday, 8:00 AM – 12:00 AM Friday–Saturday.
Club Room: 8:00 AM – 11:00 PM daily. Private events must be booked through leasing.
Dog Park: 6:00 AM – 10:00 PM. Dogs must be leashed at all times in common areas.
Business Center: 8:00 AM – 10:00 PM daily.`,
  },
  {
    id: 'sop-2',
    category: 'Guest Policy',
    title: 'Guest & Visitor Policy',
    content: `All visitors must check in at the front desk with a valid photo ID.
Residents must be notified and consent to guest entry.
Guests may not use amenities without the resident present.
Short-term rental subletting (Airbnb, VRBO) is strictly prohibited.
Recurring guests (3+ visits/week) should be flagged to the property manager.
Contractors must present their work order and company ID before access is granted.`,
  },
  {
    id: 'sop-3',
    category: 'Noise & Quiet Hours',
    title: 'Noise Complaint Protocol',
    content: `Quiet hours: 10:00 PM – 8:00 AM weekdays. 11:00 PM – 9:00 AM weekends.
Step 1: Call the resident and request they lower noise. Document the call.
Step 2: If no answer or no change after 10 minutes, visit the unit in person. Never enter — knock only.
Step 3: If unresolved, notify property manager (after hours: after-hours line).
Step 4: For extreme or violent situations, call 911 first. Document everything.
Always log noise complaints in the incident report with time, unit, and outcome.`,
  },
  {
    id: 'sop-4',
    category: 'Security',
    title: 'Unauthorized Access & Suspicious Activity',
    content: `Do not confront aggressive or potentially dangerous individuals directly.
For unauthorized building access: ask for resident name and unit number; if unable to verify, deny access and document.
For suspicious vehicles in the garage: photograph the vehicle and plate, do not approach or engage.
For suspicious persons: observe and document from a safe distance. Call non-emergency police if needed.
Never reveal resident information (unit numbers, schedules) to anyone without prior resident authorization.
All incidents must be logged in the app immediately — details fade fast.`,
  },
  {
    id: 'sop-5',
    category: 'Move-In / Move-Out',
    title: 'Move-In & Move-Out Procedures',
    content: `All moves must be pre-approved by the leasing office. Check the move schedule each morning.
Reserve the freight elevator for the move window — standard elevators are for residents only during moves.
Protect lobby walls and floors with elevator pads and floor runners before movers arrive.
Inspect common areas before and after each move and document any damage with photos.
Collect/issue key fobs, parking passes, and mailbox keys per the leasing checklist.
Movers must use the loading dock entrance only. No propping of main lobby doors.`,
  },
  {
    id: 'sop-6',
    category: 'Emergency',
    title: 'Emergency Procedures',
    content: `FIRE: Call 911. Activate nearest pull station. Initiate evacuation per the posted fire plan. Do not use elevators. Meet residents at the designated assembly point (east parking lot).
MEDICAL EMERGENCY: Call 911. Stay with the person and provide comfort. Send someone to meet paramedics at the main entrance. Do not move the person unless there is immediate danger.
FLOOD/WATER INTRUSION: Call maintenance emergency line (215) 555-0199. Shut off water source if you can safely reach the valve. Alert affected residents.
POWER OUTAGE: Call PECO electricity line (800) 494-4000. Emergency lighting is automatic. Elevator alarms will activate — call (800) 233-6935 if anyone is trapped.
NATURAL DISASTER: Follow posted evacuation routes. Account for all residents via the concierge log.`,
  },
  {
    id: 'sop-7',
    category: 'Package Management',
    title: 'Package Handling & Notification',
    content: `Log every package in the system immediately upon receipt — carrier, resident unit, tracking number, condition.
Text or call resident for packages that require a signature or are oversized.
Packages older than 3 days: apply orange flag sticker and notify leasing for follow-up.
Never release a package to anyone other than the resident on record or a pre-authorized person.
Damaged packages: photograph before moving, note damage in the log, inform the resident.
Suspicious packages (unusual odor, leaking, no return address): do not handle. Call non-emergency police.`,
  },
];

// ─── Shift Log Entries (shift log / handoff history) ─────────────────────────
export const SHIFT_HISTORY = [
  {
    id: 'sh-1',
    date: 'Jun 7, 2026',
    shiftType: 'Night Shift',
    staff: 'Marcus D.',
    company: 'Maverick',
    hours: '5:00 PM – 8:00 AM',
    status: 'completed',
    incidentCount: 2,
    tasksCompleted: 6,
    totalTasks: 7,
    summary: 'Two incidents: unauthorized vehicle on P2 (photographed, not towed — awaiting PM approval). Noise complaint floor 9, unit 912 — resolved 11:30pm. Garage gate P2 still slow. 14 packages awaiting pickup.',
  },
  {
    id: 'sh-2',
    date: 'Jun 7, 2026',
    shiftType: 'Day Shift',
    staff: 'George Nwachukwu',
    company: 'Greystar',
    hours: '8:00 AM – 5:00 PM',
    status: 'completed',
    incidentCount: 1,
    tasksCompleted: 8,
    totalTasks: 8,
    summary: 'Routine day. One noise complaint floor 14 (resolved). HVAC contractor Comfort Systems completed Mech Room B2 maintenance. Package room at capacity — notified leasing. Luggage cart #1 checked out to unit 524.',
  },
  {
    id: 'sh-3',
    date: 'Jun 6, 2026',
    shiftType: 'Night Shift',
    staff: 'Kevin T.',
    company: 'Maverick',
    hours: '5:00 PM – 8:00 AM',
    status: 'completed',
    incidentCount: 0,
    tasksCompleted: 7,
    totalTasks: 7,
    summary: 'All quiet. Garage gate P2 closing slowly — documented and forwarded to maintenance. 3 UPS deliveries, 1 Amazon placed in package room overflow under unit 628.',
  },
  {
    id: 'sh-4',
    date: 'Jun 6, 2026',
    shiftType: 'Day Shift',
    staff: 'George Nwachukwu',
    company: 'Greystar',
    hours: '8:00 AM – 5:00 PM',
    status: 'completed',
    incidentCount: 0,
    tasksCompleted: 8,
    totalTasks: 8,
    summary: 'Quiet day. New resident move-in Unit 1204 (Jordan Lee) completed smoothly. All amenities operational. 2 food deliveries handled.',
  },
  {
    id: 'sh-5',
    date: 'Jun 5, 2026',
    shiftType: 'Night Shift',
    staff: 'Lisa R.',
    company: 'Maverick',
    hours: '5:00 PM – 8:00 AM',
    status: 'completed',
    incidentCount: 1,
    tasksCompleted: 7,
    totalTasks: 8,
    summary: 'Pool area broken deck chair — removed and reported to maintenance. Package room overflow resolved after 5 aged packages picked up. Third-party pickup for unit 802 — ID verified, resident pre-authorized.',
  },
];

// ─── Decline / Skip Reasons ───────────────────────────────────────────────────
export const DECLINE_REASONS = [
  'Safety Concern — Could Not Complete Safely',
  'Area Inaccessible or Locked',
  'Waiting on Maintenance / Another Team',
  'Resident or Visitor Issue — Required Attention Instead',
  'Task Delegated to Night Shift',
  'Equipment / Tool Not Available',
  'Other — See Notes',
];

// ─── Conversations (Team Messaging) ──────────────────────────────────────────
export const CONVERSATIONS = [
  {
    id: 1,
    name: 'Sarah Thompson',
    role: 'Property Manager',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    lastMessage: 'Thanks George, approved the tow on P2.',
    time: '2:30 PM',
    unread: 0,
    online: true,
    isGroup: false,
  },
  {
    id: 2,
    name: 'Mike Rodriguez',
    role: 'Maintenance',
    avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
    lastMessage: 'P2 gate repair scheduled for Thursday',
    time: '1:15 PM',
    unread: 1,
    online: true,
    isGroup: false,
  },
  {
    id: 3,
    name: 'Maverick Dispatch',
    role: 'Night Shift Dispatch',
    avatar: null,
    lastMessage: 'Marcus confirmed for tonight 5pm',
    time: 'Yesterday',
    unread: 0,
    online: false,
    isGroup: false,
  },
  {
    id: 4,
    name: 'Hannah Team',
    role: '',
    avatar: null,
    lastMessage: 'Building-wide notice: pool closed Sat for maintenance',
    time: 'Yesterday',
    unread: 2,
    online: false,
    isGroup: true,
  },
];

// ─── Visitor Log ──────────────────────────────────────────────────────────────
export const VISITOR_LOG = [
  { id: 1, name: 'Tom Keller', purpose: 'Guest of Unit 802',       timeIn: '10:15 AM', timeOut: '12:30 PM', verified: true },
  { id: 2, name: 'Comfort Systems (3)', purpose: 'HVAC Maintenance', timeIn: '1:05 PM',  timeOut: null,       verified: true },
  { id: 3, name: 'FedEx Driver',        purpose: 'Package Delivery', timeIn: '9:40 AM',  timeOut: '9:45 AM',  verified: true },
];

// ─── Legacy aliases (kept for backward compat with sub-pages) ─────────────────
export const CLIENTS         = [];
export const CARE_PLAN       = { medications: [] };
export const CARE_IMAGES     = {};
export const PATIENT_PROFILE = BUILDING_PROFILE;
export const INITIAL_VITALS  = {};

// ─── Properties the logged-in user covers ────────────────────────────────────
export const USER_PROPERTIES = [
  {
    id: 'hannah',
    name: 'The Hannah',
    address: '1306 Callowhill Street, Philadelphia, PA 19123',
    company: 'Greystar',
    units: 286,
    floors: 18,
    yourRole: 'Head Concierge',
    lastShift: 'Jun 7, 2026',
    photo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    activeIncidents: 2,
    pendingPackages: 14,
  },
  {
    id: 'bozzuto',
    name: 'Bozzuto Commons',
    address: '400 Spring Garden Street, Philadelphia, PA 19123',
    company: 'Bozzuto',
    units: 212,
    floors: 12,
    yourRole: 'Float Concierge',
    lastShift: 'May 28, 2026',
    photo: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    activeIncidents: 0,
    pendingPackages: 7,
  },
];

// ─── Shift Calendar ───────────────────────────────────────────────────────────
// activity types: clock_in clock_out task package_in package_out food incident
//                 loaner_out loaner_in visitor note
export const SHIFT_CALENDAR = {
  hannah: {
    '2026-06-01': [
      {
        id: 'sh-0601-day', type: 'Day', staff: 'George Nwachukwu', company: 'Greystar',
        startTime: '8:00 AM', endTime: '5:00 PM', status: 'completed',
        tasksCompleted: 8, totalTasks: 8, incidentCount: 0, packagesIn: 5, packagesOut: 3,
        activities: [
          { time: '8:02 AM', type: 'clock_in', desc: 'Clocked in at front desk. Marcus handoff reviewed — quiet overnight, no open items.' },
          { time: '8:20 AM', type: 'task', title: 'Lobby Opening Check', desc: 'All lobby lights operational. Furniture arranged. Entry doors and fob readers functional.' },
          { time: '8:45 AM', type: 'task', title: 'Package Room Audit', desc: '8 overnight packages logged. 1 Amazon for Unit 524 (3 days old) — orange flag applied, leasing notified.' },
          { time: '9:00 AM', type: 'package_in', carrier: 'UPS', unit: '802', count: 2, storage: 'Luxer Locker', desc: '2 UPS packages for Unit 802 logged into Luxer.' },
          { time: '9:35 AM', type: 'task', title: 'Parking Garage Patrol – P1 & P2', desc: 'P1 and P2 clear. All vehicles have resident stickers. P2 gate closing slightly slow — documented, maintenance ticket submitted.' },
          { time: '10:15 AM', type: 'package_in', carrier: 'FedEx', unit: '1106', count: 1, storage: 'Package Room', desc: 'FedEx Express package for Unit 1106. Package room.' },
          { time: '10:45 AM', type: 'task', title: 'Amenity Inspection', desc: 'Pool gate locked, water clear, safety ring present. Gym clean, all equipment operational. Rooftop secured.' },
          { time: '11:30 AM', type: 'visitor', name: 'Tom Keller', purpose: 'Guest of Unit 802', verified: true, desc: 'Visitor signed in. Called Unit 802 — resident confirmed and came to lobby.' },
          { time: '12:15 PM', type: 'package_out', resident: 'Maria S.', unit: '1106', count: 1, pickupType: 'resident', desc: 'Resident picked up 1 FedEx package. Signed log.' },
          { time: '2:00 PM', type: 'package_in', carrier: 'Amazon', unit: '310', count: 2, storage: 'Luxer Locker', desc: '2 Amazon packages for Unit 310 logged into Luxer.' },
          { time: '3:30 PM', type: 'task', title: 'Afternoon Exterior Walk', desc: 'Exterior clean. Patio furniture secured. Trash corrals closed. Bike storage organized.' },
          { time: '4:00 PM', type: 'package_out', resident: 'James B.', unit: '802', count: 2, pickupType: 'resident', desc: 'Resident picked up both UPS packages. Signed log.' },
          { time: '4:30 PM', type: 'task', title: 'Mail Room Check', desc: 'Mail room tidy. No certified mail today.' },
          { time: '4:45 PM', type: 'task', title: 'Shift Handoff Report', desc: 'DAR submitted. 5 packages in, 3 out. 2 remaining (310 × 2, 524 × 1 flagged). P2 gate slow — maintenance ticket open. No incidents.' },
          { time: '5:00 PM', type: 'clock_out', desc: 'Shift ended. Handed off to Marcus D. (Maverick).' },
        ],
      },
      {
        id: 'sh-0601-night', type: 'Night', staff: 'Marcus D.', company: 'Maverick',
        startTime: '5:00 PM', endTime: '8:00 AM', status: 'completed',
        tasksCompleted: 5, totalTasks: 5, incidentCount: 0, packagesIn: 1, packagesOut: 0,
        activities: [
          { time: '5:00 PM', type: 'clock_in', desc: 'Clocked in. Read George\'s handoff — P2 gate slow (ticket open), 2 packages awaiting pickup.' },
          { time: '5:45 PM', type: 'visitor', name: 'Rachel Kim', purpose: 'Guest of Unit 1204', verified: true, desc: 'Evening visitor for Unit 1204. Resident confirmed and came down to escort.' },
          { time: '7:20 PM', type: 'package_in', carrier: 'Amazon', unit: '912', count: 1, storage: 'Package Room', desc: 'Late Amazon delivery for Unit 912. Package room (Luxer full).' },
          { time: '9:15 PM', type: 'task', title: 'Evening Lobby Patrol', desc: 'Lobby quiet. Pool area clear. Amenity hours enforced.' },
          { time: '10:00 PM', type: 'note', desc: 'Quiet hours began at 10pm weekday. No noise issues. Lobby clear.' },
          { time: '1:30 AM', type: 'task', title: 'Overnight Perimeter Check', desc: 'Building exterior secure. P1 and P2 clear. Gate still slow but functional.' },
          { time: '6:00 AM', type: 'task', title: 'Morning Lobby Prep', desc: 'Lobby ready for day shift. Coffee area stocked. 3 packages awaiting pickup.' },
          { time: '7:00 AM', type: 'task', title: 'Garage Gate Check', desc: 'P2 gate speed still reduced. Maintenance ticket still open — flagged for George.' },
          { time: '8:00 AM', type: 'clock_out', desc: 'Shift ended. Handoff to George. All quiet overnight. 3 packages awaiting pickup.' },
        ],
      },
    ],
    '2026-06-02': [
      {
        id: 'sh-0602-day', type: 'Day', staff: 'George Nwachukwu', company: 'Greystar',
        startTime: '8:00 AM', endTime: '5:00 PM', status: 'completed',
        tasksCompleted: 8, totalTasks: 8, incidentCount: 0, packagesIn: 7, packagesOut: 8,
        activities: [
          { time: '8:01 AM', type: 'clock_in', desc: 'Clocked in. Marcus handoff: quiet night, 3 packages outstanding, P2 gate ticket still open.' },
          { time: '8:25 AM', type: 'task', title: 'Lobby Opening Check', desc: 'All systems operational. Lobby clean.' },
          { time: '8:50 AM', type: 'task', title: 'Package Room Audit', desc: '3 remaining plus 2 overnight. Total 5 awaiting. Package for Unit 524 now 4 days — escalated to leasing for follow-up call to resident.' },
          { time: '9:20 AM', type: 'package_in', carrier: 'UPS', unit: '714', count: 3, storage: 'Luxer Locker', desc: '3 UPS packages for Unit 714 — Luxer locker.' },
          { time: '9:45 AM', type: 'note', desc: 'New resident move-in today: Unit 1204, Jordan Lee. Moving company (Two Men and a Truck) expected 11am–3pm. Freight elevator reserved. Lobby pads ordered.' },
          { time: '10:00 AM', type: 'task', title: 'Parking Garage Patrol', desc: 'Both levels clear. Confirmed P2 gate maintenance scheduled for Thursday.' },
          { time: '10:55 AM', type: 'package_in', carrier: 'FedEx', unit: '524', count: 1, storage: 'Package Room', desc: 'Another package for Unit 524 — now 6 total. Notified leasing a second time.' },
          { time: '11:10 AM', type: 'visitor', name: 'Two Men and a Truck (2 movers)', purpose: 'Move-In – Unit 1204', verified: true, desc: 'Movers verified with company ID and move permit. Escorted to freight elevator. Floor runner placed in lobby and elevator.' },
          { time: '11:45 AM', type: 'package_out', resident: 'Unit 524 Resident', unit: '524', count: 6, pickupType: 'resident', desc: 'Unit 524 resident finally picked up all 6 packages. Orange flag cleared. Signed log.' },
          { time: '1:15 PM', type: 'package_in', carrier: 'Amazon', unit: '1412', count: 2, storage: 'Luxer Locker', desc: '2 Amazon packages for Unit 1412.' },
          { time: '2:00 PM', type: 'package_out', resident: 'Unit 714 Resident', unit: '714', count: 3, pickupType: 'resident', desc: 'All 3 UPS packages picked up by Unit 714 resident.' },
          { time: '3:00 PM', type: 'note', desc: 'Move-in complete for Unit 1204. Jordan Lee issued: fob × 2, parking pass, mailbox key. Welcome basket delivered. Amenity hours reviewed. Move complete with no damage to common areas.' },
          { time: '4:30 PM', type: 'task', title: 'Common Area Post-Move Inspection', desc: 'Lobby and freight elevator clean. No damage. Floor runner returned to storage. Elevator pads removed.' },
          { time: '4:45 PM', type: 'task', title: 'Shift Handoff Report', desc: 'DAR submitted. Move-in complete Unit 1204. 7 in, 9 out (includes yesterday\'s 524). 2 remaining. No incidents.' },
          { time: '5:00 PM', type: 'clock_out', desc: 'Handed off to Kevin T. (Maverick).' },
        ],
      },
      {
        id: 'sh-0602-night', type: 'Night', staff: 'Kevin T.', company: 'Maverick',
        startTime: '5:00 PM', endTime: '8:00 AM', status: 'completed',
        tasksCompleted: 4, totalTasks: 4, incidentCount: 0, packagesIn: 0, packagesOut: 2,
        activities: [
          { time: '5:00 PM', type: 'clock_in', desc: 'Clocked in. George handoff: move-in complete, 2 packages remaining (312 and 1412).' },
          { time: '7:30 PM', type: 'visitor', name: 'Lisa Chen', purpose: 'Guest of Unit 714', verified: true, desc: 'Evening guest for 714. ID verified. Resident confirmed by phone.' },
          { time: '8:45 PM', type: 'package_out', resident: 'Unit 1412 Resident', unit: '1412', count: 2, pickupType: 'resident', desc: 'Unit 1412 resident picked up both Amazon packages.' },
          { time: '9:30 PM', type: 'package_out', resident: 'Unit 310 Resident', unit: '310', count: 2, pickupType: 'resident', desc: 'Unit 310 picked up remaining 2 packages.' },
          { time: '10:00 PM', type: 'note', desc: 'Quiet hours. Lobby clear. All amenities closed per schedule. No packages awaiting.' },
          { time: '2:00 AM', type: 'task', title: 'Overnight Perimeter Check', desc: 'Building secure. P1, P2 clear.' },
          { time: '7:50 AM', type: 'task', title: 'Lobby Prep', desc: 'Lobby ready. No packages awaiting — clean slate for George.' },
          { time: '7:55 AM', type: 'clock_out', desc: 'Shift ended. Quiet night. No packages outstanding.' },
        ],
      },
    ],
    '2026-06-03': [
      {
        id: 'sh-0603-day', type: 'Day', staff: 'George Nwachukwu', company: 'Greystar',
        startTime: '8:00 AM', endTime: '5:00 PM', status: 'completed',
        tasksCompleted: 7, totalTasks: 8, incidentCount: 1, packagesIn: 6, packagesOut: 4,
        activities: [
          { time: '8:03 AM', type: 'clock_in', desc: 'Clocked in. Kevin handoff: quiet night, no packages outstanding. Clean start.' },
          { time: '8:20 AM', type: 'task', title: 'Lobby Opening Check', desc: 'Lobby operational. One light in east corridor dim — submitted maintenance ticket #MT-2026-0318.' },
          { time: '8:40 AM', type: 'task', title: 'Package Room Audit', desc: '3 new overnight packages. All under 24hrs. Audit complete.' },
          { time: '9:15 AM', type: 'package_in', carrier: 'USPS', unit: '608', count: 2, storage: 'Package Room', desc: '2 USPS certified mail packages for Unit 608. Signature required at pickup.' },
          { time: '9:45 AM', type: 'task', title: 'Garage Patrol – P1 & P2', desc: 'P1 clear. P2: unauthorized vehicle found — silver Honda Civic, PA plate KJL-4421, no resident sticker. Photographed. Property Manager Sarah Thompson notified immediately.' },
          { time: '10:05 AM', type: 'incident', title: 'Unauthorized Vehicle – P2', desc: 'Silver Honda Civic PA-KJL-4421 parked in resident spot without sticker. Photos taken: license plate, full vehicle, spot number (P2-44). Sarah Thompson contacted — tow authorization requested. Documented per SOP.' },
          { time: '11:00 AM', type: 'package_in', carrier: 'Amazon', unit: '1204', count: 3, storage: 'Luxer Locker', desc: '3 Amazon packages for new resident Unit 1204 (Jordan Lee).' },
          { time: '11:45 AM', type: 'package_out', resident: 'Jordan Lee', unit: '1204', count: 3, pickupType: 'resident', desc: 'New resident came down immediately — picked up all 3 Amazon packages.' },
          { time: '1:00 PM', type: 'package_out', resident: 'Unit 310 Resident', unit: '310', count: 2, pickupType: 'resident', desc: '2 Amazon packages picked up by Unit 310 resident.' },
          { time: '2:15 PM', type: 'food', carrier: 'DoorDash', unit: '802', desc: 'Food delivery for Unit 802. Called resident — arrived in lobby within 4 minutes.' },
          { time: '2:30 PM', type: 'package_in', carrier: 'UPS', unit: '1412', count: 1, storage: 'Luxer Locker', desc: '1 UPS package for Unit 1412.' },
          { time: '3:00 PM', type: 'package_out', resident: 'Unit 608 Resident', unit: '608', count: 2, pickupType: 'resident', desc: 'Both USPS certified packages picked up. Signatures obtained and logged.' },
          { time: '4:00 PM', type: 'note', desc: 'Sarah Thompson approved tow for unauthorized Honda P2. Tow company (City Tow) contacted — ETA 1 hour. Vehicle still on premises at end of shift — briefed Marcus.' },
          { time: '4:45 PM', type: 'task', title: 'Shift Handoff Report', desc: 'DAR submitted. 1 incident: unauthorized vehicle P2, tow authorized, ETA 1hr. 6 in, 4 out. 3 remaining. East corridor light ticket open. MISSED: amenity inspection (was managing vehicle incident).' },
          { time: '5:00 PM', type: 'clock_out', desc: 'Handed off to Marcus D. Tow company en route for P2 Honda.' },
        ],
      },
      {
        id: 'sh-0603-night', type: 'Night', staff: 'Marcus D.', company: 'Maverick',
        startTime: '5:00 PM', endTime: '8:00 AM', status: 'completed',
        tasksCompleted: 5, totalTasks: 5, incidentCount: 1, packagesIn: 1, packagesOut: 0,
        activities: [
          { time: '5:02 PM', type: 'clock_in', desc: 'Clocked in. George handoff: unauthorized vehicle tow in progress, 3 packages outstanding.' },
          { time: '5:20 PM', type: 'note', desc: 'City Tow arrived. Silver Honda Civic PA-KJL-4421 removed from P2-44. Tow receipt obtained and filed. Photo of empty spot taken.' },
          { time: '7:00 PM', type: 'package_in', carrier: 'Amazon', unit: '912', count: 1, storage: 'Package Room', desc: 'Late Amazon for Unit 912. Package room (Luxer full).' },
          { time: '9:00 PM', type: 'task', title: 'Evening Lobby and Amenity Check', desc: 'Pool and rooftop closed at scheduled times. Building quiet.' },
          { time: '10:45 PM', type: 'incident', title: 'Noise Complaint – Floor 9', desc: 'Resident from Unit 914 called front desk: loud music from Unit 912. Called Unit 912 — answered, apologized, volume reduced immediately. Quiet within 3 minutes. Documented in incident log.' },
          { time: '11:00 PM', type: 'note', desc: 'Unit 912 quiet hours violation resolved. No further calls from floor 9.' },
          { time: '2:30 AM', type: 'task', title: 'Overnight Perimeter Check', desc: 'All floors quiet. P1, P2 clear — no unauthorized vehicles. Tow confirmed, spot now empty.' },
          { time: '5:00 AM', type: 'task', title: 'Early Morning Check', desc: 'East corridor maintenance light repair confirmed — light replaced overnight.' },
          { time: '7:55 AM', type: 'clock_out', desc: 'Shift ended. 1 noise complaint (resolved). Tow completed. 4 packages awaiting pickup.' },
        ],
      },
    ],
    '2026-06-04': [
      {
        id: 'sh-0604-day', type: 'Day', staff: 'George Nwachukwu', company: 'Greystar',
        startTime: '8:00 AM', endTime: '5:00 PM', status: 'completed',
        tasksCompleted: 8, totalTasks: 8, incidentCount: 0, packagesIn: 8, packagesOut: 6,
        activities: [
          { time: '8:01 AM', type: 'clock_in', desc: 'Clocked in. Marcus handoff: tow completed, 1 noise complaint resolved, 4 packages awaiting. East corridor light fixed.' },
          { time: '8:20 AM', type: 'task', title: 'Lobby Opening Check', desc: 'Lobby operational. East corridor light confirmed replaced. All systems normal.' },
          { time: '8:45 AM', type: 'task', title: 'Package Room Audit', desc: '4 overnight from Marcus + 0 new. Total 4 awaiting. All under 2 days. Audit complete.' },
          { time: '9:00 AM', type: 'package_in', carrier: 'UPS', unit: '614', count: 2, storage: 'Luxer Locker', desc: '2 UPS packages for Unit 614.' },
          { time: '9:30 AM', type: 'package_in', carrier: 'FedEx', unit: '310', count: 1, storage: 'Luxer Locker', desc: 'FedEx for Unit 310.' },
          { time: '9:45 AM', type: 'task', title: 'Parking Garage Patrol – P1 & P2', desc: 'Both levels clear. P2 gate: maintenance tech arrived at 9:50am, gate repaired and operating normally by 10:30am. Ticket closed.' },
          { time: '10:15 AM', type: 'visitor', name: 'Comfort Systems Inc. (3 technicians)', purpose: 'HVAC Preventive Maintenance – Work Order WO-2026-0492', verified: true, desc: 'All 3 technicians: T. Harris, R. Patel, C. Morris. Company IDs and work order verified. Escorted to Mechanical Room B2. Temp access badges issued (Badge #11, 12, 13).' },
          { time: '10:45 AM', type: 'task', title: 'Amenity Inspection', desc: 'Pool: gate locked, water balanced and clear, safety ring and first aid present. Gym: all equipment operational, floor clean. Rooftop: secured, no hazards.' },
          { time: '11:30 AM', type: 'package_in', carrier: 'Amazon', unit: '912', count: 2, storage: 'Package Room', desc: '2 Amazon for Unit 912. Luxer at capacity — overflow to package room.' },
          { time: '12:00 PM', type: 'package_out', resident: 'Unit 912 Resident', unit: '912', count: 3, pickupType: 'resident', desc: 'Unit 912 picked up all 3 packages (2 new + 1 from yesterday). Cleared backlog.' },
          { time: '1:00 PM', type: 'package_in', carrier: 'USPS', unit: '1106', count: 3, storage: 'Package Room', desc: '3 USPS packages for Unit 1106.' },
          { time: '2:00 PM', type: 'package_out', resident: 'Unit 614 Resident', unit: '614', count: 2, pickupType: 'resident', desc: '2 UPS packages picked up by Unit 614.' },
          { time: '3:00 PM', type: 'note', desc: 'HVAC maintenance completed. T. Harris, R. Patel, C. Morris escorted out. All 3 temp badges (11, 12, 13) collected. Mechanical Room B2 re-secured. Work order WO-2026-0492 signed.' },
          { time: '3:30 PM', type: 'package_out', resident: 'Unit 310 Resident', unit: '310', count: 1, pickupType: 'resident', desc: 'FedEx package picked up by Unit 310.' },
          { time: '4:00 PM', type: 'package_out', resident: 'Unit 1412 Resident', unit: '1412', count: 1, pickupType: 'resident', desc: 'Unit 1412 picked up UPS package.' },
          { time: '4:45 PM', type: 'task', title: 'Shift Handoff Report', desc: 'DAR submitted. HVAC maintenance complete, no issues. P2 gate repaired. 8 in, 7 out. 4 remaining (310, 1106 × 3). No incidents.' },
          { time: '5:00 PM', type: 'clock_out', desc: 'Handed off to Lisa R. (Maverick). Great day.' },
        ],
      },
      {
        id: 'sh-0604-night', type: 'Night', staff: 'Lisa R.', company: 'Maverick',
        startTime: '5:00 PM', endTime: '8:00 AM', status: 'completed',
        tasksCompleted: 4, totalTasks: 4, incidentCount: 0, packagesIn: 2, packagesOut: 3,
        activities: [
          { time: '5:00 PM', type: 'clock_in', desc: 'Clocked in. George handoff: HVAC done, P2 gate fixed, 4 packages remaining.' },
          { time: '6:30 PM', type: 'food', carrier: 'Uber Eats', unit: '1204', desc: 'Food delivery Unit 1204. Resident retrieved within 2 minutes.' },
          { time: '7:15 PM', type: 'package_in', carrier: 'Amazon', unit: '802', count: 1, storage: 'Luxer Locker', desc: 'Amazon for Unit 802.' },
          { time: '7:30 PM', type: 'package_out', resident: 'Unit 1106 Resident', unit: '1106', count: 3, pickupType: 'resident', desc: '1106 resident picked up all 3 USPS packages.' },
          { time: '8:00 PM', type: 'package_in', carrier: 'FedEx', unit: '608', count: 1, storage: 'Package Room', desc: 'Late FedEx for Unit 608.' },
          { time: '9:00 PM', type: 'visitor', name: 'Alex Park', purpose: 'Guest of Unit 1204', verified: true, desc: 'Evening guest for Unit 1204. Resident confirmed.' },
          { time: '11:30 PM', type: 'package_out', resident: 'Unit 802 Resident', unit: '802', count: 1, pickupType: 'resident', desc: '802 resident retrieved late Amazon package.' },
          { time: '11:45 PM', type: 'package_out', resident: 'Unit 310 Resident', unit: '310', count: 1, pickupType: 'resident', desc: '310 resident picked up package.' },
          { time: '2:00 AM', type: 'task', title: 'Overnight Perimeter Check', desc: 'All quiet. Building secure.' },
          { time: '7:58 AM', type: 'clock_out', desc: 'Shift ended. 1 package remaining (608). Quiet night.' },
        ],
      },
    ],
    '2026-06-05': [
      {
        id: 'sh-0605-day', type: 'Day', staff: 'George Nwachukwu', company: 'Greystar',
        startTime: '8:00 AM', endTime: '5:00 PM', status: 'completed',
        tasksCompleted: 8, totalTasks: 8, incidentCount: 1, packagesIn: 9, packagesOut: 8,
        activities: [
          { time: '8:02 AM', type: 'clock_in', desc: 'Clocked in. Lisa handoff: quiet night, 1 package outstanding (608).' },
          { time: '8:25 AM', type: 'task', title: 'Lobby Opening Check', desc: 'Lobby operational. Pool deck furniture needs straightening — corrected before opening.' },
          { time: '8:50 AM', type: 'task', title: 'Package Room Audit', desc: '1 remaining (608) + 3 overnight. Total 4 awaiting. All under 2 days.' },
          { time: '9:10 AM', type: 'package_in', carrier: 'UPS', unit: '714', count: 2, storage: 'Luxer Locker', desc: '2 UPS for Unit 714.' },
          { time: '9:40 AM', type: 'package_in', carrier: 'Amazon', unit: '412', count: 3, storage: 'Package Room', desc: '3 Amazon for Unit 412. Luxer at capacity — overflow to package room.' },
          { time: '10:00 AM', type: 'task', title: 'Garage Patrol – P1 & P2', desc: 'Both levels clear. P2 gate operating perfectly since repair.' },
          { time: '10:45 AM', type: 'task', title: 'Amenity Inspection', desc: 'Pool: broken deck chair found — chair secured with caution tape, maintenance ticket #MT-0605-01 submitted, photo taken. Gym and rooftop clear.' },
          { time: '11:00 AM', type: 'visitor', name: 'Rachel Torres', purpose: 'Leasing Tour – Prospective Resident', verified: true, desc: 'Prospective resident shown Units 508 and 612 by leasing agent. ID verified and logged. Tour completed 12:00pm.' },
          { time: '11:30 AM', type: 'package_out', resident: 'Unit 310 Resident', unit: '310', count: 1, pickupType: 'resident', desc: 'Unit 310 picked up package.' },
          { time: '12:00 PM', type: 'food', carrier: 'GrubHub', unit: '714', desc: 'Food delivery Unit 714. Called resident — picked up in 3 minutes.' },
          { time: '12:30 PM', type: 'package_out', resident: 'Alex K. (for Unit 802)', unit: '802', count: 2, pickupType: 'third_party', thirdPartyName: 'Alex K.', relation: 'Housemate', idVerified: true, desc: 'Third-party pickup for Unit 802. Alex K. identified as housemate. Photo ID verified (PA DL ending 8821). Resident pre-authorized via text (screenshot filed). 2 packages released.' },
          { time: '1:15 PM', type: 'package_in', carrier: 'USPS', unit: '1412', count: 4, storage: 'Package Room', desc: '4 USPS packages for Unit 1412. Package room (Luxer full).' },
          { time: '2:00 PM', type: 'package_out', resident: 'Unit 714 Resident', unit: '714', count: 2, pickupType: 'resident', desc: '2 UPS packages picked up.' },
          { time: '2:45 PM', type: 'incident', title: 'Pool Deck – Broken Furniture', desc: 'Broken deck chair (back support snapped). Chair cordoned off with caution tape, moved to pool equipment room. Maintenance ticket #MT-0605-01 submitted. Photo archived. Area safe — no injury.' },
          { time: '3:00 PM', type: 'loaner_out', item: 'Luggage Cart #1', resident: 'Jordan Lee', unit: '1204', desc: 'Cart #1 checked out to Unit 1204. Resident has IKEA delivery arriving.' },
          { time: '3:30 PM', type: 'package_out', resident: 'Unit 412 Resident', unit: '412', count: 3, pickupType: 'resident', desc: '3 Amazon packages picked up by 412 resident.' },
          { time: '4:00 PM', type: 'loaner_in', item: 'Luggage Cart #1', resident: 'Jordan Lee', unit: '1204', desc: 'Cart #1 returned in good condition.' },
          { time: '4:15 PM', type: 'package_out', resident: 'Unit 608 Resident', unit: '608', count: 1, pickupType: 'resident', desc: 'Unit 608 FedEx package (from yesterday) picked up.' },
          { time: '4:45 PM', type: 'task', title: 'Shift Handoff Report', desc: 'DAR submitted. 1 incident: broken pool chair removed, maintenance ticket open. 9 in, 9 out. 5 remaining (1412 × 4, 412 carry). Third-party pickup documented. All loaners returned.' },
          { time: '5:00 PM', type: 'clock_out', desc: 'Handed off to Derek H. (Maverick).' },
        ],
      },
      {
        id: 'sh-0605-night', type: 'Night', staff: 'Derek H.', company: 'Maverick',
        startTime: '5:00 PM', endTime: '8:00 AM', status: 'completed',
        tasksCompleted: 4, totalTasks: 4, incidentCount: 0, packagesIn: 1, packagesOut: 0,
        activities: [
          { time: '5:00 PM', type: 'clock_in', desc: 'Clocked in. George handoff: pool chair incident, 5 packages awaiting, maintenance ticket open.' },
          { time: '6:45 PM', type: 'note', desc: 'Maintenance confirmed pool deck chair will be replaced Saturday. Pool area otherwise fully operational.' },
          { time: '7:00 PM', type: 'package_in', carrier: 'Amazon', unit: '912', count: 1, storage: 'Package Room', desc: 'Late Amazon for Unit 912.' },
          { time: '9:30 PM', type: 'visitor', name: 'Michael T.', purpose: 'Guest of Unit 614', verified: true, desc: 'Evening guest. ID verified. Unit 614 confirmed.' },
          { time: '11:00 PM', type: 'note', desc: 'Quiet hours. Lobby clear. 6 packages now awaiting pickup (added 1 this shift).' },
          { time: '3:00 AM', type: 'task', title: 'Overnight Perimeter Check', desc: 'All floors quiet. Building secure. P1, P2 clear.' },
          { time: '6:30 AM', type: 'task', title: 'Morning Lobby Prep', desc: 'Lobby ready for day shift. Maintenance team confirmed deck chair replacement today.' },
          { time: '7:55 AM', type: 'clock_out', desc: 'Shift ended. Quiet night. 6 packages awaiting.' },
        ],
      },
    ],
    '2026-06-06': [
      {
        id: 'sh-0606-day', type: 'Day', staff: 'George Nwachukwu', company: 'Greystar',
        startTime: '8:00 AM', endTime: '5:00 PM', status: 'completed',
        tasksCompleted: 8, totalTasks: 8, incidentCount: 0, packagesIn: 5, packagesOut: 9,
        activities: [
          { time: '8:01 AM', type: 'clock_in', desc: 'Saturday shift. Derek handoff: 6 packages outstanding, pool chair being replaced today.' },
          { time: '8:20 AM', type: 'task', title: 'Lobby Opening Check', desc: 'Lobby ready. Expecting higher weekend foot traffic.' },
          { time: '8:45 AM', type: 'task', title: 'Package Room Audit', desc: '6 packages remaining. Package for Unit 1412 now 3 days — flagged with orange sticker, leasing notified (weekend — left voicemail).' },
          { time: '9:00 AM', type: 'package_in', carrier: 'UPS', unit: '310', count: 2, storage: 'Luxer Locker', desc: 'Saturday UPS delivery — 2 packages Unit 310.' },
          { time: '9:30 AM', type: 'task', title: 'Amenity Inspection', desc: 'Pool: new deck chair installed by maintenance — area fully clear and safe. Gym operational. Rooftop furniture secured from overnight.' },
          { time: '10:00 AM', type: 'package_out', resident: 'Unit 1412 Resident', unit: '1412', count: 4, pickupType: 'resident', desc: '1412 resident picked up all 4 flagged packages. Cleared backlog. Flag removed.' },
          { time: '10:30 AM', type: 'package_out', resident: 'Unit 912 Resident', unit: '912', count: 1, pickupType: 'resident', desc: 'Unit 912 picked up Amazon package.' },
          { time: '11:00 AM', type: 'visitor', name: 'Pool guests (party of 4)', purpose: 'Pool – Guests of Unit 802', verified: true, desc: '4 guests signed in for pool use with Unit 802. Resident accompanied group. All 4 IDs verified and logged.' },
          { time: '11:30 AM', type: 'package_in', carrier: 'Amazon', unit: '614', count: 2, storage: 'Luxer Locker', desc: '2 Amazon packages for Unit 614.' },
          { time: '12:15 PM', type: 'loaner_out', item: 'Luggage Cart #2', resident: 'Maria S.', unit: '1106', desc: 'Cart #2 checked out — resident moving items to storage unit.' },
          { time: '1:00 PM', type: 'package_out', resident: 'Unit 310 Resident', unit: '310', count: 2, pickupType: 'resident', desc: '2 UPS packages picked up.' },
          { time: '1:30 PM', type: 'package_in', carrier: 'FedEx', unit: '412', count: 1, storage: 'Luxer Locker', desc: 'Saturday FedEx for Unit 412.' },
          { time: '2:00 PM', type: 'loaner_in', item: 'Luggage Cart #2', resident: 'Maria S.', unit: '1106', desc: 'Cart #2 returned in good condition.' },
          { time: '2:30 PM', type: 'package_out', resident: 'Unit 614 Resident', unit: '614', count: 2, pickupType: 'resident', desc: '2 Amazon packages picked up.' },
          { time: '3:00 PM', type: 'package_out', resident: 'Unit 412 Resident', unit: '412', count: 1, pickupType: 'resident', desc: 'FedEx package picked up.' },
          { time: '3:30 PM', type: 'package_out', resident: 'Unit 310 Resident', unit: '310', count: 1, pickupType: 'resident', desc: '1 remaining package picked up.' },
          { time: '4:00 PM', type: 'task', title: 'Afternoon Exterior Walk', desc: 'Pool patio area clear after heavy use. Furniture rearranged to standard positions. Trash corrals closed. Building exterior clean.' },
          { time: '4:45 PM', type: 'task', title: 'Shift Handoff Report', desc: 'DAR submitted. Active Saturday. Pool deck chair replaced. All carts returned. 5 in, 10 out. 1 remaining (small package Unit 310). No incidents.' },
          { time: '5:00 PM', type: 'clock_out', desc: 'Handed off to Kevin T. Saturday evening — amenity use until 11pm tonight.' },
        ],
      },
      {
        id: 'sh-0606-night', type: 'Night', staff: 'Kevin T.', company: 'Maverick',
        startTime: '5:00 PM', endTime: '8:00 AM', status: 'completed',
        tasksCompleted: 5, totalTasks: 5, incidentCount: 0, packagesIn: 0, packagesOut: 1,
        activities: [
          { time: '5:00 PM', type: 'clock_in', desc: 'Clocked in for Saturday night. George noted heavy pool traffic, 1 package remaining.' },
          { time: '7:00 PM', type: 'visitor', name: 'Party of 3', purpose: 'Rooftop – Guests of Unit 1204', verified: true, desc: 'Evening rooftop guests for Unit 1204. Resident accompanied. Reminded of 11pm close time.' },
          { time: '9:00 PM', type: 'package_out', resident: 'Unit 310 Resident', unit: '310', count: 1, pickupType: 'resident', desc: 'Last remaining package picked up. Package room now empty.' },
          { time: '11:00 PM', type: 'note', desc: 'Rooftop cleared at 11pm per Saturday policy. All guests departed peacefully. Building transitioning to quiet mode.' },
          { time: '11:30 PM', type: 'note', desc: 'Quiet hours in effect. Lobby clear. Building calm after busy Saturday.' },
          { time: '3:30 AM', type: 'task', title: 'Overnight Perimeter Check', desc: 'All floors quiet. P1, P2 secure. No packages awaiting — clean slate.' },
          { time: '6:00 AM', type: 'task', title: 'Early Morning Patrol', desc: 'Building quiet. Sunday morning — light foot traffic expected.' },
          { time: '7:30 AM', type: 'task', title: 'Lobby Prep', desc: 'Lobby ready for day shift. No packages, no open items.' },
          { time: '7:58 AM', type: 'clock_out', desc: 'Shift ended. Quiet Saturday night. No packages outstanding. Clean handoff.' },
        ],
      },
    ],
    '2026-06-07': [
      {
        id: 'sh-0607-day', type: 'Day', staff: 'George Nwachukwu', company: 'Greystar',
        startTime: '8:00 AM', endTime: '5:00 PM', status: 'completed',
        tasksCompleted: 8, totalTasks: 8, incidentCount: 1, packagesIn: 6, packagesOut: 5,
        activities: [
          { time: '8:00 AM', type: 'clock_in', desc: 'Sunday shift. Kevin handoff: clean slate — no packages, no open items. Good night.' },
          { time: '8:15 AM', type: 'task', title: 'Lobby Opening Check', desc: 'Lobby clean. Quiet Sunday morning.' },
          { time: '8:40 AM', type: 'task', title: 'Package Room Audit', desc: '2 overnight packages (arrived before 6am). Both under 24hrs. All clear.' },
          { time: '9:00 AM', type: 'package_in', carrier: 'Amazon', unit: '802', count: 3, storage: 'Luxer Locker', desc: 'Sunday Amazon delivery — 3 packages for Unit 802.' },
          { time: '9:30 AM', type: 'task', title: 'Garage Patrol – P1 & P2', desc: 'Both levels clear. Gates operating normally.' },
          { time: '10:00 AM', type: 'task', title: 'Amenity Inspection', desc: 'Pool gate locked, water clear. New deck chair confirmed in place and secure. Gym clean. Rooftop secured from Saturday.' },
          { time: '11:00 AM', type: 'package_out', resident: 'Unit 802 Resident', unit: '802', count: 3, pickupType: 'resident', desc: 'Unit 802 picked up all 3 Amazon packages.' },
          { time: '11:30 AM', type: 'package_in', carrier: 'FedEx', unit: '1106', count: 2, storage: 'Package Room', desc: 'Sunday FedEx for Unit 1106. Package room.' },
          { time: '12:00 PM', type: 'food', carrier: 'Uber Eats', unit: '412', desc: 'Sunday food delivery Unit 412. Resident in lobby in under 2 minutes.' },
          { time: '12:45 PM', type: 'loaner_out', item: 'Luggage Cart #1', resident: 'Unit 524 Resident', unit: '524', desc: 'Cart #1 checked out for furniture delivery (couch).' },
          { time: '1:30 PM', type: 'package_out', resident: 'Unit 1106 Resident', unit: '1106', count: 2, pickupType: 'resident', desc: '2 FedEx packages picked up.' },
          { time: '1:45 PM', type: 'incident', title: 'Loading Zone Violation', desc: 'Non-resident delivery truck (Furniture Warehouse) blocking loading dock for 45+ minutes while unloading couch for Unit 524. Loading zone limit is 30 minutes. Driver contacted — explained policy. Unloading completed by 2:00pm, vehicle moved. Photo taken. Documented per SOP.' },
          { time: '2:00 PM', type: 'loaner_in', item: 'Luggage Cart #1', resident: 'Unit 524 Resident', unit: '524', desc: 'Cart #1 returned in good condition after furniture delivery.' },
          { time: '3:00 PM', type: 'package_in', carrier: 'UPS', unit: '714', count: 1, storage: 'Luxer Locker', desc: 'Sunday UPS for Unit 714.' },
          { time: '3:30 PM', type: 'task', title: 'Afternoon Exterior Walk', desc: 'Exterior in order. Loading dock clear. Patio clean and organized.' },
          { time: '4:00 PM', type: 'package_out', resident: 'Unit 714 Resident', unit: '714', count: 1, pickupType: 'resident', desc: 'Package picked up.' },
          { time: '4:45 PM', type: 'task', title: 'Shift Handoff Report', desc: 'DAR submitted. 1 incident: loading zone violation (resolved). 6 in, 5 out. 4 remaining. Cart #1 returned.' },
          { time: '5:00 PM', type: 'clock_out', desc: 'Handed off to Marcus D. 4 packages awaiting pickup.' },
        ],
      },
      {
        id: 'sh-0607-night', type: 'Night', staff: 'Marcus D.', company: 'Maverick',
        startTime: '5:00 PM', endTime: '8:00 AM', status: 'completed',
        tasksCompleted: 5, totalTasks: 6, incidentCount: 2, packagesIn: 3, packagesOut: 0,
        activities: [
          { time: '5:02 PM', type: 'clock_in', desc: 'Clocked in. George handoff: 4 packages outstanding, 1 incident (loading zone, resolved).' },
          { time: '6:30 PM', type: 'package_in', carrier: 'Amazon', unit: '524', count: 2, storage: 'Package Room', desc: '2 Amazon packages for Unit 524.' },
          { time: '7:45 PM', type: 'visitor', name: 'Sarah L.', purpose: 'Guest of Unit 412', verified: true, desc: 'Evening visitor. ID verified. 412 resident confirmed.' },
          { time: '8:00 PM', type: 'package_in', carrier: 'DHL', unit: '1204', count: 1, storage: 'Luxer Locker', desc: 'DHL Sunday delivery for Unit 1204.' },
          { time: '9:30 PM', type: 'incident', title: 'Unauthorized Access Attempt', desc: 'Individual attempted to tailgate through main entrance behind departing resident. Approached and asked to provide resident name and unit number — could not provide. Calmly denied access and explained policy. Individual left without incident. Documented with time, description, direction of departure. Non-emergency police not called (person left peacefully). Per SOP.' },
          { time: '10:30 PM', type: 'incident', title: 'Noise Complaint – Floor 9', desc: 'Resident from Unit 914 called front desk again: noise from Unit 912. Called Unit 912 — no answer. Went to floor 9 (did not enter unit — knocked only). Noise stopped within 2 minutes of knock. Resident 914 confirmed resolution. Documented. Second offense this week — noted for property manager.' },
          { time: '11:00 PM', type: 'note', desc: 'Both incidents documented. Flagged Unit 912 pattern (second noise complaint in 5 days) for Sarah Thompson review.' },
          { time: '1:00 AM', type: 'package_in', carrier: 'Amazon', unit: '310', count: 1, storage: 'Package Room', desc: 'Late-night Amazon left at entrance — moved to package room. Unit 310.' },
          { time: '3:00 AM', type: 'task', title: 'Overnight Perimeter Check', desc: 'Building secure. P1 clear. P2 gate operating normally. Unauthorized access incident documented.' },
          { time: '4:00 AM', type: 'note', desc: 'NOTE: Missed 2am fire door check — was responding to floor 9 noise complaint at that time. Documented the miss. Flagged in handoff for George.' },
          { time: '7:55 AM', type: 'clock_out', desc: 'Shift ended. 2 incidents (unauthorized access, noise — Unit 912 second offense). 7 packages awaiting pickup. 1 task missed (fire door check, documented). Handoff to George.' },
        ],
      },
    ],
    '2026-06-08': [
      {
        id: 'sh-0608-day', type: 'Day', staff: 'George Nwachukwu', company: 'Greystar',
        startTime: '8:00 AM', endTime: '5:00 PM', status: 'in_progress',
        tasksCompleted: 3, totalTasks: 8, incidentCount: 0, packagesIn: 2, packagesOut: 0,
        activities: [
          { time: '8:00 AM', type: 'clock_in', desc: 'Clocked in. Read Marcus handoff: 2 incidents (unauthorized access, noise Unit 912 second offense), 7 packages awaiting, missed fire door check documented.' },
          { time: '8:25 AM', type: 'task', title: 'Lobby Opening Check', desc: 'Lobby operational. All systems running normally.' },
          { time: '8:50 AM', type: 'task', title: 'Package Room Audit', desc: '7 packages outstanding. Auditing now. Unit 524 × 2 (1 day), Unit 1204 × 1 DHL (1 day), Unit 310 × 1 late night. Flags: none 3+ days yet.' },
          { time: '9:20 AM', type: 'package_in', carrier: 'UPS', unit: '1412', count: 2, storage: 'Luxer Locker', desc: '2 UPS packages for Unit 1412.' },
          { time: '9:45 AM', type: 'task', title: 'Garage Patrol – P1 & P2', desc: 'Both levels clear. No unauthorized vehicles. Gates operating normally.' },
        ],
      },
    ],
  },
};
