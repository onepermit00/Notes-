import React, { useId } from 'react';

/** The assistant's face: a round character in a green knit hat with a little heart. */
export function AssistantFace() {
  const id = `assistant-face-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return <svg viewBox="0 0 100 100" aria-hidden="true" style={{ display:'block', width:'100%', height:'100%' }}>
    <defs>
      <radialGradient id={id} cx="45%" cy="40%"><stop offset="0" stopColor="#ffe3cf" /><stop offset="1" stopColor="#f4c4a4" /></radialGradient>
    </defs>
    <rect width="100" height="100" fill="#f3ead9" />
    <ellipse cx="50" cy="106" rx="40" ry="26" fill="#8fb486" />
    <circle cx="50" cy="60" r="30" fill={`url(#${id})`} />
    <path d="M18 52c0-20 14-32 32-32s32 12 32 32c-10-6-20-8-32-8s-22 2-32 8z" fill="#8fb486" />
    <path d="M19 52c10-6 20-8 31-8s21 2 31 8" stroke="#6d9366" strokeWidth="5" fill="none" strokeLinecap="round" />
    <g stroke="#ffffff" strokeOpacity=".35" strokeWidth="1.4" fill="none"><path d="M30 28v14M40 23v19M50 21v21M60 23v19M70 28v14" /></g>
    <circle cx="50" cy="18" r="7" fill="#f8f4ec" />
    <path d="M50 36.5c-2.4-3-6.5-1-5 2 1 2 5 4.5 5 4.5s4-2.5 5-4.5c1.5-3-2.6-5-5-2z" fill="#e9866f" />
    <ellipse cx="40" cy="62" rx="3" ry="3.6" fill="#2a2420" /><ellipse cx="60" cy="62" rx="3" ry="3.6" fill="#2a2420" />
    <circle cx="41" cy="60.8" r="1" fill="#fff" /><circle cx="61" cy="60.8" r="1" fill="#fff" />
    <ellipse cx="33" cy="70" rx="5" ry="3" fill="#f29c8c" opacity=".5" /><ellipse cx="67" cy="70" rx="5" ry="3" fill="#f29c8c" opacity=".5" />
    <path d="M45 71q5 5 10 0" stroke="#2a2420" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>;
}

export default AssistantFace;
