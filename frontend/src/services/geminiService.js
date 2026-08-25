// Concierge AI Assistant Service
// Trained on professional concierge standards, property management rules,
// and building-specific protocols for The Greystone at Midtown (Greystar)

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const chatSessions = {};

export const createChatSession = (sessionId, role = 'concierge') => {
  if (!chatSessions[sessionId]) {
    chatSessions[sessionId] = {
      id: sessionId,
      role,
      messages: [],
      createdAt: new Date().toISOString(),
    };
  }
  return chatSessions[sessionId];
};

export const sendChatMessage = async (sessionId, message, role = 'concierge', context = {}) => {
  try {
    const response = await fetch(`${API_URL}/api/copilot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, message, role, context }),
    });
    if (!response.ok) throw new Error('AI service unavailable');
    const data = await response.json();
    return data.response;
  } catch {
    return getConciergeResponse(message, role);
  }
};

// ─── Trained concierge knowledge base ────────────────────────────────────────

const getConciergeResponse = (message, role) => {
  const m = message.toLowerCase();

  // ── Emergency detection ───────────────────────────────────────────────────
  if (m.includes('fire') && (m.includes('smell') || m.includes('alarm') || m.includes('smoke'))) {
    return `🔴 FIRE EMERGENCY PROTOCOL:\n\n1. Call 911 immediately\n2. Activate the nearest pull station\n3. Do NOT use elevators — use stairwells only\n4. Initiate building evacuation via the intercom\n5. Direct residents to the assembly point: East parking lot on Peachtree Rd\n6. Call property manager Sarah Thompson: (404) 555-0123\n7. Meet fire department at the main entrance and provide building access\n8. Document everything in an incident report after the situation is resolved\n\n⚠️ Your safety and residents' safety come first. Do not re-enter the building.`;
  }

  if (m.includes('medical') || m.includes('unconscious') || m.includes('not breathing') || m.includes('heart attack') || m.includes('collapsed')) {
    return `🔴 MEDICAL EMERGENCY PROTOCOL:\n\n1. Call 911 immediately — give the address: 1850 Peachtree Road NW, Atlanta, GA 30309\n2. Stay with the person — keep them calm and still\n3. Send someone to the main entrance to meet paramedics and guide them up\n4. Do NOT move the person unless there is immediate danger (e.g., fire)\n5. If trained in CPR/AED: our AED is located in the main lobby near the elevator bank\n6. Notify property manager Sarah Thompson: (404) 555-0123\n7. File an incident report immediately after EMS departs\n\nPoison Control (if needed): (800) 222-1222`;
  }

  if (m.includes('elevator') && (m.includes('stuck') || m.includes('trapped'))) {
    return `🔴 ELEVATOR ENTRAPMENT:\n\n1. Use the in-elevator phone or intercom to communicate with the trapped person — reassure them help is coming\n2. Call the elevator emergency line: (800) 233-6935\n3. Do NOT attempt to pry doors open yourself\n4. Notify property manager: (404) 555-0123\n5. Stay at the elevator and maintain communication until technicians arrive\n6. Document the incident — elevator number, time, how many people, resolution time`;
  }

  if (m.includes('flood') || m.includes('water leak') || m.includes('pipe burst')) {
    return `🔴 WATER INTRUSION / FLOOD:\n\n1. Call maintenance emergency line immediately: (404) 555-0199\n2. If you can safely reach the water shut-off valve, turn it off\n3. Alert affected residents on the impacted floor(s)\n4. Keep people away from standing water (electrical hazard)\n5. Document with photos — take photos before cleanup begins\n6. Notify Sarah Thompson (Property Manager): (404) 555-0123\n7. Log a detailed incident report`;
  }

  if (m.includes('power') && (m.includes('out') || m.includes('outage'))) {
    return `⚡ POWER OUTAGE:\n\n1. Call the electricity emergency line: (888) 891-0938\n2. Emergency lighting will activate automatically throughout the building\n3. Elevator alarms may sound — call (800) 233-6935 if anyone is trapped\n4. Notify property manager: (404) 555-0123\n5. Remain at the lobby desk to assist residents and manage access\n6. Do NOT prop exterior doors open for any reason during a power outage\n7. Document time of outage and restoration`;
  }

  // ── Noise complaints ──────────────────────────────────────────────────────
  if (m.includes('noise') || m.includes('loud') || m.includes('party') || m.includes('music')) {
    return `📋 NOISE COMPLAINT PROTOCOL:\n\nQuiet Hours: 10:00 PM – 8:00 AM (weekdays) · 11:00 PM – 9:00 AM (weekends)\n\n**Step 1** — Call the unit: Ask politely that they reduce noise. Document the call (time, unit, who you spoke with).\n\n**Step 2** — If no answer or no change after 10 minutes: Go to the unit in person. Knock only — never enter. Explain the quiet hours policy professionally.\n\n**Step 3** — If still unresolved: Notify property manager via text/call. After hours, use the after-hours line: (404) 555-0199.\n\n**Step 4** — For aggressive or threatening situations: Call 911. Your safety is the priority.\n\n⚠️ Always file an incident report for every noise complaint, regardless of outcome. Include: time, unit number, complainant (unit or anonymous), action taken, and resolution.`;
  }

  // ── Unauthorized access / suspicious activity ─────────────────────────────
  if (m.includes('unauthorized') || m.includes('trespassing') || m.includes('suspicious') || m.includes('unknown person')) {
    return `🔒 UNAUTHORIZED ACCESS / SUSPICIOUS ACTIVITY:\n\n**Key rules:**\n- NEVER reveal resident unit numbers, schedules, or personal info to strangers\n- Do NOT confront aggressive or potentially dangerous individuals\n- Trust your instincts — if something feels wrong, document it and escalate\n\n**Unauthorized building entry:**\n1. Politely ask for the resident's name and unit number\n2. Call the resident to verify — if unverified, deny access\n3. If they refuse to leave, call non-emergency police: (404) 546-4235\n4. Document: description, time, what was said, outcome\n\n**Suspicious vehicle in garage:**\n1. Photograph the vehicle and license plate (do not approach closely)\n2. Check against the registered vehicle list\n3. Log in incident report and notify property manager\n4. Do NOT arrange towing without property manager approval\n\n**Suspicious package:**\n1. Do not touch or move it\n2. Clear the area\n3. Call non-emergency police\n4. Notify property manager`;
  }

  // ── Package handling ──────────────────────────────────────────────────────
  if (m.includes('package') || m.includes('delivery') || m.includes('parcel')) {
    return `📦 PACKAGE MANAGEMENT:\n\n**Receiving:**\n- Log every package immediately: carrier, resident unit, tracking number, condition\n- For packages requiring signature: call/text resident right away\n- Photograph any damaged packages before moving them\n\n**Aged packages (3+ days):**\n- Apply orange flag sticker\n- Notify leasing office at (404) 555-0126\n- Document in the package log\n\n**Releasing packages:**\n- Only release to the resident on record OR a pre-authorized person with written consent\n- Always verify ID\n- Never release to movers, guests, or delivery drivers returning\n\n**Suspicious packages:**\n- Unusual odor, leaking, ticking, no return address, unexpected origin\n- Do NOT touch or move it\n- Evacuate the area and call 911\n- Do NOT put it in water or a microwave\n\n**Package room capacity:** If the room is full, notify leasing immediately — do not stack packages in the lobby.`;
  }

  // ── Visitor / contractor management ───────────────────────────────────────
  if (m.includes('visitor') || m.includes('contractor') || m.includes('vendor') || m.includes('technician')) {
    return `👤 VISITOR & CONTRACTOR MANAGEMENT:\n\n**All visitors:**\n1. Request a valid photo ID\n2. Call the resident to confirm they are expecting this person\n3. Log: full name, ID type, unit visiting, time in, purpose\n4. Issue a visitor badge if available\n5. Log time out when they leave\n\n**Contractors & vendors:**\n1. Verify their company name and work order number before granting access\n2. Never grant access based on a verbal claim alone\n3. Escort to the work area — do not let them navigate freely\n4. Issue a temporary access badge; collect it on departure\n5. Log all details in the visitor log AND in the shift log\n\n**Recurring vendors** (landscaping, pest control, cleaning):\n- Check the approved vendor schedule each morning\n- Cross-reference their company ID against the approved vendor list\n\n**Unauthorized contractors:**\n- Politely deny access if they cannot provide a valid work order\n- Notify property manager immediately`;
  }

  // ── Move-in / move-out ────────────────────────────────────────────────────
  if (m.includes('move') || m.includes('moving') || m.includes('mover')) {
    return `🚛 MOVE-IN / MOVE-OUT PROTOCOL:\n\n1. **Verify** the move is on today's approved schedule (check with leasing)\n2. **Reserve** the freight elevator for the move window\n3. **Protect** the lobby: place elevator pads and floor runners before movers arrive\n4. **Inspect** common areas BEFORE movers enter — photograph any pre-existing damage\n5. **Movers** must use the loading dock entrance. Main lobby doors must NEVER be propped open\n6. **Issue / collect** key fobs, parking passes, and mailbox keys per the leasing checklist\n7. **Inspect** common areas AFTER movers leave — document any new damage immediately\n8. **Notify leasing** if any damage occurs — do not accept payment directly from movers\n\n⚠️ Residents are responsible for their movers' conduct in common areas.`;
  }

  // ── Professional standards ────────────────────────────────────────────────
  if (m.includes('how to greet') || m.includes('greeting') || m.includes('professional') || m.includes('etiquette')) {
    return `🎩 PROFESSIONAL CONCIERGE STANDARDS:\n\n**Greeting residents:**\n- Always stand and make eye contact when a resident approaches\n- Use their name when you know it: "Good morning, Mr. Johnson!"\n- If you don't know their name: "Good morning! How can I help you today?"\n- Smile — your energy sets the tone for the entire building experience\n\n**Phone etiquette:**\n- Answer within 3 rings: "Good [morning/afternoon], The Greystone, this is [your name], how can I help you?"\n- Never put someone on hold for more than 60 seconds without checking back\n- Always take a message if someone is unavailable — name, callback number, time of call\n\n**Dress & appearance:**\n- Uniform must be clean and pressed at all times\n- Name tag visible at all times\n- No personal phone use at the front desk when residents are present\n\n**Confidentiality:**\n- Never share resident unit numbers, schedules, or any personal information with anyone\n- If a resident asks about another resident: "I'm sorry, I'm unable to share that information"\n- All building incidents and resident interactions are strictly confidential`;
  }

  // ── Amenity questions ─────────────────────────────────────────────────────
  if (m.includes('pool') || m.includes('gym') || m.includes('fitness') || m.includes('rooftop') || m.includes('amenity')) {
    return `🏊 BUILDING AMENITIES:\n\n**Rooftop Pool:** 6:00 AM – 10:00 PM daily\n- No glass in pool area\n- Guests must be accompanied by a resident at all times\n- Max capacity: 50 persons\n- Safety ring and first aid kit must be present — check daily\n\n**Fitness Center:** 24 hours / 7 days (fob required after 10pm)\n- Report equipment malfunctions to maintenance immediately: (404) 555-0124\n- No guests in the fitness center after 10pm\n\n**Rooftop Terrace:** 8:00 AM – 11:00 PM (Sun–Thu) · 8:00 AM – 12:00 AM (Fri–Sat)\n- Maximum occupancy: 75 persons\n- Private events must be pre-booked through leasing\n\n**Dog Park:** 6:00 AM – 10:00 PM\n- Dogs must be leashed in all common areas\n- Owners responsible for cleanup\n\n**Club Room:** 8:00 AM – 11:00 PM daily\n- Private bookings through leasing only`;
  }

  // ── Shift handoff / documentation ─────────────────────────────────────────
  if (m.includes('handoff') || m.includes('shift report') || m.includes('document') || m.includes('log')) {
    return `📝 SHIFT HANDOFF & DOCUMENTATION:\n\n**The Golden Rule:** The next person on shift should never walk in blind. Your documentation is their preparation.\n\n**Your handoff report must include:**\n1. All incidents that occurred (even minor ones — they escalate)\n2. Every visitor and contractor who entered the building\n3. Any outstanding packages or mail items\n4. Building status updates (any equipment issues, amenity closures)\n5. Anything the next shift needs to monitor or follow up on\n6. Notes for specific teams: tag as [Maintenance], [Leasing], or [Manager]\n\n**Best practices:**\n- Log incidents in real time — don't wait until end of shift\n- Be factual: who, what, when, where, outcome\n- Avoid opinions or assumptions in the log\n- If in doubt, document it — it's always better to have a record\n\n**Submit before clocking out** — the Shift Handoff Report is a required task every shift.`;
  }

  // ── General greetings ─────────────────────────────────────────────────────
  if (m.includes('hello') || m.includes('hi') || m.includes('hey') || m.includes('help')) {
    return getGreeting(role);
  }

  // ── Default intelligent response ──────────────────────────────────────────
  return `I'm your Concierge AI Assistant for The Greystone at Midtown. I can help you with:\n\n• **Emergency procedures** — fire, medical, power outage, flood\n• **Noise complaint protocols** — step-by-step resolution\n• **Unauthorized access & suspicious activity**\n• **Package management** — receiving, flagging, releasing\n• **Visitor & contractor procedures**\n• **Move-in / move-out protocol**\n• **Professional standards & resident etiquette**\n• **Amenity rules and hours**\n• **Shift documentation best practices**\n\nWhat situation are you dealing with?`;
};

// ─── Greeting by role ─────────────────────────────────────────────────────────
export const getGreeting = (role) => {
  if (role === 'concierge' || role === 'shift_staff') {
    return `Welcome to your Concierge AI Assistant for The Greystone at Midtown.\n\nI'm trained on this building's rules, standard operating procedures, professional concierge standards, and emergency protocols. Ask me anything — from how to handle a noise complaint at 2am to the correct procedure for a contractor sign-in.\n\nWhat do you need help with?`;
  }
  return `Hello! I'm the Concierge Operations Assistant for The Greystone at Midtown.\n\nI can summarize shift activity, explain incident reports, and answer questions about building operations. What would you like to know?`;
};

export const clearChatSession = (sessionId) => {
  if (chatSessions[sessionId]) delete chatSessions[sessionId];
};

export default { createChatSession, sendChatMessage, getGreeting, clearChatSession };
