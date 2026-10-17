# Bulletproof Brands CRM — Project Documentation

**Version:** 1.0  
**Prepared:** 14 October 2026  
**Live site:** https://bulletproof-crm.vercel.app  
**Repository:** `bulletproofbrands137-eng/bulletproof-crm` (private GitHub repository)

> This guide documents the CRM workflow and the project structure based on the shared source snapshot and the implementation history in this conversation. Exact deployment settings can differ from a local copy; confirm production behaviour in Vercel before operational changes.

## 1. Project Overview

Bulletproof Brands CRM is an internal lead and sales operations dashboard. It brings lead records, calls, follow-ups, meeting scheduling, proposals, and sales reporting into one interface. The operating principle is **semi-automatic**: the system creates queues, dates, notifications and activity history where implemented; employees make customer calls, record real outcomes, and choose important sales decisions.

### Main goals
- Store and manage leads in one place.
- Track call attempts and outcomes.
- Keep FU1/FU2/FU3 follow-ups visible and due-date driven.
- Schedule meetings and track attendance.
- Track proposal progress and sales outcomes.
- Synchronize supported records with Google Sheets.
- Use MongoDB Atlas for operational data and MongoDB-backed login sessions.
- Deploy the application through GitHub and Vercel.

## 2. Technology Stack

| Component | Technology / purpose |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript; main files include `index.html`, `Dashboard.html`, and `login.html` |
| Backend | Node.js with Express in `server.js` |
| Operational database | MongoDB Atlas, database name configured by `MONGODB_DB_NAME` (commonly `bulletproof_crm`) |
| Spreadsheet integration | Google Sheets, configured with `GOOGLE_SHEET_ID`; optional Apps Script bridge via `GOOGLE_APPS_SCRIPT_URL` |
| Authentication | MongoDB `auth_users` / `auth_sessions`; password hashing with Node.js `crypto.scrypt`; HTTP-only session cookie |
| Hosting | Vercel production deployment, connected to the private GitHub repository |
| Source control | Git; production changes are pushed to branch `main` |
| Optional integrations | Meta Lead Ads webhook fields; WhatsApp click-to-chat links; Google Calendar/Apps Script capabilities when configured |

## 3. Project File Map

| File / directory | Purpose |
|---|---|
| `server.js` | Express server, API routes, authentication, MongoDB access, Sheet sync, static-file serving |
| `index.html` | Main CRM interface and client-side interactions |
| `Dashboard.html` | Dashboard HTML copy/entry used by the project; keep it consistent with `index.html` where the project expects them to match |
| `login.html` | Login page |
| `package.json` / `package-lock.json` | Runtime scripts and pinned dependency tree |
| `.env.example` | Names/placeholders for supported configuration variables; no real secrets should be stored here |
| `.env` | Local secrets/configuration only; must not be committed to GitHub |
| `Code.gs` | Google Apps Script integration/backup code where used |
| `3_TOUCH_WORKFLOW.md` | Description of FU1/FU2/FU3 workflow |
| `MONGODB_AND_SHEETS_GUIDE.md` | Database and spreadsheet setup notes from the project |
| `SYSTEM_ARCHITECTURE.md` | Architecture and data-model reference; verify against current code if it differs |
| `favicon*`, `site.webmanifest`, `public/` | Browser icon and static assets |
| `bulletproof_*.png` | Brand/logo assets |
| `scratch/`, `*.py` | Verification/update utilities; run only when you understand their effect |

## 4. Main CRM Modules

| Module | Purpose |
|---|---|
| Dashboard | Overview, counts, pipeline, urgent items and tasks |
| Leads Pipeline | Lead list, stage, assigned employee, source and next action |
| Call Center / Call Console | Select a lead, log an attempt, choose call status/outcome, add notes and next-call date |
| Lead Call History | View saved calls associated with a lead |
| Follow-ups | Due today, overdue and upcoming customer touchpoints |
| Meetings | Schedule date/time, assign meeting owner, track result/attendance |
| Proposals | Track quotation/package, amount, status and follow-up |
| Dead Leads | Keep closed/unqualified lead records and reason/history |
| Clients | Converted or active customer records |
| WhatsApp Hub | Prepare messages and open WhatsApp click-to-chat where supported |
| Meta Lead Ads | Ingest/track Meta leads when the webhook and credentials are configured |
| Team / Reports / Analytics | Sales and activity summaries supported by the current dashboard |
| Settings / Sync | Show connection state and trigger supported manual synchronization |

Visible modules can change as the UI is updated. Backend data/functions should not be removed just because a sidebar item is hidden.

## 5. Lead-to-Sale Workflow

### 5.1 New lead
1. Employee opens **Add Lead** and enters required details.
2. Optional details may include website, profile, decision maker, notes, industry and budget, depending on the version deployed.
3. The backend saves the lead to the configured data source(s).
4. The CRM should create/show the initial call queue record as `PENDING`/`FU1` where the automatic queue workflow is enabled.
5. Employees should not create a second initial-call entry manually when the automatic one already exists.

### 5.2 Three-touch follow-up workflow

| Actual customer outcome | Expected CRM action |
|---|---|
| No answer / call not received | Save attempt and outcome; schedule next touch (default described in project workflow: +1 day) |
| Busy / call later | Save attempt; keep lead active and schedule the next follow-up (often +1 day unless a callback date is chosen) |
| Customer asks for 2–3 days | Record the request and schedule follow-up (default described in workflow: +3 days; use exact date if supported by the deployed form) |
| Interested | Move to qualification/next step; employee decides meeting/proposal action |
| Not interested | Employee records the outcome and reason; close/stop active follow-ups according to current workflow |
| Wrong number | Mark invalid/record reason; do not keep it in the normal active call queue |

The sequence is **FU1 → FU2 → FU3**. After the third unsuccessful touch, the CRM should ask the employee to choose **Nurture**, **Lost/Dead**, or a custom follow-up rather than automatically creating endless calls. Always record the real result; the CRM does not call customers or decide their interest on its own.

### 5.3 Meetings and proposals
- An interested lead can move to qualification and meeting scheduling.
- Meeting date, start time, owner, meeting type and notes should be saved against the correct lead.
- Meeting completion/show-up can make a proposal the next suggested action.
- A no-show or cancellation should prompt the employee to reschedule or choose the appropriate next status.
- Proposal status may change over time (for example, Interested → Not Interested). Preserve the activity history and stop future proposal follow-ups when the deal is closed, according to the deployed workflow.

## 6. Data Storage and Synchronization

### MongoDB Atlas
The Node backend reads/writes operational records in MongoDB when the connection is configured and available. Common collections include:
- `leads`
- `calls`
- `meetings`
- `followups`
- `proposals`
- `clients`
- `payments`
- `tasks`
- `meta_leads`
- `auth_users`
- `auth_sessions`

Additional collections may be used by newer code or other integrations. Check the live Data Explorer/code before assuming this list is exhaustive.

### Google Sheets
Google Sheets supports spreadsheet-based data exchange/synchronization. The project has a manual **Sync** button and backend route `POST /api/sync-sheet`. Some write routes also push records to corresponding Sheet tabs (for example leads, calls, meetings, proposals, payments and tasks in the source snapshot).

### Recommended operating rules
- Treat empty database/spreadsheet results as genuinely empty; do not replace them with hard-coded demo rows.
- Before bulk deleting production records, make a backup and identify every data source.
- After clearing test data, also check browser storage/demo seed logic if stale rows return.
- Do not assume deleting rows from Google Sheets also deletes MongoDB documents, or vice versa.
- Avoid repeatedly importing the same records; sync should be idempotent and based on stable record IDs where implemented.
- On login, the CRM should load current data without requiring the user to click Sync; the manual Sync button remains available for refresh.
- If MongoDB and Sheets disagree, identify which source the deployed code currently treats as primary before editing records.

## 7. Login and Security

The shared login implementation uses a dedicated MongoDB `auth_users` collection for authentication and `auth_sessions` for active sessions, so the pre-existing business `users` collection is not repurposed for login.

- Admin/bootstrap values are read from environment variables.
- Passwords are stored as a salted hash using Node.js `crypto.scrypt`, not as plain text.
- Session tokens are random, stored hashed in the database, and sent in an HTTP-only cookie named `crm_session`.
- Session lifetime is controlled by `AUTH_SESSION_TTL_HOURS` (documented default: 12 hours).
- Logout clears the cookie and removes the matching session where possible.
- Protected APIs require an authenticated session; status and Meta webhook verification/ingestion routes are exceptions in the inspected server snapshot.
- The initial setup creates the configured admin if that email is not already present. This does not automatically provision all employees unless user-management features are implemented separately.

### Security rules
- Never commit `.env` or paste live passwords/connection strings into chat/issues.
- Keep the GitHub repository private.
- Use a strong admin password and rotate it if it may have been exposed.
- Give MongoDB database users only the permissions they need.
- Restrict Atlas Network Access as tightly as your deployment topology permits. Avoid `0.0.0.0/0` unless you intentionally accept the increased exposure and have evaluated alternatives.
- Set secrets in Vercel Project Settings → Environment Variables; redeploy after changing runtime variables.
- Do not send secret values to screenshots or documentation.

## 8. Environment Configuration

Put real values in a local `.env` file, excluded from Git. Names found in the inspected source include:

| Variable | Purpose |
|---|---|
| `PORT` | Local server port; defaults to 3000 |
| `MONGODB_URI` | MongoDB Atlas connection URI |
| `MONGODB_DB_NAME` | Database name; typically `bulletproof_crm` |
| `GOOGLE_SHEET_ID` | Spreadsheet ID used by sync |
| `GOOGLE_APPS_SCRIPT_URL` | Optional Apps Script endpoint |
| `AUTH_ADMIN_EMAIL` | Initial admin login email |
| `AUTH_ADMIN_PASSWORD` | Initial admin password; keep secret |
| `AUTH_ADMIN_NAME` | Display name for initial admin |
| `AUTH_ADMIN_ROLE` | Initial admin role label |
| `AUTH_SESSION_TTL_HOURS` | Session lifetime in hours (default documented as 12) |
| `META_ACCESS_TOKEN` | Optional Meta integration token |
| `META_VERIFY_TOKEN` | Optional Meta webhook verification token |
| `NODE_ENV` / `VERCEL` | Runtime mode flags used by the app |

Not every variable is required for every environment. Use `.env.example` as the local checklist and compare it with the current `server.js` and Vercel settings. Never copy placeholder values as real credentials.

## 9. Run the CRM Locally

### Prerequisites
- Node.js and npm installed.
- Project folder contains `package.json` and `server.js`.
- A valid `.env` file is present locally (never commit it).
- MongoDB Atlas Network Access and database credentials permit connections, if MongoDB is used.

### Start commands
From the actual project root in Antigravity/VS Code terminal:

```powershell
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

The development script uses Node watch mode in the provided package configuration. Keep the terminal open while testing. Stop the server with `Ctrl+C`.

### Port 3000 already in use
If `EADDRINUSE` appears, stop the other CRM terminal with `Ctrl+C`. If the process is unknown, inspect with:

```powershell
netstat -ano | findstr :3000
```

Only terminate a process after confirming its PID belongs to the old CRM server.

## 10. GitHub and Vercel Release Workflow

The private GitHub repository is `bulletproofbrands137-eng/bulletproof-crm`; production deployment is connected to branch `main` at `https://bulletproof-crm.vercel.app`.

### Before pushing
1. Make changes in the correct project folder.
2. Test locally.
3. Review the change list:

```powershell
git status
git --no-pager diff
```

4. Confirm `.env`, `node_modules/`, `.vercel/` and backup files are not staged.
5. Stage intended files, commit, and push:

```powershell
git add <intended-files>
git commit -m "Describe the change"
git push origin main
```

Use `git add .` only after checking `.gitignore` and `git status`.

### After pushing
1. Open Vercel → project `bulletproof-crm` → Deployments.
2. Wait for the latest deployment to show `Ready`.
3. Open the production URL and hard-refresh (`Ctrl+Shift+R`).
4. Test the relevant feature in production.
5. If the deployment fails, inspect Vercel Build Logs and Runtime Logs. Do not assume a Git push means the deployment is healthy.

### Important
- Do not create a new Vercel project for every change.
- Keep the same connected GitHub repository/branch.
- Production business use should comply with the hosting provider's current plan terms.
- Vercel outbound IP behaviour may not match your local PC IP. If MongoDB access fails in production, examine the runtime error and Atlas network rules; do not make the database public as a first response.

## 11. Key API Routes

These routes were present in the inspected `server.js` snapshot. Actual payloads and future changes must be verified against the current code.

| Route | Purpose |
|---|---|
| `GET /login` | Serves login page |
| `POST /api/auth/login` | Validates credentials and creates session |
| `GET /api/auth/me` | Checks current authenticated session |
| `POST /api/auth/logout` | Logs out / clears session |
| `GET /api/status` | Health and connection status |
| `GET /api/sync-status` | Reports sync status |
| `GET /api/data` | Returns the CRM data bundle |
| `GET /api/leads` / `POST /api/leads` | List/create-or-update leads, depending on handler behaviour |
| `GET /api/calls` / `POST /api/calls` | List and save calls |
| `GET /api/meetings` / `POST /api/meetings` | List and save meetings |
| `GET /api/followups` | Lists follow-ups |
| `GET /api/proposals-list` / `POST /api/proposals` | Lists and saves proposals |
| `GET /api/payments-list` / `POST /api/payments` | Lists and saves payments |
| `GET /api/tasks-list` / `POST /api/tasks` | Lists and saves tasks |
| `GET /api/clients` | Lists client records |
| `GET /api/activity-log` | Reads activity history |
| `POST /api/sync-sheet` | Manual spreadsheet synchronization |
| `POST /api/config` | Updates supported connection settings |
| `GET/POST /api/webhook/meta` | Meta webhook verification/ingestion, where configured |

Most `/api` routes require an authenticated session. Status and Meta webhook routes are exceptions in the inspected implementation.

## 12. Troubleshooting

| Symptom | Check / action |
|---|---|
| Dashboard shows 0 after login, but Sync fills it | Check `/api/data` in browser DevTools → Network; verify auto-load/bootstrap code and whether the sync promise completed |
| Old demo rows return after clearing data | Check MongoDB, Google Sheets, localStorage/sessionStorage, in-memory caches and demo seed/fallback arrays; do not repeatedly delete data without finding the source |
| `Repository not found` on Git push | Check `git remote -v`, confirm the repo owner/name, and authenticate with an account with access to the private repository |
| Vercel has old UI | Check latest deployment is `Ready`, then hard-refresh or test a private/incognito window |
| MongoDB SSL/TLS or `querySrv ECONNREFUSED` | Verify fresh Atlas URI, database user/password encoding, Atlas allowlist, DNS/network and Vercel runtime logs |
| `EADDRINUSE :::3000` | Another process is using port 3000; stop the old server before starting another |
| Save button shows success and an error | Inspect browser Console and server logs; confirm server returned success and history/list refresh completed |
| Favicon still old | Browser caching may keep it; confirm favicon URL returns successfully and use a versioned URL/hard refresh |
| Old proposals remain after clearing database and sheet | Check hard-coded fallback/demo arrays and stale browser storage; fix the source rather than merely hiding rows |

## 13. Backups, Resets and Data Safety

- Make a backup/export before deleting any operational records.
- Emptying Google Sheets does not empty MongoDB, and deleting MongoDB records does not clear Sheets.
- Never drop the whole database to remove test data. Preserve `auth_users`, `auth_sessions`, settings and indexes unless a deliberate migration/maintenance plan says otherwise.
- If the intended state is a fresh CRM, clean each operational collection and corresponding Sheet tab carefully, preserving headers and configuration.
- After cleanup, verify that no startup seed, periodic sync, demo fallback or stale browser cache repopulates the records.
- Never run a cleanup/reset script unless it belongs to the active project version and its target collections have been reviewed.

## 14. Routine Checklist

### For each code change
- [ ] Make the smallest requested change.
- [ ] Test locally on `http://localhost:3000`.
- [ ] Inspect browser console and server logs.
- [ ] Confirm no data/secret files are staged.
- [ ] Commit and push to `main`.
- [ ] Wait for Vercel `Ready`.
- [ ] Test the live site.

### For CRM data integrity
- [ ] Add a test lead only with a safe test number.
- [ ] Confirm it is stored in the configured backend.
- [ ] Confirm automatic call/follow-up records do not duplicate.
- [ ] Check actual call status and selected date in history.
- [ ] Verify meeting/proposal status changes are reflected after reload.
- [ ] Check whether Sheets and MongoDB are consistent after sync.

## 15. Known Notes / Scope

- The system is designed to assist employees; it does not autonomously make customer calls or decide whether a customer is interested.
- Automatic mobile call-duration capture is not provided by a standard browser/Express CRM for normal phone calls; employees may need to enter actual duration unless a separate telephony integration is configured.
- WhatsApp click-to-chat can open a prepared message, but sending is still performed by an employee unless a separate approved WhatsApp API integration exists.
- Meta Lead Ads ingestion requires valid Meta app setup, webhook configuration, tokens/permissions and policy compliance.
- Employee-specific account provisioning and fine-grained permissions should be confirmed against the currently deployed auth implementation. The inspected login setup bootstraps one admin from environment variables and uses a dedicated auth collection.
- The documentation is operational guidance, not a guarantee that every optional integration is enabled in production. Verify feature flags, credentials and actual Vercel deployment.

---

**Document owner:** Bulletproof Brands CRM project  
**Main branch:** `main`  
**Production URL:** https://bulletproof-crm.vercel.app
