require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const auth = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Authentication Login Routes (serve login.html or redirect if already authenticated)
app.get(['/login', '/login.html'], (req, res) => {
  if (auth.checkIsAuthenticated(req)) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Guard direct requests to CRM HTML pages and known navigation routes
const PROTECTED_PAGE_ROUTES = [
  '/',
  '/index.html',
  '/Dashboard.html',
  '/dashboard',
  '/call-center',
  '/meetings',
  '/proposals',
  '/follow-ups',
  '/clients',
  '/not-attends',
  '/dead-leads',
  '/all-leads'
];

app.get(PROTECTED_PAGE_ROUTES, (req, res) => {
  if (!auth.checkIsAuthenticated(req)) {
    return res.redirect('/login');
  }
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Static assets (CSS, JS, images, icons) - disable automatic index file serving
app.use(express.static(__dirname, { index: false }));

// Google Sheet Backend Configuration & Two-Way Sync
let GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID || '1QnstkihYucPh402l4sg22I6L7TnIzv7zUjoDKZl_JZg';
let GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || '';
let MONGODB_URI = process.env.MONGODB_URI || '';
let MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'bulletproof_crm';

// MongoDB Client handle (Atlas Connected)
let mongoClient = null;
let mongoDb = null;
let isMongoConnected = false;

// Sync status tracking
let lastSyncStatus = {
  lastSyncAt: null,
  tabResults: {},
  totalLeads: 0,
  totalCalls: 0,
  totalProposals: 0,
  totalPayments: 0,
  totalTasks: 0,
  totalMeetings: 0,
  totalFollowups: 0,
  totalClients: 0,
  totalActivityLogs: 0,
  totalMetaLeads: 0,
  errors: []
};

// Centralized Service Catalog & Default Pricing (Requirements 2, 3 & 5)

// Centralized Proposal Pricing Master List (Requirement 54)
const PROPOSAL_PACKAGES = [
  { id: 'meta_leads', name: 'Meta Leads', price: 7000 },
  { id: 'meta_content_iphone', name: 'Meta Leads + Content (iPhone)', price: 22000 },
  { id: 'meta_content_camera', name: 'Meta Leads + Content (Camera)', price: 25000 },
  { id: 'ecommerce', name: 'E-commerce', price: 10000 },
  { id: 'ecommerce_content', name: 'E-commerce + Content', price: 25000 },
  { id: 'shopify', name: 'Shopify', price: 20000 },
  { id: 'ai_video', name: 'AI Video', price: 15000 },
  { id: 'custom', name: 'Custom', price: 0 }
];

// Centralized Lead Sources (Requirement 3)
const LEAD_SOURCES = [
  'Instagram',
  'Website',
  'Call',
  'Reference',
  'Add Through',
  'Ad Through'
];

const CALL_STATUSES = [
  'Received',
  'Not Received',
  'Busy',
  'Not Interested',
  'Meeting Scheduled'
];

const MEETING_STATUSES = [
  'Scheduled',
  'Attend',
  'Not Attend',
  'Rescheduled',
  'Cancel'
];

const ASSIGNED_PERSONS = [
  'Meet Sir',
  'Smit Sir',
  'Sanjana Mam'
];

const MEETING_TYPES = [
  'Office',
  'Google Meet',
  'Client Office',
  'Call'
];

function getTodayIso() {
  return new Date().toISOString().split('T')[0];
}

function isPastDate(dateStr) {
  if (!dateStr) return false;
  const today = getTodayIso();
  const d = String(dateStr).trim().split('T')[0];
  return d < today;
}

const DEFAULT_SERVICES = [
  { id: 'srv_meta_leads', name: 'Meta Leads', defaultPrice: 7000, description: 'High converting Meta lead generation campaigns (Facebook & Instagram ads)', isActive: true },
  { id: 'srv_meta_content_iphone', name: 'Meta Leads + Content (iPhone)', defaultPrice: 22000, description: 'Meta ad campaigns + monthly dynamic short-form content shot on iPhone', isActive: true },
  { id: 'srv_meta_content_camera', name: 'Meta Leads + Content (Camera)', defaultPrice: 25000, description: 'Meta ad campaigns + professional cinema camera production content', isActive: true },
  { id: 'srv_ecommerce', name: 'E-commerce', defaultPrice: 10000, description: 'E-commerce growth ads, catalog optimization & conversion funnel', isActive: true },
  { id: 'srv_ecommerce_content', name: 'E-commerce + Content', defaultPrice: 25000, description: 'Full-funnel e-commerce performance ads + studio product video shoots', isActive: true },
  { id: 'srv_shopify', name: 'Shopify', defaultPrice: 20000, description: 'Custom Shopify high-converting storefront architecture & app integration', isActive: true },
  { id: 'srv_ai_video', name: 'AI Video', defaultPrice: 15000, description: 'Hyper-personalized AI video creatives & multilingual ad automation', isActive: true },
  { id: 'srv_custom', name: 'Custom Service', defaultPrice: 0, description: 'Bespoke agency marketing & growth deliverables', isActive: true }
];

// In-Memory fallback cache — ALL entity types from Google Sheet
let crmDataCache = {
  leads: [],
  calls: [],
  proposals: [],
  payments: [],
  tasks: [],
  followups: [],
  meetings: [],
  clients: [],
  deadLeads: [],
  packages: [...PROPOSAL_PACKAGES],
  sources: [...LEAD_SOURCES],
  activityLog: [],
  metaLeads: [],
  services: [...DEFAULT_SERVICES]
};

// Initial Seed Data (Used if Sheet is empty or loading)
const SEED_DATA = {
  leads: [
    {
      id: "LD-10001",
      name: "Chiragbhai Moradiya",
      phone: "9924035386",
      email: "chirag@siriocraft.com",
      company: "Siriocraft",
      website: "siriocraft.com",
      source: "Meta Ads",
      status: "Meeting",
      nextAction: "Office Consultation",
      score: 95,
      temp: "HOT",
      assigned: "Smit Sir",
      location: "Surat",
      budget: "₹1,00,000+",
      urgency: "High",
      decisionMaker: "Yes",
      meetingDate: "30-09-2026",
      meetingTime: "4:00 PM",
      meetingType: "Office Meeting",
      callStatus: "Done",
      callDuration: "6m 42s",
      meetingStatus: "Confirmed",
      proposalStatus: "Accepted",
      followupStatus: "Pending",
      adCampaign: "Surat Founders Video 04"
    },
    {
      id: "LD-10002",
      name: "Rajesh Patel",
      phone: "9825123456",
      email: "rajesh@patelenterprise.com",
      company: "Patel Enterprise",
      website: "patelenterprise.com",
      source: "Meta Ads",
      status: "Proposal",
      nextAction: "Close Deal",
      score: 88,
      temp: "HOT",
      assigned: "Rahul",
      location: "Surat",
      budget: "₹1,50,000",
      urgency: "High",
      decisionMaker: "Yes",
      meetingDate: "29-09-2026",
      meetingTime: "5:30 PM",
      meetingType: "Google Meet",
      callStatus: "Done",
      callDuration: "12m 10s",
      meetingStatus: "Show",
      proposalStatus: "Sent",
      followupStatus: "Pending",
      adCampaign: "Gujarat SMBs Carousel"
    },
    {
      id: "LD-10003",
      name: "Amit Shah",
      phone: "9879112233",
      email: "amit@shahandco.com",
      company: "Shah & Co",
      website: "",
      source: "Website Direct",
      status: "Follow-up",
      nextAction: "Follow-up Call 1",
      score: 72,
      temp: "WARM",
      assigned: "Smit Sir",
      location: "Ahmedabad",
      budget: "₹75,000",
      urgency: "Medium",
      decisionMaker: "Yes",
      meetingDate: "",
      meetingTime: "",
      meetingType: "",
      callStatus: "Done",
      callDuration: "4m 18s",
      meetingStatus: "Pending",
      proposalStatus: "Draft",
      followupStatus: "1 Day Overdue",
      adCampaign: "Organic Web"
    }
  ],
  calls: [
    { time: "03:45 PM", name: "Chiragbhai Moradiya", company: "Siriocraft", outcome: "Connected", duration: "6m 42s", notes: "Confirmed 4 PM office meeting with Smit Sir.", caller: "Smit Sir" },
    { time: "02:15 PM", name: "Rajesh Patel", company: "Patel Enterprise", outcome: "Connected", duration: "12m 10s", notes: "Walked through proposal terms. Google Meet at 5:30 PM.", caller: "Rahul" }
  ],
  proposals: [
    { id: "PROP-8901", client: "Chiragbhai Moradiya", company: "Siriocraft", scope: "Brand Scaling + E-Commerce Infrastructure", amount: 95000, date: "30 Sep 2026", status: "Interested" },
    { id: "PROP-8902", client: "Rajesh Patel", company: "Patel Enterprise", scope: "Full Funnel Meta Ads Engine", amount: 150000, date: "29 Sep 2026", status: "Sent" },
    { id: "PROP-8903", client: "Mehul Trivedi", company: "Trivedi Exports", scope: "Global B2B Catalog & SEO", amount: 120000, date: "30 Sep 2026", status: "Not Interested" }
  ],
  payments: [
    { id: "INV-2026-081", client: "Chiragbhai Moradiya", company: "Siriocraft", desc: "Advance 50% Project Kickoff", amount: 50000, due: "30 Sep 2026", status: "Paid" },
    { id: "INV-2026-082", client: "Chiragbhai Moradiya", company: "Siriocraft", desc: "Milestone 2 Final Launch", amount: 45000, due: "15 Oct 2026", status: "Pending" }
  ],
  tasks: [
    { id: "TSK-1", title: "Call Chiragbhai Moradiya & confirm meeting", sub: "Completed at 11:30 AM", done: true, priority: "High" },
    { id: "TSK-2", title: "Conduct 4:00 PM Consultation with Chiragbhai", sub: "Surat Office • Siriocraft E-com", done: false, priority: "Urgent" }
  ],
  followups: [],
  meetings: [],
  clients: [],
  deadLeads: [],
  activityLog: [],
  metaLeads: []
};

crmDataCache = {
  leads: [],
  calls: [],
  proposals: [],
  payments: [],
  tasks: [],
  followups: [],
  meetings: [],
  clients: [],
  deadLeads: [],
  activityLog: [],
  metaLeads: []
};

// ==============================================================
// HELPER: Parse Google Sheets GViz date values
// GViz returns dates as "Date(year,month,day)" where month is 0-indexed
// and datetimes as "Date(year,month,day,hour,min,sec)"
// ==============================================================
function parseGVizDate(val) {
  if (!val) return '';
  const str = String(val);
  const match = str.match(/^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),?(\d+)?)?\)$/);
  if (!match) return str;
  const year = parseInt(match[1]);
  const month = parseInt(match[2]) + 1; // GViz months are 0-indexed
  const day = parseInt(match[3]);
  if (match[4] !== undefined) {
    // It's a datetime
    const hour = parseInt(match[4]);
    const min = parseInt(match[5]);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${String(min).padStart(2, '0')} ${ampm}`;
  }
  return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
}

function parseGVizDateISO(val) {
  if (!val) return '';
  const str = String(val);
  const match = str.match(/^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),?(\d+)?)?\)$/);
  if (!match) return str;
  const year = parseInt(match[1]);
  const month = parseInt(match[2]); // 0-indexed
  const day = parseInt(match[3]);
  const hour = match[4] !== undefined ? parseInt(match[4]) : 0;
  const min = match[5] !== undefined ? parseInt(match[5]) : 0;
  const sec = match[6] !== undefined ? parseInt(match[6]) : 0;
  return new Date(year, month, day, hour, min, sec).toISOString();
}

// Safe string extractor from GViz cell — uses formatted value (f) when available
function gv(cell, fallback) {
  if (!cell) return fallback !== undefined ? fallback : '';
  // Prefer formatted value for dates/numbers displayed to humans
  return cell.f || (cell.v != null ? String(cell.v) : (fallback !== undefined ? fallback : ''));
}

function gvRaw(cell, fallback) {
  if (!cell) return fallback !== undefined ? fallback : '';
  return cell.v != null ? cell.v : (fallback !== undefined ? fallback : '');
}

// Safely strip immutable MongoDB _id before $set updates or inserts
function stripMongoId(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const copy = { ...obj };
  delete copy._id;
  return copy;
}

// ==============================================================
// TWO-WAY SYNC: WRITE DIRECTLY TO GOOGLE SHEETS
// ==============================================================
async function writeToGoogleSheet(sheetName, idField, record) {
  if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL.trim() === '') {
    return { success: false, reason: 'GOOGLE_APPS_SCRIPT_URL_NOT_CONFIGURED' };
  }
  try {
    const payload = {
      action: 'saveRecord',
      sheetName,
      idField,
      record
    };
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });
    const result = await response.json();
    console.log(`  📝 Saved directly to Google Sheet [${sheetName}]: ID=${record[idField]}`);
    return result;
  } catch (err) {
    console.warn(`  ⚠️ Google Sheet Write Error [${sheetName}]:`, err.message);
    return { success: false, error: err.message };
  }
}

function mapLeadToSheet(lead) {
  const now = new Date().toISOString();
  return {
    lead_id: lead.id || '',
    created_date: lead.createdDate || now.split('T')[0],
    created_time: lead.createdTime || '',
    name: lead.name || '',
    phone: lead.phone || '',
    whatsapp_number: lead.whatsapp || lead.phone || '',
    email: lead.email || '',
    company_name: lead.company || '',
    website: lead.website || '',
    industry: lead.industry || '',
    business_type: lead.businessType || '',
    location: lead.location || 'Surat',
    source: lead.source || 'Website',
    campaign: lead.campaign || lead.adCampaign || '',
    ad_set: lead.adSet || '',
    ad: lead.ad || '',
    form: lead.form || '',
    utm_source: lead.utmSource || '',
    utm_medium: lead.utmMedium || '',
    utm_campaign: lead.utmCampaign || '',
    utm_content: lead.utmContent || '',
    utm_term: lead.utmTerm || '',
    assigned_employee: lead.assigned || 'Smit Sir',
    lead_status: lead.status || 'New',
    sub_status: lead.subStatus || '',
    lead_temperature: lead.temp || 'HOT',
    lead_score: lead.score || 80,
    budget: lead.budget || '',
    expected_start_date: lead.expectedStartDate || '',
    decision_maker: lead.decisionMaker || 'Yes',
    requirements: lead.requirements || '',
    problems: lead.problems || '',
    notes: lead.notes || '',
    last_contact_date: lead.lastContactDate || '',
    last_contact_type: lead.lastContactType || '',
    next_action: lead.nextAction || '',
    next_action_date: lead.nextActionDate || lead.meetingDate || '',
    next_action_time: lead.nextActionTime || lead.meetingTime || '',
    created_by: lead.createdBy || 'Dashboard',
    updated_by: lead.updatedBy || 'Dashboard',
    updated_date: now
  };
}

function mapCallToSheet(call) {
  const now = new Date().toISOString();
  return {
    call_id: call.id || '',
    lead_id: call.leadId || '',
    client_name: call.name || '',
    phone: call.phone || call.phoneNumber || '',
    date: call.date || call.callDate || now.split('T')[0],
    time: call.time || '',
    employee: call.caller || call.employee || call.createdBy || (call.status === 'Pending' || call.outcome === 'Pending' ? 'Unassigned' : 'Siddharth Bhai'),
    status: call.status || call.callStatus || call.outcome || 'Pending',
    duration: call.duration || '—',
    notes: call.notes || call.conversationNotes || '',
    next_call_date: call.nextCallDate || '',
    next_call_time: call.nextCallTime || '',
    recording_url: call.recordingUrl || '',
    created_at: call.createdAt || now
  };
}

function mapMeetingToSheet(meeting) {
  const now = new Date().toISOString();
  return {
    meeting_id: meeting.id || `MTG-${Date.now()}`,
    lead_id: meeting.leadId || '',
    client_name: meeting.name || meeting.clientName || '',
    phone: meeting.phone || '',
    date: meeting.date || '',
    time: meeting.time || '',
    meeting_person: meeting.host || meeting.meetingPerson || 'Smit Sir',
    meeting_type: meeting.type || meeting.meetingType || 'Office Meeting',
    address: meeting.address || 'Surat Office, Gujarat',
    website: meeting.website || '',
    status: meeting.status || 'Scheduled',
    notes: meeting.notes || '',
    assigned_employee: meeting.assigned || 'Smit Sir',
    calendar_event_id: meeting.calendarEventId || '',
    meet_link: meeting.meetLink || '',
    created_at: meeting.createdAt || now,
    updated_at: now
  };
}

function mapProposalToSheet(proposal) {
  const now = new Date().toISOString();
  return {
    proposal_id: proposal.id || '',
    lead_id: proposal.leadId || '',
    client_name: proposal.client || proposal.clientName || '',
    company: proposal.company || '',
    service: proposal.scope || proposal.service || '',
    package: proposal.package || 'Custom',
    amount: proposal.amount || 0,
    discount: proposal.discount || 0,
    final_amount: proposal.finalAmount || proposal.amount || 0,
    created_date: proposal.date || now.split('T')[0],
    valid_until: proposal.validUntil || '',
    assigned_employee: proposal.assigned || 'Smit Sir',
    proposal_url: proposal.url || '',
    status: proposal.status || 'Pending',
    notes: proposal.notes || '',
    viewed_at: proposal.viewedAt || ''
  };
}

function mapPaymentToSheet(payment) {
  return {
    payment_id: payment.id || `PAY-${Date.now()}`,
    client_id: payment.clientId || '',
    lead_id: payment.leadId || '',
    client_name: payment.client || payment.clientName || '',
    invoice_number: payment.invoice || payment.invoiceNumber || '',
    milestone_name: payment.milestone || payment.milestoneName || 'Payment',
    amount: payment.amount || 0,
    due_date: payment.dueDate || '',
    paid_date: payment.paidDate || payment.date || '',
    payment_method: payment.method || payment.paymentMethod || 'Bank Transfer',
    status: payment.status || 'Paid',
    transaction_ref: payment.transactionRef || payment.ref || '',
    notes: payment.notes || ''
  };
}

function mapTaskToSheet(task) {
  const now = new Date().toISOString();
  return {
    task_id: task.id || `TSK-${Date.now()}`,
    title: task.title || '',
    description: task.sub || task.description || '',
    lead_id: task.leadId || '',
    client_id: task.clientId || '',
    assigned_to: task.assigned || 'Smit Sir',
    priority: task.priority || 'Medium',
    due_date: task.dueDate || '',
    due_time: task.dueTime || '',
    status: task.status || (task.done ? 'Completed' : 'Pending'),
    created_by: task.createdBy || 'Dashboard',
    created_at: task.createdAt || now,
    completed_at: task.completedAt || (task.done ? now : '')
  };
}

function mapFollowupToSheet(fu) {
  const now = new Date().toISOString();
  return {
    followup_id: fu.id || '',
    lead_id: fu.leadId || '',
    stage: fu.stage || '1',
    entry: fu.entry || '',
    client_note: fu.clientNote || '',
    next_followup_date: fu.nextFollowUpDate || '',
    status: fu.status || 'Completed',
    created_by: fu.createdBy || 'Smit Sir',
    created_at: fu.createdAt || now,
    updated_at: now
  };
}

// ==============================================================
// 1. MONGODB ATLAS INITIALIZATION
// ==============================================================
async function initMongoDB() {
  if (!MONGODB_URI || MONGODB_URI.trim() === '' || MONGODB_URI.includes('<username>')) {
    console.log('ℹ️  MongoDB Atlas: No connection URI provided yet in .env. Running with Google Sheets backend.');
    isMongoConnected = false;
    return;
  }

  try {
    const { MongoClient } = require('mongodb');
    mongoClient = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    await mongoClient.connect();
    mongoDb = mongoClient.db(MONGODB_DB_NAME);
    isMongoConnected = true;
    console.log(`✅ MongoDB Atlas: Successfully connected to database [${MONGODB_DB_NAME}]!`);
    await auth.ensureAuthUser(mongoDb);

    // Check MongoDB collections status and restore cache if empty
    const leadsColl = mongoDb.collection('leads');
    const leadsCount = await leadsColl.countDocuments();
    if (crmDataCache.leads.length === 0 && leadsCount > 0) {
      crmDataCache.leads = await leadsColl.find({}).toArray();
      console.log(`📥 Loaded ${crmDataCache.leads.length} leads from MongoDB Atlas`);
    }

    const callsColl = mongoDb.collection('calls');
    const callsCount = await callsColl.countDocuments();
    if (crmDataCache.calls.length === 0 && callsCount > 0) {
      crmDataCache.calls = await callsColl.find({}).toArray();
    }

    const mtgColl = mongoDb.collection('meetings');
    const mtgCount = await mtgColl.countDocuments();
    if (crmDataCache.meetings.length === 0 && mtgCount > 0) {
      crmDataCache.meetings = await mtgColl.find({}).toArray();
    }

    
    const deadColl = mongoDb.collection('dead_leads');
    const deadCount = await deadColl.countDocuments();
    if (crmDataCache.deadLeads.length === 0 && deadCount > 0) {
      crmDataCache.deadLeads = await deadColl.find({}).toArray();
    }
    const fuColl = mongoDb.collection('followups');
    const fuCount = await fuColl.countDocuments();
    if (crmDataCache.followups.length === 0 && fuCount > 0) {
      crmDataCache.followups = await fuColl.find({}).toArray();
    }

    const actColl = mongoDb.collection('activity_log');
    const actCount = await actColl.countDocuments();
    if (crmDataCache.activityLog.length === 0 && actCount > 0) {
      crmDataCache.activityLog = await actColl.find({}).sort({ timestamp: -1 }).toArray();
    }

    console.log(`📊 MongoDB Atlas: Connected & ready (${crmDataCache.leads.length} leads active in cache).`);
  } catch (err) {
    console.warn('⚠️  MongoDB Atlas Connection Warning:', err.message);
    if (err.message && err.message.includes('SSL alert number 80')) {
      console.warn('💡 Tip: Atlas SSL alert 80 indicates your IP is not whitelisted in MongoDB Atlas Network Access.');
      console.warn('👉 Go to MongoDB Atlas -> Network Access -> Add IP Address -> Allow Access From Anywhere (0.0.0.0/0)');
    }
    isMongoConnected = false;
  }
}

// Safe MongoDB Atlas executor - ensures no DB error crashes an endpoint
async function safeMongo(operationFn) {
  if (!isMongoConnected || !mongoDb) return null;
  try {
    return await operationFn(mongoDb);
  } catch (err) {
    console.warn('⚠️  MongoDB Atlas operation bypassed (Sheets/Cache active):', err.message);
    if (err.message && (
      err.message.includes('SSL') ||
      err.message.includes('tlsv1') ||
      err.message.includes('alert') ||
      err.message.includes('topology') ||
      err.message.includes('connection') ||
      err.message.includes('timed out') ||
      err.message.includes('ECONNREFUSED') ||
      err.message.includes('ResetPool')
    )) {
      isMongoConnected = false;
    }
    return null;
  }
}

// ==============================================================
// 2. GOOGLE SHEETS CONNECTOR (GViz Public Query Engine)
//    Syncs ALL tabs: LEADS, CALLS, PROPOSALS, PAYMENTS, TASKS,
//    MEETINGS, FOLLOWUPS, CLIENTS, ACTIVITY_LOG, META_LEADS
// ==============================================================
async function fetchGoogleSheetTab(sheetId, tabName) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) return null;
    const text = await response.text();
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}') + 1;
    if (start === -1 || end === -1) return null;
    const json = JSON.parse(text.substring(start, end));
    return json.table;
  } catch (e) {
    console.warn(`Could not fetch tab ${tabName} from Google Sheet:`, e.message);
    return null;
  }
}

/**
 * Generic helper: parse a GViz table into an array of objects using a column map.
 * columnMap is an array of { col: <0-indexed column>, key: <field name>, type: 'string'|'number'|'date'|'dateISO'|'boolean' }
 * skipHeaderRow: if true, skip first row if it matches header labels
 */
function parseGVizTable(table, columnMap, opts = {}) {
  if (!table || !table.rows) return [];
  const results = [];
  const headerLabels = (table.cols || []).map(c => (c.label || '').toLowerCase());
  const hasHeaderLabels = headerLabels.some(l => l.length > 0);

  for (let i = 0; i < table.rows.length; i++) {
    const row = table.rows[i];
    if (!row.c) continue;
    const c = row.c;

    // Skip header row — detect if first column matches a known header label
    const firstCellVal = String(c[0]?.v || '').toLowerCase();
    if (i === 0 && opts.headerValues && opts.headerValues.includes(firstCellVal)) continue;
    // Also skip if it matches the column label (GViz parsedNumHeaders=0 case)
    if (i === 0 && !hasHeaderLabels && opts.skipFirstRow) continue;

    // Check if this row has any meaningful data
    const hasData = c.some(cell => cell && cell.v != null && String(cell.v).trim() !== '');
    if (!hasData) continue;

    const obj = {};
    for (const mapping of columnMap) {
      const cell = c[mapping.col];
      switch (mapping.type) {
        case 'number':
          obj[mapping.key] = Number(gvRaw(cell, 0));
          break;
        case 'date':
          obj[mapping.key] = parseGVizDate(gvRaw(cell, ''));
          break;
        case 'dateISO':
          obj[mapping.key] = gv(cell, '') || parseGVizDateISO(gvRaw(cell, ''));
          break;
        case 'boolean':
          obj[mapping.key] = Boolean(gvRaw(cell, false));
          break;
        default:
          obj[mapping.key] = gv(cell, mapping.default || '');
      }
    }

    // Skip entries that have no identifying info
    if (opts.requiredKey && !obj[opts.requiredKey]) continue;

    results.push(obj);
  }
  return results;
}

async function syncWithGoogleSheet() {
  if (!GOOGLE_SHEET_ID) return;
  console.log(`\n🔄 ════════════════════════════════════════════════`);
  console.log(`🔄 FULL SYNC: Connecting ALL tabs from Google Sheet`);
  console.log(`🔄 Sheet ID: ${GOOGLE_SHEET_ID}`);
  console.log(`🔄 ════════════════════════════════════════════════\n`);

  const syncErrors = [];
  const tabCounts = {};

  try {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1. LEADS TAB
    // Columns: A=lead_id, B=created_date, C=created_time, D=name, E=phone,
    //   F=whatsapp, G=email, H=company, I=website, J=industry, K=business_type,
    //   L=location, M=source, N=campaign, O=ad_set, P=ad, Q=form,
    //   R=utm_source, S=utm_medium, T=utm_campaign, U=utm_content, V=utm_term,
    //   W=assigned_employee, X=lead_status, Y=sub_status, Z=lead_temperature,
    //   AA=lead_score, AB=budget, AC=expected_start_date, AD=decision_maker,
    //   AE=requirements, AF=problems, AG=notes, AH=last_contact_date,
    //   AI=last_contact_type, AJ=next_action, AK=next_action_date,
    //   AL=next_action_time, AM=created_by, AN=updated_by, AO=updated_date
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const leadsTable = await fetchGoogleSheetTab(GOOGLE_SHEET_ID, 'LEADS');
    if (leadsTable && leadsTable.rows && leadsTable.rows.length > 0) {
      const parsedLeads = [];
      for (const row of leadsTable.rows) {
        if (!row.c) continue;
        const c = row.c;
        const leadId = gvRaw(c[0], '');
        const name = gvRaw(c[3], '');
        if (!name || leadId === 'lead_id') continue; // Skip header
        const existingLead = crmDataCache.leads.find(x => x.id === String(leadId)) || {};
        const sheetStatus = String(gvRaw(c[23], 'New'));

        // Parse phone number — strip scientific notation
        let phone = String(gvRaw(c[4], ''));
        if (phone.includes('E') || phone.includes('e')) {
          phone = String(Math.round(Number(phone)));
        }
        phone = phone.replace(/\.0$/, '');

        // Parse whatsapp number
        let whatsapp = String(gvRaw(c[5], ''));
        if (whatsapp.includes('E') || whatsapp.includes('e')) {
          whatsapp = String(Math.round(Number(whatsapp)));
        }
        whatsapp = whatsapp.replace(/\.0$/, '');

        parsedLeads.push({
          ...existingLead,
          id: String(leadId || ('LD-' + Math.floor(10000 + Math.random() * 90000))),
          createdDate: gv(c[1], ''),
          createdTime: gv(c[2], ''),
          name: String(name),
          phone: phone,
          whatsapp: whatsapp,
          email: String(gvRaw(c[6], '')),
          company: String(gvRaw(c[7], '')),
          website: String(gvRaw(c[8], '')),
          industry: String(gvRaw(c[9], '')),
          businessType: String(gvRaw(c[10], '')),
          location: String(gvRaw(c[11], 'Surat')),
          source: String(gvRaw(c[12], 'Meta Ads')),
          campaign: String(gvRaw(c[13], '')),
          adSet: String(gvRaw(c[14], '')),
          ad: String(gvRaw(c[15], '')),
          form: String(gvRaw(c[16], '')),
          utmSource: String(gvRaw(c[17], '')),
          utmMedium: String(gvRaw(c[18], '')),
          utmCampaign: String(gvRaw(c[19], '')),
          utmContent: String(gvRaw(c[20], '')),
          utmTerm: String(gvRaw(c[21], '')),
          assigned: String(gvRaw(c[22], 'Smit Sir')),
          status: sheetStatus,
          subStatus: String(gvRaw(c[24], '')),
          temp: String(gvRaw(c[25], 'HOT')),
          score: Number(gvRaw(c[26], 80)),
          budget: String(gvRaw(c[27], '₹50,000+')),
          expectedStartDate: gv(c[28], ''),
          decisionMaker: String(gvRaw(c[29], 'Yes')),
          requirements: String(gvRaw(c[30], '')),
          problems: String(gvRaw(c[31], '')),
          notes: String(gvRaw(c[32], '')),
          lastContactDate: gv(c[33], ''),
          lastContactType: String(gvRaw(c[34], '')),
          nextAction: String(gvRaw(c[35], 'Call Due')),
          meetingDate: gv(c[36], ''),
          meetingTime: gv(c[37], '4:00 PM'),
          meetingType: 'Office Meeting',
          createdBy: String(gvRaw(c[38], '')),
          updatedBy: String(gvRaw(c[39], '')),
          updatedDate: gv(c[40], ''),
          // Workflow fields (preserve runtime state or derive from sheet)
          callStatus: existingLead.callStatus || (sheetStatus === 'New' ? 'Pending' : 'Done'),
          callDuration: existingLead.callDuration || '',
          meetingStatus: existingLead.meetingStatus || (gvRaw(c[36]) ? 'Scheduled' : 'Pending - Waiting for Call'),
          proposalStatus: existingLead.proposalStatus || 'Pending - Awaiting Interest',
          followupStage: Number(existingLead.followupStage || 1),
          followupStatus: existingLead.followupStatus || (sheetStatus === 'New' ? 'FU1 Pending' : 'None'),
          followupDueAt: existingLead.followupDueAt || (sheetStatus === 'New' ? new Date().toISOString() : ''),
          followupCount: Number(existingLead.followupCount || 0),
          followupHistory: Array.isArray(existingLead.followupHistory) ? existingLead.followupHistory : [],
          workflowStatus: existingLead.workflowStatus || 'Active',
          adCampaign: String(gvRaw(c[13], 'Surat Founders Video 04'))
        });
      }
      if (parsedLeads.length > 0) {
        crmDataCache.leads = parsedLeads;
        tabCounts.LEADS = parsedLeads.length;
        console.log(`  ✅ LEADS: ${parsedLeads.length} records synced`);
      } else {
        crmDataCache.leads = [];
        tabCounts.LEADS = 0;
        console.log(`  ⚠️  LEADS: No data rows found (headers only)`);
      }
    } else {
      crmDataCache.leads = [];
      console.log(`  ⚠️  LEADS: Tab not accessible or empty`);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 2. CALLS TAB
    // Columns: A=call_id, B=lead_id, C=client_name, D=phone, E=date,
    //   F=time, G=employee, H=status, I=duration, J=notes,
    //   K=next_call_date, L=next_call_time, M=recording_url, N=created_at
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const callsTable = await fetchGoogleSheetTab(GOOGLE_SHEET_ID, 'CALLS');
    if (callsTable && callsTable.rows && callsTable.rows.length > 0) {
      const parsedCalls = [];
      for (const row of callsTable.rows) {
        if (!row.c) continue;
        const c = row.c;
        const callId = gvRaw(c[0], '');
        if (callId === 'call_id') continue; // Skip header
        const name = gvRaw(c[2], '');
        if (!name && !callId) continue;

        parsedCalls.push({
          id: String(callId || `CALL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
          leadId: String(gvRaw(c[1], '')),
          name: String(name),
          phone: String(gvRaw(c[3], '')),
          date: gv(c[4], ''),
          time: gv(c[5], 'Recent'),
          caller: String(gvRaw(c[6], '')),
          outcome: String(gvRaw(c[7], 'Pending')),
          duration: String(gvRaw(c[8], '—')),
          notes: String(gvRaw(c[9], '')),
          nextCallDate: gv(c[10], ''),
          nextCallTime: gv(c[11], ''),
          recordingUrl: String(gvRaw(c[12], '')),
          createdAt: String(gvRaw(c[13], '')),
          company: '' // Populated from lead data if available
        });
      }
      if (parsedCalls.length > 0) {
        crmDataCache.calls = parsedCalls;
        tabCounts.CALLS = parsedCalls.length;
        console.log(`  ✅ CALLS: ${parsedCalls.length} records synced`);
      } else {
        crmDataCache.calls = [];
        tabCounts.CALLS = 0;
        console.log(`  ⚠️  CALLS: No data rows found (headers only)`);
      }
    } else {
      crmDataCache.calls = [];
      console.log(`  ⚠️  CALLS: Tab not accessible or empty`);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 3. PROPOSALS TAB
    // Columns: A=proposal_id, B=lead_id, C=client_name, D=company,
    //   E=service, F=package, G=amount, H=discount, I=final_amount,
    //   J=created_date, K=valid_until, L=assigned_employee,
    //   M=proposal_url, N=status, O=notes, P=viewed_at
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const proposalsTable = await fetchGoogleSheetTab(GOOGLE_SHEET_ID, 'PROPOSALS');
    if (proposalsTable && proposalsTable.rows && proposalsTable.rows.length > 0) {
      const parsedProposals = [];
      for (const row of proposalsTable.rows) {
        if (!row.c) continue;
        const c = row.c;
        const propId = gvRaw(c[0], '');
        if (propId === 'proposal_id') continue; // Skip header
        const clientName = gvRaw(c[2], '');
        if (!clientName && !propId) continue;

        parsedProposals.push({
          id: String(propId || `PROP-${Date.now()}`),
          leadId: String(gvRaw(c[1], '')),
          client: String(clientName),
          company: String(gvRaw(c[3], '')),
          scope: String(gvRaw(c[4], '')),
          package: String(gvRaw(c[5], '')),
          amount: Number(gvRaw(c[6], 0)),
          discount: String(gvRaw(c[7], '0')),
          finalAmount: Number(gvRaw(c[8], 0)),
          date: gv(c[9], ''),
          validUntil: gv(c[10], ''),
          assigned: String(gvRaw(c[11], 'Smit Sir')),
          proposalUrl: String(gvRaw(c[12], '')),
          status: String(gvRaw(c[13], 'Draft')),
          notes: String(gvRaw(c[14], '')),
          viewedAt: String(gvRaw(c[15], ''))
        });
      }
      if (parsedProposals.length > 0) {
        crmDataCache.proposals = parsedProposals;
        tabCounts.PROPOSALS = parsedProposals.length;
        console.log(`  ✅ PROPOSALS: ${parsedProposals.length} records synced`);
      } else {
        crmDataCache.proposals = [];
        tabCounts.PROPOSALS = 0;
        console.log(`  ⚠️  PROPOSALS: No data rows (headers only)`);
      }
    } else {
      crmDataCache.proposals = [];
      console.log(`  ⚠️  PROPOSALS: Tab not accessible or empty`);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 4. PAYMENTS TAB
    // Columns: A=payment_id, B=client_id, C=lead_id, D=client_name,
    //   E=invoice_number, F=milestone_name, G=amount, H=due_date,
    //   I=paid_date, J=payment_method, K=status, L=transaction_ref, M=notes
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const paymentsTable = await fetchGoogleSheetTab(GOOGLE_SHEET_ID, 'PAYMENTS');
    if (paymentsTable && paymentsTable.rows && paymentsTable.rows.length > 0) {
      const parsedPayments = [];
      for (const row of paymentsTable.rows) {
        if (!row.c) continue;
        const c = row.c;
        const payId = gvRaw(c[0], '');
        if (payId === 'payment_id') continue;
        const clientName = gvRaw(c[3], '');
        if (!clientName && !payId) continue;

        parsedPayments.push({
          id: String(payId || `PAY-${Date.now()}`),
          clientId: String(gvRaw(c[1], '')),
          leadId: String(gvRaw(c[2], '')),
          client: String(clientName),
          invoiceNumber: String(gvRaw(c[4], '')),
          desc: String(gvRaw(c[5], '')),
          amount: Number(gvRaw(c[6], 0)),
          due: gv(c[7], ''),
          paidDate: gv(c[8], ''),
          paymentMethod: String(gvRaw(c[9], '')),
          status: String(gvRaw(c[10], 'Pending')),
          transactionRef: String(gvRaw(c[11], '')),
          notes: String(gvRaw(c[12], '')),
          company: '' // Can be enriched from lead/client data
        });
      }
      if (parsedPayments.length > 0) {
        crmDataCache.payments = parsedPayments;
        tabCounts.PAYMENTS = parsedPayments.length;
        console.log(`  ✅ PAYMENTS: ${parsedPayments.length} records synced`);
      } else {
        crmDataCache.payments = [];
        tabCounts.PAYMENTS = 0;
        console.log(`  ⚠️  PAYMENTS: No data rows (headers only)`);
      }
    } else {
      crmDataCache.payments = [];
      console.log(`  ⚠️  PAYMENTS: Tab not accessible or empty`);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 5. TASKS TAB
    // Columns: A=task_id, B=title, C=description, D=lead_id, E=client_id,
    //   F=assigned_to, G=priority, H=due_date, I=due_time,
    //   J=status, K=created_by, L=created_at, M=completed_at
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const tasksTable = await fetchGoogleSheetTab(GOOGLE_SHEET_ID, 'TASKS');
    if (tasksTable && tasksTable.rows && tasksTable.rows.length > 0) {
      const parsedTasks = [];
      for (const row of tasksTable.rows) {
        if (!row.c) continue;
        const c = row.c;
        const taskId = gvRaw(c[0], '');
        if (taskId === 'task_id') continue;
        const title = gvRaw(c[1], '');
        if (!title && !taskId) continue;

        const status = String(gvRaw(c[9], 'Pending'));
        parsedTasks.push({
          id: String(taskId || `TSK-${Date.now()}`),
          title: String(title),
          sub: String(gvRaw(c[2], '')),
          description: String(gvRaw(c[2], '')),
          leadId: String(gvRaw(c[3], '')),
          clientId: String(gvRaw(c[4], '')),
          assigned: String(gvRaw(c[5], 'Smit Sir')),
          priority: String(gvRaw(c[6], 'Medium')),
          dueDate: gv(c[7], ''),
          dueTime: gv(c[8], ''),
          status: status,
          done: status === 'Completed' || status === 'Done',
          createdBy: String(gvRaw(c[10], '')),
          createdAt: String(gvRaw(c[11], '')),
          completedAt: String(gvRaw(c[12], ''))
        });
      }
      if (parsedTasks.length > 0) {
        crmDataCache.tasks = parsedTasks;
        tabCounts.TASKS = parsedTasks.length;
        console.log(`  ✅ TASKS: ${parsedTasks.length} records synced`);
      } else {
        crmDataCache.tasks = [];
        tabCounts.TASKS = 0;
        console.log(`  ⚠️  TASKS: No data rows (headers only)`);
      }
    } else {
      crmDataCache.tasks = [];
      console.log(`  ⚠️  TASKS: Tab not accessible or empty`);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 6. MEETINGS TAB
    // Columns: A=meeting_id, B=lead_id, C=client_name, D=phone,
    //   E=date, F=time, G=meeting_person, H=meeting_type, I=address,
    //   J=website, K=status, L=notes, M=assigned_employee,
    //   N=calendar_event_id, O=meet_link, P=created_at, Q=updated_at
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const meetingsTable = await fetchGoogleSheetTab(GOOGLE_SHEET_ID, 'MEETINGS');
    if (meetingsTable && meetingsTable.rows && meetingsTable.rows.length > 0) {
      const parsedMeetings = [];
      for (const row of meetingsTable.rows) {
        if (!row.c) continue;
        const c = row.c;
        const meetingId = gvRaw(c[0], '');
        if (meetingId === 'meeting_id') continue;
        const clientName = gvRaw(c[2], '');
        if (!clientName && !meetingId) continue;

        parsedMeetings.push({
          id: String(meetingId || `MTG-${Date.now()}`),
          leadId: String(gvRaw(c[1], '')),
          clientName: String(clientName),
          phone: String(gvRaw(c[3], '')),
          date: gv(c[4], ''),
          time: gv(c[5], ''),
          meetingPerson: String(gvRaw(c[6], 'Smit Sir')),
          type: String(gvRaw(c[7], 'Office Meeting')),
          address: String(gvRaw(c[8], '')),
          website: String(gvRaw(c[9], '')),
          status: String(gvRaw(c[10], 'Scheduled')),
          notes: String(gvRaw(c[11], '')),
          assigned: String(gvRaw(c[12], 'Smit Sir')),
          calendarEventId: String(gvRaw(c[13], '')),
          meetLink: String(gvRaw(c[14], '')),
          createdAt: String(gvRaw(c[15], '')),
          updatedAt: String(gvRaw(c[16], ''))
        });
      }
      if (parsedMeetings.length > 0) {
        crmDataCache.meetings = parsedMeetings;
        tabCounts.MEETINGS = parsedMeetings.length;
        console.log(`  ✅ MEETINGS: ${parsedMeetings.length} records synced`);
      } else {
        crmDataCache.meetings = [];
        tabCounts.MEETINGS = 0;
        console.log(`  ⚠️  MEETINGS: No data rows (headers only)`);
      }
    } else {
      crmDataCache.meetings = [];
      console.log(`  ⚠️  MEETINGS: Tab not accessible or empty`);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 7. FOLLOWUPS TAB
    // Columns: A=followup_id, B=lead_id, C=client_name, D=phone,
    //   E=assigned_to, F=type, G=due_date, H=due_time, I=message,
    //   J=status, K=completed_date, L=interval_days, M=notes, N=created_at
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const followupsTable = await fetchGoogleSheetTab(GOOGLE_SHEET_ID, 'FOLLOWUPS');
    if (followupsTable && followupsTable.rows && followupsTable.rows.length > 0) {
      const parsedFollowups = [];
      for (const row of followupsTable.rows) {
        if (!row.c) continue;
        const c = row.c;
        const fuId = gvRaw(c[0], '');
        if (fuId === 'followup_id') continue;
        const clientName = gvRaw(c[2], '');
        if (!clientName && !fuId) continue;

        parsedFollowups.push({
          id: String(fuId || `FU-${Date.now()}`),
          leadId: String(gvRaw(c[1], '')),
          clientName: String(clientName),
          phone: String(gvRaw(c[3], '')),
          assigned: String(gvRaw(c[4], 'Smit Sir')),
          type: String(gvRaw(c[5], 'Call')),
          dueDate: gv(c[6], ''),
          dueTime: gv(c[7], ''),
          message: String(gvRaw(c[8], '')),
          status: String(gvRaw(c[9], 'Pending')),
          completedDate: gv(c[10], ''),
          intervalDays: Number(gvRaw(c[11], 0)),
          notes: String(gvRaw(c[12], '')),
          createdAt: String(gvRaw(c[13], ''))
        });
      }
      if (parsedFollowups.length > 0) {
        crmDataCache.followups = parsedFollowups;
        tabCounts.FOLLOWUPS = parsedFollowups.length;
        console.log(`  ✅ FOLLOWUPS: ${parsedFollowups.length} records synced`);
      } else {
        crmDataCache.followups = [];
        tabCounts.FOLLOWUPS = 0;
        console.log(`  ⚠️  FOLLOWUPS: No data rows (headers only)`);
      }
    } else {
      crmDataCache.followups = [];
      console.log(`  ⚠️  FOLLOWUPS: Tab not accessible or empty`);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 8. CLIENTS TAB
    // Columns: A=client_id, B=lead_id, C=name, D=company, E=phone,
    //   F=email, G=website, H=industry, I=services, J=total_project_value,
    //   K=total_paid, L=balance_due, M=assigned_manager, N=status,
    //   O=start_date, P=renewal_date, Q=drive_folder_url,
    //   R=satisfaction_rating, S=feedback
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const clientsTable = await fetchGoogleSheetTab(GOOGLE_SHEET_ID, 'CLIENTS');
    if (clientsTable && clientsTable.rows && clientsTable.rows.length > 0) {
      const parsedClients = [];
      for (const row of clientsTable.rows) {
        if (!row.c) continue;
        const c = row.c;
        const clientId = gvRaw(c[0], '');
        if (clientId === 'client_id') continue;
        const name = gvRaw(c[2], '');
        if (!name && !clientId) continue;

        parsedClients.push({
          id: String(clientId || `CLT-${Date.now()}`),
          leadId: String(gvRaw(c[1], '')),
          name: String(name),
          company: String(gvRaw(c[3], '')),
          phone: String(gvRaw(c[4], '')),
          email: String(gvRaw(c[5], '')),
          website: String(gvRaw(c[6], '')),
          industry: String(gvRaw(c[7], '')),
          services: String(gvRaw(c[8], '')),
          totalProjectValue: Number(gvRaw(c[9], 0)),
          totalPaid: Number(gvRaw(c[10], 0)),
          balanceDue: Number(gvRaw(c[11], 0)),
          assignedManager: String(gvRaw(c[12], 'Smit Sir')),
          status: String(gvRaw(c[13], 'Active')),
          startDate: gv(c[14], ''),
          renewalDate: gv(c[15], ''),
          driveFolderUrl: String(gvRaw(c[16], '')),
          satisfactionRating: Number(gvRaw(c[17], 0)),
          feedback: String(gvRaw(c[18], ''))
        });
      }
      if (parsedClients.length > 0) {
        crmDataCache.clients = parsedClients;
        tabCounts.CLIENTS = parsedClients.length;
        console.log(`  ✅ CLIENTS: ${parsedClients.length} records synced`);
      } else {
        crmDataCache.clients = [];
        tabCounts.CLIENTS = 0;
        console.log(`  ⚠️  CLIENTS: No data rows (headers only)`);
      }
    } else {
      crmDataCache.clients = [];
      console.log(`  ⚠️  CLIENTS: Tab not accessible or empty`);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 9. ACTIVITY_LOG TAB
    // Columns: A=log_id, B=lead_id, C=client_id, D=user, E=action,
    //   F=entity, G=old_value, H=new_value, I=timestamp, J=description
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const activityTable = await fetchGoogleSheetTab(GOOGLE_SHEET_ID, 'ACTIVITY_LOG');
    if (activityTable && activityTable.rows && activityTable.rows.length > 0) {
      const parsedLogs = [];
      for (const row of activityTable.rows) {
        if (!row.c) continue;
        const c = row.c;
        const logId = gvRaw(c[0], '');
        if (logId === 'log_id') continue;
        if (!logId) continue;

        parsedLogs.push({
          id: String(logId),
          leadId: String(gvRaw(c[1], '')),
          clientId: String(gvRaw(c[2], '')),
          user: String(gvRaw(c[3], '')),
          action: String(gvRaw(c[4], '')),
          entity: String(gvRaw(c[5], '')),
          oldValue: String(gvRaw(c[6], '')),
          newValue: String(gvRaw(c[7], '')),
          timestamp: String(gvRaw(c[8], '')),
          description: String(gvRaw(c[9], ''))
        });
      }
      if (parsedLogs.length > 0) {
        crmDataCache.activityLog = parsedLogs;
        tabCounts.ACTIVITY_LOG = parsedLogs.length;
        console.log(`  ✅ ACTIVITY_LOG: ${parsedLogs.length} records synced`);
      } else {
        crmDataCache.activityLog = [];
        tabCounts.ACTIVITY_LOG = 0;
        console.log(`  ⚠️  ACTIVITY_LOG: No data rows (headers only)`);
      }
    } else {
      crmDataCache.activityLog = [];
      console.log(`  ⚠️  ACTIVITY_LOG: Tab not accessible or empty`);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 10. META_LEADS TAB
    // Columns: A=meta_lead_id, B=ad_id, C=form_id, D=raw_payload_json,
    //   E=processed_status, F=mapped_lead_id, G=received_at
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const metaTable = await fetchGoogleSheetTab(GOOGLE_SHEET_ID, 'META_LEADS');
    if (metaTable && metaTable.rows && metaTable.rows.length > 0) {
      const parsedMeta = [];
      for (const row of metaTable.rows) {
        if (!row.c) continue;
        const c = row.c;
        const metaId = gvRaw(c[0], '');
        if (metaId === 'meta_lead_id') continue;
        if (!metaId) continue;

        parsedMeta.push({
          id: String(metaId),
          adId: String(gvRaw(c[1], '')),
          formId: String(gvRaw(c[2], '')),
          rawPayload: String(gvRaw(c[3], '')),
          processedStatus: String(gvRaw(c[4], 'Pending')),
          mappedLeadId: String(gvRaw(c[5], '')),
          receivedAt: String(gvRaw(c[6], ''))
        });
      }
      if (parsedMeta.length > 0) {
        crmDataCache.metaLeads = parsedMeta;
        tabCounts.META_LEADS = parsedMeta.length;
        console.log(`  ✅ META_LEADS: ${parsedMeta.length} records synced`);
      } else {
        crmDataCache.metaLeads = [];
        tabCounts.META_LEADS = 0;
        console.log(`  ⚠️  META_LEADS: No data rows (headers only)`);
      }
    } else {
      crmDataCache.metaLeads = [];
      console.log(`  ⚠️  META_LEADS: Tab not accessible or empty`);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CROSS-REFERENCE: Enrich calls/proposals/payments with company from leads
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const leadMap = {};
    for (const lead of crmDataCache.leads) {
      if (lead.id) leadMap[lead.id] = lead;
    }
    for (const call of crmDataCache.calls) {
      if (call.leadId && leadMap[call.leadId] && !call.company) {
        call.company = leadMap[call.leadId].company || '';
      }
    }
    for (const payment of crmDataCache.payments) {
      if (payment.leadId && leadMap[payment.leadId] && !payment.company) {
        payment.company = leadMap[payment.leadId].company || '';
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SYNC TO MONGODB (if connected)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await safeMongo(async (db) => {
      const collections = [
        { name: 'leads', data: crmDataCache.leads },
        { name: 'calls', data: crmDataCache.calls },
        { name: 'proposals', data: crmDataCache.proposals },
        { name: 'payments', data: crmDataCache.payments },
        { name: 'tasks', data: crmDataCache.tasks },
        { name: 'meetings', data: crmDataCache.meetings },
        { name: 'followups', data: crmDataCache.followups },
        { name: 'clients', data: crmDataCache.clients }
      ];
      for (const { name, data } of collections) {
        const coll = db.collection(name);
        if (data.length > 0) {
          for (const doc of data) {
            if (doc.id) {
              await coll.updateOne({ id: doc.id }, { $set: stripMongoId(doc) }, { upsert: true });
            }
          }
        } else {
          // When Google Sheet tab has no rows, check if MongoDB has records and load into cache
          const count = await coll.countDocuments();
          if (count > 0 && crmDataCache[name] && crmDataCache[name].length === 0) {
            crmDataCache[name] = await coll.find({}).toArray();
          }
        }
      }
      console.log(`  ✅ All data synced to MongoDB Atlas`);
    });

    // Update sync status
    lastSyncStatus = {
      lastSyncAt: new Date().toISOString(),
      tabResults: tabCounts,
      totalLeads: crmDataCache.leads.length,
      totalCalls: crmDataCache.calls.length,
      totalProposals: crmDataCache.proposals.length,
      totalPayments: crmDataCache.payments.length,
      totalTasks: crmDataCache.tasks.length,
      totalMeetings: crmDataCache.meetings.length,
      totalFollowups: crmDataCache.followups.length,
      totalClients: crmDataCache.clients.length,
      totalActivityLogs: crmDataCache.activityLog.length,
      totalMetaLeads: crmDataCache.metaLeads.length,
      errors: syncErrors
    };

    console.log(`\n🔄 ════════════════════════════════════════════════`);
    console.log(`✅ SYNC COMPLETE — ${Object.values(tabCounts).reduce((a, b) => a + b, 0)} total records across ${Object.keys(tabCounts).length} tabs`);
    console.log(`   Leads: ${crmDataCache.leads.length} | Calls: ${crmDataCache.calls.length} | Proposals: ${crmDataCache.proposals.length}`);
    console.log(`   Payments: ${crmDataCache.payments.length} | Tasks: ${crmDataCache.tasks.length} | Meetings: ${crmDataCache.meetings.length}`);
    console.log(`   Follow-ups: ${crmDataCache.followups.length} | Clients: ${crmDataCache.clients.length} | Activity Log: ${crmDataCache.activityLog.length}`);
    console.log(`   Meta Leads: ${crmDataCache.metaLeads.length}`);
    console.log(`🔄 ════════════════════════════════════════════════\n`);

  } catch (err) {
    console.warn('⚠️ Google Sheet Full Sync Error:', err.message);
    syncErrors.push(err.message);
  }
}

// ==============================================================
// 3. REST API ENDPOINTS
// ==============================================================

// ==============================================================
// AUTHENTICATION API ENDPOINTS (Public)
// ==============================================================

// 1. Password-Only Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const ip = auth.getClientIp(req);
    if (auth.isLoginLocked(ip)) {
      const waitMins = auth.getLockRemainingMinutes(ip);
      return res.status(429).json({
        success: false,
        message: `Too many failed attempts. Account locked. Please try again in ${waitMins} minute(s).`
      });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const user = await auth.getAuthUser(mongoDb);
    if (!user || !user.passwordHash) {
      return res.status(500).json({ success: false, message: 'Authentication system not initialized' });
    }

    const isValid = await auth.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      auth.recordLoginFailure(ip);
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    auth.clearLoginAttempts(ip);
    const token = auth.generateToken({ userId: user.id || 'admin-1', role: user.role || 'admin' });
    auth.setAuthCookie(res, token);

    res.json({ success: true, message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// 2. Recovery Info (Masked Email for Forgot Password Screen)
app.get('/api/auth/recovery-info', (req, res) => {
  const email = process.env.RESET_EMAIL || 'bulletproofbrandscrm@gmail.com';
  res.json({
    success: true,
    email: auth.maskEmail(email)
  });
});

// 3. Request OTP for Forgot Password (Email Only)
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const cooldown = auth.canResendOTP('email');
    if (!cooldown.allowed) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${cooldown.waitSeconds} seconds before requesting a new OTP.`,
        waitSeconds: cooldown.waitSeconds
      });
    }

    const otp = auth.generateOTP();
    const email = process.env.RESET_EMAIL || 'bulletproofbrandscrm@gmail.com';

    // Perform REAL delivery to designated recipient — do not fake or assume success
    const deliveryResult = await auth.sendEmailOTP(email, otp);
    if (!deliveryResult || !deliveryResult.sent) {
      return res.status(502).json({
        success: false,
        message: 'Unable to send OTP to email. Please try again.',
        error: deliveryResult?.error || 'EMAIL_DELIVERY_FAILED'
      });
    }

    // Only store hashed OTP in database and record cooldown AFTER provider confirms delivery
    const otpHash = await auth.hashOTP(otp);
    await auth.createPasswordReset(mongoDb, otpHash);
    auth.recordOTPRequest('email');

    res.json({
      success: true,
      message: 'OTP sent to registered email',
      cooldownSeconds: 60
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({
      success: false,
      message: 'Unable to send OTP to email. Please try again.'
    });
  }
});

// 4. Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp || String(otp).trim().length !== 6) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    const cleanOtp = String(otp).trim();
    const latestReset = await auth.getLatestPasswordReset(mongoDb);
    if (!latestReset) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new OTP.' });
    }

    if (new Date() > new Date(latestReset.expiresAt)) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new OTP.' });
    }

    if (latestReset.attempts >= 5 || latestReset.invalidated) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new OTP.' });
    }

    const isValid = await auth.verifyOTP(cleanOtp, latestReset.otpHash);
    if (!isValid) {
      await auth.incrementResetAttempts(mongoDb, latestReset._id ? String(latestReset._id) : latestReset.id);
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    await auth.markResetVerified(mongoDb, latestReset._id ? String(latestReset._id) : latestReset.id);
    const recoveryToken = auth.generateRecoveryToken({ userId: latestReset.userId || 'admin-1' });

    res.json({
      success: true,
      message: 'OTP verified successfully',
      recoveryToken
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, message: 'Invalid OTP. Please try again.' });
  }
});

// 5. Continue to Dashboard (after OTP verified)
app.post('/api/auth/continue-dashboard', async (req, res) => {
  try {
    const { recoveryToken } = req.body;
    if (!recoveryToken) {
      return res.status(400).json({ success: false, message: 'Recovery session missing' });
    }

    const decoded = auth.verifyToken(recoveryToken);
    if (!decoded || decoded.type !== 'recovery_access') {
      return res.status(401).json({ success: false, message: 'Invalid or expired recovery session' });
    }

    const token = auth.generateToken({ userId: decoded.userId || 'admin-1', role: 'admin' });
    auth.setAuthCookie(res, token);

    res.json({ success: true, message: 'Authenticated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 6. Reset Password (with Strong Password Validation)
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { newPassword, confirmPassword, recoveryToken } = req.body;
    if (!recoveryToken) {
      return res.status(400).json({ success: false, message: 'Recovery session missing' });
    }

    const decoded = auth.verifyToken(recoveryToken);
    if (!decoded || decoded.type !== 'recovery_access') {
      return res.status(401).json({ success: false, message: 'Invalid or expired recovery session' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const validation = auth.validatePasswordStrength(newPassword);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: `Password does not meet requirements: ${validation.errors.join(', ')}`
      });
    }

    const newHash = await auth.hashPassword(newPassword);
    await auth.updatePasswordHash(mongoDb, newHash);

    // Automatically authenticate user with new session
    const token = auth.generateToken({ userId: decoded.userId || 'admin-1', role: 'admin' });
    auth.setAuthCookie(res, token);

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ success: false, message: 'Server error updating password' });
  }
});

// 7. Logout
app.post('/api/auth/logout', (req, res) => {
  auth.clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
});

// 8. Auth State Check
app.get('/api/auth/me', (req, res) => {
  const isAuth = auth.checkIsAuthenticated(req);
  if (!isAuth) {
    return res.status(401).json({ authenticated: false });
  }
  res.json({ authenticated: true, role: 'admin' });
});

// ==============================================================
// PROTECT ALL CRM API ROUTES (Requires Authentication)
// ==============================================================
app.use('/api', (req, res, next) => {
  // Allow authentication endpoints and external webhooks without session
  if (req.path.startsWith('/auth') || req.path.startsWith('/webhook')) {
    return next();
  }
  return auth.authMiddleware(req, res, next);
});

// Health and Status check
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    server: 'Bulletproof CRM Engine',
    version: '3.0.0',
    googleSheetId: GOOGLE_SHEET_ID,
    googleSheetUrl: `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit`,
    googleSheetConnected: true,
    appsScriptConnected: Boolean(GOOGLE_APPS_SCRIPT_URL),
    googleAppsScriptUrl: GOOGLE_APPS_SCRIPT_URL ? GOOGLE_APPS_SCRIPT_URL.substring(0, 40) + '...' : '',
    mongoConnected: isMongoConnected,
    mongoUriConfigured: Boolean(MONGODB_URI && !MONGODB_URI.includes('<username>')),
    lastSyncAt: lastSyncStatus.lastSyncAt,
    counts: {
      leads: crmDataCache.leads.length,
      calls: crmDataCache.calls.length,
      proposals: crmDataCache.proposals.length,
      payments: crmDataCache.payments.length,
      tasks: crmDataCache.tasks.length,
      meetings: crmDataCache.meetings.length,
      followups: crmDataCache.followups.length,
      clients: crmDataCache.clients.length,
      activityLog: crmDataCache.activityLog.length,
      metaLeads: crmDataCache.metaLeads.length
    },
    leadsCount: crmDataCache.leads.length,
    timestamp: new Date().toISOString()
  });
});

// Detailed Sync Status
app.get('/api/sync-status', (req, res) => {
  res.json({
    success: true,
    ...lastSyncStatus,
    googleSheetId: GOOGLE_SHEET_ID,
    googleSheetUrl: `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit`,
    mongoConnected: isMongoConnected
  });
});

// Full CRM Data Fetch (from MongoDB or Google Sheets cache)
app.get('/api/data', async (req, res) => {
  try {
    let leads = crmDataCache.leads || [];
    let calls = crmDataCache.calls || [];
    let proposals = crmDataCache.proposals || [];
    let followups = crmDataCache.followups || [];
    let meetings = crmDataCache.meetings || [];
    let deadLeads = crmDataCache.deadLeads || [];
    let activityLog = crmDataCache.activityLog || [];

    await safeMongo(async (db) => {
      const mLeads = await db.collection('leads').find({}).toArray();
      if (mLeads.length > 0) leads = mLeads;
      const mCalls = await db.collection('calls').find({}).toArray();
      if (mCalls.length > 0) calls = mCalls;
      const mProposals = await db.collection('proposals').find({}).toArray();
      if (mProposals.length > 0) proposals = mProposals;
      const mFollowups = await db.collection('followups').find({}).toArray();
      if (mFollowups.length > 0) followups = mFollowups;
      const mMeetings = await db.collection('meetings').find({}).toArray();
      if (mMeetings.length > 0) meetings = mMeetings;
      const mDead = await db.collection('dead_leads').find({}).toArray();
      if (mDead.length > 0) deadLeads = mDead;
    });

    // Clients represent leads with status === 'Won'
    const clients = leads.filter(l => l.status === 'Won');

    // Dead leads list
    const resolvedDeadLeads = deadLeads.length > 0 ? deadLeads : leads.filter(l => l.status === 'Dead').map(l => ({
      id: `DEAD-${l.id}`,
      leadId: l.id,
      businessName: l.businessName || l.company || l.name,
      company: l.company || l.businessName || l.name,
      name: l.name || l.businessName || l.company,
      phone: (l.mobileNumbers && l.mobileNumbers[0]) || l.phone || '',
      reason: l.deadReason || 'Not Interested',
      closeEmployeeName: l.closeEmployeeName || l.assigned || 'Smit Sir',
      deadDate: l.deadDate || (l.updatedAt ? l.updatedAt.split('T')[0] : getTodayIso()),
      previousStage: l.previousStage || 'Call Center',
      previousStatus: l.previousStatus || 'Active',
      status: 'Dead',
      createdAt: l.updatedAt || new Date().toISOString()
    }));

    res.json({
      success: true,
      source: isMongoConnected ? 'mongodb_atlas' : 'google_sheets_cache',
      lastSyncAt: lastSyncStatus.lastSyncAt,
      leads,
      calls,
      meetings,
      proposals,
      followups,
      clients,
      deadLeads: resolvedDeadLeads,
      activityLog,
      packages: PROPOSAL_PACKAGES,
      sources: LEAD_SOURCES,
      payments: crmDataCache.payments,
      tasks: crmDataCache.tasks,
      metaLeads: crmDataCache.metaLeads
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Real Dashboard KPIs
app.get('/api/dashboard/stats', (req, res) => {
  const today = getTodayIso();
  const leads = crmDataCache.leads || [];
  const calls = crmDataCache.calls || [];
  const meetings = crmDataCache.meetings || [];
  const proposals = crmDataCache.proposals || [];
  const followups = crmDataCache.followups || [];
  const deadLeads = crmDataCache.deadLeads || [];

  const totalLeads = leads.length;
  const todayLeads = leads.filter(l => (l.createdDate && l.createdDate === today) || (l.createdAt && l.createdAt.startsWith(today))).length;
  const todayCalls = calls.filter(c => (c.createdAt && c.createdAt.startsWith(today)) || (c.date && c.date === today) || (c.calledAt && c.calledAt.startsWith(today))).length;
  const todayMeetings = meetings.filter(m => (m.meetingDate === today || m.date === today)).length;
  const todayProposals = proposals.filter(p => (p.createdAt && p.createdAt.startsWith(today)) || (p.date && p.date === today)).length;
  const todayFollowups = followups.filter(f => (f.nextFollowUpDate === today || (f.createdAt && f.createdAt.startsWith(today)))).length;
  const todayWon = leads.filter(l => l.status === 'Won' && ((l.wonDate && l.wonDate.startsWith(today)) || (l.updatedAt && l.updatedAt.startsWith(today)))).length;
  const todayDead = deadLeads.filter(d => d.deadDate === today || (d.createdAt && d.createdAt.startsWith(today))).length 
    || leads.filter(l => l.status === 'Dead' && ((l.deadDate && l.deadDate === today) || (l.updatedAt && l.updatedAt.startsWith(today)))).length;
  const notAttends = meetings.filter(m => m.status === 'Not Attend').length;
  const upcomingFollowups = followups.filter(f => f.nextFollowUpDate && f.nextFollowUpDate > today).length;
  const upcomingMeetings = meetings.filter(m => (m.meetingDate && m.meetingDate > today) || (m.date && m.date > today)).length;

  res.json({
    success: true,
    stats: {
      totalLeads,
      todayLeads,
      todayCalls,
      todayMeetings,
      todayProposals,
      todayFollowups,
      todayWon,
      todayDead,
      notAttends,
      upcomingFollowups,
      upcomingMeetings
    }
  });
});

app.get('/api/packages', (req, res) => {
  res.json({ success: true, packages: PROPOSAL_PACKAGES });
});

app.get('/api/sources', (req, res) => {
  res.json({ success: true, sources: LEAD_SOURCES });
});

app.get('/api/dead-leads', (req, res) => {
  const deadList = (crmDataCache.deadLeads && crmDataCache.deadLeads.length > 0)
    ? crmDataCache.deadLeads
    : (crmDataCache.leads || []).filter(l => l.status === 'Dead').map(l => ({
        id: `DEAD-${l.id}`,
        leadId: l.id,
        businessName: l.businessName || l.company || l.name,
        company: l.company || l.businessName || l.name,
        name: l.name || l.businessName || l.company,
        phone: (l.mobileNumbers && l.mobileNumbers[0]) || l.phone || '',
        reason: l.deadReason || 'Not Interested',
        closeEmployeeName: l.closeEmployeeName || l.assigned || 'Smit Sir',
        deadDate: l.deadDate || (l.updatedAt ? l.updatedAt.split('T')[0] : getTodayIso()),
        previousStage: l.previousStage || 'Call Center',
        previousStatus: l.previousStatus || 'Active',
        status: 'Dead',
        createdAt: l.updatedAt || new Date().toISOString()
      }));
  res.json({ success: true, deadLeads: deadList, count: deadList.length });
});

app.get('/api/calls', (req, res) => {
  const leadId = req.query.leadId;
  const calls = leadId ? (crmDataCache.calls || []).filter(c => c.leadId === leadId) : (crmDataCache.calls || []);
  res.json({ success: true, calls, count: calls.length });
});

app.get('/api/meetings', (req, res) => {
  let list = crmDataCache.meetings || [];
  if (req.query.status) list = list.filter(m => m.status === req.query.status);
  if (req.query.leadId) list = list.filter(m => m.leadId === req.query.leadId);
  res.json({ success: true, meetings: list, count: list.length });
});

app.get('/api/clients', (req, res) => {
  const wonLeads = (crmDataCache.leads || []).filter(l => l.status === 'Won').map(lead => {
    const meetings = (crmDataCache.meetings || []).filter(m => m.leadId === lead.id);
    const followups = (crmDataCache.followups || []).filter(f => f.leadId === lead.id);
    const calls = (crmDataCache.calls || []).filter(c => c.leadId === lead.id);
    const proposals = (crmDataCache.proposals || []).filter(p => p.leadId === lead.id);
    const history = (crmDataCache.activityLog || []).filter(a => a.leadId === lead.id || a.clientId === lead.id)
      .sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0));
    return {
      ...lead,
      meetings,
      followups,
      calls,
      proposals,
      history
    };
  });
  res.json({ success: true, clients: wonLeads, count: wonLeads.length });
});

app.get('/api/activity-log', (req, res) => {
  res.json({ success: true, activityLog: crmDataCache.activityLog, count: crmDataCache.activityLog.length });
});

// ==============================================================
// META LEAD ADS AUTOMATIC WEBHOOK & INGESTION ENGINE
// ==============================================================
async function processIncomingMetaLead(rawLead) {
  const phone = String(rawLead.phone || rawLead.phone_number || '').trim();
  const email = String(rawLead.email || '').trim().toLowerCase();
  const name = String(rawLead.name || rawLead.full_name || 'Meta Inbound Prospect').trim();
  const company = String(rawLead.company || rawLead.company_name || 'Brand Enterprise').trim();
  const metaLeadId = String(rawLead.id || rawLead.meta_lead_id || rawLead.leadgen_id || `ML-${Date.now()}`);

  // 1. Duplicate Check (Phone or Email or Meta Lead ID)
  const cleanPhone = phone.replace(/\D/g, '');
  const existingLead = crmDataCache.leads.find(l => {
    if (metaLeadId && l.metaLeadId === metaLeadId) return true;
    if (cleanPhone && cleanPhone.length >= 10 && String(l.phone || '').replace(/\D/g, '').endsWith(cleanPhone.slice(-10))) return true;
    if (email && l.email && l.email.toLowerCase() === email) return true;
    return false;
  });

  if (existingLead) {
    console.log(`⚠️ Duplicate Meta Lead detected for ${name} (${phone}). Re-engaging existing lead ${existingLead.id}`);
    existingLead.callStatus = 'Pending';
    existingLead.followupStatus = 'Call Due';
    existingLead.lastAction = 'Meta Lead Re-engagement';
    existingLead.lastActionAt = new Date().toISOString();
    return { lead: existingLead, call: null, isDuplicate: true };
  }

  // 2. Generate Lead ID (LB-2026-XXXXX format as requested)
  const leadId = `LB-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  // 3. Lead Scoring Engine (80-98 based on intent)
  let score = 84;
  const budgetStr = String(rawLead.budget || '');
  if (budgetStr.includes('1L') || budgetStr.includes('1.5') || Number(budgetStr) >= 50000) score += 6;
  if (rawLead.website) score += 4;
  if (rawLead.requirement) score += 3;
  score = Math.min(score, 98);

  // 4. Auto-Assign Employee (Round Robin: Smit Sir, Rahul, Jay)
  const salesTeam = ['Smit Sir', 'Rahul', 'Jay'];
  const nextAssignee = salesTeam[crmDataCache.leads.length % salesTeam.length] || 'Smit Sir';

  // 5. Construct Complete Lead Object
  const newLead = {
    id: leadId,
    metaLeadId: metaLeadId,
    name: name,
    phone: phone,
    email: email,
    company: company,
    website: rawLead.website || '',
    requirement: rawLead.requirement || rawLead.service || 'Full-Stack Branding & Shopify Infrastructure',
    budget: rawLead.budget ? String(rawLead.budget) : '₹1,00,000+',
    city: rawLead.location || rawLead.city || 'Surat, Gujarat',
    location: rawLead.location || rawLead.city || 'Surat, Gujarat',
    source: 'Meta Ads',
    campaign: rawLead.campaign_name || rawLead.campaign || 'Surat Business Owners - Shopify & Growth Funnel',
    adSet: rawLead.adset_name || rawLead.adSet || 'Surat Founders AdSet',
    ad: rawLead.ad_name || rawLead.ad || 'Business Video 04',
    form: rawLead.form_name || rawLead.form || 'Instant Consultation Form',
    status: 'New',
    callStatus: 'Pending',
    followupStage: 1,
    followupStatus: 'Call Due',
    followupDueAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5-minute SLA
    score: score,
    temp: score >= 80 ? 'HOT' : 'WARM',
    assigned: nextAssignee,
    nextAction: 'First Contact Call (5-min SLA)',
    decisionMaker: 'Yes',
    notes: `Meta Inbound Lead from ${rawLead.campaign_name || 'Meta Ads'}. Requirement: ${rawLead.requirement || 'Full-Stack Growth'}.`,
    createdDate: new Date().toISOString().split('T')[0],
    createdTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString()
  };

  crmDataCache.leads.unshift(newLead);

  // 6. Automatically inject pending call into Call Queue with "Call Now"
  const callRecord = {
    id: `CALL-${Date.now()}`,
    leadId: newLead.id,
    name: newLead.name,
    company: newLead.company,
    phone: newLead.phone,
    caller: 'Siddharth Bhai',
    time: newLead.createdTime,
    status: 'Pending',
    outcome: 'Pending',
    followupStage: 1,
    notes: `New Meta Inbound Lead from ${newLead.campaign}. Immediate call pending (5-min SLA).`,
    createdAt: new Date().toISOString()
  };
  crmDataCache.calls.unshift(callRecord);

  // 7. Store in Meta Leads log
  const metaRecord = {
    id: metaLeadId,
    adId: rawLead.ad_id || 'AD-9901',
    formId: rawLead.form_id || 'FORM-301',
    rawPayload: JSON.stringify(rawLead),
    processedStatus: 'Converted to Lead',
    mappedLeadId: newLead.id,
    receivedAt: new Date().toISOString()
  };
  crmDataCache.metaLeads.unshift(metaRecord);

  // 8. Sync to MongoDB Atlas
  if (isMongoConnected && mongoDb) {
    mongoDb.collection('leads').updateOne({ id: newLead.id }, { $set: stripMongoId(newLead) }, { upsert: true }).catch(console.warn);
    mongoDb.collection('calls').insertOne(stripMongoId(callRecord)).catch(console.warn);
    mongoDb.collection('meta_leads').updateOne({ id: metaRecord.id }, { $set: stripMongoId(metaRecord) }, { upsert: true }).catch(console.warn);
  }

  // 9. Sync to Google Sheets (LEADS & META_LEADS)
  writeToGoogleSheet('LEADS', 'lead_id', mapLeadToSheet(newLead)).catch(console.warn);
  writeToGoogleSheet('META_LEADS', 'meta_lead_id', {
    meta_lead_id: metaRecord.id,
    ad_id: metaRecord.adId,
    form_id: metaRecord.formId,
    raw_payload_json: metaRecord.rawPayload,
    processed_status: metaRecord.processedStatus,
    mapped_lead_id: metaRecord.mappedLeadId,
    received_at: metaRecord.receivedAt
  }).catch(console.warn);

  console.log(`⚡ [META AUTOMATION] New Lead ${newLead.id} (${newLead.name}) created, scored ${score} 🔥, assigned to ${nextAssignee}, added to Call Queue!`);
  return { lead: newLead, call: callRecord, isDuplicate: false };
}

// Meta Webhook Verification
app.get('/api/webhook/meta', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const verifyToken = process.env.META_VERIFY_TOKEN || 'bulletproof_meta_crm_2026';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Meta Webhook Verified Successfully!');
    return res.status(200).send(challenge);
  }
  res.status(200).json({ status: 'Meta Webhook Listener Active', endpoint: '/api/webhook/meta', verifyTokenRequired: verifyToken });
});

// Meta Webhook Event Ingestion
app.post('/api/webhook/meta', async (req, res) => {
  try {
    const body = req.body;
    console.log('⚡ Meta Webhook Event Received:', JSON.stringify(body).slice(0, 300));

    // Handle Meta Leadgen Webhook structure
    if (body.object === 'page' && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        if (Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            if (change.field === 'leadgen' && change.value) {
              const leadgenId = change.value.leadgen_id;
              const formId = change.value.form_id;
              const adId = change.value.ad_id;

              let leadData = {
                id: leadgenId,
                form_id: formId,
                ad_id: adId,
                campaign_name: 'Meta Ads Auto Ingest'
              };

              if (process.env.META_ACCESS_TOKEN && leadgenId) {
                try {
                  const graphUrl = `https://graph.facebook.com/v21.0/${leadgenId}?access_token=${process.env.META_ACCESS_TOKEN}`;
                  const graphRes = await fetch(graphUrl);
                  if (graphRes.ok) {
                    const graphJson = await graphRes.json();
                    if (Array.isArray(graphJson.field_data)) {
                      graphJson.field_data.forEach(f => {
                        const val = f.values && f.values[0] ? f.values[0] : '';
                        if (f.name === 'full_name' || f.name === 'name') leadData.name = val;
                        else if (f.name === 'phone_number' || f.name === 'phone') leadData.phone = val;
                        else if (f.name === 'email') leadData.email = val;
                        else if (f.name === 'company_name' || f.name === 'company') leadData.company = val;
                        else if (f.name === 'city' || f.name === 'location') leadData.location = val;
                        else if (f.name === 'budget') leadData.budget = val;
                        else if (f.name === 'requirement' || f.name === 'service') leadData.requirement = val;
                      });
                    }
                  }
                } catch (gErr) {
                  console.warn('Meta Graph API Fetch Warning:', gErr.message);
                }
              }

              await processIncomingMetaLead(leadData);
            }
          }
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    }

    // Direct Lead Ingestion Payload
    const result = await processIncomingMetaLead(body);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Meta Webhook Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Meta Lead Simulator / Ingestion API
app.post('/api/meta/simulate-lead', async (req, res) => {
  try {
    const sampleLeads = [
      {
        name: "Hiteshbhai Patel",
        phone: "98251" + Math.floor(10000 + Math.random() * 90000),
        email: "hitesh@pateltextiles.in",
        company: "Patel Silk Mills",
        website: "https://patelsilkmills.com",
        location: "Surat, Gujarat",
        budget: "₹1,50,000",
        requirement: "E-Commerce Shopify Architecture & Meta Ads Engine",
        campaign_name: "Surat Business Owners - Shopify & Growth Funnel",
        adset_name: "Textile & Diamond Founders",
        ad_name: "Founder Story Video 04"
      },
      {
        name: "Bhavinbhai Shah",
        phone: "99790" + Math.floor(10000 + Math.random() * 90000),
        email: "bhavin@shahjewels.com",
        company: "Shah Fine Jewels",
        website: "https://shahfinejewels.com",
        location: "Surat, Gujarat",
        budget: "₹2,00,000",
        requirement: "Luxury Brand Identity & Performance Marketing",
        campaign_name: "Gujarat Founders Scale Up - Carousel",
        adset_name: "Luxury & D2C Brands",
        ad_name: "Brand Elevation Ad 02"
      },
      {
        name: "Dharmeshbhai Vaghani",
        phone: "98795" + Math.floor(10000 + Math.random() * 90000),
        email: "dharmesh@vaghangroup.com",
        company: "Vaghani Diamond Exports",
        website: "https://vaghanigroup.com",
        location: "Surat, Gujarat",
        budget: "₹1,00,000",
        requirement: "Global B2B Lead Funnel & CRM Setup",
        campaign_name: "Surat Business Owners - Video 04",
        adset_name: "Export Businesses",
        ad_name: "B2B Scale Video"
      }
    ];

    const chosen = req.body && req.body.name ? req.body : sampleLeads[Math.floor(Math.random() * sampleLeads.length)];
    const result = await processIncomingMetaLead(chosen);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/meta-leads', (req, res) => {
  res.json({ success: true, metaLeads: crmDataCache.metaLeads, count: crmDataCache.metaLeads.length });
});

app.get('/api/followups', (req, res) => {
  res.json({ success: true, followups: crmDataCache.followups, count: crmDataCache.followups.length });
});

app.get('/api/leads', (req, res) => {
  res.json({ success: true, leads: crmDataCache.leads, count: crmDataCache.leads.length });
});

app.get('/api/calls', (req, res) => {
  res.json({ success: true, calls: crmDataCache.calls, count: crmDataCache.calls.length });
});

app.get('/api/proposals-list', (req, res) => {
  res.json({ success: true, proposals: crmDataCache.proposals, count: crmDataCache.proposals.length });
});

app.get('/api/payments-list', (req, res) => {
  res.json({ success: true, payments: crmDataCache.payments, count: crmDataCache.payments.length });
});

app.get('/api/tasks-list', (req, res) => {
  res.json({ success: true, tasks: crmDataCache.tasks, count: crmDataCache.tasks.length });
});

// Add / Update Lead
app.post('/api/leads', async (req, res) => {
  try {
    const body = req.body || {};
    const businessName = String(body.businessName || body.company || '').trim();
    if (!businessName) {
      return res.status(400).json({ success: false, error: 'Business Name is required.' });
    }

    const leadSource = String(body.leadSource || body.source || '').trim();
    if (!leadSource) {
      return res.status(400).json({ success: false, error: 'Lead Source is required.' });
    }

    // Process and validate Indian phone numbers (exactly 10 digits required)
    let rawPhones = [];
    if (Array.isArray(body.mobileNumbers) && body.mobileNumbers.length > 0) {
      rawPhones = body.mobileNumbers;
    } else if (Array.isArray(body.phones) && body.phones.length > 0) {
      rawPhones = body.phones;
    } else if (body.phone && String(body.phone).trim()) {
      rawPhones = [body.phone];
    }

    let mobileNumbers = [];
    for (const rawP of rawPhones) {
      const str = String(rawP || '').trim();
      if (!str) continue;
      let digits = str.replace(/[\s\-\(\)]/g, '');
      if (digits.startsWith('+91')) digits = digits.slice(3);
      else if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
      else if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);

      if (!/^\d{10}$/.test(digits)) {
        return res.status(400).json({
          success: false,
          error: 'Enter a valid 10-digit mobile number.'
        });
      }
      mobileNumbers.push(digits);
    }

    const nowIso = new Date().toISOString();
    const isNew = !body.id;
    const leadId = body.id || ('LD-' + Math.floor(10000 + Math.random() * 90000));

    const existingIdx = crmDataCache.leads.findIndex(l => l.id === leadId);
    const existingLead = existingIdx >= 0 ? crmDataCache.leads[existingIdx] : {};

    const lead = {
      ...existingLead,
      id: leadId,
      businessName,
      company: businessName,
      name: String(body.name || '').trim() || businessName,
      leadSource,
      source: leadSource,
      mobileNumbers,
      phones: mobileNumbers,
      phone: mobileNumbers[0] || '',
      city: String(body.city || existingLead.city || '').trim(),
      state: String(body.state || existingLead.state || '').trim(),
      location: String(body.location || body.city || existingLead.location || 'Surat').trim(),
      status: existingLead.status || 'New',
      currentStage: existingLead.currentStage || 'Call Center',
      assigned: body.assigned || existingLead.assigned || 'Smit Sir',
      notes: body.notes || existingLead.notes || '',
      createdDate: existingLead.createdDate || nowIso.split('T')[0],
      createdAt: existingLead.createdAt || nowIso,
      updatedAt: nowIso
    };

    if (existingIdx >= 0) {
      crmDataCache.leads[existingIdx] = lead;
    } else {
      crmDataCache.leads.unshift(lead);
    }

    // Activity: Lead Created or Updated
    const act = {
      id: 'ACT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      leadId: lead.id,
      activityType: isNew ? 'Lead Created' : 'Lead Updated',
      description: isNew ? `New lead created: ${businessName} (${leadSource})` : `Lead updated: ${businessName}`,
      notes: lead.notes || '',
      user: lead.assigned,
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: nowIso,
      createdAt: nowIso
    };
    crmDataCache.activityLog.unshift(act);

    // If new lead, automatically create Call #1 activity record (defaults to Siddharth Bhai)
    let call1 = null;
    if (isNew) {
      const defaultCaller = body.caller || 'Siddharth Bhai';
      call1 = {
        id: `CALL-${lead.id}-1`,
        leadId: lead.id,
        callNumber: 1,
        phoneNumber: lead.phone || '',
        conversationNotes: '',
        callStatus: 'Pending',
        nextCallDate: '',
        caller: defaultCaller,
        createdBy: defaultCaller,
        createdAt: nowIso
      };
      crmDataCache.calls.unshift(call1);

      const callAct = {
        id: 'ACT-' + (Date.now() + 1) + '-' + Math.floor(Math.random() * 1000),
        leadId: lead.id,
        activityType: 'Call #1 Created',
        description: `Lead entered Call Center — Call #1 ready`,
        notes: '',
        user: lead.assigned,
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: nowIso,
        createdAt: nowIso
      };
      crmDataCache.activityLog.unshift(callAct);

      await safeMongo(async (db) => {
        await db.collection('calls').updateOne({ id: call1.id }, { $set: stripMongoId(call1) }, { upsert: true });
        await db.collection('activity_log').insertOne(stripMongoId(callAct));
      });
      writeToGoogleSheet('CALLS', 'call_id', mapCallToSheet(call1)).catch(e => console.warn(e));
    }

    await safeMongo(async (db) => {
      await db.collection('leads').updateOne({ id: lead.id }, { $set: stripMongoId(lead) }, { upsert: true });
      await db.collection('activity_log').insertOne(stripMongoId(act));
    });
    writeToGoogleSheet('LEADS', 'lead_id', mapLeadToSheet(lead)).catch(e => console.warn(e));

    res.json({
      success: true,
      lead,
      call: call1 || crmDataCache.calls.find(c => c.leadId === lead.id) || null,
      activity: act
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/leads/:id/details', (req, res) => {
  const leadId = req.params.id;
  const lead = crmDataCache.leads.find(l => l.id === leadId);
  if (!lead) return res.status(404).json({ success: false, error: 'Lead not found.' });

  const calls = crmDataCache.calls.filter(c => c.leadId === leadId).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const meetings = crmDataCache.meetings.filter(m => m.leadId === leadId).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const proposals = crmDataCache.proposals.filter(p => p.leadId === leadId).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const followups = crmDataCache.followups.filter(f => f.leadId === leadId).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const deadInfo = (crmDataCache.deadLeads || []).find(d => d.leadId === leadId) || null;
  const activities = crmDataCache.activityLog.filter(a => a.leadId === leadId).sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0));

  res.json({
    success: true,
    lead,
    calls,
    meetings,
    proposals,
    followups,
    deadInfo,
    activities
  });
});

app.get('/api/leads/:id', (req, res) => {
  const lead = crmDataCache.leads.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ success: false, error: 'Lead not found.' });

  const meetings = crmDataCache.meetings.filter(m => m.leadId === lead.id);
  const followups = crmDataCache.followups.filter(f => f.leadId === lead.id);
  const calls = crmDataCache.calls.filter(c => c.leadId === lead.id);
  const proposals = crmDataCache.proposals.filter(p => p.leadId === lead.id);
  const history = crmDataCache.activityLog.filter(a => a.leadId === lead.id || a.clientId === lead.id);

  res.json({
    success: true,
    lead: {
      ...lead,
      meetings,
      followups,
      calls,
      proposals,
      history
    }
  });
});

// ==============================================================
// 3.1 SERVICES CATALOG & PRICING APIS (Requirements 2, 3, 5, 6, 14, 15)
// ==============================================================
app.get('/api/services', (req, res) => {
  res.json({
    success: true,
    services: crmDataCache.services || DEFAULT_SERVICES,
    count: (crmDataCache.services || DEFAULT_SERVICES).length
  });
});

app.get('/api/services/:id', (req, res) => {
  const service = (crmDataCache.services || DEFAULT_SERVICES).find(s => s.id === req.params.id);
  if (!service) return res.status(404).json({ success: false, error: 'Service not found.' });
  res.json({ success: true, service });
});

app.post('/api/services', async (req, res) => {
  try {
    const { name, defaultPrice, description, isActive } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, error: 'Service name is required.' });
    }
    const priceNum = Number(defaultPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ success: false, error: 'Service price must be a non-negative number.' });
    }

    const newService = {
      id: `srv_${Date.now()}`,
      name: String(name).trim(),
      defaultPrice: priceNum,
      description: description ? String(description).trim() : '',
      isActive: isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    crmDataCache.services = crmDataCache.services || [...DEFAULT_SERVICES];
    crmDataCache.services.push(newService);

    await safeMongo(async (db) => {
      await db.collection('services').updateOne({ id: newService.id }, { $set: stripMongoId(newService) }, { upsert: true });
    });

    res.status(201).json({ success: true, service: newService });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const id = req.params.id;
    crmDataCache.services = crmDataCache.services || [...DEFAULT_SERVICES];
    const idx = crmDataCache.services.findIndex(s => s.id === id);
    if (idx < 0) return res.status(404).json({ success: false, error: 'Service not found.' });

    const updates = req.body || {};
    if (updates.defaultPrice !== undefined) {
      const p = Number(updates.defaultPrice);
      if (isNaN(p) || p < 0) return res.status(400).json({ success: false, error: 'Price must be non-negative.' });
      updates.defaultPrice = p;
    }

    crmDataCache.services[idx] = {
      ...crmDataCache.services[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    const updated = crmDataCache.services[idx];

    await safeMongo(async (db) => {
      await db.collection('services').updateOne({ id }, { $set: stripMongoId(updated) }, { upsert: true });
    });

    res.json({ success: true, service: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const id = req.params.id;
    crmDataCache.services = (crmDataCache.services || DEFAULT_SERVICES).filter(s => s.id !== id);
    await safeMongo(async (db) => {
      await db.collection('services').deleteOne({ id });
    });
    res.json({ success: true, message: `Service ${id} deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==============================================================
// 3.2 GLOBAL CENTRALIZED DEAD LEAD & RESTORE APIS (Requirements 1, 9, 15)
// ==============================================================
const handleGlobalDeadLead = async (req, res) => {
  try {
    const leadId = req.params.leadId || req.params.id || req.body.leadId;
    const { reason, user, closeEmployeeName, date, notes } = req.body;
    if (!leadId) return res.status(400).json({ success: false, error: 'leadId is required.' });

    const lead = crmDataCache.leads.find(l => l.id === leadId);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found.' });

    if (lead.status === 'Dead') {
      return res.status(400).json({
        success: false,
        error: 'Lead is already marked as Dead.',
        isDead: true,
        lead
      });
    }

    const prevStatus = lead.status || 'Active';
    const prevStage = lead.currentStage || 'Call Center';
    const nowIso = new Date().toISOString();
    const deadDate = date || nowIso.split('T')[0];
    const closer = closeEmployeeName || user || lead.assigned || 'Smit Sir';
    const deadReason = reason || notes || 'Not Interested';

    lead.previousStatus = prevStatus;
    lead.previousStage = prevStage;
    lead.status = 'Dead';
    lead.currentStage = 'Dead';
    lead.deadDate = deadDate;
    lead.markedAt = nowIso;
    lead.deadBy = closer;
    lead.closeEmployeeName = closer;
    lead.deadReason = deadReason;
    lead.updatedAt = nowIso;

    // Create deadLeads record
    const deadRec = {
      id: `DEAD-${lead.id}-${Date.now()}`,
      leadId: lead.id,
      businessName: lead.businessName || lead.company || lead.name,
      company: lead.company || lead.businessName || lead.name,
      name: lead.name || lead.businessName || lead.company,
      phone: (lead.mobileNumbers && lead.mobileNumbers[0]) || lead.phone || '',
      reason: deadReason,
      closeEmployeeName: closer,
      deadDate,
      previousStage: prevStage,
      previousStatus: prevStatus,
      status: 'Dead',
      createdBy: closer,
      createdAt: nowIso
    };

    crmDataCache.deadLeads = crmDataCache.deadLeads || [];
    crmDataCache.deadLeads.unshift(deadRec);

    const act = {
      id: 'ACT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      leadId: lead.id,
      activityType: 'Lead Marked Dead',
      description: `Lead marked as Dead from ${prevStage}. Reason: ${deadReason}`,
      notes: `Closed by: ${closer}`,
      user: closer,
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: nowIso,
      createdAt: nowIso,
      status: 'Dead'
    };
    crmDataCache.activityLog.unshift(act);

    await safeMongo(async (db) => {
      await db.collection('leads').updateOne({ id: lead.id }, { $set: stripMongoId(lead) }, { upsert: true });
      await db.collection('dead_leads').updateOne({ id: deadRec.id }, { $set: stripMongoId(deadRec) }, { upsert: true });
      await db.collection('activity_log').insertOne(stripMongoId(act));
    });
    writeToGoogleSheet('LEADS', 'lead_id', mapLeadToSheet(lead)).catch(e => console.warn(e));

    res.json({ success: true, deadRecord: deadRec, lead, activity: act });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

app.patch('/api/leads/:leadId/dead', handleGlobalDeadLead);
app.post('/api/leads/:id/dead', handleGlobalDeadLead);
app.post('/api/leads/dead', handleGlobalDeadLead);
app.post('/api/followups/dead', handleGlobalDeadLead);

// Centralized Restore / Reactivate Lead Endpoint
const handleRestoreLead = async (req, res) => {
  try {
    const leadId = req.params.leadId || req.params.id || req.body.leadId;
    const { user } = req.body;
    if (!leadId) return res.status(400).json({ success: false, error: 'leadId is required.' });

    const lead = crmDataCache.leads.find(l => l.id === leadId);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found.' });

    const restoredStatus = lead.previousStatus && lead.previousStatus !== 'Dead' ? lead.previousStatus : 'Follow-up';
    lead.status = restoredStatus;
    lead.workflowStatus = 'Active';
    delete lead.deadDate;
    delete lead.deadReason;
    lead.updatedAt = new Date().toISOString();

    const act = {
      id: 'ACT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      leadId: lead.id,
      clientId: lead.clientId || lead.id,
      activityType: 'Lead Restored',
      stage: lead.followupStage ? `Follow-up ${lead.followupStage}` : '',
      description: 'Lead restored from Dead status',
      notes: `Reactivated by ${user || 'Smit Sir'}. Restored to status: ${restoredStatus}`,
      user: user || 'Smit Sir',
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      status: restoredStatus
    };
    crmDataCache.activityLog.unshift(act);

    await safeMongo(async (db) => {
      await db.collection('leads').updateOne({ id: lead.id }, { $set: stripMongoId(lead) }, { upsert: true });
      await db.collection('activity_log').insertOne(stripMongoId(act));
    });
    writeToGoogleSheet('LEADS', 'lead_id', mapLeadToSheet(lead)).catch(e => console.warn(e));

    res.json({ success: true, lead, activity: act });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

app.patch('/api/leads/:leadId/restore', handleRestoreLead);
app.post('/api/leads/:id/restore', handleRestoreLead);
app.post('/api/leads/restore', handleRestoreLead);

// ==============================================================
// 3.3 FOLLOW-UP ENTRY & SERVICE SELECTION APIS (Requirements 2, 3, 4, 7, 8, 14)
// ==============================================================
app.post('/api/followups', async (req, res) => {
  try {
    const body = req.body || {};
    const leadId = body.leadId;
    if (!leadId) {
      return res.status(400).json({ success: false, error: 'leadId is required.' });
    }

    const lead = crmDataCache.leads.find(l => l.id === leadId);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found.' });

    if (body.nextFollowUpDate && isPastDate(body.nextFollowUpDate)) {
      return res.status(400).json({ success: false, error: 'Next Follow-up Date cannot be in the past.' });
    }

    const action = body.action || 'save';
    const nowIso = new Date().toISOString();

    if (action === 'won') {
      lead.status = 'Won';
      lead.currentStage = 'Won';
      lead.wonDate = nowIso;
      lead.updatedAt = nowIso;

      const act = {
        id: 'ACT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        leadId: lead.id,
        activityType: 'Lead Won',
        description: `Lead closed as Won / Converted client!`,
        notes: body.notes || '',
        user: body.user || lead.assigned || 'Smit Sir',
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: nowIso,
        createdAt: nowIso
      };
      crmDataCache.activityLog.unshift(act);

      await safeMongo(async (db) => {
        await db.collection('leads').updateOne({ id: lead.id }, { $set: stripMongoId(lead) });
        await db.collection('activity_log').insertOne(stripMongoId(act));
      });
      writeToGoogleSheet('LEADS', 'lead_id', mapLeadToSheet(lead)).catch(e => console.warn(e));

      return res.json({ success: true, lead, action: 'won' });
    }

    if (action === 'next_meeting') {
      lead.currentStage = 'Meeting';
      lead.status = 'Meeting';
      lead.updatedAt = nowIso;

      const act = {
        id: 'ACT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        leadId: lead.id,
        activityType: 'Meeting Requested',
        description: `Next meeting requested from follow-up`,
        notes: body.notes || '',
        user: body.user || lead.assigned || 'Smit Sir',
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: nowIso,
        createdAt: nowIso
      };
      crmDataCache.activityLog.unshift(act);

      await safeMongo(async (db) => {
        await db.collection('leads').updateOne({ id: lead.id }, { $set: stripMongoId(lead) });
        await db.collection('activity_log').insertOne(stripMongoId(act));
      });
      return res.json({ success: true, lead, action: 'next_meeting' });
    }

    if (action === 'cancel') {
      lead.currentStage = 'Dead';
      lead.updatedAt = nowIso;
      return res.json({ success: true, lead, action: 'cancel', nextStage: 'dead_lead' });
    }

    // Determine follow-up count
    const existingLeadFus = crmDataCache.followups.filter(f => f.leadId === leadId);
    let fuNumber = body.followupNumber ? Number(body.followupNumber) : (existingLeadFus.length + 1);

    const fuId = body.id || `FU-${leadId}-${fuNumber}-${Date.now()}`;
    const fu = {
      id: fuId,
      leadId,
      followupNumber: fuNumber,
      notes: body.notes || '',
      nextFollowUpDate: body.nextFollowUpDate || '',
      whatsappMessage: body.whatsappMessage || '',
      status: body.status || 'Active',
      createdBy: body.user || lead.assigned || 'Smit Sir',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    crmDataCache.followups.unshift(fu);

    if (body.nextFollowUpDate) {
      lead.nextFollowUpDate = body.nextFollowUpDate;
    }
    lead.updatedAt = nowIso;

    // Log Activity
    const act = {
      id: 'ACT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      leadId: lead.id,
      activityType: `Follow-up #${fuNumber} Created`,
      description: `Follow-up #${fuNumber} logged${body.nextFollowUpDate ? ' (Next: ' + body.nextFollowUpDate + ')' : ''}`,
      notes: fu.notes,
      user: fu.createdBy,
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: nowIso,
      createdAt: nowIso
    };
    crmDataCache.activityLog.unshift(act);

    await safeMongo(async (db) => {
      await db.collection('followups').updateOne({ id: fu.id }, { $set: stripMongoId(fu) }, { upsert: true });
      await db.collection('leads').updateOne({ id: lead.id }, { $set: stripMongoId(lead) });
      await db.collection('activity_log').insertOne(stripMongoId(act));
    });
    writeToGoogleSheet('FOLLOWUPS', 'followup_id', mapFollowupToSheet(fu)).catch(e => console.warn(e));

    res.json({ success: true, followup: fu, lead });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/followups/stage-note', async (req, res) => {
  try {
    const { leadId, stage, note, user } = req.body;
    if (!leadId || !stage) {
      return res.status(400).json({ success: false, error: 'leadId and stage are required.' });
    }
    const lead = crmDataCache.leads.find(l => l.id === leadId);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found.' });

    lead.stageNotes = lead.stageNotes || {};
    lead.stageNotes[stage] = {
      ...(lead.stageNotes[stage] || {}),
      note: note || '',
      updatedAt: new Date().toISOString(),
      updatedBy: user || 'Smit Sir'
    };
    lead.updatedAt = new Date().toISOString();

    const act = {
      id: 'ACT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      leadId,
      clientId: lead.clientId || leadId,
      activityType: 'Follow-up Note',
      stage: `Follow-up ${stage}`,
      description: `Client note saved for Follow-up ${stage}`,
      notes: note || '',
      user: user || 'Smit Sir',
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      status: lead.status || 'Active'
    };
    crmDataCache.activityLog.unshift(act);

    await safeMongo(async (db) => {
      await db.collection('leads').updateOne({ id: lead.id }, { $set: stripMongoId(lead) });
      await db.collection('activity_log').insertOne(stripMongoId(act));
    });

    res.json({ success: true, stage, note: lead.stageNotes[stage], lead });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Followups for a specific Lead
app.get('/api/followups/:leadId', (req, res) => {
  const leadId = req.params.leadId;
  const list = crmDataCache.followups.filter(f => f.leadId === leadId);
  res.json({ success: true, followups: list, count: list.length });
});

// ==============================================================
// 3.4 DASHBOARD SERVICE METRICS API (Requirement 10)
// ==============================================================
app.get('/api/dashboard/services', (req, res) => {
  const serviceCatalog = crmDataCache.services || DEFAULT_SERVICES;
  const leads = crmDataCache.leads || [];

  const metrics = serviceCatalog.map(srv => {
    const matchingLeads = leads.filter(l => {
      if (l.status === 'Dead') return false; // active pipeline only
      if (l.serviceId === srv.id) return true;
      if (l.currentService && l.currentService.toLowerCase().trim() === srv.name.toLowerCase().trim()) return true;
      if (srv.id === 'srv_custom' && (l.serviceId === 'srv_custom' || l.customServiceName)) return true;
      return false;
    });

    const leadCount = matchingLeads.length;
    const potentialValue = matchingLeads.reduce((sum, l) => {
      const price = Number(l.agreedPrice || l.defaultPrice || srv.defaultPrice || 0);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    return {
      serviceId: srv.id,
      name: srv.name,
      defaultPrice: srv.defaultPrice,
      leadCount,
      potentialValue,
      leads: matchingLeads.map(l => ({ id: l.id, company: l.company || l.name, agreedPrice: l.agreedPrice }))
    };
  });

  const grandTotalValue = metrics.reduce((sum, m) => sum + m.potentialValue, 0);
  const totalLeadsWithService = metrics.reduce((sum, m) => sum + m.leadCount, 0);

  res.json({
    success: true,
    services: metrics,
    grandTotalValue,
    totalLeadsWithService
  });
});

// Get Chronological History for a Lead
app.get('/api/leads/:id/history', (req, res) => {
  const leadId = req.params.id;
  const history = crmDataCache.activityLog
    .filter(a => a.leadId === leadId || a.clientId === leadId)
    .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  res.json({ success: true, history, count: history.length });
});
app.get('/api/followups/:id/history', (req, res) => {
  const leadId = req.params.id;
  const history = crmDataCache.activityLog
    .filter(a => a.leadId === leadId || a.clientId === leadId)
    .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  res.json({ success: true, history, count: history.length });
});

// (Client list route is handled above at lines 1475+ with strict Won filter)

app.get('/api/clients/:id', (req, res) => {
  const id = req.params.id;
  const lead = crmDataCache.leads.find(l => l.id === id || l.clientId === id);
  if (!lead) return res.status(404).json({ success: false, error: 'Client not found.' });

  const meetings = crmDataCache.meetings.filter(m => m.leadId === lead.id);
  const followups = crmDataCache.followups.filter(f => f.leadId === lead.id);
  const history = crmDataCache.activityLog.filter(a => a.leadId === lead.id || a.clientId === lead.id);

  res.json({
    success: true,
    client: {
      ...lead,
      meetings,
      followups,
      history
    }
  });
});

app.post('/api/clients/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body || {};
  const existingIdx = crmDataCache.leads.findIndex(l => l.id === id || l.clientId === id);
  if (existingIdx < 0) return res.status(404).json({ success: false, error: 'Client not found.' });

  crmDataCache.leads[existingIdx] = {
    ...crmDataCache.leads[existingIdx],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  const updatedLead = crmDataCache.leads[existingIdx];

  const act = {
    id: 'ACT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    leadId: updatedLead.id,
    clientId: updatedLead.clientId || updatedLead.id,
    activityType: 'Client Profile Updated',
    stage: updatedLead.status,
    description: `Client profile updated: ${updatedLead.company || updatedLead.name}`,
    notes: updates.notes || '',
    user: updates.user || 'Smit Sir',
    date: new Date().toLocaleDateString('en-GB'),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    timestamp: new Date().toISOString(),
    status: updatedLead.status
  };
  crmDataCache.activityLog.unshift(act);

  await safeMongo(async (db) => {
    await db.collection('leads').updateOne({ id: updatedLead.id }, { $set: stripMongoId(updatedLead) });
    await db.collection('activity_log').insertOne(stripMongoId(act));
  });
  writeToGoogleSheet('LEADS', 'lead_id', mapLeadToSheet(updatedLead)).catch(e => console.warn(e));

  res.json({ success: true, client: updatedLead });
});
app.put('/api/clients/:id', (req, res) => {
  req.method = 'POST';
  return app._router.handle(req, res);
});

// Log / Update Call
app.post('/api/calls', async (req, res) => {
  try {
    const body = req.body || {};
    const leadId = body.leadId;
    if (!leadId) {
      return res.status(400).json({ success: false, error: 'leadId is required.' });
    }

    const lead = crmDataCache.leads.find(l => l.id === leadId);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found.' });
    }

    const callStatus = body.callStatus || body.status || 'Received';
    if (!CALL_STATUSES.includes(callStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid callStatus. Must be one of: ${CALL_STATUSES.join(', ')}`
      });
    }

    if (body.nextCallDate && isPastDate(body.nextCallDate)) {
      return res.status(400).json({ success: false, error: 'Next Call Date cannot be in the past.' });
    }

    // Determine call number
    const existingLeadCalls = crmDataCache.calls.filter(c => c.leadId === leadId);
    let callNumber = body.callNumber ? Number(body.callNumber) : (existingLeadCalls.length + 1);
    if (isNaN(callNumber) || callNumber < 1) callNumber = 1;

    const nowIso = new Date().toISOString();
    const callId = body.id || `CALL-${leadId}-${callNumber}-${Date.now()}`;

    const existingCallIdx = crmDataCache.calls.findIndex(c => c.id === body.id || (c.leadId === leadId && c.callNumber === callNumber && c.callStatus === 'Pending'));

    const callDate = body.callDate || body.date || nowIso.split('T')[0];
    const callerName = body.caller || body.user || 'Siddharth Bhai';

    const call = {
      id: existingCallIdx >= 0 ? crmDataCache.calls[existingCallIdx].id : callId,
      leadId,
      callNumber,
      phoneNumber: body.phoneNumber || (lead.mobileNumbers && lead.mobileNumbers[0]) || lead.phone || '',
      conversationNotes: body.conversationNotes || body.notes || '',
      callStatus,
      nextCallDate: body.nextCallDate || '',
      whatsappMessage: body.whatsappMessage || '',
      createdBy: callerName,
      caller: callerName,
      date: callDate,
      callDate: callDate,
      createdAt: existingCallIdx >= 0 ? crmDataCache.calls[existingCallIdx].createdAt : (callDate ? new Date(callDate + 'T12:00:00+05:30').toISOString() : nowIso),
      updatedAt: nowIso
    };

    if (existingCallIdx >= 0) {
      crmDataCache.calls[existingCallIdx] = call;
    } else {
      crmDataCache.calls.unshift(call);
    }

    lead.callStatus = callStatus;
    lead.nextCallDate = call.nextCallDate;
    lead.lastCallAt = nowIso;
    lead.updatedAt = nowIso;

    if (callStatus === 'Meeting Scheduled') {
      lead.status = 'Meeting';
      lead.currentStage = 'Meeting';
    } else if (callStatus === 'Not Interested') {
      lead.currentStage = 'Call Center';
    }

    const act = {
      id: 'ACT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      leadId: lead.id,
      activityType: `Call #${callNumber} Updated`,
      description: `Call #${callNumber} (${callStatus}) logged with ${call.phoneNumber}`,
      notes: call.conversationNotes,
      user: call.createdBy,
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: nowIso,
      createdAt: nowIso
    };
    crmDataCache.activityLog.unshift(act);

    await safeMongo(async (db) => {
      await db.collection('calls').updateOne({ id: call.id }, { $set: stripMongoId(call) }, { upsert: true });
      await db.collection('leads').updateOne({ id: lead.id }, { $set: stripMongoId(lead) }, { upsert: true });
      await db.collection('activity_log').insertOne(stripMongoId(act));
    });
    writeToGoogleSheet('CALLS', 'call_id', mapCallToSheet(call)).catch(e => console.warn(e));

    res.json({ success: true, call, lead });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Schedule or Update Meeting
app.post('/api/meetings', async (req, res) => {
  try {
    const meeting = { ...(req.body || {}) };
    if (!meeting.leadId) {
      return res.status(400).json({ success: false, error: 'leadId is required.' });
    }
    const meetingDate = meeting.date || meeting.meetingDate;
    if (!meetingDate) {
      return res.status(400).json({ success: false, error: 'Meeting Date is required.' });
    }
    if (isPastDate(meetingDate)) {
      return res.status(400).json({ success: false, error: 'Meeting Date cannot be in the past. Only today and future dates allowed.' });
    }
    const timeSlot = meeting.time || meeting.timeSlot;
    if (!timeSlot) {
      return res.status(400).json({ success: false, error: 'Meeting Time Slot is required.' });
    }
    const assignedPerson = meeting.assigned || meeting.assignedPerson;
    if (!assignedPerson) {
      return res.status(400).json({ success: false, error: 'Assigned Person is required.' });
    }
    const meetingType = meeting.type || meeting.meetingType;
    if (!meetingType) {
      return res.status(400).json({ success: false, error: 'Meeting Type is required.' });
    }

    const lead = crmDataCache.leads.find(l => l.id === meeting.leadId);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found.' });

    const nowIso = new Date().toISOString();
    const isReschedule = meeting.isReschedule || meeting.status === 'Rescheduled';

    let meetingRecord;
    if (isReschedule) {
      if (meeting.previousMeetingId) {
        const prevM = crmDataCache.meetings.find(m => m.id === meeting.previousMeetingId);
        if (prevM) prevM.status = 'Rescheduled';
      }
      meetingRecord = {
        id: `MTG-${Date.now()}`,
        leadId: lead.id,
        meetingDate,
        date: meetingDate,
        timeSlot,
        time: timeSlot,
        customStartTime: meeting.customStartTime || '',
        customEndTime: meeting.customEndTime || '',
        duration: meeting.duration || '',
        isCustomTime: Boolean(meeting.isCustomTime),
        assignedPerson,
        assigned: assignedPerson,
        meetingType,
        type: meetingType,
        status: 'Scheduled',
        notes: meeting.notes || '',
        previousMeetingId: meeting.previousMeetingId || '',
        createdBy: meeting.user || assignedPerson || 'Smit Sir',
        createdAt: nowIso,
        updatedAt: nowIso
      };
      crmDataCache.meetings.unshift(meetingRecord);
    } else {
      const existingIdx = meeting.id ? crmDataCache.meetings.findIndex(m => m.id === meeting.id) : -1;
      meetingRecord = {
        id: meeting.id || `MTG-${Date.now()}`,
        leadId: lead.id,
        meetingDate,
        date: meetingDate,
        timeSlot,
        time: timeSlot,
        customStartTime: meeting.customStartTime || '',
        customEndTime: meeting.customEndTime || '',
        duration: meeting.duration || '',
        isCustomTime: Boolean(meeting.isCustomTime),
        assignedPerson,
        assigned: assignedPerson,
        meetingType,
        type: meetingType,
        status: meeting.status || 'Scheduled',
        notes: meeting.notes || '',
        createdBy: meeting.user || assignedPerson || 'Smit Sir',
        createdAt: existingIdx >= 0 ? crmDataCache.meetings[existingIdx].createdAt : nowIso,
        updatedAt: nowIso
      };
      if (existingIdx >= 0) {
        crmDataCache.meetings[existingIdx] = meetingRecord;
      } else {
        crmDataCache.meetings.unshift(meetingRecord);
      }
    }

    lead.meetingDate = meetingDate;
    lead.meetingTime = timeSlot;
    lead.meetingType = meetingType;
    lead.assigned = assignedPerson;
    lead.meetingStatus = meetingRecord.status;
    lead.status = 'Meeting';
    lead.currentStage = 'Meeting';
    lead.meetingDuration = meeting.duration || '';
    lead.meetingEndTime = meeting.customEndTime || '';
    lead.isCustomTime = Boolean(meeting.isCustomTime);
    lead.updatedAt = nowIso;

    const actType = isReschedule ? 'Meeting Rescheduled' : (meeting.status === 'Attend' ? 'Meeting Attended' : 'Meeting Scheduled');
    const act = {
      id: 'ACT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      leadId: lead.id,
      activityType: actType,
      description: `Meeting (${meetingType}) ${actType.toLowerCase()} on ${meetingDate} at ${timeSlot}${meeting.duration ? ' (' + meeting.duration + ')' : ''} with ${assignedPerson}`,
      notes: meetingRecord.notes,
      user: assignedPerson,
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: nowIso,
      createdAt: nowIso
    };
    crmDataCache.activityLog.unshift(act);

    await safeMongo(async (db) => {
      await db.collection('meetings').updateOne({ id: meetingRecord.id }, { $set: stripMongoId(meetingRecord) }, { upsert: true });
      await db.collection('leads').updateOne({ id: lead.id }, { $set: stripMongoId(lead) }, { upsert: true });
      await db.collection('activity_log').insertOne(stripMongoId(act));
    });
    writeToGoogleSheet('MEETINGS', 'meeting_id', mapMeetingToSheet(meetingRecord)).catch(e => console.warn(e));

    res.json({ success: true, meeting: meetingRecord, lead });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Meeting Status: Attend, Not Attend, Rescheduled, Cancel
const handleMeetingStatusUpdate = async (req, res) => {
  try {
    const meetingId = req.params.id;
    const { status, user, notes } = req.body;
    if (!MEETING_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${MEETING_STATUSES.join(', ')}` });
    }

    const meeting = crmDataCache.meetings.find(m => m.id === meetingId);
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found.' });

    const lead = crmDataCache.leads.find(l => l.id === meeting.leadId);
    const nowIso = new Date().toISOString();

    meeting.status = status;
    meeting.updatedAt = nowIso;
    if (status === 'Attend') {
      meeting.attendedAt = nowIso;
      meeting.attendedBy = user || 'Smit Sir';
      if (lead) {
        lead.currentStage = 'Proposal';
        lead.status = 'Proposal';
        lead.meetingStatus = 'Attend';
        lead.updatedAt = nowIso;
      }
    } else if (status === 'Not Attend') {
      meeting.notAttendedAt = nowIso;
      if (lead) {
        lead.currentStage = 'Not Attend';
        lead.meetingStatus = 'Not Attend';
        lead.updatedAt = nowIso;
      }
    } else if (status === 'Cancel') {
      meeting.cancelledAt = nowIso;
      if (lead) {
        lead.meetingStatus = 'Cancel';
        lead.updatedAt = nowIso;
      }
    }

    const actName = status === 'Attend' ? 'Meeting Attended' : (status === 'Not Attend' ? 'Meeting Not Attend' : `Meeting ${status}`);
    const act = {
      id: 'ACT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      leadId: meeting.leadId,
      activityType: actName,
      description: `Meeting on ${meeting.meetingDate || meeting.date} at ${meeting.timeSlot || meeting.time} marked as ${status}`,
      notes: notes || '',
      user: user || meeting.assignedPerson || 'Smit Sir',
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: nowIso,
      createdAt: nowIso
    };
    crmDataCache.activityLog.unshift(act);

    await safeMongo(async (db) => {
      await db.collection('meetings').updateOne({ id: meeting.id }, { $set: stripMongoId(meeting) });
      if (lead) await db.collection('leads').updateOne({ id: lead.id }, { $set: stripMongoId(lead) });
      await db.collection('activity_log').insertOne(stripMongoId(act));
    });
    writeToGoogleSheet('MEETINGS', 'meeting_id', mapMeetingToSheet(meeting)).catch(e => console.warn(e));

    res.json({ success: true, meeting, lead });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

app.patch('/api/meetings/:id/status', handleMeetingStatusUpdate);
app.post('/api/meetings/:id/status', handleMeetingStatusUpdate);

// Create / Update Proposal
app.post('/api/proposals', async (req, res) => {
  try {
    const body = req.body || {};
    const leadId = body.leadId;
    if (!leadId) {
      return res.status(400).json({ success: false, error: 'leadId is required.' });
    }
    const lead = crmDataCache.leads.find(l => l.id === leadId);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found.' });

    const packageName = body.packageName || body.package || body.type;
    if (!packageName) {
      return res.status(400).json({ success: false, error: 'Proposal Package is required.' });
    }

    const amount = Number(body.amount);
    if (isNaN(amount) || amount < 0) {
      return res.status(400).json({ success: false, error: 'Proposal Amount must be a valid non-negative number.' });
    }

    const followUpDate = body.followUpDate || body.followupDate;
    if (!followUpDate) {
      return res.status(400).json({ success: false, error: 'Follow-up Date is required.' });
    }
    if (isPastDate(followUpDate)) {
      return res.status(400).json({ success: false, error: 'Follow-up Date cannot be in the past. Only today and future dates allowed.' });
    }

    const nowIso = new Date().toISOString();
    const proposalId = body.id || `PROP-${leadId}-${Date.now()}`;

    const proposal = {
      id: proposalId,
      leadId,
      meetingId: body.meetingId || '',
      packageName,
      package: packageName,
      amount,
      customAmount: packageName === 'Custom' ? amount : (body.customAmount || 0),
      followUpDate,
      notes: body.notes || '',
      status: body.status || 'Active',
      client: lead.name || lead.businessName,
      company: lead.company || lead.businessName,
      date: nowIso.split('T')[0],
      createdBy: body.user || lead.assigned || 'Smit Sir',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const existingIdx = crmDataCache.proposals.findIndex(p => p.id === proposal.id);
    if (existingIdx >= 0) {
      crmDataCache.proposals[existingIdx] = proposal;
    } else {
      crmDataCache.proposals.unshift(proposal);
    }

    // Advance Lead to Follow-up stage
    lead.currentStage = 'Follow-up';
    lead.status = 'Follow-up';
    lead.selectedPackage = packageName;
    lead.proposalAmount = amount;
    lead.proposalDate = nowIso.split('T')[0];
    lead.nextFollowUpDate = followUpDate;
    lead.updatedAt = nowIso;

    // Automatically initialize first Follow-up record
    const fuId = `FU-${leadId}-1`;
    let fu = crmDataCache.followups.find(f => f.id === fuId || f.leadId === leadId);
    if (!fu) {
      fu = {
        id: fuId,
        leadId,
        followupNumber: 1,
        notes: body.notes || 'Proposal created; follow-up scheduled.',
        nextFollowUpDate: followUpDate,
        whatsappMessage: '',
        status: 'Pending',
        createdBy: proposal.createdBy,
        createdAt: nowIso,
        updatedAt: nowIso
      };
      crmDataCache.followups.unshift(fu);
      await safeMongo(async (db) => {
        await db.collection('followups').updateOne({ id: fu.id }, { $set: stripMongoId(fu) }, { upsert: true });
      });
    }

    // Log Activity
    const act = {
      id: 'ACT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      leadId: lead.id,
      activityType: 'Proposal Created',
      description: `Proposal saved: ${packageName} (₹${amount.toLocaleString('en-IN')}) with Follow-up on ${followUpDate}`,
      notes: proposal.notes,
      user: proposal.createdBy,
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: nowIso,
      createdAt: nowIso
    };
    crmDataCache.activityLog.unshift(act);

    await safeMongo(async (db) => {
      await db.collection('proposals').updateOne({ id: proposal.id }, { $set: stripMongoId(proposal) }, { upsert: true });
      await db.collection('leads').updateOne({ id: lead.id }, { $set: stripMongoId(lead) }, { upsert: true });
      await db.collection('activity_log').insertOne(stripMongoId(act));
    });
    writeToGoogleSheet('PROPOSALS', 'proposal_id', mapProposalToSheet(proposal)).catch(e => console.warn(e));

    res.json({ success: true, proposal, lead, followup: fu });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const payment = req.body;
    crmDataCache.payments.unshift(payment);
    await safeMongo(async (db) => {
      await db.collection('payments').insertOne(stripMongoId(payment));
    });

    // Two-Way Sync: Save directly into Google Sheet PAYMENTS tab
    writeToGoogleSheet('PAYMENTS', 'payment_id', mapPaymentToSheet(payment)).catch(e => console.warn(e));
    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add or Update Task
app.post('/api/tasks', async (req, res) => {
  try {
    const task = req.body;
    const existingIdx = crmDataCache.tasks.findIndex(t => t.id === task.id);
    if (existingIdx >= 0) {
      crmDataCache.tasks[existingIdx] = { ...crmDataCache.tasks[existingIdx], ...task };
    } else {
      crmDataCache.tasks.unshift(task);
    }
    await safeMongo(async (db) => {
      await db.collection('tasks').updateOne(
        { id: task.id },
        { $set: stripMongoId(task) },
        { upsert: true }
      );
    });

    // Two-Way Sync: Save directly into Google Sheet TASKS tab
    writeToGoogleSheet('TASKS', 'task_id', mapTaskToSheet(task)).catch(e => console.warn(e));
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Force Sync with Google Sheet (ALL tabs)
app.post('/api/sync-sheet', async (req, res) => {
  try {
    if (req.body.sheetId) {
      GOOGLE_SHEET_ID = req.body.sheetId;
    }
    await syncWithGoogleSheet();
    res.json({
      success: true,
      message: 'Full sync completed — ALL tabs synced from Google Sheet',
      ...lastSyncStatus,
      leadsCount: crmDataCache.leads.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Configuration (Sheet ID, Apps Script URL, or Mongo URI)
app.post('/api/config', async (req, res) => {
  try {
    const { sheetId, mongoUri, appsScriptUrl } = req.body;
    let mongoTested = false;

    if (sheetId) {
      GOOGLE_SHEET_ID = sheetId;
      await syncWithGoogleSheet();
    }

    if (appsScriptUrl !== undefined) {
      GOOGLE_APPS_SCRIPT_URL = appsScriptUrl;
    }

    if (mongoUri !== undefined) {
      MONGODB_URI = mongoUri;
      await initMongoDB();
      mongoTested = isMongoConnected;
    }

    // Persist to .env file
    const envContent = `# Bulletproof CRM Configuration\nPORT=${PORT}\nGOOGLE_SHEET_ID=${GOOGLE_SHEET_ID}\nGOOGLE_APPS_SCRIPT_URL=${GOOGLE_APPS_SCRIPT_URL}\nMONGODB_URI=${MONGODB_URI}\nMONGODB_DB_NAME=${MONGODB_DB_NAME}\n`;
    fs.writeFileSync(path.join(__dirname, '.env'), envContent, 'utf-8');

    res.json({
      success: true,
      googleSheetId: GOOGLE_SHEET_ID,
      appsScriptConfigured: Boolean(GOOGLE_APPS_SCRIPT_URL),
      mongoConnected: isMongoConnected,
      message: 'Configuration updated successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Purge All Dummy & Old Data from MongoDB Atlas and server cache
app.post('/api/clean-data', async (req, res) => {
  try {
    crmDataCache = {
      leads: [],
      calls: [],
      proposals: [],
      payments: [],
      tasks: [],
      followups: [],
      meetings: [],
      clients: [],
      deadLeads: [],
      activityLog: [],
      metaLeads: []
    };

    await safeMongo(async (db) => {
      const collections = [
        'leads', 'calls', 'proposals', 'payments', 'tasks',
        'meetings', 'followups', 'clients', 'dead_leads', 'activity_log', 'meta_leads'
      ];
      for (const colName of collections) {
        try {
          await db.collection(colName).deleteMany({});
        } catch (e) { }
      }
      console.log('🧹 Purged all MongoDB Atlas collections via /api/clean-data');
    });

    lastSyncStatus = {
      lastSyncAt: new Date().toISOString(),
      tabResults: {},
      totalLeads: 0,
      totalCalls: 0,
      totalProposals: 0,
      totalPayments: 0,
      totalTasks: 0,
      totalMeetings: 0,
      totalFollowups: 0
    };

    res.json({
      success: true,
      message: 'All dummy and old data successfully purged from MongoDB Atlas and cache.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a single lead across cache, MongoDB Atlas, and Google Sheets
app.delete('/api/leads/:id', async (req, res) => {
  try {
    const leadId = req.params.id;
    crmDataCache.leads = crmDataCache.leads.filter(l => l.id !== leadId);
    crmDataCache.calls = crmDataCache.calls.filter(c => c.leadId !== leadId);
    crmDataCache.meetings = crmDataCache.meetings.filter(m => m.leadId !== leadId);
    crmDataCache.followups = crmDataCache.followups.filter(f => f.leadId !== leadId);

    await safeMongo(async (db) => {
      await db.collection('leads').deleteOne({ id: leadId });
      await db.collection('calls').deleteMany({ leadId: leadId });
      await db.collection('meetings').deleteMany({ leadId: leadId });
      await db.collection('followups').deleteMany({ leadId: leadId });
    });

    if (GOOGLE_APPS_SCRIPT_URL) {
      try {
        await fetch(GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'deleteRecord',
            sheetName: CRM_CONFIG.SHEETS.LEADS,
            idField: 'lead_id',
            id: leadId
          })
        });
      } catch (sheetErr) {
        console.warn('Apps Script delete lead warning:', sheetErr.message);
      }
    }

    res.json({ success: true, message: `Lead ${leadId} deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a single call across cache and MongoDB Atlas
app.delete('/api/calls/:id', async (req, res) => {
  try {
    const callId = req.params.id;
    crmDataCache.calls = crmDataCache.calls.filter(c => c.id !== callId);

    await safeMongo(async (db) => {
      await db.collection('calls').deleteOne({ id: callId });
    });

    if (GOOGLE_APPS_SCRIPT_URL) {
      try {
        await fetch(GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'deleteRecord',
            sheetName: CRM_CONFIG.SHEETS.CALLS,
            idField: 'call_id',
            id: callId
          })
        });
      } catch (sheetErr) {
        console.warn('Apps Script delete call warning:', sheetErr.message);
      }
    }

    res.json({ success: true, message: `Call ${callId} deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SPA Fallback Route: Serve index.html if authenticated, else redirect to /login
app.get('*', (req, res) => {
  if (auth.checkIsAuthenticated(req)) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    res.redirect('/login');
  }
});

// ==============================================================
// 4. PORT CLEANUP & START SERVER (Resilient to node --watch reloads)
// ==============================================================
let currentServer = null;
let retryCount = 0;
const MAX_PORT_RETRIES = 5;
let syncInterval = null;

function killPortProcess(port) {
  if (process.platform !== 'win32') return;
  try {
    const { execSync } = require('child_process');
    const netstat = execSync('netstat -ano', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    const lines = netstat.split(/\r?\n/);
    const pidsToKill = new Set();
    for (const line of lines) {
      if (line.includes(`:${port}`) && line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && pid !== String(process.pid)) {
          pidsToKill.add(pid);
        }
      }
    }
    for (const pid of pidsToKill) {
      console.log(`🧹 Terminating orphaned process PID ${pid} holding port ${port}...`);
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
      } catch (_) {}
    }
  } catch (err) {
    // ignore
  }
}

function startServer() {
  const srv = app.listen(PORT, async () => {
    currentServer = srv;
    retryCount = 0;
    console.log(`\n======================================================`);
    console.log(`🚀 BULLETPROOF CRM SERVER RUNNING ON PORT ${PORT}`);
    console.log(`👉 Open in browser: http://localhost:${PORT}`);
    console.log(`📊 Google Sheet Connected: https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}`);
    console.log(`======================================================\n`);

    await syncWithGoogleSheet();
    await initMongoDB();
    await auth.ensureAuthUser(mongoDb);

    if (!syncInterval) {
      // Continuously sync with Google Sheet every 15 seconds for real-time live updates
      syncInterval = setInterval(async () => {
        try {
          await syncWithGoogleSheet();
        } catch (e) {
          console.warn('Background sync error:', e.message);
        }
      }, 15000);
    }
  });

  srv.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`\n⚠️  PORT CONFLICT: Port ${PORT} is occupied. Clearing conflicting process...`);
      killPortProcess(PORT);
      retryCount++;
      if (retryCount <= MAX_PORT_RETRIES) {
        console.log(`🔄 Automatically retrying to bind server (attempt ${retryCount}/${MAX_PORT_RETRIES}) in 1s...`);
        try { srv.close(); } catch (_) {}
        setTimeout(() => {
          startServer();
        }, 1000);
      } else {
        console.error(`❌ Could not bind to port ${PORT} after ${MAX_PORT_RETRIES} attempts. Please free port ${PORT} manually.\n`);
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
    }
  });

  return srv;
}

// Graceful release of port on process reload / termination
process.on('SIGTERM', () => {
  if (currentServer) {
    try { currentServer.close(); } catch (_) {}
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  if (currentServer) {
    try { currentServer.close(); } catch (_) {}
  }
  process.exit(0);
});

// Initial cleanup of any dangling process from previous session, then boot (skip if running under Vercel serverless)
if (!process.env.VERCEL) {
  killPortProcess(PORT);
  startServer();
}

// Protect process from transient SSL / Network errors during background sync
process.on('uncaughtException', (err) => {
  console.warn('⚠️  [Recovered] Uncaught Exception caught safely:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.warn('⚠️  [Recovered] Unhandled Rejection caught safely:', reason?.message || reason);
});

module.exports = app;


