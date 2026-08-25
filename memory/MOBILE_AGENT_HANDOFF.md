# ADLTrack - Mobile Agent Handoff Document

## Overview
This document provides a comprehensive specification for the Mobile Agent to recreate the ADLTrack web application as a native mobile app using Expo (React Native).

## App Identity
- **App Name**: ADLTrack
- **Tagline**: "Simple. Secure. Reliable Care."
- **Primary Color**: #25D366 (Green)
- **Secondary Colors**: 
  - Rose/Pink: #f43f5e (for incidents, alerts)
  - Dark mode background: stone-950
  - Light mode background: white
- **Font**: Manrope (or closest system equivalent)

## User Roles & Flows

### 1. Caregiver Flow
**Purpose**: Professional caregivers who manage shifts, complete tasks, and document care activities

**Bottom Navigation (5 tabs)**:
| Tab | Icon | Label | Active Color |
|-----|------|-------|--------------|
| Home | Home | Home | Green #25D366 |
| Incident | AlertTriangle | Incident | Green #25D366 |
| Message | MessageSquare | Message | Green #25D366 |
| Shifts | Clock | Shifts | Green #25D366 |
| Menu | Settings | Menu | Green #25D366 |

**Home Tab Features**:
- Patient photo and name at top (clickable to view profile)
- Vitals grid (4 cards): BP, Heart Rate, Temp, Pain Level
- Today's Progress bar (completed/total tasks)
- Tab switcher: "Requests" | "Today's Tasks"
- Task cards with:
  - Priority badge (CRITICAL = rose, STANDARD = gray)
  - Task title and scheduled time
  - Photo required indicator
  - Expandable task details
  - Start Task button

**Incident Tab Features**:
- Header: "Incidents - Report and track incidents for [Patient Name]"
- "New Incident Report" button (rose/pink card)
- "Past Reports" section with count badge
- Multi-step incident creation:
  1. Select incident type (Fall, Injury, Behavior Change, Medication Issue, Health Concern, Other)
  2. Add description (text area)
  3. Attach photo evidence (camera integration)
  4. Toggle: "Notify Emergency Contacts"
  5. Submit button
- Incident cards show: Type icon, title, description preview, timestamp, status badge

**Shift Tab Features**:
- Current Shift status card (Active/Inactive)
- Start/End Shift button
- Shift details when active (Started time, Patient name, Tasks completed)
- Quick actions: View Earnings, Shift History

**Menu Tab Features**:
- Profile card at top (photo, name, title) - clickable to Profile page
- Menu items with icons:
  - Earnings (Activity icon)
  - Shift History (Clock icon)
  - Settings (Settings icon)
  - Support (Bell icon)
- Sign Out button (rose/red styling)

### 2. Family Member Flow
**Purpose**: Family guardians who monitor their loved one's care

**Bottom Navigation (5 tabs)**:
| Tab | Icon | Label | Active Color | Badge |
|-----|------|-------|--------------|-------|
| Home | Home | Home | Green | - |
| Incident | AlertTriangle | Incident | Green | Count if incidents exist |
| Message | MessageSquare | Message | Green | - |
| Alerts | Bell | Alerts | Green | - |
| Menu | Settings | Menu | Green | - |

**Home Tab Features**:
- Vitals grid (4 cards): BP, Heart Rate, Temp, Pain Level (all clickable to vitals detail)
- Today's Progress bar
- Historical date banner (when viewing past dates)
- Tab switcher: "My Requests" | "Care Timeline"
- **My Requests Tab**:
  - Add New Request button (dashed border)
  - Request cards with priority, status, title, description
- **Care Timeline Tab**:
  - Photo-rich cards showing completed tasks
  - Task image, title, completion time
  - Caregiver notes
  - Caregiver attribution (photo, name, role)

**Incident Tab Features**:
- Header: "Incident Reports - Care incidents reported for [Patient Name]"
- Summary card: Total | Resolved | Open counts
- "Recent Incidents" section
- Incident cards (view only, created by caregiver):
  - Type icon and badge
  - Title and description
  - Timestamp and status
  - Caregiver attribution
  - Attached photos (clickable to view full-size modal)

**Menu Tab Features**:
- Profile card (Family Guardian details)
- Quick patient access button
- Menu items: Current Caregiver, Billing, Settings, Support
- Sign Out button

### 3. Agency Flow (Enterprise)
**Purpose**: Healthcare agencies managing multiple caregivers and patients

**Features**:
- Multi-patient dashboard
- Staff overview with status indicators
- Compliance tracking (EVV)
- Alerts and notifications
- AI chat assistant for agency queries

## Data Models

### Task
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "scheduledTime": "string (8:00 AM)",
  "priority": "critical | standard | low",
  "status": "pending | in_progress | completed",
  "requiresPhoto": "boolean",
  "completedAt": "string (optional)",
  "completionNote": "string (optional)",
  "evidenceUrl": "string (optional)"
}
```

### Incident
```json
{
  "id": "number",
  "type": "fall | injury | behavior | medication | health | other",
  "title": "string",
  "description": "string",
  "photos": "string[] (URLs)",
  "status": "open | resolved",
  "notifyEmergency": "boolean",
  "createdAt": "string (timestamp)",
  "createdBy": "string (caregiver name)"
}
```

### Vitals
```json
{
  "bloodPressure": [{ "systolic": 120, "diastolic": 76, "time": "8:00 AM", "date": "Jan 17" }],
  "heartRate": [{ "value": 72, "time": "8:00 AM", "date": "Jan 17" }],
  "temperature": [{ "value": 98.6, "time": "8:00 AM", "date": "Jan 17" }],
  "pain": [{ "value": 1, "time": "8:00 AM", "date": "Jan 17" }]
}
```

### Patient
```json
{
  "name": "string",
  "photo": "string (URL)",
  "age": "number",
  "conditions": "string[]",
  "allergies": "string[]",
  "medications": "string[]",
  "emergencyContact": { "name": "string", "phone": "string", "relationship": "string" }
}
```

## Design Specifications

### Color Palette
| Name | Value | Usage |
|------|-------|-------|
| Primary | #25D366 | Buttons, active states, success indicators |
| Primary Hover | #20bd5a | Button hover states |
| Danger/Rose | #f43f5e | Incidents, alerts, critical items |
| Background Dark | stone-950 (#0c0a09) | Dark mode background |
| Card Dark | stone-900 (#1c1917) | Dark mode card background |
| Card Dark Hover | stone-800 (#292524) | Dark mode hover states |
| Text Primary Dark | white | Main text in dark mode |
| Text Secondary Dark | stone-400 | Secondary text dark mode |
| Background Light | white | Light mode background |
| Card Light | white | Light mode cards |
| Text Primary Light | stone-900 | Main text light mode |
| Border Dark | stone-800 | Borders in dark mode |
| Border Light | stone-200 | Borders in light mode |

### Typography
- Headings: Bold, Manrope font family
- Body: Regular weight
- Labels: Semibold, uppercase, tracking-wider for small labels
- Font sizes:
  - Page title: text-2xl (24px)
  - Card title: text-lg (18px)
  - Body: text-base (16px)
  - Small/Label: text-sm or text-xs

### Spacing & Borders
- Card border radius: rounded-2xl (16px) or rounded-3xl (24px)
- Button border radius: rounded-xl (12px) or rounded-full
- Page padding: px-6 (24px)
- Card padding: p-4 to p-6
- Item spacing: space-y-3 or space-y-4

### Components to Build
1. **Bottom Navigation Bar** - Fixed at bottom, 5 tabs with icons and labels
2. **Task Card** - Expandable card with priority badge, time, photo indicator
3. **Vitals Card** - Compact card with icon, value, label
4. **Incident Card** - Type badge, title, description, status, photos
5. **Profile Card** - Photo, name, title with chevron for navigation
6. **Progress Bar** - Horizontal bar with completion percentage
7. **Photo Viewer Modal** - Full-screen image viewer for incident photos
8. **Request Modal** - Bottom sheet for adding new care requests
9. **AI Copilot** - Floating button + chat modal

### Dark Mode Support
- All screens must support dark/light mode toggle
- Use theme context for dynamic styling
- Default: Dark mode for Caregiver, Light mode for Landing/Auth pages

## Key Interactions

### Task Completion Flow (Caregiver)
1. Tap on task card to expand
2. Tap "Start Task" button
3. If photo required, camera opens
4. Add completion note (optional)
5. Tap "Mark Complete"
6. Task moves to completed state with checkmark

### Incident Report Flow (Caregiver)
1. Navigate to Incident tab
2. Tap "New Incident Report" button
3. Select incident type from grid
4. Enter description
5. Optionally attach photo
6. Toggle emergency notification if needed
7. Submit report

### Viewing Incident Photos (Family)
1. Navigate to Incident tab
2. Tap on incident card
3. Tap on attached photo
4. Full-screen modal opens with zoom capability
5. Tap X or outside to close

## Backend API Endpoints (To Be Implemented)
```
POST /api/auth/login
POST /api/auth/signup
GET /api/tasks
POST /api/tasks/{id}/complete
GET /api/incidents
POST /api/incidents
GET /api/vitals
POST /api/vitals
POST /api/copilot/chat
```

## Assets to Recreate
- ADLTrack logo (Green circle with Activity icon)
- Placeholder patient photos from Unsplash
- Placeholder caregiver photos from Unsplash
- Care activity images for timeline

## GitHub Repository
After saving the web app to GitHub, pull from the repository to see:
- Complete component structure
- Mock data examples
- Exact styling and animations
- Icon usage (Lucide React → use Expo vector icons equivalent)

## Notes for Mobile Agent
1. Use Expo's camera module for photo capture
2. Use AsyncStorage or SecureStore for mock auth state
3. Implement proper keyboard avoidance for forms
4. Add haptic feedback on button presses
5. Ensure bottom navigation is above safe area insets
6. Test on both iOS and Android
7. The web app is currently a MOCKUP - no real backend. Build the mobile app the same way initially.
