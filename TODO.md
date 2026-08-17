# TODO - Fix Signup Button Does Nothing

- [x] Add visible loading + error UI to SignupPage
- [x] Confirm form submit handler always runs (and show status on validation)
- [x] Ensure API client returns/display errors correctly (client posts to /api/auth/signup)
- [x] Re-test click flow by adding visible UI feedback: button click → onSubmit → fetch('/api/auth/signup')

# TODO - Backend/Frontend completion checks

- [ ] Verify /api/auth/signup works end-to-end with cookie-based JWT
- [ ] Verify HR endpoints (/api/hr/pending-employees, /approve, /decline) work with role gating
- [ ] Verify login gating: non-approved accounts are not issued JWT (expect 403)
- [ ] Run smoke-test: seed -> login as employee/HR -> pending/approve flow

