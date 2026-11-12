/* The Noted assistant's understanding, with no screen attached so it can be tested on its own.

   Cheapest first: the usual requests ("2 UPS boxes for 4B", "who lives in 312", "noise complaint on 7",
   "what did the last shift leave open", "open packages") and every emergency are worked out here in the
   app, instantly and free. Only what this can't understand goes to /api/assistant.

   Doing something for someone always runs the same way: the assistant asks what's missing one question
   at a time (with taps for the usual answers and a skip where the detail is optional), then shows a
   Ready to save card. Nothing is saved until the person taps Save, and then it is saved exactly the way
   the app's own forms save it, so it lands in the same Daily Activity Report. */

export const ASSISTANT_DEFAULT_NAME = 'Noted Assistant';

export const INCIDENT_TYPES = [
  ['noise', 'Noise Complaint'], ['unauthorized', 'Unauthorized Access'], ['parking', 'Parking Violation'],
  ['maintenance', 'Facility Issue'], ['disturbance', 'Disturbance / Altercation'], ['package', 'Package Issue'],
  ['utility', 'Utility / Power'], ['other', 'Other'],
];
export const SEVERITIES = [['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['critical', 'Critical']];
export const CARRIERS = ['Amazon', 'UPS', 'FedEx', 'USPS', 'DHL'];
const incidentLabel = id => (INCIDENT_TYPES.find(([k]) => k === id) || [])[1] || 'Incident';

/* ---- Small readers for what people type or say ---- */
const clip = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);
const cap = s => { const t = clip(s, 600); return t ? t.charAt(0).toUpperCase() + t.slice(1) : ''; };
const STOP = new Set('a an and are at be can could do does find for from get give go her here him his i in is it its me my of on open or our please pull see show tell that the their them this to up us want we what when where which who will with you your look looking need unit apt apartment resident lives live'.split(' '));
export const words = s => String(s || '').toLowerCase().replace(/[’']/g, '').split(/[^a-z0-9]+/).filter(w => w.length > 1 && !STOP.has(w));
export const noneSaid = s => /^(no|none|nope|nothing|n\/a|na|skip|i don.?t know|don.?t know|not sure|no one|nobody)\b/i.test(String(s || '').trim());

/* Times in plain words: "3pm", "15:30", "noon" → ['15:00']. A bare hour is read the way a desk means it:
   7 to 11 in the morning, 1 to 6 in the afternoon. */
export function readTimes(text) {
  const s = String(text || '').toLowerCase().replace(/\b(unit|apt|apartment|floor|level|suite|#)\s*\d+\w?/g, ' ').replace(/\b(\d+)\s*(times?|x|hours?|hrs?|minutes?|mins?|days?|weeks?|packages?|pkgs?|boxes|box|parcels?|people|guests?)\b/g, ' ');
  const out = [], add = (h, m) => { if (h >= 0 && h < 24 && m >= 0 && m < 60) out.push(String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0')); };
  for (const x of s.matchAll(/\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?|o.?clock)?(?![\d/.\w])/g)) {
    let h = Number(x[1]); const m = Number(x[2] || 0), ap = (x[3] || '')[0];
    if (!ap && !x[2]) continue; // a bare number is more likely a unit or a count than a time
    if (h > 23 || (ap && ap !== 'o' && (h < 1 || h > 12))) continue;
    if (ap === 'p' && h < 12) h += 12; else if (ap === 'a' && h === 12) h = 0; else if (ap === 'o' && h >= 1 && h <= 6) h += 12;
    add(h, m);
  }
  for (const [re, t] of [[/\bnoon|lunch\b/, '12:00'], [/\bmidnight\b/, '00:00'], [/\bend of (my |the )?shift\b/, '']]) if (re.test(s) && t) out.push(t);
  return [...new Set(out)].sort();
}
export function clockText(t) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(t || '')); if (!m) return String(t || '');
  const h = Number(m[1]); return `${h % 12 || 12}:${m[2]} ${h < 12 ? 'AM' : 'PM'}`;
}
/* "2 boxes", "three packages", "a package" → 2, 3, 1. */
export function readCount(text) {
  const s = String(text || '').toLowerCase(), names = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, couple: 2 };
  const m = s.match(/\b(\d{1,2}|a|an|one|two|three|four|five|six|seven|eight|nine|ten|couple(?: of)?)\s+(?:\w+\s+)?(?:packages?|pkgs?|boxes|box|parcels?|envelopes?|bags?|deliver(?:y|ies)|items?)\b/);
  if (!m) return 0;
  const n = /^\d/.test(m[1]) ? Number(m[1]) : names[m[1].split(' ')[0]];
  return n >= 1 && n <= 99 ? n : 0;
}
export function readCarrier(text) {
  const s = String(text || '').toLowerCase();
  for (const [re, name] of [[/\bamazon|amzn\b/, 'Amazon'], [/\bups\b/, 'UPS'], [/\bfed ?ex\b/, 'FedEx'], [/\busps|postal|post office|mail ?(man|carrier)\b/, 'USPS'], [/\bdhl\b/, 'DHL'], [/\bdoor ?dash\b/, 'DoorDash'], [/\buber ?eats\b/, 'Uber Eats'], [/\binstacart\b/, 'Instacart'], [/\bflorist|flowers\b/, 'Florist'], [/\bcourier\b/, 'Courier']]) if (re.test(s)) return name;
  return '';
}
/* A unit as people say it: "unit 312", "apt 4B", "#1204", "for 4B", "in 715". Matched against the residents
   directory when there is one, so "12" isn't mistaken for a unit just because it's a number. */
export function readUnit(text, residents = []) {
  const s = String(text || ''), known = new Map(residents.filter(r => r && r.unit).map(r => [String(r.unit).toLowerCase(), r]));
  const tagged = s.match(/(?:\b(?:unit|apt\.?|apartment|suite|ste\.?|room)\s*#?\s*|#)([a-z]?\d{1,5}[a-z]?|ph\s?\d{0,3})\b/i);
  if (tagged) return tagged[1].replace(/\s+/g, '').toUpperCase();
  for (const m of s.matchAll(/\b(\d{1,5}[a-z]?|[a-z]\d{1,4}|ph\d{0,3})\b/gi)) {
    const u = m[1].toLowerCase(), before = s.slice(Math.max(0, m.index - 14), m.index).toLowerCase(), after = s.slice(m.index + m[1].length, m.index + m[1].length + 12).toLowerCase();
    if (/^\s*(packages?|pkgs?|boxes|box|parcels?|am\b|pm\b|a\.m|p\.m|:|minutes?|mins?|hours?|people|guests?|times?|floors?|th floor|days?)/.test(after)) continue;
    if (known.has(u)) return String(known.get(u).unit).toUpperCase();
    if (/\b(for|to|in|at|from|of|→)\s*$/.test(before) && (/\d{3,}/.test(u) || /[a-z]/.test(u))) return m[1].toUpperCase();
  }
  return '';
}
export const residentForUnit = (unit, residents = []) => residents.find(r => String(r.unit || '').toLowerCase() === String(unit || '').toLowerCase()) || null;
export function residentByName(text, residents = []) {
  const want = words(text);
  if (!want.length) return null;
  let best = null, top = 0;
  for (const r of residents) {
    const name = words(r.name); let score = 0;
    for (const w of want) if (name.some(n => n === w || (w.length > 3 && n.startsWith(w)))) score += 1;
    if (score > top) { top = score; best = r; }
  }
  return best;
}
/* "in the garage", "on the 4th floor", "by the loading dock": where something happened, when they already said it. */
const AREAS = /\b(?:(?:parking )?garage|lobby|pool(?: deck)?|gym|fitness (?:center|room)|mail ?room|package room|loading dock|roof(?:top)?(?: deck)?|courtyard|stairwell|stairs|hallway|elevator|leasing office|front (?:desk|door|entrance)|back (?:door|entrance)|entrance|parking lot|laundry(?: room)?|trash room|clubhouse|lounge|basement|dog park|bike room|storage(?: room)?)\b/i;
export function readArea(text) {
  const s = String(text || '');
  const floor = s.match(/\b(\d{1,2})(?:st|nd|rd|th) floor\b/i) || s.match(/\bfloor (\d{1,2})\b/i);
  const area = s.match(AREAS);
  const out = [area && area[0].toLowerCase(), floor && `floor ${floor[1]}`].filter(Boolean).join(', ');
  return out ? out[0].toUpperCase() + out.slice(1) : '';
}

export function incidentKind(text) {
  const s = String(text || '').toLowerCase();
  for (const [k, re] of [
    ['noise', /\bnois[ey]|loud|music|party|bass|shouting|yelling\b/],
    ['unauthorized', /\bunauthori[sz]ed|trespass|tailgat|break[- ]?in|broke in|intruder|suspicious (person|man|woman|individual)|not a resident|refus\w+ to leave|loiter/],
    ['parking', /\bpark(ed|ing)|vehicle|car\b|tow|garage space|blocking (the )?(drive|ramp|entrance)/],
    ['utility', /\bpower (is )?(out|outage)|outage|water leak|leak(ing)?|flood|pipe|burst|gas smell|elevator|no (hot )?water|sprinkler/],
    ['disturbance', /\balterc|fight|argument|aggress|threat|harass|drunk|intoxicat|domestic|assault/],
    ['package', /\b(missing|stolen|damaged|lost|wrong|misdelivered|open(ed)?) (package|parcel|box|delivery)|package (is |was )?(missing|stolen|damaged|lost)|theft/],
    ['maintenance', /\bbroken|damage|not working|out of order|malfunction|hazard|spill|glass|door (won.?t|doesn.?t) (close|lock|open)|light (is )?out|hvac|a\/c\b/],
  ]) if (re.test(s)) return k;
  return '';
}
export function categoryFor(text) {
  const s = String(text || '').toLowerCase();
  if (/\brounds?|patrol|security|walk(ed)? (the )?(garage|floors?|perimeter|building)|lock(ed)? up|door check|camera/.test(s)) return 'Safety / Security';
  if (/\bpackage|parcel|delivery|courier|carrier\b/.test(s)) return 'Delivery';
  if (/\bvendor|contractor|plumber|electrician|technician|hvac\b/.test(s)) return 'Vendor / Contractor';
  if (/\bpool|gym|fitness|rooftop|club ?room|amenit|lounge|grill|business center/.test(s)) return 'Amenity';
  if (/\bclean|spill|trash|wipe|mop|vacuum|tidy/.test(s)) return 'Cleaning';
  if (/\brepair|maintenance|work order|light bulb|leak|broken|fix(ed)?\b/.test(s)) return 'Maintenance';
  if (/\bresident|guest|visitor|helped|assist|tenant|unit\b/.test(s)) return 'Resident Assist';
  return 'Administrative';
}

/* ---- Emergencies: caught before anything else, answered only with what to do first ---- */
export const EMERGENCY = /\b(fire|smoke|flames?|burning|gas (smell|leak)|smell(s)? (of )?gas|carbon monoxide|not breathing|unconscious|unresponsive|collapsed|heart attack|chest pain|stroke|seizure|overdose|bleeding (badly|heavily|a lot)|choking|gun|weapon|knife|shots?( fired)?|shooting|stab(bed|bing)?|being attacked|assault(ed|ing)?|active shooter|bomb|trapped in (the )?elevator|stuck in (the )?elevator|someone (is )?(drowning|hurt badly))\b/i;
const HOW_TO = /\b(how (do|should|would|can) (i|we)|how to|what(.?s| is) the (procedure|protocol|policy|process|rule|sop)|what (do|should) (i|we) do|procedure for|protocol for|steps for|am i (allowed|supposed)|can i (let|release|give))\b/i;

/* The standard professional front-desk steps, in plain words. The property's own SOPs always come first;
   these are the fallback every desk can rely on. Nothing here is specific to one building. */
export const PROTOCOLS = [
  { id: 'fire', match: /\bfire|smoke|alarm|burning\b/i, title: 'Fire or smoke', emergency: true, incident: 'utility', steps: ['Call 911 now and give the building address.', 'Pull the nearest alarm station if it is not already sounding.', 'Stairs only. No one uses the elevators.', 'Guide residents to the assembly point named in the property’s emergency plan.', 'Meet the fire department at the main entrance and give them access.', 'Call the property manager, then file an incident report once everyone is safe.'] },
  { id: 'medical', match: /\bmedical|unconscious|unresponsive|not breathing|collapsed|heart|chest pain|stroke|seizure|overdose|bleeding|choking|hurt\b/i, title: 'Medical emergency', emergency: true, incident: 'other', steps: ['Call 911 now and give the building address and where the person is.', 'Stay with the person. Do not move them unless they are in danger.', 'Send someone to the entrance to bring the paramedics straight up.', 'If you are trained and there is an AED on site, use it.', 'Call the property manager, then file an incident report after EMS leaves.'] },
  { id: 'violence', match: /\bgun|weapon|knife|shots?|shooting|stab|attack|assault|threat|active shooter|bomb\b/i, title: 'Violence or a weapon', emergency: true, incident: 'disturbance', steps: ['Get yourself somewhere safe first. Do not confront anyone.', 'Call 911 now.', 'Keep residents away from the area if you can do it safely.', 'Call the property manager, then file an incident report with times and descriptions.'] },
  { id: 'gas', match: /\bgas|carbon monoxide\b/i, title: 'Gas smell', emergency: true, incident: 'utility', steps: ['Leave the area. Do not use light switches, elevators or anything that sparks.', 'Call 911 and the gas utility from outside or from the lobby.', 'Keep people away until responders say it is clear.', 'Call the property manager and maintenance, then file an incident report.'] },
  { id: 'elevator', match: /\belevator\b/i, title: 'Someone stuck in an elevator', emergency: true, incident: 'utility', steps: ['Talk to them through the car’s phone or intercom. Tell them help is coming.', 'Call the elevator company’s emergency line from the property contacts. If anyone is unwell, call 911.', 'Never try to open the doors yourself.', 'Stay by the elevator and keep talking until the technician arrives.', 'File an incident report: which car, when, how many people, when they were out.'] },
  { id: 'noise', match: /\bnois[ey]|loud|party|music\b/i, title: 'Noise complaint', incident: 'noise', steps: ['Write down who complained, which unit it is about and the time.', 'Call the unit and ask politely for the noise to come down. Note who you spoke with.', 'If nothing changes in about 10 minutes, knock on the door. Knock only, never enter.', 'Still going? Tell the property manager or the after-hours line.', 'If anyone is aggressive or threatening, step away and call 911.', 'File an incident report every time, whatever the outcome.'] },
  { id: 'access', match: /\bunauthori[sz]ed|trespass|suspicious (person|man|woman|individual|activity)|stranger|tailgat|won.?t leave|refus\w+ to leave|let (him|her|them|someone) (in|up)|no id\b/i, title: 'Unauthorized access or a suspicious person', incident: 'unauthorized', steps: ['Ask who they are here to see, by name and unit. Never tell them a resident’s unit or schedule.', 'Call the resident to confirm. If you cannot confirm, they do not go up.', 'If they refuse to leave, call the non-emergency police line. If you feel unsafe, call 911.', 'Do not confront or follow anyone who seems aggressive.', 'Write down a description, the time, what was said and how it ended, and file an incident report.'] },
  { id: 'suspicious-package', match: /\bsuspicious (package|parcel|box|bag)|leaking (package|box)|ticking\b/i, title: 'Suspicious package', incident: 'package', steps: ['Do not touch or move it.', 'Clear people away from it.', 'Call 911 if it smells, leaks, ticks or has wires. Otherwise call the non-emergency police line.', 'Call the property manager and file an incident report.'] },
  { id: 'package', match: /\bpackage|parcel|delivery|deliveries\b/i, title: 'Receiving and releasing packages', steps: ['Log every package as it arrives: carrier, unit, how many, and any damage (take a photo).', 'Release only to the resident on record, or to someone the resident authorized in writing, with ID.', 'Never release to movers, guests or a driver who comes back for it.', 'Flag packages older than the property’s limit and tell the office.', 'If the package room is full, tell the office. Do not stack packages in the lobby.'] },
  { id: 'vendor', match: /\bvendor|contractor|technician|work order|plumber|electrician\b/i, title: 'Vendors and contractors', steps: ['Ask for the company name and the work order before giving any access.', 'Check them against today’s approved vendors or confirm with the office or the resident.', 'Sign them in: company, work, where they are going, who approved it, time in.', 'Give a temporary badge or key only if the property allows it, and get it back.', 'Sign them out when they leave. No work order, no access: call the property manager.'] },
  { id: 'visitor', match: /\bvisitor|guest\b/i, title: 'Visitors', steps: ['Greet them and ask who they are visiting, by name.', 'Call the resident to confirm before sending anyone up.', 'Log the visitor: name, who they are seeing, the time and why.', 'Never give out a resident’s unit number, phone or schedule.', 'If the resident does not answer or says no, the visitor waits in the lobby or leaves.'] },
  { id: 'lockout', match: /\block(ed)? ?out|lost (their |a |the )?(key|fob)|forgot (their |the )?(key|fob)\b/i, title: 'Lockouts', steps: ['Confirm the person is the resident on record for that unit. Check ID.', 'Follow the property’s lockout rule for who may be let in and how (escort, loaner key, locksmith).', 'Never let in someone who is not on the lease without the resident’s or manager’s approval.', 'Log the lockout: resident, unit, how they were let in, and when the key came back.'] },
  { id: 'move', match: /\bmov(e|ing|ers?)\b/i, title: 'Move-ins and move-outs', steps: ['Check the move is on today’s approved schedule.', 'Reserve the freight elevator and put the pads and floor protection down first.', 'Walk the route and photograph any damage before the movers start.', 'Movers use the loading entrance. Lobby doors are never propped open.', 'Walk the route again afterwards and report new damage to the office right away.'] },
  { id: 'leak', match: /\bleak|flood|water|pipe|burst\b/i, title: 'Water leak or flood', incident: 'utility', steps: ['Call maintenance or the emergency maintenance line right away.', 'If you can reach the shut-off safely, close it.', 'Warn the units below and next door. Keep people away from standing water near anything electrical.', 'Take photos before cleanup starts.', 'Call the property manager and file an incident report.'] },
  { id: 'power', match: /\bpower|outage|blackout\b/i, title: 'Power outage', incident: 'utility', steps: ['Check whether anyone is in an elevator. If so, follow the elevator steps.', 'Call the utility’s outage line and the property manager.', 'Stay at the desk to help residents and control who comes in. Do not prop exterior doors open.', 'Write down when the power went out and when it came back.'] },
  { id: 'handoff', match: /\bhand ?off|hand ?over|shift (report|notes)|document\b/i, title: 'Handoff and documentation', steps: ['Log things as they happen, not at the end of the shift.', 'Stick to facts: who, what, when, where, and how it ended.', 'Before you clock out, write what the next shift must watch or finish.', 'List anything still open: packages waiting, vendors still on site, incidents not resolved.'] },
];
export const protocolFor = text => PROTOCOLS.find(p => p.match.test(String(text || ''))) || null;

/* ---- Sections of the app the assistant can open ---- */
export const PLACES = {
  concierge: {
    home: ['Today’s shift', 'The Daily Activity Report for this shift.', /\b(today|dar|daily activity|report|home|shift record)\b/i],
    requests: ['Requests', 'What the manager asked the desk to do.', /\brequests?|assigned|to-?dos?|my tasks\b/i],
    followup: ['Follow-ups', 'Reminders and loose ends for this shift.', /\bfollow-? ?ups?|reminders?\b/i],
    packages: ['Packages', 'Deliveries, pickups, returns and the package-room audit.', /\bpackages?|parcels?|deliver(y|ies)|pickups?|rts|audit\b/i],
    guests: ['Visitors', 'Guest arrivals and pre-registrations.', /\bguests?|visitors?|pre-?reg/i],
    vendors: ['Vendors', 'Contractor check-ins and check-outs.', /\bvendors?|contractors?\b/i],
    lockout: ['Lockouts', 'Record a lockout and key access.', /\block ?outs?\b/i],
    tours: ['Tours', 'Prospect tours and walk-ins.', /\btours?|prospects?\b/i],
    loaners: ['Loaners', 'Carts, keys and other items on loan.', /\bloaners?|luggage cart|borrow/i],
    incident: ['Incident report', 'A structured report with photos.', /\bincidents?\b/i],
    handoff: ['Next handoff', 'Notes for the next shift, then clock out.', /\bhand ?off|hand ?over|clock ?out|end (my |the )?shift\b/i],
    sops: ['Property knowledge', 'The property’s own procedures.', /\bsops?|procedures?|knowledge|policies|policy|rules\b/i],
    training: ['Training', 'Training assigned by the property.', /\btraining|courses?\b/i],
    messages: ['Messages', 'The thread you share with your manager and the desk team.', /\bmessages?|chat|thread\b/i],
    calendar: ['Shifts', 'Your schedule and past shifts.', /\bcalendar|schedule|shifts|past shifts|history\b/i],
    settings: ['Settings', 'Account, appearance and preferences.', /\bsettings?|password|dark mode|appearance|preferences\b/i],
    contacts: ['Emergency contacts', 'Who to call for this property.', /\bcontacts?|phone numbers?|who (do|should) i call\b/i],
    'new-task': ['New task', 'Document something you did.', /\bnew task\b/i],
  },
  manager: {
    home: ['Overview', 'Today’s report, incidents and who is on shift.', /\boverview|home|dashboard|incidents?|today\b/i],
    tasks: ['Tasks', 'What you’ve asked the desk to do.', /\brequests?|tasks?|assign/i],
    shifts: ['Shift calendar', 'Daily Activity Reports from every shift.', /\breports?|dars?|daily activity|shifts?|calendar|history\b/i],
    team: ['Team', 'Concierge accounts and invitations.', /\bteam|concierges?|staff|invite/i],
    residents: ['Residents', 'The resident directory.', /\bresidents?|directory|tenants?\b/i],
    messages: ['Messages', 'The thread you share with the desk.', /\bmessages?|chat|thread\b/i],
    analytics: ['Analytics', 'Volumes and trends.', /\banalytics|trends?|stats|numbers|performance\b/i],
    scheduled: ['Preset requests', 'Recurring requests for the desk.', /\bpreset|recurring|scheduled\b/i],
    more: ['Building SOPs', 'The procedures your desk follows.', /\bsops?|procedures?|policies|policy\b/i],
    training: ['Training', 'Training for the desk team.', /\btraining|courses?\b/i],
    settings: ['Settings', 'Account and property settings.', /\bsettings?|password|profile\b/i],
  },
};
const LOOKUP = /\b(where|find|show|open|pull|see|look|view|go to|take me|get me|bring up|check|who|which|what)\b/i;

/* Everything that can be found by name on the record. */
export function things(ctx = {}) {
  const out = [];
  for (const r of ctx.residents || []) out.push({ kind: 'resident', id: r.resident_id || `res:${r.unit}:${r.name}`, name: r.name, unit: r.unit, phone: r.phone || '', note: r.notes || '', words: [r.name, r.unit, 'resident'].join(' ') });
  for (const t of ctx.requests || []) out.push({ kind: 'request', id: t.task_id || t.id, name: t.title, detail: [t.status === 'completed' ? 'Done' : t.status === 'in_progress' ? 'In progress' : 'Open', t.dueTime && t.dueTime !== 'ASAP' ? `Due ${clockText(t.dueTime)}` : t.dueTime, t.assignedTo && ctx.role === 'manager' ? `For ${t.assignedTo}` : ''].filter(Boolean), status: t.status, words: [t.title, t.notes, t.category, 'request task'].join(' ') });
  for (const i of ctx.incidents || []) out.push({ kind: 'incident', id: i.incident_id || i.id, name: i.title || incidentLabel(i.type), detail: [incidentLabel(i.type), i.location, i.filedAt, i.status === 'resolved' ? 'Resolved' : 'Open'].filter(Boolean), status: i.status, words: [i.title, i.type, incidentLabel(i.type), i.location, i.unit_number, 'incident report'].join(' ') });
  for (const e of ctx.todayLog || []) out.push({ kind: 'entry', id: `entry:${e.id}`, name: e.title, detail: [e.category, e.completedAt, e.notes].filter(Boolean), words: [e.title, e.notes, e.category].join(' ') });
  for (const c of ctx.team || []) out.push({ kind: 'teammate', id: c.concierge_id || c.id, name: c.name, phone: c.phone || '', detail: [c.title, c.onShift ? 'On shift now' : '', c.email].filter(Boolean), words: [c.name, c.title, 'concierge team staff'].join(' ') });
  return out;
}
export function find(text, ctx = {}) {
  const want = words(text).map(w => w.replace(/s$/, ''));
  if (!want.length) return [];
  return things(ctx).map(t => {
    const name = words(t.name).map(w => w.replace(/s$/, '')), more = words(t.words).map(w => w.replace(/s$/, ''));
    let score = 0;
    for (const w of want) { if (name.some(n => n === w || (w.length > 4 && n.startsWith(w)))) score += 3; else if (more.some(n => n === w || (w.length > 4 && n.startsWith(w)))) score += 1; }
    if (t.kind === 'resident' && t.unit && want.includes(String(t.unit).toLowerCase())) score += 4;
    return { t, score };
  }).filter(x => x.score >= 2).sort((a, b) => b.score - a.score).filter((x, n, all) => x.score >= all[0].score - 1).slice(0, 4).map(x => x.t);
}

/* ---- What's going on right now, said first when the assistant opens (like a colleague would) ---- */
export function nudges(ctx = {}) {
  const out = [], now = ctx.now || new Date(), mins = now.getHours() * 60 + now.getMinutes();
  const open = (ctx.requests || []).filter(t => t.status !== 'completed');
  const late = open.filter(t => { const m = /^(\d{1,2}):(\d{2})$/.exec(t.dueTime || ''); return m && Number(m[1]) * 60 + Number(m[2]) < mins; });
  if (ctx.role === 'manager') {
    const inc = (ctx.incidents || []).filter(i => i.status !== 'resolved');
    if (inc.length) out.push({ id: 'incidents', text: `${inc.length} incident${inc.length === 1 ? ' is' : 's are'} waiting for your review.`, taps: [['Show them', 'say:show open incidents']] });
    if (late.length) out.push({ id: 'late', text: `${late.length} request${late.length === 1 ? ' is' : 's are'} past due at the desk: ${late.slice(0, 2).map(t => t.title).join('; ')}.`, taps: [['Show requests', 'say:what is open']] });
    return out;
  }
  if (late.length) out.push({ id: 'late', text: `${late.length === 1 ? 'One request is' : late.length + ' requests are'} past due: ${late.slice(0, 2).map(t => `${t.title} (${clockText(t.dueTime)})`).join('; ')}.`, taps: [['Show requests', 'open:requests']] });
  else if (open.length) out.push({ id: 'open', text: `You have ${open.length} open request${open.length === 1 ? '' : 's'} from your manager.`, taps: [['Show requests', 'open:requests']] });
  const left = (ctx.handoff && ctx.handoff.openItems) || [];
  if (left.length) out.push({ id: 'handoff', text: `The last shift left ${left.length} open item${left.length === 1 ? '' : 's'}: ${left.slice(0, 3).join('; ')}.` });
  const followed = new Set(ctx.followedUp || []);
  const mine = (ctx.incidents || []).filter(i => i.status !== 'resolved' && i.createdAtMs && now - i.createdAtMs > 30 * 60000 && now - i.createdAtMs < 12 * 3600000 && !followed.has(i.incident_id || i.id))[0];
  if (mine) out.push({ id: `inc:${mine.incident_id || mine.id}`, text: `Checking in on the ${incidentLabel(mine.type).toLowerCase()} you reported${mine.location ? ` at ${mine.location}` : ''}. Is it settled?`, taps: [['Yes, it’s settled', `followup:${mine.incident_id || mine.id}|settled`, true], ['Still going on', `followup:${mine.incident_id || mine.id}|ongoing`]] });
  return out;
}

/* ---- Answers the app can give by itself from the shift record ---- */
function localAnswer(s, ctx) {
  const log = ctx.todayLog || [], open = (ctx.requests || []).filter(t => t.status !== 'completed');
  if (/\b(last|previous|prior) shift\b|\bhand ?off notes?\b|\bleft (open|for me)\b/i.test(s) && !/^(draft|start|write|prepare|begin|get)\b/i.test(s) && ctx.role !== 'manager') {
    const h = ctx.handoff;
    if (!h || (!h.note && !(h.openItems || []).length)) return { kind: 'say', say: 'The last shift didn’t leave a handoff note or any open items.' };
    const note = h.note ? (/[.!?]$/.test(h.note.trim()) ? h.note.trim() : h.note.trim() + '.') : '';
    return { kind: 'say', say: [h.from ? `${h.from} left this:` : 'The last shift left this:', note, (h.openItems || []).length ? `Open items: ${h.openItems.join('; ')}.` : ''].filter(Boolean).join(' ') };
  }
  if (/\b(what(.?s| is)|anything|show( me)?|list) (still )?(open|pending|due|outstanding|left)\b|\bopen (requests|items|tasks)\b|\bwhat do i (have|need) to do\b/i.test(s)) {
    if (/incident/i.test(s)) { const inc = things({ incidents: (ctx.incidents || []).filter(i => i.status !== 'resolved') }); return inc.length ? { kind: 'find', things: inc.slice(0, 4), say: `${inc.length} incident${inc.length === 1 ? ' is' : 's are'} still open.` } : { kind: 'say', say: 'No incidents are open.' }; }
    if (!open.length) return { kind: 'say', say: ctx.role === 'manager' ? 'Nothing is open at the desk right now.' : 'Nothing is open. You’re all caught up.' };
    return { kind: 'find', things: things({ requests: open, role: ctx.role }).slice(0, 4), say: `${open.length} request${open.length === 1 ? ' is' : 's are'} open${open.length > 4 ? '. Here are the first four' : ''}.` };
  }
  const many = s.match(/\bhow many (packages?|deliver(?:y|ies)|guests?|visitors?|vendors?|contractors?|lockouts?|tours?|incidents?|entries|things)\b/i);
  if (many && ctx.role !== 'manager') {
    const k = many[1].toLowerCase(), re = /^pack|^deliv/.test(k) ? /^package delivery/i : /^guest|^visit/.test(k) ? /^guest (arrival|check-in)/i : /^vendor|^contr/.test(k) ? /^vendor check-in/i : /^lock/.test(k) ? /^lockout/i : /^tour/.test(k) ? /^tour/i : null;
    if (/^incident/.test(k)) { const n = (ctx.incidents || []).filter(i => i.createdAtMs && i.createdAtMs >= (ctx.shiftStartMs || 0)).length; return { kind: 'say', say: `${n} incident${n === 1 ? ' has' : 's have'} been filed this shift.` }; }
    const n = re ? log.filter(e => re.test(e.title || '')).length : log.length;
    return { kind: 'say', say: re ? `${n} ${k.replace(/ies$/, 'y').replace(/s$/, '')}${n === 1 ? '' : /y$/.test(k.replace(/ies$/, 'y')) ? '' : 's'} logged so far this shift.`.replace('deliverys', 'deliveries') : `${n} entr${n === 1 ? 'y' : 'ies'} in today’s report so far.` };
  }
  if (/\b(summar(y|i[sz]e)|recap|what (have i|did i) (done|do|log)|how is my shift)\b/i.test(s) && ctx.role !== 'manager') {
    if (!log.length) return { kind: 'say', say: 'Nothing is logged for this shift yet. Tell me what happened and I’ll get it ready for the report.' };
    const by = {}; for (const e of log) by[e.category || 'Other'] = (by[e.category || 'Other'] || 0) + 1;
    return { kind: 'say', say: `${log.length} entr${log.length === 1 ? 'y' : 'ies'} so far: ${Object.entries(by).map(([c, n]) => `${n} ${c.toLowerCase()}`).join(', ')}. ${open.length ? `${open.length} request${open.length === 1 ? ' is' : 's are'} still open.` : 'No requests are open.'}`, taps: [['Draft my handoff', 'say:draft my handoff']] };
  }
  if (/\bwho(.?s| is) (on (shift|duty)|working|at the desk)\b/i.test(s) && ctx.role === 'manager') {
    const on = (ctx.team || []).filter(c => c.onShift);
    return on.length ? { kind: 'find', things: things({ team: on }), say: `${on.map(c => c.name).join(' and ')} ${on.length === 1 ? 'is' : 'are'} on shift now.` } : { kind: 'say', say: 'No one is clocked in right now.' };
  }
  return null;
}

/* What the app can tell without the AI. Returns null when it should ask the AI.
   kinds: emergency, protocol, start (a guided entry), find, open, say. */
export function understand(text, ctx = {}) {
  const s = String(text || '').trim(), role = ctx.role === 'manager' ? 'manager' : 'concierge';
  if (!s) return null;
  const asking = HOW_TO.test(s) || /\?\s*$/.test(s);
  const calm = s.replace(/\bfire (lane|alarm test|extinguishers?|pit|place|door|drill|department|exit|stairs?|panel|watch|hydrant|inspection|marshal|code)s?\b/gi, ' ').replace(/\bsmoke (detector|alarm battery|break)s?\b/gi, ' ');
  const trapped = /\belevator\b.*\b(stuck|trapped)\b.*\b(someone|somebody|person|people|residents?|inside|kid|child)\b|\b(someone|somebody|person|people|residents?)\b.*\b(stuck|trapped)\b.*\belevator\b/i.test(s);
  if ((EMERGENCY.test(calm) || trapped) && !/\b(drill|test|training|inspection)\b/i.test(s)) return { kind: 'emergency', protocol: (trapped ? PROTOCOLS.find(p => p.id === 'elevator') : protocolFor(calm)) || PROTOCOLS[1] };
  if (HOW_TO.test(s)) { const p = protocolFor(s); return p ? { kind: 'protocol', protocol: p } : null; }

  const answer = localAnswer(s, ctx);
  if (answer) return answer;

  let unit = readUnit(s, ctx.residents), resident = unit ? residentForUnit(unit, ctx.residents) : null;
  // "open packages", "settings", "show incidents": a section's own name, and little else, means go there.
  if (words(s).length <= 2 && !/^(log|add|record|note|new|write|report|file|draft|prepare|get|start|begin)\b/i.test(s)) for (const [key, [, , re]] of Object.entries(PLACES[role])) if (re.test(s) && !find(s, { residents: ctx.residents, team: ctx.team }).length) return { kind: 'open', open: key };
  if (role === 'concierge') {
    if (/\b(hand ?off|hand ?over|end (my |the )?shift|clock(ing)? (me )?out|wrap(ping)? up)\b/i.test(s) && !asking) return { kind: 'start', type: 'handoff', fields: { note: s.replace(/^.*?(hand ?off|hand ?over|end (my |the )?shift|clock(ing)? (me )?out|wrap(ping)? up)\s*(notes?)?\s*[:,-]?\s*/i, '').replace(/^(ready|please|now|for me|together)[.! ]*$/i, '') } };
    if (/\b(lock(ed)? ?out|forgot (his|her|their|the) (keys?|fob)|lost (his|her|their|a|the) (keys?|fob))\b/i.test(s) && !asking) return { kind: 'open', open: 'lockout', say: 'Lockouts need the ID check and how they got back in, so I’ll take you to the lockout form.' };
    const carrier = readCarrier(s), count = readCount(s);
    const pkgWord = /\b(packages?|pkgs?|parcels?|boxes|box|deliver(y|ies|ed))\b/i.test(s);
    if (pkgWord && !unit) { const m = s.match(/\bfor\s+((?:mr\.?|mrs\.?|ms\.?|dr\.?)?\s*[A-Za-z][a-z'’-]+(?:\s+[A-Z][a-z'’-]+)?)/), r = m && residentByName(m[1], ctx.residents); if (r) { unit = String(r.unit).toUpperCase(); resident = r; } }
    if ((pkgWord || (carrier && /\b(dropped|here|arrived|left|brought|came)\b/i.test(s))) && !asking && !incidentKind(s).startsWith('package') && !/\b(pick(ed|ing)? ?up|picked|released?|return(ed)? to sender|rts|audit|show|open|where|find|see)\b/i.test(s) && (carrier || count || unit || /\b(log|add|record|got|arrived|came|new|received|dropped)\b/i.test(s)))
      return { kind: 'start', type: 'package', fields: { unit, resident: resident ? resident.name : '', carrier, count: count ? String(count) : '' } };
    if (/\b(guest|visitor)\b/i.test(s) && !asking && /\b(for|to see|visiting|here|arrived|sign(ing)? in|check(ing)? in|log|add)\b/i.test(s) && !/\b(show|open|where|list|see the)\b/i.test(s)) {
      const who = s.match(/\b(?:guest|visitor)(?: named| is|:)?\s+([A-Z][a-z'’-]+(?:\s+[A-Z][a-z'’-]+)?)/) || s.match(/^([A-Z][a-z'’-]+(?:\s+[A-Z][a-z'’-]+)?)\s+(?:is here|here to see|to see|visiting|for)\b/);
      return { kind: 'start', type: 'visitor', fields: { visitor: who ? who[1] : '', unit, resident: resident ? resident.name : '' } };
    }
    if (/\b(vendor|contractor|plumber|electrician|technician|hvac|pest control|locksmith|cleaning crew|landscap\w+|elevator (tech|company)|cable (guy|tech)|internet tech)\b/i.test(s) && !asking && /\b(here|arrived|sign(ing|ed)? in|check(ing|ed)? in|log|add|on site|showed up|came)\b/i.test(s) && !/\b(show|open|where|list)\b/i.test(s))
      return { kind: 'start', type: 'vendor', fields: { location: unit ? `Unit ${unit}` : '' } };
  }
  if (/^(message|tell|let|text|notify|ping)\s+(the\s+)?(team|manager|management|everyone|office|next shift|property manager|desk|concierges?)\b/i.test(s) || /^(send|post) (a )?(message|note)\b/i.test(s))
    return { kind: 'start', type: 'message', fields: { text: cap(s.replace(/^(message|tell|let|text|notify|ping)\s+(the\s+)?(team|manager|management|everyone|office|next shift|property manager|desk|concierges?)\s*(know)?\s*(that|:|,|-)?\s*/i, '').replace(/^(send|post) (a )?(message|note)( to (the )?(team|manager|everyone))?\s*(that|saying|:|,|-)?\s*/i, '')) } };
  if (/\b(remind me|reminder|follow[- ]?up|don.?t let me forget|to-?do|need to remember)\b/i.test(s) || (role === 'manager' && /^(ask|have|assign|get|request|tell)\b.+\bto\b/i.test(s))) {
    const t = readTimes(s)[0] || '';
    let what = s.replace(/^.*?\b(remind me|set (a )?reminder|add (a )?(reminder|follow[- ]?up|to-?do)|don.?t let me forget|i need to remember)\s*(to|about|that)?\s*/i, '').replace(/\b(at|by|before|around)\s+\d{1,2}(:\d{2})?\s*(a\.?m\.?|p\.?m\.?)?\b/i, '').replace(/\s+/g, ' ').trim();
    let assignee = null;
    if (role === 'manager') { assignee = residentByName(s, (ctx.team || []).map(c => ({ ...c, name: c.name }))); what = s.replace(/^(ask|have|assign|get|request|tell)\s+(.+?)\s+to\s+/i, '').replace(/\b(at|by|before|around)\s+\d{1,2}(:\d{2})?\s*(a\.?m\.?|p\.?m\.?)?\b/i, '').trim(); }
    return { kind: 'start', type: 'task', fields: { what: /^(a )?(reminder|follow[- ]?up|to-?do)\.?$/i.test(what) ? '' : cap(what), due: t, assignee_id: assignee ? assignee.concierge_id || assignee.id : '' } };
  }
  const inc = incidentKind(s);
  if (role === 'concierge' && !asking && (/\b(incident|report (a|an)|file (a|an)|complain(t|ed|ing|s)?)\b/i.test(s) || (inc && !/\b(show|open|find|see|list|where)\b/i.test(s) && !/^(log|note|record|add)\b/i.test(s))))
    return { kind: 'start', type: 'incident', fields: { incident_type: inc, unit, location: unit ? `Unit ${unit}` : readArea(s), what: /^(report|file|log|new|add|start)?\s*(a|an)?\s*(incident|incident report)\.?$/i.test(s) ? '' : cap(s) } };

  if (LOOKUP.test(s) || words(s).length <= 3) {
    if (unit && resident) return { kind: 'find', things: things({ residents: [resident] }) };
    const found = find(s, ctx);
    if (found.length && !/^(log|add|record|note|new|write)\b/i.test(s)) return { kind: 'find', things: found };
    if (unit && (ctx.residents || []).length && /\bwho\b/i.test(s)) return { kind: 'say', say: `I don’t see anyone listed for unit ${unit} in the resident directory.` };
    for (const [key, [, , re]] of Object.entries(PLACES[role])) if (re.test(s)) return { kind: 'open', open: key };
  }
  if (role === 'concierge' && (/^(log|note|record|write down|add to (the )?(dar|report)|document|put down)\b/i.test(s) || (!asking && /^(i |we |just )?(did|finished|completed|walked|checked|opened|closed|helped|assisted|cleaned|locked|unlocked|escorted|delivered|reset|restocked|tested|let|called|spoke|met|signed|moved|wiped|replaced|turned|rounds|patrol)/i.test(s)))) {
    const what = s.replace(/^(please\s+)?(log|note|record|write down|add to (the )?(dar|report)|document|put down)\s*(that|this|:|,|-)?\s*/i, '');
    return { kind: 'start', type: 'log', fields: { what: /^(an? )?(entry|activity|note|something)?\.?$/i.test(what) ? '' : cap(what), category: what ? categoryFor(what) : '' } };
  }
  return null;
}

/* ---- Guided entries: the questions each one needs, asked one at a time ---- */
const typeTaps = () => INCIDENT_TYPES.map(([k, l]) => [l, 'set:type|' + k]);
export const QUESTIONS = {
  package: [
    { key: 'unit', need: f => !f.unit, ask: () => 'Which unit is it for?', set: (f, s, ctx) => { const u = readUnit(/\d/.test(s) && !/unit|apt|#/i.test(s) ? `unit ${s}` : s, ctx.residents) || (residentByName(s, ctx.residents) || {}).unit; if (!u) return 'I didn’t catch the unit. Type it like “312” or “4B”, or the resident’s name.'; f.unit = String(u).toUpperCase(); const r = residentForUnit(f.unit, ctx.residents); if (r) f.resident = r.name; return ''; } },
    { key: 'carrier', need: f => !f.carrier, ask: f => `Who delivered it${f.resident ? ` for ${f.resident}` : ''}?`, taps: () => CARRIERS.map(c => [c, 'set:carrier|' + c]), skip: 'Not sure', set: (f, s) => { f.carrier = readCarrier(s) || clip(s, 40); return ''; } },
    { key: 'count', need: f => !f.count, ask: () => 'How many packages?', taps: () => ['1', '2', '3', '4'].map(n => [n, 'set:count|' + n]), set: (f, s) => { const n = parseInt(String(s).replace(/\D/g, ''), 10) || readCount(`${s} packages`); if (!(n >= 1 && n <= 99)) return 'Type the number of packages, like “2”.'; f.count = String(n); return ''; } },
    { key: 'note', need: f => !f.note, ask: () => 'Anything to note, like where it’s stored or damage on the box?', skip: 'No note', set: (f, s) => { f.note = clip(s, 300); return ''; } },
  ],
  visitor: [
    { key: 'visitor', need: f => !f.visitor, ask: () => 'What’s the visitor’s name?', set: (f, s) => { f.visitor = clip(s, 80); return ''; } },
    { key: 'unit', need: f => !f.unit, ask: f => `Who is ${f.visitor} here to see? The unit or the resident’s name.`, set: (f, s, ctx) => { const byName = residentByName(s, ctx.residents), u = readUnit(/^\s*[a-z]?\d+[a-z]?\s*$/i.test(s) ? `unit ${s}` : s, ctx.residents) || (byName || {}).unit; if (!u) return 'I didn’t catch the unit. Type it like “312”, or the resident’s name as it is in the directory.'; f.unit = String(u).toUpperCase(); const r = residentForUnit(f.unit, ctx.residents); f.resident = r ? r.name : f.resident; return ''; } },
    { key: 'resident', need: f => !f.resident, ask: f => `Who is the resident in unit ${f.unit}?`, skip: 'Not sure', set: (f, s) => { f.resident = clip(s, 80); return ''; } },
    { key: 'confirmed', need: f => !f.confirmed, ask: f => `Did ${f.resident || 'the resident'} confirm the visit?`, taps: () => [['Yes, confirmed', 'set:confirmed|Resident confirmed', true], ['Pre-authorized', 'set:confirmed|Pre-authorized'], ['Couldn’t reach them', 'set:confirmed|Resident not reached']], set: (f, s) => { f.confirmed = /^(y|yes|confirmed)\b/i.test(s) ? 'Resident confirmed' : clip(s, 60); return ''; } },
    { key: 'purpose', need: f => !f.purpose, ask: () => 'What’s the visit for?', taps: () => [['Personal visit', 'set:purpose|Personal visit'], ['Food delivery', 'set:purpose|Food delivery'], ['Service', 'set:purpose|Service'], ['Family', 'set:purpose|Family']], skip: 'Didn’t say', set: (f, s) => { f.purpose = clip(s, 80); return ''; } },
  ],
  vendor: [
    { key: 'company', need: f => !f.company, ask: () => 'Which company are they with?', set: (f, s) => { f.company = clip(s, 80); return ''; } },
    { key: 'purpose', need: f => !f.purpose, ask: f => `What work is ${f.company} here to do?`, taps: () => [['Plumbing', 'set:purpose|Plumbing'], ['Electrical', 'set:purpose|Electrical'], ['HVAC', 'set:purpose|HVAC'], ['Cleaning', 'set:purpose|Cleaning'], ['Pest control', 'set:purpose|Pest control']], set: (f, s) => { f.purpose = clip(s, 80); return ''; } },
    { key: 'location', need: f => !f.location, ask: () => 'Where are they working? A unit or an area.', set: (f, s, ctx) => { const u = readUnit(/^\s*[a-z]?\d+[a-z]?\s*$/i.test(s) ? `unit ${s}` : s, ctx.residents); f.location = u ? `Unit ${u}` : clip(s, 80); return ''; } },
    { key: 'approved', need: f => !f.approved, ask: () => 'Who approved the work? Check the work order.', skip: 'No work order', set: (f, s) => { f.approved = clip(s, 80); return ''; } },
  ],
  incident: [
    { key: 'type', need: f => !f.incident_type, ask: () => 'What kind of incident is it?', taps: typeTaps, set: (f, s) => { const k = (INCIDENT_TYPES.find(([key, l]) => key === s || l.toLowerCase() === s.toLowerCase()) || [])[0] || incidentKind(s) || 'other'; f.incident_type = k; if (!f.what && k === 'other' && s.length > 12) f.what = cap(s); return ''; } },
    { key: 'location', need: f => !f.location, ask: () => 'Where did it happen? A unit, a floor or an area.', set: (f, s, ctx) => { const u = readUnit(/^\s*[a-z]?\d+[a-z]?\s*$/i.test(s) ? `unit ${s}` : s, ctx.residents); if (u) { f.unit = u; f.location = `Unit ${u}`; } else f.location = cap(clip(s, 120)); return ''; } },
    { key: 'what', need: f => !f.what || f.what.length < 12, ask: () => 'What happened? A few plain sentences: who, what, when.', set: (f, s) => { if (noneSaid(s) || s.trim().length < 8) return 'Write a sentence or two about what happened. It goes in the report for the manager.'; f.what = cap(clip(s, 600)); return ''; } },
    { key: 'severity', need: f => !f.severity, ask: () => 'How serious is it?', taps: () => SEVERITIES.map(([k, l]) => [l, 'set:severity|' + k]), set: (f, s) => { const k = (SEVERITIES.find(([key, l]) => key === s.toLowerCase() || l.toLowerCase() === s.toLowerCase()) || [])[0] || (/emergenc|danger|urgent|serious|bad/i.test(s) ? 'high' : /minor|small|little/i.test(s) ? 'low' : ''); if (!k) return 'Tap Low, Medium, High or Critical.'; f.severity = k; return ''; } },
    { key: 'people', need: f => !f.people, ask: () => 'Who was involved? Names or descriptions.', skip: 'No one identified', set: (f, s) => { if (!noneSaid(s)) f.people = clip(s, 200); return ''; } },
    { key: 'actions', need: f => !f.actions, ask: () => 'What have you done about it so far?', skip: 'Nothing yet', set: (f, s) => { if (!noneSaid(s)) f.actions = cap(clip(s, 500)); return ''; } },
  ],
  log: [
    { key: 'what', need: f => !f.what, ask: () => 'What should the entry say? Tell me what you did.', set: (f, s) => { if (s.trim().length < 3) return 'Tell me what was done, in a few words.'; f.what = cap(clip(s, 200)); f.category = f.category || categoryFor(s); return ''; } },
    { key: 'note', need: f => !f.note, ask: () => 'Any detail to add?', skip: 'No, that’s it', set: (f, s) => { f.note = clip(s, 500); return ''; } },
  ],
  task: [
    { key: 'what', need: f => !f.what, ask: (f, ctx) => ctx.role === 'manager' ? 'What should the desk do?' : 'What should I remind you about?', set: (f, s) => { f.what = cap(clip(s, 140)); return ''; } },
    { key: 'assignee', need: (f, ctx) => ctx.role === 'manager' && !f.assignee_id && (ctx.team || []).length > 0, ask: () => 'Who is it for?', taps: (f, ctx) => (ctx.team || []).slice(0, 6).map(c => [c.name, 'set:assignee|' + (c.concierge_id || c.id)]), set: (f, s, ctx) => { const c = (ctx.team || []).find(x => (x.concierge_id || x.id) === s) || residentByName(s, ctx.team || []); if (!c) return 'Tap the concierge it’s for.'; f.assignee_id = c.concierge_id || c.id; f.assignee = c.name; return ''; } },
    { key: 'due', need: f => !f.due, ask: () => 'By when?', taps: () => [['As soon as possible', 'set:due|ASAP'], ['End of shift', 'set:due|End of shift']], set: (f, s) => { if (/asap|soon|now/i.test(s)) { f.due = 'ASAP'; return ''; } if (/end of (my |the )?shift/i.test(s)) { f.due = 'End of shift'; return ''; } const t = readTimes(/\d\s*$/.test(s.trim()) && !/[ap]m|:/.test(s) ? `${s} o'clock` : s)[0]; if (!t) return 'I didn’t catch the time. Try like “3 pm”.'; f.due = t; return ''; } },
    { key: 'priority', need: (f, ctx) => ctx.role === 'manager' && !f.priority, ask: () => 'How urgent is it?', taps: () => [['Standard', 'set:priority|Standard', true], ['High', 'set:priority|High'], ['Low', 'set:priority|Low']], set: (f, s) => { f.priority = /high|urgent/i.test(s) ? 'High' : /low/i.test(s) ? 'Low' : 'Standard'; return ''; } },
    { key: 'note', need: f => !f.note, ask: () => 'Any note to go with it?', skip: 'No note', set: (f, s) => { f.note = clip(s, 500); return ''; } },
  ],
  message: [
    { key: 'text', need: f => !f.text || f.text.length < 2, ask: () => 'What should the message say?', set: (f, s) => { f.text = cap(clip(s, 600)); return ''; } },
  ],
  handoff: [
    { key: 'note', need: f => !f.note, ask: () => 'What should the next shift know? I’ll add what’s still open from the record.', skip: 'Nothing to add', set: (f, s) => { f.note = cap(clip(s, 1200)); return ''; } },
  ],
};
export const TASK_NAMES = { package: 'the package', visitor: 'the visitor', vendor: 'the vendor', incident: 'the incident report', log: 'the entry', task: 'the reminder', message: 'the message', handoff: 'the handoff' };
const LEADS = { package: 'Sure, I’ll log it.', visitor: 'Sure, I’ll sign them in.', vendor: 'Sure, I’ll sign them in.', incident: 'I’ll get the report ready.', log: 'Sure.', task: 'Sure.', message: 'Sure.', handoff: 'Let’s get the handoff ready.' };

export function startFlow(type, fields = {}, ctx = {}) {
  const f = {}; for (const [k, v] of Object.entries(fields || {})) if (typeof v === 'string' && v.trim()) f[k] = v.trim();
  if (f.unit) { f.unit = f.unit.toUpperCase(); const r = residentForUnit(f.unit, ctx.residents); if (r && !f.resident) f.resident = r.name; }
  if (type === 'incident' && f.unit && !f.location) f.location = `Unit ${f.unit}`;
  if (type === 'task' && f.assignee_id) { const c = (ctx.team || []).find(x => (x.concierge_id || x.id) === f.assignee_id); if (c) f.assignee = c.name; else delete f.assignee_id; }
  return { type, f, done: {}, q: '', lead: LEADS[type] || '' };
}
/* The next question that isn't answered: { q, text, taps } — or null when everything needed is there. */
export function nextQuestion(flow, ctx = {}) {
  for (const q of QUESTIONS[flow.type] || []) {
    if (flow.done[q.key] || !q.need(flow.f, ctx)) continue;
    return { q, text: q.ask(flow.f, ctx), taps: [...(q.taps ? q.taps(flow.f, ctx) : []), ...(q.skip ? [[q.skip, 'skip:' + q.key]] : [])] };
  }
  return null;
}
/* An answer, typed or tapped. Returns '' when it was taken, or what to say when it wasn't understood. */
export function answer(flow, key, value, ctx = {}) {
  const q = (QUESTIONS[flow.type] || []).find(x => x.key === key);
  if (!q) return '';
  const problem = q.set(flow.f, String(value || '').trim(), ctx);
  if (!problem) flow.done[key] = true;
  return problem || '';
}
export const skip = (flow, key) => { flow.done[key] = true; };

/* What still looks open, for the handoff: open requests, incidents not resolved, follow-ups. */
export function openItems(ctx = {}) {
  return [
    ...(ctx.requests || []).filter(t => t.status !== 'completed').map(t => `Request: ${t.title}${t.dueTime && t.dueTime !== 'ASAP' ? ` (due ${clockText(t.dueTime)})` : ''}`),
    ...(ctx.incidents || []).filter(i => i.status !== 'resolved' && i.createdAtMs && i.createdAtMs >= (ctx.shiftStartMs || 0)).map(i => `Incident: ${incidentLabel(i.type)}${i.location ? ` at ${i.location}` : ''}`),
    ...(ctx.followUps || []).filter(x => x.status !== 'resolved').map(x => `Follow up: ${x.text}`),
  ].slice(0, 12);
}

/* The Ready to save card: what will be saved, in the same words the app's own forms use. */
export function ready(flow, ctx = {}) {
  const f = flow.f, plural = n => (Number(n) === 1 ? '' : 's');
  if (flow.type === 'package') return {
    tag: 'Package delivery', title: `${f.carrier || 'Package'} → Unit ${f.unit}`, place: 'packages', intro: 'Check it and tap Save. It goes in the Packages section of today’s report.',
    rows: [['For', [f.resident, `Unit ${f.unit}`].filter(Boolean).join(' · ')], ['Carrier', f.carrier], ['Packages', f.count || '1'], ['Note', f.note]],
    save: { do: 'activity', entry: { title: `Package delivery · ${f.carrier || 'Carrier not noted'} → Unit ${f.unit}`, category: 'Delivery', notes: [`${f.count || 1} package${plural(f.count || 1)}`, f.resident, f.note].filter(Boolean).join(' · '), sourceSection: 'packages' }, notify: { unit: f.unit, carrier: f.carrier, count: Number(f.count || 1), residentName: f.resident || '' } },
    saved: `Logged for unit ${f.unit}.`,
  };
  if (flow.type === 'visitor') return {
    tag: 'Guest arrival', title: `${f.visitor} → ${f.resident || 'Resident'}`, place: 'guests', intro: 'Check it and tap Save. It goes in the Guests section of today’s report.',
    rows: [['Visiting', [f.resident, `Unit ${f.unit}`].filter(Boolean).join(' · ')], ['Resident', f.confirmed], ['Purpose', f.purpose]],
    save: { do: 'activity', entry: { title: `Guest arrival · ${f.visitor} → ${f.resident || 'Resident'} · Unit ${f.unit}`, category: 'Resident Assist', notes: [f.purpose, f.confirmed].filter(Boolean).join(' · '), sourceSection: 'guests' } },
    saved: `${f.visitor} is signed in.`,
  };
  if (flow.type === 'vendor') return {
    tag: 'Vendor check-in', title: `${f.company} · ${f.purpose}`, place: 'vendors', intro: 'Check it and tap Save. It goes in the Vendors section of today’s report.',
    rows: [['Working in', f.location], ['Approved by', f.approved || 'No work order shown']],
    save: { do: 'activity', entry: { title: `Vendor check-in · ${f.company} · ${f.purpose}`, category: 'Vendor / Contractor', notes: [f.location, f.approved ? `Auth: ${f.approved}` : 'No work order shown'].filter(Boolean).join(' · '), sourceSection: 'vendors' } },
    saved: `${f.company} is signed in. Remember to sign them out in Vendors when they leave.`,
  };
  if (flow.type === 'incident') return {
    tag: 'Incident report', title: incidentLabel(f.incident_type), place: 'incident', intro: 'Check the report and tap Save. Your manager is told as soon as it’s filed.',
    rows: [['Where', f.location], ['What happened', f.what], ['Severity', (SEVERITIES.find(([k]) => k === f.severity) || [])[1]], ['Involved', f.people], ['Done so far', f.actions]],
    save: { do: 'incident', form: { type: f.incident_type || 'other', location: f.location, description: f.what, severity: f.severity || 'medium', actionsTaken: f.actions || '', unitNumber: f.unit || '', personInvolved: f.people || '' } },
    saved: 'Incident filed. It’s on today’s report and your manager has been told. I’ll check back with you on it.',
  };
  if (flow.type === 'log') return {
    tag: 'Report entry', title: f.what, place: 'home', intro: 'Tap Save and it goes in today’s report.',
    rows: [['Category', f.category || 'Administrative'], ['Detail', f.note]],
    save: { do: 'activity', entry: { title: f.what, category: f.category || categoryFor(f.what), notes: f.note || '' } },
    saved: 'Added to today’s report.',
  };
  if (flow.type === 'task') { const due = /^\d\d:\d\d$/.test(f.due || '') ? clockText(f.due) : f.due || 'As soon as possible', mgr = ctx.role === 'manager'; return {
    tag: mgr ? 'Request for the desk' : 'Reminder', title: f.what, place: mgr ? 'tasks' : 'followup', intro: mgr ? 'Check it and tap Save. The concierge sees it right away.' : 'Check it and tap Save. It stays on your follow-up list until it’s done.',
    rows: [['For', mgr ? f.assignee || 'Whoever is on shift' : ''], ['By', due === 'ASAP' ? 'As soon as possible' : due], ['Priority', mgr ? f.priority || 'Standard' : ''], ['Note', f.note]],
    save: mgr ? { do: 'request', form: { title: f.what, notes: f.note || '', category: categoryFor(f.what), priority: f.priority || 'Standard', assignedTo: f.assignee || '', toId: f.assignee_id || '', dueTime: f.due === 'End of shift' ? 'End of shift' : f.due || 'ASAP' } }
      : { do: 'followup', item: { text: `${f.what}${due && due !== 'As soon as possible' && due !== 'ASAP' ? ` · by ${due}` : ''}${f.note ? ` — ${f.note}` : ''}`, source: 'assistant' } },
    saved: mgr ? `Sent to ${f.assignee || 'the desk'}.` : 'It’s on your follow-up list, and it will carry into your handoff if it’s still open.',
  }; }
  if (flow.type === 'message') return {
    tag: 'Team message', title: f.text, place: 'messages', intro: 'Tap Save to send it to the property team.',
    rows: [['To', ctx.role === 'manager' ? 'The front desk team' : 'The manager and the desk team']],
    save: { do: 'message', text: f.text }, saved: 'Sent.',
  };
  if (flow.type === 'handoff') { const items = openItems(ctx); return {
    tag: 'Shift handoff', title: 'Notes for the next shift', place: 'handoff', intro: 'Here’s the draft. Tap Open handoff to read it once more and end your shift there.',
    rows: [['Notes', f.note || 'None'], ['Still open', items.length ? items.join(' • ') : 'Nothing open on the record']],
    save: { do: 'handoff', notes: f.note || '', items }, saveLabel: 'Open handoff', saved: 'The handoff is filled in. Read it once more, then end your shift.',
  }; }
  return null;
}

/* What the AI's plan means for the app (the server already checked ids, sections and values). */
export function fromAI(plan, ctx = {}) {
  if (!plan || !plan.kind) return null;
  const role = ctx.role === 'manager' ? 'manager' : 'concierge', all = things(ctx);
  const byId = (plan.ids || []).map(id => all.find(t => t.id === id)).filter(Boolean);
  const place = plan.open && PLACES[role][plan.open] ? plan.open : '';
  if (plan.kind === 'emergency') return { kind: 'emergency', protocol: PROTOCOLS[1], say: plan.reply };
  if (plan.kind === 'find' || (plan.kind === 'answer' && byId.length)) return byId.length ? { kind: 'find', things: byId, say: plan.reply } : { kind: 'say', say: plan.reply || 'I couldn’t find that on the record.' };
  if (plan.kind === 'open' && place) return { kind: 'open', open: place, say: plan.reply };
  if (plan.kind === 'protocol') return { kind: 'say', say: plan.reply, open: place || (role === 'concierge' ? 'sops' : '') };
  const allowed = role === 'manager' ? ['task', 'message'] : ['log', 'package', 'visitor', 'vendor', 'incident', 'task', 'message', 'handoff'];
  if (allowed.includes(plan.kind)) return { kind: 'start', type: plan.kind, fields: plan.fields || {} };
  return { kind: 'say', say: plan.reply || 'I can only help with Noted and this property’s front desk.' };
}
