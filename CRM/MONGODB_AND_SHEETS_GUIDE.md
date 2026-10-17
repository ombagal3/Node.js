# Bulletproof Brands CRM — Cloud Architecture Guide

## 🚀 Overview
Your CRM is now a **100% pure modern web application** (HTML5 + CSS + JavaScript) with a unified dual-backend engine:
1. **Google Sheets Database (Active)**: Connected directly to your Google Spreadsheet (`1QnstkihYucPh402l4sg22I6L7TnIzv7zUjoDKZl_JZg`).
2. **MongoDB Atlas Cloud Database (Free M0 Tier)**: Fully supported for cloud NoSQL storage.
3. **Standalone Mode (0 Setup)**: You can also double-click [index.html](file:///c:/Users/NAYAN/Downloads/Bulletproof%20lead%20Dashboard/index.html) in any browser without needing to run any server!

---

## 🏃 How to Run the Application

### Option 1: Standalone Direct Launch (Instant — 0 Install)
1. Simply double-click [index.html](file:///c:/Users/NAYAN/Downloads/Bulletproof%20lead%20Dashboard/index.html) (or right click -> Open with Google Chrome / Edge).
2. All 16 pages and features work immediately.
3. Live Google Sheet data is fetched directly using Google Visualization API (no API keys required!).

---

### Option 2: Full Node.js Cloud Server (Recommended)
This runs the full Express server with REST APIs, Google Sheets sync, and MongoDB Atlas integration:

1. Open PowerShell or Command Prompt in this folder:
   ```bash
   npm start
   ```
2. Open your browser at:
   ```
   http://localhost:3000
   ```

---

## 🍃 MongoDB Atlas Cloud Setup (Free Tier — 2 Minutes)

If you wish to use MongoDB Atlas alongside or instead of Google Sheets:

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Select **M0 Free Cluster** (Free forever, 512 MB storage).
3. **Create Database User**:
   - Go to **Security > Database Access**
   - Click **Add New Database User** (e.g. username: `admin`, set a password).
4. **Allow Network Access**:
   - Go to **Security > Network Access**
   - Click **Add IP Address** -> Select **Allow Access from Anywhere** (`0.0.0.0/0`).
5. **Get Connection String**:
   - Go to **Deployments > Database**
   - Click **Connect** -> Choose **Drivers** (Node.js)
   - Copy the URI:
     ```
     mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/bulletproof_crm?retryWrites=true&w=majority
     ```
6. **Connect in CRM**:
   - In the CRM Dashboard, go to **Settings** (gear icon in sidebar).
   - Paste your URI into the **MongoDB Atlas Connection URI** box.
   - Click **Save & Connect**!
   - Alternatively, paste it into your [.env](file:///c:/Users/NAYAN/Downloads/Bulletproof%20lead%20Dashboard/.env) file:
     ```env
     MONGODB_URI=mongodb+srv://admin:YourPassword@cluster0.xxxxx.mongodb.net/bulletproof_crm?retryWrites=true&w=majority
     ```

---

## 📊 Google Sheet Integration

Your Google Spreadsheet is connected:
- **Sheet URL**: [https://docs.google.com/spreadsheets/d/1QnstkihYucPh402l4sg22I6L7TnIzv7zUjoDKZl_JZg/edit](https://docs.google.com/spreadsheets/d/1QnstkihYucPh402l4sg22I6L7TnIzv7zUjoDKZl_JZg/edit)
- **Spreadsheet ID**: `1QnstkihYucPh402l4sg22I6L7TnIzv7zUjoDKZl_JZg`
- **Connected Tabs**:
  - `LEADS`
  - `CALLS`
  - `MEETINGS`
  - `PROPOSALS`
  - `CLIENTS`
  - `PAYMENTS`
  - `TASKS`
  - `USERS`

You can click the **⚡ Sync** button in the top navigation bar anytime to pull fresh rows from your Google Sheet.

---

## 📁 Project Structure

```
Bulletproof lead Dashboard/
├── index.html                   # Primary Web Application (Pure HTML/CSS/JS)
├── Dashboard.html               # Synced Production Web App
├── server.js                    # Node.js Express REST Backend & Cloud Sync
├── package.json                 # Node.js dependencies
├── .env                         # Server environment configuration
├── .env.example                 # Example configuration
├── apps_script_backup/          # Archived Apps Script files (Code.gs, etc.)
├── bulletproof_*.png            # High-res logos & luxury branding assets
└── MONGODB_AND_SHEETS_GUIDE.md  # This architecture & setup guide
```
