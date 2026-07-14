// Converts a logged activity object into a professional narrative sentence for the live DAR.
// Each activity keeps its own timestamp — arrivals and departures are NEVER merged.
export function toNarrative(activity) {
  const { title = '', notes = '', time = '', category = '' } = activity;

  // Extract time-of-day: "Jul 14, 8:47 PM" → "8:47 PM"
  const tod = time.includes(', ') ? time.split(', ')[1] : time;
  const pre = tod ? `${tod} — ` : '';

  // Clean context note (skip if empty or "N/A")
  const ctx = notes && notes.trim() && !['n/a', ''].includes(notes.trim().toLowerCase())
    ? notes.trim()
    : '';

  const period = (s) => s.endsWith('.') || s.endsWith('!') || s.endsWith('?') ? s : `${s}.`;
  const append = (base) => ctx ? `${period(base)} ${period(ctx)}` : period(base);

  // ── GUEST ARRIVAL ──────────────────────────────────────────────────────────
  if (/guest arrival/i.test(title)) {
    const m = title.match(/Guest arrival[^·]*·\s*(.+?)\s*→\s*(.+?)\s*·\s*Unit\s*(\S+)/i);
    if (m) {
      const [, guest, resident, unit] = m;
      const purposeCtx = ctx ? ` ${period(ctx)}` : '';
      return `${pre}Guest arrived — ${guest} checked in as a visitor for ${resident}, Unit ${unit}.${purposeCtx}`;
    }
    return `${pre}${append('Guest arrival logged')}`;
  }

  // ── GUEST CHECK-IN (PRE-REGISTERED) ───────────────────────────────────────
  if (/guest check-in \(pre-reg\)/i.test(title)) {
    const m = title.match(/Guest check-in[^·]*·\s*(.+?)\s*→\s*(.+?)\s*·\s*Unit\s*(\S+)/i);
    if (m) {
      const [, guest, resident, unit] = m;
      return `${pre}Pre-registered guest arrived — ${guest} checked in for ${resident}, Unit ${unit}${ctx ? `. ${period(ctx)}` : '.'}`;
    }
    return `${pre}${append('Pre-registered guest checked in')}`;
  }

  // ── GUEST DEPARTURE ────────────────────────────────────────────────────────
  if (/guest departure/i.test(title)) {
    const m = title.match(/Guest departure[^·]*·\s*(.+?)\s*→\s*(.+?)\s*·\s*Unit\s*(\S+)/i);
    if (m) {
      const [, guest, resident, unit] = m;
      return `${pre}Guest departed — ${guest} (visitor for ${resident}, Unit ${unit}) left the building${ctx ? `. ${period(ctx)}` : '.'}`;
    }
    return `${pre}${append('Guest departed the building')}`;
  }

  // ── VENDOR CHECK-IN ────────────────────────────────────────────────────────
  if (/vendor check-in/i.test(title)) {
    const m = title.match(/Vendor check-in[^·]*·\s*(.+?)\s*·\s*(.+)/i);
    if (m) {
      const [, company, purposePart] = m;
      const detail = ctx
        ? `${period(ctx)}`
        : 'Vendor was escorted to their destination.';
      return `${pre}Vendor arrived — ${company} (${purposePart.trim()}) checked in and was granted building access. ${detail}`;
    }
    return `${pre}${append('Vendor checked in')}`;
  }

  // ── VENDOR CHECK-OUT ───────────────────────────────────────────────────────
  if (/vendor check-out/i.test(title)) {
    const m = title.match(/Vendor check-out[^·]*·\s*(.+?)\s*·\s*(.+)/i);
    if (m) {
      const [, company, purposePart] = m;
      const detail = ctx
        ? `${period(ctx)}`
        : 'Work completed and vendor exited the building.';
      return `${pre}Vendor departed — ${company} (${purposePart.trim()}) checked out. ${detail}`;
    }
    return `${pre}${append('Vendor checked out')}`;
  }

  // ── LOANER CHECKOUT ────────────────────────────────────────────────────────
  if (/loaner checkout/i.test(title)) {
    const m = title.match(/Loaner checkout[^·]*·\s*(.+?)\s*·\s*(.+?)\s*·\s*Unit\s*(\S+)/i);
    if (m) {
      const [, item, resident, unit] = m;
      return `${pre}Loaner item issued — ${item} checked out to ${resident}, Unit ${unit}. Item condition documented, signature obtained${ctx ? `. ${period(ctx)}` : '.'}`;
    }
    return `${pre}${append('Loaner item checked out')}`;
  }

  // ── LOANER RETURN ──────────────────────────────────────────────────────────
  if (/loaner return/i.test(title)) {
    const m = title.match(/Loaner return[^·]*·\s*(.+)/i);
    if (m) {
      const [, item] = m;
      return `${pre}Loaner item returned — ${item} received, inspected, and secured${ctx ? `. ${period(ctx)}` : '.'}`;
    }
    return `${pre}${append('Loaner item returned and secured')}`;
  }

  // ── LOCKOUT ────────────────────────────────────────────────────────────────
  if (/lockout/i.test(title)) {
    const m = title.match(/Lockout[^·]*·\s*(.+?)\s*·\s*Unit\s*(\S+)/i);
    if (m) {
      const [, resident, unit] = m;
      const detail = ctx ? period(ctx) : 'Identity verified per protocol and access was restored.';
      return `${pre}Lockout assistance — ${resident}, Unit ${unit}. ${detail}`;
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
    return `${pre}Tour conducted — ${append(title)}`;
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
    return `${pre}Resident assistance — ${append(title)}`;
  }

  // ── DEFAULT ────────────────────────────────────────────────────────────────
  return `${pre}${append(title)}`;
}
