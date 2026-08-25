# Notes (onepermit) — Product Requirements Document

## Original Problem Statement
Imported existing GitHub repo `onepermit00/Notes-` (a workforce operations app called "Notes", brand wordmark "onepermit"). User then supplied `MY-DESIGN-SYSTEM.zip` — an "Editorial Operations" design system extracted from another app — and requested a full visual redesign that recreates the editorial design language while preserving all existing functionality, content, routes, and business logic. Express Housing branding/content explicitly excluded.

## Product
Real-time workforce operations & accountability for property management, concierge, cleaning, security, and hospitality teams. Roles: Concierge (front-desk tablet), Manager (property oversight), Vendor/Enterprise.

## Architecture
- **Frontend:** React 19 (CRA + craco), Tailwind 3 + shadcn tokens, inline-styled dashboards, framer-motion, lucide-react. State-based page routing in `App.js` (landing → signin/signup → manager/concierge dashboard → calendar).
- **Backend:** FastAPI (`/app/backend/server.py`, ~1500 lines) — auth (cookie session + Bearer token), concierge management, shifts (start/end/history/handover), tasks, incidents, messages, SSE events. Prefix `/api`.
- **DB:** MongoDB (motor). Email via Resend (RESEND_API_KEY **not set** — emails skipped).
- **Mobile:** Expo app in `/app/mobile` (untouched).

## Design System (authority: MY-DESIGN-SYSTEM package, extracted to /tmp/ds)
- Inter only; coral accent `#FF385C` (sole primary); neutrals `#222/#717171/#EBEBEB`; warm `#F2F1EE`; dark `#0B0B0B/#171717`; status green/red/orange only for status.
- 8px rhythm, 1280px container, hairline borders, editorial display type (clamp, tight tracking), 44px touch targets, 16px inputs, focus-visible coral, reduced-motion support.
- Key files copied into project: `/app/frontend/src/styles/editorial.css` (tokens + foundations).

## Redesign Completed (Feb 2026)
1. **Foundations:** `index.css` — Inter-only font import, shadcn accent remapped indigo→coral (hsl 351 100% 61%), border #EBEBEB, radius 0.75rem; imports `styles/editorial.css`.
2. **LandingPage.jsx** — full editorial rebuild: 80px sticky header, text-led hero "Every shift. On the record.", numbered product rows, warm process chapter, near-black roles chapter + benefits rows, testimonials, pricing panels (featured = dark), dark conversion footer. All original copy/content preserved; vecteezy cartoon carousel removed per asset policy.
3. **SignIn.jsx / SignUp.jsx** — auth-shell pattern (dark editorial left panel, form right, mobile full-height). All logic preserved verbatim (role selector, 3-step signup, validation, strength meter, summary box). data-testids added throughout.
4. **ThemeContext.jsx** — added `ACCENT/ACCENT_SOFT/ACCENT_GLOW/WARM/EASE` canonical aliases (legacy `BLUE` kept — used by ~9000 lines of dashboards which already match DS palette).
5. **ManagerDashboard.jsx restyled (editorial)** — near-black `#0b0b0b` header/search bar + DAR chapter surfaces (was `#111827`), coral eyebrow rules on DAR/panel/modal headers, editorial workspace heading on home ("MANAGER WORKSPACE" eyebrow + 46px "Overview"), near-black active nav items with white text (light-on-dark in dark mode, `.nav-btn--active` class excluded from App.css hover rule), panel headers use coral rule + property eyebrow + 24px/800 title, off-token colors normalized (#6B7280→#717171, #8FAEDD→#6597FF), Inter wordmark. Added Escape-to-close for modals AND tab panels, aria-labels + data-testids (`panel-close-btn`, `task-modal-close`). Sidebar auto-expands after opening a panel (pre-existing behavior — collapsed rail buttons have `title` attrs, expanded ones don't).
6. **Drawer redesign (user reference: Express Housing admin unit drawer)** — all right-side drawers (10 tab panels, Assign Task, Emergency Contacts, Add Team Members) are now full-height flush drawers (top/bottom/right:0, hairline left border, no floating margins) with editorial headers: coral tracked eyebrow (property name), 42px extrabold title, 15px muted subtitle, 44px round X close button, 32px content gutters. Shifts keeps wide layout (left = sidebar width 64/248). Phone = full-bleed.
8. **Landing header + section intros (user reference 2: Express Housing landing)** — header: bold 24px "Notes" wordmark, centered nav links with gray pill hover (rounded-2xl, #f2f2f2), right-side rounded pill cluster (Sign in text + near-black Sign up pill inside bordered white pill w/ soft shadow), 88px tall. Hero second line "On the record." in coral. Section intros use icon + bold title + helper text pattern (`SectionIntro` component): ShieldCheck/Product, ListChecks/Process, Users/Roles(dark), Quote/Testimonials, Building2/Pricing. LANDING ONLY per user; dashboards untouched.

## Bug fixes
- Dev-server "Invalid Host header" → `allowedHosts: "all"` in craco.config.js.
- API base URL: `authApi.js` now appends `/api` in code; `frontend/.env` REACT_APP_BACKEND_URL kept as bare preview URL (platform rule).

## Testing
- iteration_14: 100% backend (9/9), 100% frontend (47/47). See `/app/memory/test_credentials.md`.

## Backlog / Notes
- RESEND_API_KEY needed for email features.
- GitHub push configured (token in /root/.git-credentials, remote `origin` → onepermit00/Notes-). User asked to push — pending confirmation choice.
- Landing role card "Enter as X" currently routes to sign-in (App.js ignores role arg) — same as original behavior.

9. **Concierge dashboard redesigned (matches manager)** — CaregiverDashboard.jsx: Inter-first font, #111827→#0b0b0b surfaces, #8FAEDD→#6597FF, near-black active nav (nav-btn--active), full-height flush drawers (main tab panel w/ PAGE_SUBTITLES, New Task wizard, Emergency Contacts, Pkg Audit, Amenities, Models, Task completion) with editorial headers, Escape-to-close effect (hooks at top of component — must stay before any early return), tracked-caps brand header + rounded search. DAR Sect/DARSect headers (BOTH dashboards) changed from solid color bars to accent top-rule + accent tracked-caps text. Verified end-to-end incl. 3-step New Task creation → appears in DAR.
