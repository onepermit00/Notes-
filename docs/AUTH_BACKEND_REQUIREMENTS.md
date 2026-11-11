# Authentication backend requirements

The current FastAPI contract supports manager signup, manager/concierge sign-in,
sign-out, session restoration, authenticated profile updates, and authenticated
password changes. It does **not** support email recovery or invitation links.

The frontend therefore displays explicit unavailable states for those routes and
does not send an email, accept a token, or report a successful password change.

## Endpoints still required

- `POST /api/auth/password/forgot` with `{ "email": string }`. Always return a
  neutral response to avoid account enumeration; create a short-lived,
  single-use token and send the reset link when email delivery is configured.
- `POST /api/auth/password/reset` with `{ "token": string, "password": string }`.
  Validate expiry and one-time use, apply the same password rule as signup, and
  revoke existing sessions after a successful reset.
- `GET /api/auth/invitations/{token}`. Return invitation status and safe property/
  role context; distinguish valid, expired, used, and invalid tokens.
- `POST /api/auth/invitations/{token}/accept` with `{ "password": string }`.
  Activate the invited concierge account and consume the invitation atomically.

When these endpoints exist, replace the informational states in
`frontend/src/components/AuthSupportPage.jsx` with API-backed forms. The intended
contract names are also isolated in `frontend/src/services/authApi.js` as
`pendingAuthContracts`.

## Existing operational limitation

`RESEND_API_KEY` is optional in `backend/server.py`. Without it, current welcome
and manager-triggered concierge credential emails are logged and skipped.
