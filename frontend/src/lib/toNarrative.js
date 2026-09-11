// Converts a logged activity object into a professional narrative sentence for the live DAR.
// Each activity keeps its own timestamp — arrivals and departures are NEVER merged.
export function toNarrative(activity) {
  const { title = '', notes = '', time = '', category = '' } = activity;

  // Extract time-of-day via regex so iOS locale variants never leak the date
  const timeMatch = time.match(/\d{1,2}:\d{2}\s*(?:AM|PM)/i);
  const tod = timeMatch ? timeMatch[0].replace(/\s*(AM|PM)$/i, (_, m) => m.toLowerCase()) : (time.includes(', ') ? time.split(', ')[1] : time);
  const pre = tod ? `${tod} — ` : '';

  // Clean context note (skip if empty or "N/A")
  const ctx = notes && notes.trim() && !['n/a', ''].includes(notes.trim().toLowerCase())
    ? notes.trim()
    : '';

  const cleanSentence = (value) => {
    const cleaned = String(value || '')
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.;:!?])/g, '$1')
      .trim();
    return cleaned
      ? cleaned.replace(/(^|[.!?]\s+)([a-z])/g, (_, boundary, letter) => `${boundary}${letter.toUpperCase()}`)
      : '';
  };
  const period = (s) => {
    const cleaned = cleanSentence(s);
    return !cleaned || /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
  };
  const properName = (value) => String(value || '').trim().replace(/\b([a-z])/g, letter => letter.toUpperCase());
  const contextSentence = (value) => period(String(value || '')
    .replace(/\s*·\s*/g, '. ')
    .replace(/\bAuth:\s*/gi, 'Authorized by ')
    .replace(/\bIn:\s*/gi, 'Checked in at '));
  const append = (base) => ctx ? `${period(base)} ${contextSentence(ctx)}` : period(base);

  // ── PACKAGE DELIVERY ─────────────────────────────────────────────────
  if (/package delivery/i.test(title)) {
    const m = title.match(/Package delivery[^·]*·\s*(.+?)\s*→\s*Unit\s*(.+)$/i);
    if (m) return `${pre}${append(`${m[1].trim()} delivery received for Unit ${m[2].trim()}`)}`;
  }

  // ── PACKAGE PICKUP ──────────────────────────────────────────────────
  if (/package pickup/i.test(title)) {
    const m = title.match(/Package pickup[^·]*·\s*(.+?)\s*·\s*Unit\s*(.+)$/i);
    if (m) return `${pre}${append(`${properName(m[1])} collected a package for Unit ${m[2].trim()}`)}`;
  }

  // ── GUEST ARRIVAL ──────────────────────────────────────────────────────────
  if (/guest arrival/i.test(title)) {
    const m = title.match(/Guest arrival[^·]*·\s*(.+?)\s*→\s*(.+?)\s*·\s*Unit\s*(\S+)/i);
    if (m) {
      const [, guest, resident, unit] = m;
      return `${pre}${properName(guest)} arrived to visit ${properName(resident)} in Unit ${unit}.${ctx ? ` ${contextSentence(ctx)}` : ''}`;
    }
    return `${pre}${append('Guest arrival logged')}`;
  }

  // ── GUEST CHECK-IN (PRE-REGISTERED) ───────────────────────────────────────
  if (/guest check-in \(pre-reg\)/i.test(title)) {
    const m = title.match(/Guest check-in[^·]*·\s*(.+?)\s*→\s*(.+?)\s*·\s*Unit\s*(\S+)/i);
    if (m) {
      const [, guest, resident, unit] = m;
      return `${pre}${properName(guest)} arrived for a pre-registered visit with ${properName(resident)} in Unit ${unit}.${ctx ? ` ${contextSentence(ctx)}` : ''}`;
    }
    return `${pre}${append('Pre-registered guest checked in')}`;
  }

  // ── GUEST DEPARTURE ────────────────────────────────────────────────────────
  if (/guest departure/i.test(title)) {
    const m = title.match(/Guest departure[^·]*·\s*(.+?)\s*→\s*(.+?)\s*·\s*Unit\s*(\S+)/i);
    if (m) {
      const [, guest, resident, unit] = m;
      return `${pre}${properName(guest)}, visitor for ${properName(resident)} in Unit ${unit}, departed the building.${ctx ? ` ${contextSentence(ctx)}` : ''}`;
    }
    return `${pre}${append('Guest departed the building')}`;
  }

  // ── VENDOR CHECK-IN ────────────────────────────────────────────────────────
  if (/vendor check-in/i.test(title)) {
    const m = title.match(/Vendor check-in[^·]*·\s*(.+?)\s*·\s*(.+)/i);
    if (m) {
      const [, company, purposePart] = m;
      const detail = ctx ? contextSentence(ctx) : '';
      return `${pre}${properName(company)} checked in for ${purposePart.trim()} work.${detail ? ` ${detail}` : ''}`;
    }
    return `${pre}${append('Vendor checked in')}`;
  }

  // ── VENDOR CHECK-OUT ───────────────────────────────────────────────────────
  if (/vendor check-out/i.test(title)) {
    const m = title.match(/Vendor check-out[^·]*·\s*(.+?)\s*·\s*(.+)/i);
    if (m) {
      const [, company, purposePart] = m;
      const detail = ctx ? contextSentence(ctx) : '';
      return `${pre}${properName(company)} checked out after ${purposePart.trim()} work.${detail ? ` ${detail}` : ''}`;
    }
    return `${pre}${append('Vendor checked out')}`;
  }

  // ── LOANER CHECKOUT ────────────────────────────────────────────────────────
  if (/loaner checkout/i.test(title)) {
    const m = title.match(/Loaner checkout[^·]*·\s*(.+?)\s*·\s*(.+?)\s*·\s*Unit\s*(\S+)/i);
    if (m) {
      const [, item, resident, unit] = m;
      return `${pre}${item.trim()} was issued to ${properName(resident)} in Unit ${unit}.${ctx ? ` ${contextSentence(ctx)}` : ''}`;
    }
    return `${pre}${append('Loaner item checked out')}`;
  }

  // ── LOANER RETURN ──────────────────────────────────────────────────────────
  if (/loaner return/i.test(title)) {
    const m = title.match(/Loaner return[^·]*·\s*(.+)/i);
    if (m) {
      const [, item] = m;
      return `${pre}${item.trim()} was returned, inspected, and secured.${ctx ? ` ${contextSentence(ctx)}` : ''}`;
    }
    return `${pre}${append('Loaner item returned and secured')}`;
  }

  // ── LOCKOUT ────────────────────────────────────────────────────────────────
  if (/lockout/i.test(title)) {
    const m = title.match(/Lockout[^·]*·\s*(.+?)\s*·\s*Unit\s*(\S+)/i);
    if (m) {
      const [, resident, unit] = m;
      const detail = ctx ? contextSentence(ctx) : 'Identity was verified and access was restored.';
      return `${pre}Assisted ${properName(resident)} with a lockout at Unit ${unit}. ${detail}`;
    }
    return `${pre}${append('Lockout assistance provided. Identity verified and access restored')}`;
  }

  // ── PACKAGE AUDIT ──────────────────────────────────────────────────────────
  if (/package room audit/i.test(title)) {
    const status = title.replace(/package room audit\s*·?\s*/i, '').trim();
    return `${pre}Package room audit completed${status ? ` — ${status}` : ''}${ctx ? `. ${period(ctx)}` : '.'}`;
  }

  // ── TOURS ──────────────────────────────────────────────────────────────────
  if (/tour/i.test(category) || /tour/i.test(title)) {
    const m = title.match(/Tour[^·]*·\s*(.+?)(?:\s*·\s*(.+))?$/i);
    if (m) return `${pre}${properName(m[1])} completed ${m[2] ? `a ${m[2].trim()} tour` : 'a property tour'}.${ctx ? ` ${contextSentence(ctx)}` : ''}`;
    return `${pre}${append('Property tour completed')}`;
  }

  // ── SECURITY / ROUNDS ──────────────────────────────────────────────────────
  if (category === 'Safety / Security') {
    return `${pre}${append(title)}`;
  }

  // ── AMENITY ────────────────────────────────────────────────────────────────
  if (category === 'Amenity') {
    return `${pre}${append(title)}`;
  }

  // ── DELIVERY ───────────────────────────────────────────────────────────────
  if (category === 'Delivery') {
    return `${pre}${append(title)}`;
  }

  // ── RESIDENT ASSIST (general) ──────────────────────────────────────────────
  if (category === 'Resident Assist') {
    return `${pre}${append(title)}`;
  }

  // ── DEFAULT ────────────────────────────────────────────────────────────────
  return `${pre}${append(title)}`;
}
