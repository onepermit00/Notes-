# Test Credentials

## Manager accounts (created during testing)
- Email: `retest+1787624956@example.com` / Password: `RetestPass123!` (verified working sign-in → Manager Dashboard)
- Email: `designtest+022624@example.com` / Password: `TestPass1234!`
- Email: `uitest+1787624855@example.com` / Password: `TestPass1234!`

## Concierge account (created via manager API)
- Email: `concierge.test@example.com` / Password: `ConciergePass123!` (Casey Desk — has an active shift + logged task)
- Concierge is the DEFAULT role on the sign-in page (no role click needed)
- Email: `importtest@example.com` — NOT created (validation-only probe)

Sign in at the app URL → header "Sign in" → select **Manager** role.
Concierge accounts must be created by a manager from the dashboard (Add Team Members).
