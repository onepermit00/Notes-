# ADLTrack - Product Requirements Document

## Original Problem Statement
Build a comprehensive caregiving coordination application named "ADLTrack". The primary and ongoing task is to make the web application's dashboards an exact visual and functional replica of the mobile app (`/app/mobile/ADLTrackComplete.js`). This is a meticulous, screenshot-driven process where the user provides designs for specific pages, and the agent implements them.

## Core Requirements
- Achieve visual and functional parity between the mobile app (React Native) and the web app (React)
- All new web development must exactly replicate the mobile app's dark-themed, component-based design aesthetic
- Replicate all mobile app functionality on the web app, including multi-step forms and detailed modal views
- The user is the ultimate arbiter of design accuracy and expects a pixel-perfect match to reference images

## Architecture
- **Frontend (Web):** React, JSX, TailwindCSS, Shadcn/UI components
- **Frontend (Mobile):** Expo (React Native), React Navigation
- **Backend:** FastAPI (minimal, mostly mocked data)
- **Database:** MongoDB (not yet integrated - all data mocked)
- **Data:** All hardcoded in `/app/frontend/src/services/mockData.js`

## What's Been Implemented

### Completed Features (as of Feb 17, 2026)
1. **Vital Signs Modal** - Multi-themed modal for BP, Heart Rate, Temperature, Pain
2. **Incident Report Page** - 5-step form with red-themed styling, full-screen overlay pattern
3. **Shifts Tab (NEW)** - Complete redesign matching mobile app screenshots:
   - Shift Status card with On/Off shift states, Clock In/Out times, Weekly Hours
   - Green "Clock In" / Red "Clock Out" button with GPS verification
   - Custom alert dialog for Clock In/Out confirmations
   - Active Client selector with dropdown modal showing 3 clients
   - Client list with avatars, conditions, task counts, risk badges (MODERATE/HIGH/LOW)
   - Quick Actions: View Earnings, Shift History
   - Shift History sub-page with filter tabs (All/Completed/Cancelled)
4. **Bottom Navigation** - Full-screen overlay pattern to prevent floating nav on forms
5. **Landing Page, Auth Flow, Role Selection**

### Key Files
- `/app/frontend/src/components/CaregiverDashboard.jsx` - Main caregiver dashboard with all tabs
- `/app/frontend/src/components/IncidentReportPage.jsx` - 5-step incident form
- `/app/frontend/src/components/VitalsModal.jsx` - Vitals display modal
- `/app/frontend/src/services/mockData.js` - All mock data (CLIENTS, SHIFT_HISTORY, etc.)
- `/app/mobile/ADLTrackComplete.js` - Mobile app source of truth for design

## Prioritized Backlog

### P0 (Critical)
- ~~Fix UI Unresponsiveness and Scrolling Bugs~~ (FIXED - Mar 19, 2026)

### P1 (High Priority)
- Redesign Mobile App Patient Profile in `/app/mobile/ADLTrackComplete.js`
- Build Agency Dashboard for web app
- Connect AI Copilot with Gemini API integration

### P2 (Medium Priority)
- Build Caseworker web dashboard
- Build Doctor web dashboard
- Integrate AsyncStorage for persistent mobile sessions
- Backend API integration (replace mocked data with real API endpoints)

### P3 (Future/Refactoring)
- Decompose monolithic `/app/mobile/ADLTrackComplete.js` into modular components
- Refactor `CaregiverDashboard.jsx` god component into smaller sub-components
- Set up proper MongoDB data models and backend CRUD operations

## Technical Notes
- Full-screen overlay pattern (`fixed inset-0 z-50`) used for forms to prevent bottom nav issues
- All data currently mocked - no backend integration yet
- The `skipStartShift=true` prop auto-starts the shift when the caregiver dashboard loads
- Client list modal uses z-[60] to appear above other overlays
