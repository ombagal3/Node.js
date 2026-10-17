# 🛡️ BULLETPROOF BRANDS — ENTERPRISE CRM & SALES AUTOMATION
### *"IMPOSSIBLE TO IGNORE"*

A production-grade, enterprise-architected internal CRM and Sales Management System designed and built for **Bulletproof Brands**. 

Powered by a dual-engine architecture:
1. **Google Sheets Relational Database (Active)**: Connected directly to your Google Spreadsheet (`1QnstkihYucPh402l4sg22I6L7TnIzv7zUjoDKZl_JZg`) via Google Visualization API.
2. **MongoDB Atlas Cloud Database (Free M0 Tier)**: Native NoSQL cloud database support via Node.js Express.
3. **High-Performance Web Frontend**: Built with HTML5, CSS3, and Vanilla JavaScript with executive Obsidian & Gold luxury SaaS design.

---

## ⚡ Quick Start

### Option 1: Standalone Direct Launch (0 Setup)
Simply double-click [index.html](file:///c:/Users/NAYAN/Downloads/Bulletproof%20lead%20Dashboard/index.html) in your browser. All 16 pages and live Google Sheet data are available immediately!

### Option 2: Full Node.js Cloud Backend
Run the backend server with REST APIs and MongoDB Atlas integration:
```bash
npm install
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏛️ System Features (16 Accessible Views)

| # | View | Route | Key Features |
|---|---|---|---|
| 1 | **Executive Overview** | `dashboard` | 8 interactive KPI cards, sales pipeline funnel, lead sources donut, urgent alerts, today's meetings, and task list |
| 2 | **Leads Pipeline** | `leads` | Interactive Kanban board (6 stages) and full lead table with workflow badges and missing info indicators |
| 3 | **Call Center** | `calls` | Call logging modal, outcome dispatches (Connected, Voicemail, No Answer), and duration tracking |
| 4 | **Meeting Schedule** | `meetings` | Interactive calendar date picker (`input[type="date"]`), 24 pre-set time slot dropdowns (`select`), and show/no-show attendance |
| 5 | **Follow-ups Cadence** | `followups` | SLA breach tracking, overdue notifications, and 1-click WhatsApp follow-ups |
| 6 | **Proposals & Commercials** | `proposals` | Draft, Sent, Accepted tracking, quotation value metrics, and scope summary |
| 7 | **Active Clients** | `clients` | Converted client directory, contract values, project tags, and account health |
| 8 | **Projects & Delivery** | `projects` | Client project progress bars, milestone tracking, and lead closer assignments |
| 9 | **Payments & Invoicing** | `payments` | Milestone payment logging, accounts receivable, and overdue invoice alerts |
| 10 | **WhatsApp Hub** | `whatsapp` | Gujarati pre-formatted WhatsApp templates with 1-click direct `wa.me` links |
| 11 | **Meta Lead Ads** | `meta-ads` | Campaign tracking, 15-minute call SLA monitoring, and live test lead generator |
| 12 | **Team Leaderboard** | `team` | Employee revenue leaderboard, close rates, and call volumes |
| 13 | **Reports & Analytics** | `reports` | Conversion rates, average deal size, CAC, and source attribution |
| 14 | **Automations Engine** | `automation` | Active triggers and actions (Instant WhatsApp, 2h Pre-meeting reminder, No-show reschedule) |
| 15 | **Templates Manage** | `templates` | Variable-driven messaging templates (`{{name}}`, `{{meeting_person}}`, etc.) |
| 16 | **System & Cloud Settings** | `settings` | Google Sheet ID sync, MongoDB Atlas connection URI, JSON/CSV exports, and diagnostics |

---

## 📊 Google Spreadsheet Integration

- **Spreadsheet URL**: [https://docs.google.com/spreadsheets/d/1QnstkihYucPh402l4sg22I6L7TnIzv7zUjoDKZl_JZg/edit](https://docs.google.com/spreadsheets/d/1QnstkihYucPh402l4sg22I6L7TnIzv7zUjoDKZl_JZg/edit)
- **Spreadsheet ID**: `1QnstkihYucPh402l4sg22I6L7TnIzv7zUjoDKZl_JZg`
- **Connected Tables**: `USERS`, `LEADS`, `CALLS`, `MEETINGS`, `FOLLOWUPS`, `PROPOSALS`, `CLIENTS`, `PROJECTS`, `PAYMENTS`, `TASKS`

---

## 🍃 MongoDB Atlas Cloud Setup (Free Tier)

Refer to [MONGODB_AND_SHEETS_GUIDE.md](file:///c:/Users/NAYAN/Downloads/Bulletproof%20lead%20Dashboard/MONGODB_AND_SHEETS_GUIDE.md) for step-by-step instructions on setting up a free M0 cluster and connecting it in the Settings view.
