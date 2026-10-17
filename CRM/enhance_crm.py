# enhance_crm.py
import re

with open("build_full_crm.py", "r", encoding="utf-8") as f:
    content = f.read()

# ==============================================================================
# 1. ENHANCE ROW 1 KPI CARDS WITH ONCLICK & HOVER HINTS
# ==============================================================================
old_kpi_section = """        <!-- ROW 1: 8 KPI CARDS -->
        <section class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div class="glass-card glass-card-hover p-3 flex flex-col justify-between">
            <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Leads</span>
            <div id="kpi-total-leads" class="text-xl sm:text-2xl font-bold font-brand text-white mt-0.5">428</div>
            <span class="text-[10px] text-emerald-400 font-medium">↑ +14% vs LW</span>
          </div>

          <div class="glass-card glass-card-hover p-3 flex flex-col justify-between">
            <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">New Leads</span>
            <div id="kpi-new-leads" class="text-xl sm:text-2xl font-bold font-brand text-white mt-0.5">18</div>
            <span class="text-[10px] text-brandgold font-medium">● 4 Unassigned</span>
          </div>

          <div class="glass-card glass-card-hover p-3 flex flex-col justify-between">
            <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Calls Made</span>
            <div id="kpi-calls-made" class="text-xl sm:text-2xl font-bold font-brand text-white mt-0.5">72</div>
            <span class="text-[10px] text-sky-400 font-medium">66.7% Connected</span>
          </div>

          <div class="glass-card glass-card-hover p-3 flex flex-col justify-between">
            <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Meetings</span>
            <div id="kpi-meetings" class="text-xl sm:text-2xl font-bold font-brand text-white mt-0.5">24</div>
            <span class="text-[10px] text-blue-400 font-medium">3 Today</span>
          </div>

          <div class="glass-card glass-card-hover p-3 flex flex-col justify-between">
            <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Proposals</span>
            <div id="kpi-proposals" class="text-xl sm:text-2xl font-bold font-brand text-white mt-0.5">17</div>
            <span class="text-[10px] text-amber-400 font-medium">₹14.8L Value</span>
          </div>

          <div class="glass-card glass-card-hover p-3 flex flex-col justify-between">
            <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Won Deals</span>
            <div id="kpi-won" class="text-xl sm:text-2xl font-bold font-brand text-emerald-400 mt-0.5">8</div>
            <span class="text-[10px] text-emerald-400 font-medium">47% Win Rate</span>
          </div>

          <div class="glass-card glass-card-hover p-3 flex flex-col justify-between">
            <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Revenue</span>
            <div id="kpi-revenue" class="text-xl sm:text-2xl font-bold font-brand text-white mt-0.5">₹4.82 L</div>
            <span class="text-[10px] text-emerald-400 font-medium">↑ +28% MoM</span>
          </div>

          <div class="glass-card glass-card-hover p-3 flex flex-col justify-between border-brandgold/30 bg-brandgold/5">
            <span class="text-[11px] font-medium text-brandgold uppercase tracking-wider flex items-center justify-between">
              <span>Time</span>
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-gold"></span>
            </span>
            <div id="live-clock-card" class="text-lg sm:text-xl font-bold font-brand text-brandgold mt-0.5">4:00 PM</div>
            <span class="text-[10px] text-slate-400">Surat, Gujarat</span>
          </div>
        </section>"""

new_kpi_section = """        <!-- ROW 1: 8 INTERACTIVE KPI CARDS (Click any box to inspect pending workflow & missing details) -->
        <section class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div onclick="openKpiDrilldown('total')" class="glass-card glass-card-hover p-3 flex flex-col justify-between cursor-pointer border border-brandborder hover:border-brandgold/70 transition-all group relative" title="Click to view all 428 leads and remaining details breakdown">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider group-hover:text-brandgold transition-colors">Total Leads</span>
              <span class="text-[9px] text-slate-500 group-hover:text-brandgold font-mono">Inspect ↗</span>
            </div>
            <div id="kpi-total-leads" class="text-xl sm:text-2xl font-bold font-brand text-white mt-0.5">428</div>
            <span class="text-[10px] text-emerald-400 font-medium">↑ +14% vs LW</span>
          </div>

          <div onclick="openKpiDrilldown('new')" class="glass-card glass-card-hover p-3 flex flex-col justify-between cursor-pointer border border-brandborder hover:border-brandgold/70 transition-all group relative" title="Click to view new leads needing initial calls & assignment">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider group-hover:text-brandgold transition-colors">New Leads</span>
              <span class="text-[9px] text-slate-500 group-hover:text-brandgold font-mono">Inspect ↗</span>
            </div>
            <div id="kpi-new-leads" class="text-xl sm:text-2xl font-bold font-brand text-white mt-0.5">18</div>
            <span class="text-[10px] text-brandgold font-medium">● 4 Unassigned</span>
          </div>

          <div onclick="openKpiDrilldown('calls')" class="glass-card glass-card-hover p-3 flex flex-col justify-between cursor-pointer border border-brandborder hover:border-sky-500/70 transition-all group relative" title="Click to view call pipeline and pending calls queue">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider group-hover:text-sky-400 transition-colors">Calls Made</span>
              <span class="text-[9px] text-slate-500 group-hover:text-sky-400 font-mono">Inspect ↗</span>
            </div>
            <div id="kpi-calls-made" class="text-xl sm:text-2xl font-bold font-brand text-white mt-0.5">72</div>
            <span class="text-[10px] text-sky-400 font-medium">66.7% Connected</span>
          </div>

          <div onclick="openKpiDrilldown('meetings')" class="glass-card glass-card-hover p-3 flex flex-col justify-between cursor-pointer border border-brandborder hover:border-blue-500/70 transition-all group relative" title="Click to view today's meetings and pending consultations">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider group-hover:text-blue-400 transition-colors">Meetings</span>
              <span class="text-[9px] text-slate-500 group-hover:text-blue-400 font-mono">Inspect ↗</span>
            </div>
            <div id="kpi-meetings" class="text-xl sm:text-2xl font-bold font-brand text-white mt-0.5">24</div>
            <span class="text-[10px] text-blue-400 font-medium">3 Today</span>
          </div>

          <div onclick="openKpiDrilldown('proposals')" class="glass-card glass-card-hover p-3 flex flex-col justify-between cursor-pointer border border-brandborder hover:border-amber-500/70 transition-all group relative" title="Click to view proposals and quotes pending delivery">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider group-hover:text-amber-400 transition-colors">Proposals</span>
              <span class="text-[9px] text-slate-500 group-hover:text-amber-400 font-mono">Inspect ↗</span>
            </div>
            <div id="kpi-proposals" class="text-xl sm:text-2xl font-bold font-brand text-white mt-0.5">17</div>
            <span class="text-[10px] text-amber-400 font-medium">₹14.8L Value</span>
          </div>

          <div onclick="openKpiDrilldown('won')" class="glass-card glass-card-hover p-3 flex flex-col justify-between cursor-pointer border border-brandborder hover:border-emerald-500/70 transition-all group relative" title="Click to view won deals and pending onboarding milestones">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider group-hover:text-emerald-400 transition-colors">Won Deals</span>
              <span class="text-[9px] text-slate-500 group-hover:text-emerald-400 font-mono">Inspect ↗</span>
            </div>
            <div id="kpi-won" class="text-xl sm:text-2xl font-bold font-brand text-emerald-400 mt-0.5">8</div>
            <span class="text-[10px] text-emerald-400 font-medium">47% Win Rate</span>
          </div>

          <div onclick="openKpiDrilldown('revenue')" class="glass-card glass-card-hover p-3 flex flex-col justify-between cursor-pointer border border-brandborder hover:border-emerald-500/70 transition-all group relative" title="Click to view collected payments vs pending balances">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider group-hover:text-emerald-400 transition-colors">Revenue</span>
              <span class="text-[9px] text-slate-500 group-hover:text-emerald-400 font-mono">Inspect ↗</span>
            </div>
            <div id="kpi-revenue" class="text-xl sm:text-2xl font-bold font-brand text-white mt-0.5">₹4.82 L</div>
            <span class="text-[10px] text-emerald-400 font-medium">↑ +28% MoM</span>
          </div>

          <div class="glass-card glass-card-hover p-3 flex flex-col justify-between border-brandgold/30 bg-brandgold/5">
            <span class="text-[11px] font-medium text-brandgold uppercase tracking-wider flex items-center justify-between">
              <span>Time</span>
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-gold"></span>
            </span>
            <div id="live-clock-card" class="text-lg sm:text-xl font-bold font-brand text-brandgold mt-0.5">4:00 PM</div>
            <span class="text-[10px] text-slate-400">Surat, Gujarat</span>
          </div>
        </section>"""

assert old_kpi_section in content, "old_kpi_section not found"
content = content.replace(old_kpi_section, new_kpi_section)
print("1. Replaced Row 1 KPI cards with interactive drilldowns")

# ==============================================================================
# 2. ENHANCE PIPELINE FUNNEL CHEVRONS TO OPEN DRILLDOWNS
# ==============================================================================
pipeline_replacements = [
    ('onclick="filterPipelineStage(\'new\')"', 'onclick="openKpiDrilldown(\'stage_new\')"'),
    ('onclick="filterPipelineStage(\'contacted\')"', 'onclick="openKpiDrilldown(\'stage_contacted\')"'),
    ('onclick="filterPipelineStage(\'qualified\')"', 'onclick="openKpiDrilldown(\'stage_qualified\')"'),
    ('onclick="filterPipelineStage(\'meeting\')"', 'onclick="openKpiDrilldown(\'stage_meeting\')"'),
    ('onclick="filterPipelineStage(\'proposal\')"', 'onclick="openKpiDrilldown(\'stage_proposal\')"'),
    ('onclick="filterPipelineStage(\'negotiation\')"', 'onclick="openKpiDrilldown(\'stage_negotiation\')"'),
    ('onclick="filterPipelineStage(\'won\')"', 'onclick="openKpiDrilldown(\'stage_won\')"'),
]

for old_p, new_p in pipeline_replacements:
    content = content.replace(old_p, new_p)
print("2. Enhanced Pipeline Funnel steps with drilldown triggers")

# ==============================================================================
# 3. ENHANCE ROW 3 WIDGETS WITH "VIEW ALL" & DRILLDOWNS
# ==============================================================================
# 3.1 Need Your Attention Header
old_attention_header = """            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full bg-rose-500 pulse-gold"></span>
                <h3 class="font-brand font-bold text-sm text-white">Need Your Attention</h3>
              </div>
              <span class="text-[10px] px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-400 font-bold">5 ALERTS</span>
            </div>"""

new_attention_header = """            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full bg-rose-500 pulse-gold"></span>
                <h3 class="font-brand font-bold text-sm text-white">Need Your Attention</h3>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-[10px] px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-400 font-bold">5 ALERTS</span>
                <button onclick="openKpiDrilldown('attention_all')" class="text-[11px] text-rose-400 hover:text-white font-semibold transition-colors flex items-center space-x-0.5" title="View all attention alerts">
                  <span>View All</span><span class="text-[10px]">↗</span>
                </button>
              </div>
            </div>"""

assert old_attention_header in content, "old_attention_header not found"
content = content.replace(old_attention_header, new_attention_header)

# 3.2 Need Your Attention Cards onclicks
attention_replacements = [
    ('onclick="filterByAttention(\'overdue_fu\')"', 'onclick="openKpiDrilldown(\'overdue_fu\')"'),
    ('onclick="filterByAttention(\'meetings_today\')"', 'onclick="openKpiDrilldown(\'meetings_today\')"'),
    ('onclick="filterPipelineStage(\'proposal\')"', 'onclick="openKpiDrilldown(\'high_value\')"'),
    ('onclick="filterPipelineStage(\'new\')"', 'onclick="openKpiDrilldown(\'unassigned\')"'),
    ('onclick="filterByAttention(\'no_call\')"', 'onclick="openKpiDrilldown(\'no_call\')"'),
]
for old_a, new_a in attention_replacements:
    content = content.replace(old_a, new_a)

# 3.3 Today's Meetings Header (add View All button)
old_meetings_header = """            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span class="text-brandgold text-base">🗓</span>
                <h3 class="font-brand font-bold text-sm text-white">Today's Meetings</h3>
              </div>
              <span class="text-[10px] px-2 py-0.5 rounded bg-brandgold/20 text-brandgold font-bold">3 TODAY</span>
            </div>"""

new_meetings_header = """            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span class="text-brandgold text-base">🗓</span>
                <h3 class="font-brand font-bold text-sm text-white">Today's Meetings</h3>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-[10px] px-2 py-0.5 rounded bg-brandgold/20 text-brandgold font-bold">3 TODAY</span>
                <button onclick="switchNav('meetings')" class="text-[11px] text-brandgold hover:text-white font-semibold transition-colors flex items-center space-x-0.5" title="View all meetings">
                  <span>View All</span><span class="text-[10px]">↗</span>
                </button>
              </div>
            </div>"""

assert old_meetings_header in content, "old_meetings_header not found"
content = content.replace(old_meetings_header, new_meetings_header)

# 3.4 My Tasks Header (add View All button)
old_tasks_header = """            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span class="text-sky-400 text-base">☑</span>
                <h3 class="font-brand font-bold text-sm text-white">My Tasks (Smit Sir)</h3>
              </div>
              <span class="text-[10px] text-slate-400 font-mono">Today's Focus</span>
            </div>"""

new_tasks_header = """            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span class="text-sky-400 text-base">☑</span>
                <h3 class="font-brand font-bold text-sm text-white">My Tasks (Smit Sir)</h3>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-[10px] text-slate-400 font-mono">Today's Focus</span>
                <button onclick="openTasksModal()" class="text-[11px] text-sky-400 hover:text-white font-semibold transition-colors flex items-center space-x-0.5" title="View all tasks">
                  <span>View All</span><span class="text-[10px]">↗</span>
                </button>
              </div>
            </div>"""

assert old_tasks_header in content, "old_tasks_header not found"
content = content.replace(old_tasks_header, new_tasks_header)
print("3. Replaced Row 3 Headers with working 'View All' links")

# ==============================================================================
# 4. ENHANCE ROW 4 RECENT LEADS TABLE (View All Leads & Remaining Details Col)
# ==============================================================================
old_recent_leads_header = """          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-brandborder gap-2">
            <div>
              <h3 class="font-brand font-bold text-sm text-white">Recent Pipeline Leads</h3>
              <p class="text-[11px] text-slate-400">Click any row to open the complete lead inspector</p>
            </div>"""

new_recent_leads_header = """          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-brandborder gap-2">
            <div class="flex items-center space-x-3">
              <div>
                <h3 class="font-brand font-bold text-sm text-white">Recent Pipeline Leads</h3>
                <p class="text-[11px] text-slate-400">Click any row to open the complete lead inspector</p>
              </div>
              <button onclick="switchNav('leads')" class="text-xs text-brandgold hover:text-white font-semibold transition-colors flex items-center space-x-1 px-2.5 py-1 rounded bg-brandcard border border-brandborder hover:border-brandgold/40" title="View all leads">
                <span>View All Leads</span><span>↗</span>
              </button>
            </div>"""

assert old_recent_leads_header in content, "old_recent_leads_header not found"
content = content.replace(old_recent_leads_header, new_recent_leads_header)

# Table headers: replace Next Action with Workflow & Remaining Details
old_th_nextaction = """                  <th class="p-2.5">Status</th>
                  <th class="p-2.5">Next Action</th>
                  <th class="p-2.5">Score</th>"""

new_th_nextaction = """                  <th class="p-2.5">Status</th>
                  <th class="p-2.5">Workflow & Remaining Details</th>
                  <th class="p-2.5">Score</th>"""

assert old_th_nextaction in content, "old_th_nextaction not found"
content = content.replace(old_th_nextaction, new_th_nextaction)
print("4. Updated Recent Leads table header with 'View All Leads' and 'Workflow & Remaining Details'")

# ==============================================================================
# 5. ENHANCE ROW 5 QUICK WHATSAPP TEMPLATES (Add View All)
# ==============================================================================
old_wa_header = """            <div class="flex items-center justify-between mb-3">
              <h3 class="font-brand font-bold text-sm text-white">Quick WhatsApp Templates</h3>
              <span class="text-[10px] text-emerald-400 font-mono">1-Click Dispatch</span>
            </div>"""

new_wa_header = """            <div class="flex items-center justify-between mb-3">
              <h3 class="font-brand font-bold text-sm text-white">Quick WhatsApp Templates</h3>
              <div class="flex items-center space-x-2">
                <span class="text-[10px] text-emerald-400 font-mono">1-Click Dispatch</span>
                <button onclick="switchNav('whatsapp')" class="text-[11px] text-brandgold hover:text-white font-semibold transition-colors flex items-center space-x-0.5" title="View all WhatsApp templates">
                  <span>View All</span><span class="text-[10px]">↗</span>
                </button>
              </div>
            </div>"""

assert old_wa_header in content, "old_wa_header not found"
content = content.replace(old_wa_header, new_wa_header)
print("5. Added 'View All' to Quick WhatsApp Templates")

# ==============================================================================
# 6. ENHANCE VIEW 11: META ADS VIEW WITH LIVE STREAM & REMAINING DETAILS TABLE
# ==============================================================================
old_meta_end = """        <div class="glass-card p-4">
          <h3 class="font-bold text-sm text-white mb-3">Active Campaigns Performance</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-brandborder text-slate-400 text-[10px] uppercase font-semibold">
                  <th class="p-2.5">Campaign Name</th>
                  <th class="p-2.5">Ad Set</th>
                  <th class="p-2.5">Spend</th>
                  <th class="p-2.5">Leads</th>
                  <th class="p-2.5">CPL</th>
                  <th class="p-2.5">Quality Score</th>
                  <th class="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-brandborder/50">
                <tr>
                  <td class="p-2.5 font-bold text-white">Surat Business Owners - Video 04</td>
                  <td class="p-2.5 text-slate-300">Surat Founders AdSet</td>
                  <td class="p-2.5 font-mono text-slate-300">₹34,500</td>
                  <td class="p-2.5 font-mono font-bold text-white">268</td>
                  <td class="p-2.5 font-mono text-brandgold">₹128.73</td>
                  <td class="p-2.5 font-bold text-emerald-400">88% Hot</td>
                  <td class="p-2.5"><span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">Active</span></td>
                </tr>
                <tr>
                  <td class="p-2.5 font-bold text-white">Gujarat Founders Scale Up - Carousel</td>
                  <td class="p-2.5 text-slate-300">Ahmedabad & Surat SMBs</td>
                  <td class="p-2.5 font-mono text-slate-300">₹21,200</td>
                  <td class="p-2.5 font-mono font-bold text-white">114</td>
                  <td class="p-2.5 font-mono text-brandgold">₹185.96</td>
                  <td class="p-2.5 font-bold text-amber-400">76% Hot</td>
                  <td class="p-2.5"><span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">Active</span></td>
                </tr>
                <tr>
                  <td class="p-2.5 font-bold text-white">E-Commerce Retargeting Q3</td>
                  <td class="p-2.5 text-slate-300">Website Visitors 30d</td>
                  <td class="p-2.5 font-mono text-slate-300">₹12,800</td>
                  <td class="p-2.5 font-mono font-bold text-white">46</td>
                  <td class="p-2.5 font-mono text-brandgold">₹278.26</td>
                  <td class="p-2.5 font-bold text-sky-400">82% Hot</td>
                  <td class="p-2.5"><span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>"""

new_meta_end = """        <div class="glass-card p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-sm text-white">Active Campaigns Performance</h3>
            <span class="text-[10px] text-brandgold font-mono">Meta Graph API v19.0 Sync</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-brandborder text-slate-400 text-[10px] uppercase font-semibold">
                  <th class="p-2.5">Campaign Name</th>
                  <th class="p-2.5">Ad Set</th>
                  <th class="p-2.5">Spend</th>
                  <th class="p-2.5">Leads</th>
                  <th class="p-2.5">CPL</th>
                  <th class="p-2.5">Quality Score</th>
                  <th class="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-brandborder/50">
                <tr>
                  <td class="p-2.5 font-bold text-white">Surat Business Owners - Video 04</td>
                  <td class="p-2.5 text-slate-300">Surat Founders AdSet</td>
                  <td class="p-2.5 font-mono text-slate-300">₹34,500</td>
                  <td class="p-2.5 font-mono font-bold text-white">268</td>
                  <td class="p-2.5 font-mono text-brandgold">₹128.73</td>
                  <td class="p-2.5 font-bold text-emerald-400">88% Hot</td>
                  <td class="p-2.5"><span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">Active</span></td>
                </tr>
                <tr>
                  <td class="p-2.5 font-bold text-white">Gujarat Founders Scale Up - Carousel</td>
                  <td class="p-2.5 text-slate-300">Ahmedabad & Surat SMBs</td>
                  <td class="p-2.5 font-mono text-slate-300">₹21,200</td>
                  <td class="p-2.5 font-mono font-bold text-white">114</td>
                  <td class="p-2.5 font-mono text-brandgold">₹185.96</td>
                  <td class="p-2.5 font-bold text-amber-400">76% Hot</td>
                  <td class="p-2.5"><span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">Active</span></td>
                </tr>
                <tr>
                  <td class="p-2.5 font-bold text-white">E-Commerce Retargeting Q3</td>
                  <td class="p-2.5 text-slate-300">Website Visitors 30d</td>
                  <td class="p-2.5 font-mono text-slate-300">₹12,800</td>
                  <td class="p-2.5 font-mono font-bold text-white">46</td>
                  <td class="p-2.5 font-mono text-brandgold">₹278.26</td>
                  <td class="p-2.5 font-bold text-sky-400">82% Hot</td>
                  <td class="p-2.5"><span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- META ADS LEADS STREAM WITH REMAINING DETAILS & WORKFLOW CHECKLIST -->
        <div class="glass-card p-4 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-brandborder gap-2">
            <div>
              <h3 class="font-brand font-bold text-sm text-white flex items-center space-x-2">
                <span>⚡</span>
                <span>Meta Ad Leads Ingest Stream & Pending Workflow Checklist</span>
              </h3>
              <p class="text-[11px] text-slate-400">Real-time status of captured Facebook/Instagram leads, call status, meeting bookings, and remaining profile details</p>
            </div>
            <div class="flex items-center space-x-2">
              <span id="meta-pending-calls-count" class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                14 Calls Pending (&lt;15m SLA)
              </span>
              <button onclick="simulateIncomingMetaLead()" class="gold-gradient-btn px-3 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-amber-500/10 flex items-center space-x-1">
                <span>+ Ingest Test Lead</span>
              </button>
            </div>
          </div>

          <!-- Meta Leads Subfilters -->
          <div class="flex items-center space-x-2 text-xs overflow-x-auto pb-1" id="meta-stream-filters">
            <button onclick="filterMetaStream('all')" id="meta-flt-all" class="px-2.5 py-1 rounded font-bold bg-brandgold text-black">All Meta Leads</button>
            <button onclick="filterMetaStream('pending_call')" id="meta-flt-pending_call" class="px-2.5 py-1 rounded font-medium text-slate-400 hover:text-white bg-brandcard">📞 Call Pending</button>
            <button onclick="filterMetaStream('missing_details')" id="meta-flt-missing_details" class="px-2.5 py-1 rounded font-medium text-slate-400 hover:text-white bg-brandcard">⚠️ Missing Details</button>
            <button onclick="filterMetaStream('unassigned')" id="meta-flt-unassigned" class="px-2.5 py-1 rounded font-medium text-slate-400 hover:text-white bg-brandcard">👤 Unassigned</button>
          </div>

          <!-- Table Container -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-brandborder text-slate-400 text-[10px] uppercase font-semibold">
                  <th class="p-2.5">Lead & Contact</th>
                  <th class="p-2.5">Company / Business</th>
                  <th class="p-2.5">Initial Call (15m SLA)</th>
                  <th class="p-2.5">Consultation Meeting</th>
                  <th class="p-2.5">Custom Proposal</th>
                  <th class="p-2.5">Remaining Personal Details</th>
                  <th class="p-2.5">Assigned Closer</th>
                  <th class="p-2.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody id="meta-leads-stream-body" class="divide-y divide-brandborder/50">
                <!-- Dynamically Populated by renderMetaAdsTable() -->
              </tbody>
            </table>
          </div>
        </div>
      </div>"""

assert old_meta_end in content, "old_meta_end not found"
content = content.replace(old_meta_end, new_meta_end)
print("6. Added Meta Ads Ingest Stream & Remaining Workflow Tracker")

# ==============================================================================
# 7. ENHANCE LEAD DRAWER (Workflow Progress & Remaining Details Checklist Card)
# ==============================================================================
old_drawer_details_start = """      <!-- DETAILS TAB -->
      <div id="drawer-tab-details" class="space-y-4">
        <!-- Lead Score Gauge -->
        <div class="p-4 rounded-xl bg-brandcard/70 border border-brandborder flex items-center justify-between">"""

new_drawer_details_start = """      <!-- DETAILS TAB -->
      <div id="drawer-tab-details" class="space-y-4">
        
        <!-- WORKFLOW PROGRESS & REMAINING DETAILS CHECKLIST CARD -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-brandcard to-slate-900 border border-brandgold/40 shadow-xl space-y-3 text-xs">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="text-brandgold text-base">⚡</span>
              <h3 class="font-brand font-bold text-white text-xs uppercase tracking-wider">Workflow Progress & Remaining Details</h3>
            </div>
            <span id="drawer-workflow-completion-badge" class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Calculating...
            </span>
          </div>

          <!-- Dynamic Remaining Checklist Items -->
          <div class="space-y-2 pt-1" id="drawer-workflow-items-list">
            <!-- Rendered dynamically -->
          </div>

          <!-- Missing Personal Details Warning & Action -->
          <div id="drawer-missing-details-alert" class="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/60 hidden">
            <div class="flex items-start justify-between">
              <div>
                <span class="text-[10px] uppercase font-bold text-rose-400 block">⚠️ Missing Profile / Personal Details:</span>
                <p id="drawer-missing-details-text" class="text-xs text-rose-200 mt-0.5">Website, Email, Budget</p>
              </div>
              <button onclick="openEditDetailsModal(activeLeadId)" class="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] shrink-0">
                ✏️ Fill Details
              </button>
            </div>
          </div>
        </div>

        <!-- Lead Score Gauge -->
        <div class="p-4 rounded-xl bg-brandcard/70 border border-brandborder flex items-center justify-between">"""

assert old_drawer_details_start in content, "old_drawer_details_start not found"
content = content.replace(old_drawer_details_start, new_drawer_details_start)
print("7. Added Workflow Progress & Remaining Details checklist card to Lead Drawer")

# ==============================================================================
# 8. INSERT 3 NEW MODALS (KPI Drilldown Modal, Tasks Modal, Edit Details Modal)
# ==============================================================================
old_payment_modal_end = """        <div class="pt-2 flex justify-end space-x-2">
          <button type="button" onclick="closePaymentModal()" class="px-4 py-2 bg-brandcard text-slate-300 rounded-lg">Cancel</button>
          <button type="submit" class="gold-gradient-btn px-5 py-2 rounded-lg font-bold">Record Payment</button>
        </div>
      </form>
    </div>
  </div>"""

new_modals_code = """        <div class="pt-2 flex justify-end space-x-2">
          <button type="button" onclick="closePaymentModal()" class="px-4 py-2 bg-brandcard text-slate-300 rounded-lg">Cancel</button>
          <button type="submit" class="gold-gradient-btn px-5 py-2 rounded-lg font-bold">Record Payment</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ============================================================== -->
  <!-- MODAL: KPI DRILLDOWN & REMAINING DETAILS BREAKDOWN MODAL -->
  <!-- ============================================================== -->
  <div id="kpi-drilldown-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 hidden">
    <div class="bg-brandnav border border-brandborder rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
      <!-- Modal Header -->
      <div class="p-4 sm:p-5 border-b border-brandborder bg-brandcard/50 flex items-start justify-between">
        <div class="flex items-center space-x-3">
          <div id="kpi-modal-icon-container" class="w-10 h-10 rounded-xl bg-brandgold/20 border border-brandgold/40 text-brandgold flex items-center justify-center text-xl shrink-0 font-bold">
            📊
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h2 id="kpi-modal-title" class="font-brand font-bold text-base sm:text-lg text-white">Total Leads Audit</h2>
              <span id="kpi-modal-count-badge" class="px-2 py-0.5 rounded-full text-xs font-bold bg-brandgold text-black">428 Leads</span>
            </div>
            <p id="kpi-modal-subtitle" class="text-xs text-slate-400 mt-0.5">Categorized breakdown of leads and all remaining personal & workflow details</p>
          </div>
        </div>
        <button onclick="closeKpiDrilldown()" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-brandcard text-lg">✕</button>
      </div>

      <!-- Live Category Counters / Summary Bar -->
      <div class="p-3 bg-brandbg border-b border-brandborder grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        <div class="p-2 rounded-lg bg-brandcard/60 border border-brandborder flex items-center justify-between">
          <span class="text-slate-400">Total in Category</span>
          <span id="kpi-sum-total" class="font-bold text-white font-mono">18</span>
        </div>
        <div class="p-2 rounded-lg bg-rose-950/30 border border-rose-900/40 flex items-center justify-between">
          <span class="text-rose-300">📞 Call Pending</span>
          <span id="kpi-sum-calls" class="font-bold text-rose-400 font-mono">14</span>
        </div>
        <div class="p-2 rounded-lg bg-blue-950/30 border border-blue-900/40 flex items-center justify-between">
          <span class="text-blue-300">📅 Meeting Needed</span>
          <span id="kpi-sum-meetings" class="font-bold text-blue-400 font-mono">8</span>
        </div>
        <div class="p-2 rounded-lg bg-amber-950/30 border border-amber-900/40 flex items-center justify-between">
          <span class="text-amber-300">📄 Proposal Needed</span>
          <span id="kpi-sum-proposals" class="font-bold text-amber-400 font-mono">6</span>
        </div>
        <div class="p-2 rounded-lg bg-purple-950/30 border border-purple-900/40 flex items-center justify-between col-span-2 sm:col-span-1">
          <span class="text-purple-300">⚠️ Missing Info</span>
          <span id="kpi-sum-missing" class="font-bold text-purple-400 font-mono">9</span>
        </div>
      </div>

      <!-- Filter Tabs inside Modal -->
      <div class="px-4 py-2 bg-brandcard/30 border-b border-brandborder flex items-center space-x-1.5 overflow-x-auto text-xs" id="kpi-modal-filter-tabs">
        <!-- Rendered dynamically -->
      </div>

      <!-- Leads List / Table -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3" id="kpi-modal-leads-container">
        <!-- Rendered dynamically -->
      </div>

      <!-- Modal Footer -->
      <div class="p-3 border-t border-brandborder bg-brandcard/40 flex items-center justify-between text-xs">
        <span class="text-slate-400" id="kpi-modal-footer-info">Showing actionable workflow checklist for all matching leads</span>
        <button onclick="closeKpiDrilldown()" class="px-4 py-1.5 rounded-lg bg-brandcard hover:bg-slate-700 text-slate-300 font-medium">Close</button>
      </div>
    </div>
  </div>

  <!-- ============================================================== -->
  <!-- MODAL: ALL TASKS MANAGER MODAL -->
  <!-- ============================================================== -->
  <div id="tasks-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 hidden">
    <div class="bg-brandnav border border-brandborder rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
      <div class="p-4 border-b border-brandborder bg-brandcard/50 flex items-center justify-between">
        <div class="flex items-center space-x-2.5">
          <span class="text-sky-400 text-xl font-bold">☑</span>
          <div>
            <h2 class="font-brand font-bold text-base text-white">Daily Tasks & Action Items</h2>
            <p class="text-xs text-slate-400">Complete task manager for Smit Sir and sales team</p>
          </div>
        </div>
        <button onclick="closeTasksModal()" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-brandcard text-lg">✕</button>
      </div>

      <!-- Filter Tabs -->
      <div class="px-4 py-2 border-b border-brandborder bg-brandbg flex items-center space-x-2 text-xs">
        <button onclick="filterTasksModal('all')" id="task-filter-all" class="px-3 py-1 rounded font-bold bg-brandgold text-black">All Tasks (<span id="count-tasks-all">4</span>)</button>
        <button onclick="filterTasksModal('pending')" id="task-filter-pending" class="px-3 py-1 rounded font-medium text-slate-400 hover:text-white">Pending (<span id="count-tasks-pending">3</span>)</button>
        <button onclick="filterTasksModal('completed')" id="task-filter-completed" class="px-3 py-1 rounded font-medium text-slate-400 hover:text-white">Completed (<span id="count-tasks-completed">1</span>)</button>
      </div>

      <!-- Add New Task Input Bar -->
      <div class="p-3 border-b border-brandborder bg-brandcard/20 flex space-x-2">
        <input type="text" id="modal-task-input" placeholder="Type a new task and press Enter..." class="flex-1 bg-brandbg border border-brandborder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brandgold">
        <select id="modal-task-priority" class="bg-brandbg border border-brandborder rounded-lg px-2 text-xs text-slate-300 focus:outline-none">
          <option value="Normal">Normal</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>
        <button onclick="addTaskFromModal()" class="gold-gradient-btn px-4 py-1.5 rounded-lg text-xs font-bold">Add Task</button>
      </div>

      <!-- Task List Container -->
      <div class="flex-1 overflow-y-auto p-4 space-y-2 text-xs" id="modal-tasks-list">
        <!-- Rendered dynamically -->
      </div>
    </div>
  </div>

  <!-- ============================================================== -->
  <!-- MODAL: EDIT / COMPLETE REMAINING PERSONAL DETAILS MODAL -->
  <!-- ============================================================== -->
  <div id="edit-details-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 hidden">
    <div class="bg-brandnav border border-brandborder rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
      <div class="p-4 border-b border-brandborder bg-brandcard/50 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-brandgold text-lg">✏️</span>
          <div>
            <h2 class="font-brand font-bold text-sm text-white">Complete Lead Personal Details</h2>
            <p class="text-[11px] text-slate-400" id="edit-details-subtitle">Fill missing profile and qualification details</p>
          </div>
        </div>
        <button onclick="closeEditDetailsModal()" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-brandcard">✕</button>
      </div>

      <form id="edit-details-form" onsubmit="handleEditDetailsSubmit(event)" class="p-4 space-y-3 text-xs">
        <input type="hidden" id="edit-lead-id">
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-400 mb-1">Full Name</label>
            <input type="text" id="edit-lead-name" required class="w-full bg-brandbg border border-brandborder rounded-lg p-2 text-white focus:outline-none focus:border-brandgold">
          </div>
          <div>
            <label class="block text-slate-400 mb-1">Phone Number</label>
            <input type="tel" id="edit-lead-phone" required class="w-full bg-brandbg border border-brandborder rounded-lg p-2 text-white font-mono focus:outline-none focus:border-brandgold">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-400 mb-1">Company / Business</label>
            <input type="text" id="edit-lead-company" class="w-full bg-brandbg border border-brandborder rounded-lg p-2 text-white focus:outline-none focus:border-brandgold">
          </div>
          <div>
            <label class="block text-slate-400 mb-1">Email Address</label>
            <input type="email" id="edit-lead-email" placeholder="client@company.com" class="w-full bg-brandbg border border-brandborder rounded-lg p-2 text-white focus:outline-none focus:border-brandgold">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-400 mb-1">Website URL</label>
            <input type="url" id="edit-lead-website" placeholder="https://example.com" class="w-full bg-brandbg border border-brandborder rounded-lg p-2 text-white focus:outline-none focus:border-brandgold">
          </div>
          <div>
            <label class="block text-slate-400 mb-1">City / Location</label>
            <input type="text" id="edit-lead-location" placeholder="e.g. Surat, Gujarat" class="w-full bg-brandbg border border-brandborder rounded-lg p-2 text-white focus:outline-none focus:border-brandgold">
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-slate-400 mb-1">Budget Range</label>
            <select id="edit-lead-budget" class="w-full bg-brandbg border border-brandborder rounded-lg p-2 text-white focus:outline-none focus:border-brandgold">
              <option value="">-- Select Budget --</option>
              <option value="₹25,000–₹50,000">₹25,000–₹50,000</option>
              <option value="₹50,000–₹1,00,000">₹50,000–₹1,00,000</option>
              <option value="₹1,00,000–₹2,00,000">₹1,00,000–₹2,00,000</option>
              <option value="₹2,00,000+">₹2,00,000+</option>
            </select>
          </div>
          <div>
            <label class="block text-slate-400 mb-1">Decision Maker?</label>
            <select id="edit-lead-decision" class="w-full bg-brandbg border border-brandborder rounded-lg p-2 text-white focus:outline-none focus:border-brandgold">
              <option value="Yes">Yes (Direct Owner)</option>
              <option value="Partner">Partner</option>
              <option value="No">No (Manager/Staff)</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
          <div>
            <label class="block text-slate-400 mb-1">Assigned Closer</label>
            <select id="edit-lead-assigned" class="w-full bg-brandbg border border-brandborder rounded-lg p-2 text-white focus:outline-none focus:border-brandgold">
              <option value="Smit Sir">Smit Sir</option>
              <option value="Rahul">Rahul</option>
              <option value="Jay">Jay</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>
        </div>

        <div class="pt-2 flex justify-end space-x-2">
          <button type="button" onclick="closeEditDetailsModal()" class="px-4 py-2 bg-brandcard text-slate-300 rounded-lg">Cancel</button>
          <button type="submit" class="gold-gradient-btn px-5 py-2 rounded-lg font-bold">Save Details</button>
        </div>
      </form>
    </div>
  </div>"""

assert old_payment_modal_end in content, "old_payment_modal_end not found"
content = content.replace(old_payment_modal_end, new_modals_code)
print("8. Inserted #kpi-drilldown-modal, #tasks-modal, and #edit-details-modal")

# ==============================================================================
# 9. ENHANCE JAVASCRIPT: SEED DATA & COMPLETE WORKFLOW LOGIC
# ==============================================================================
# Read old script logic start
old_script_start = """    // Initial Mockup Dataset matching User's Provided Image
    const SEED_DATA = {"""

assert old_script_start in content, "old_script_start not found"

# Let's inspect from SEED_DATA down to window.onload = init;
script_idx = content.find(old_script_start)
script_end_marker = "window.onload = init;\n  </script>"
assert script_end_marker in content, "script_end_marker not found"

new_script_logic = """    // Initial Comprehensive Dataset with Full Workflow Tracking
    const SEED_DATA = {
      leads: [
        {
          id: "LD-10001",
          name: "Chiragbhai Moradiya",
          phone: "9924035386",
          email: "chirag@siriocraft.com",
          company: "Siriocraft",
          website: "https://www.siriocraft.com/",
          source: "Meta Ads",
          status: "Meeting",
          nextAction: "Today 4:00 PM",
          score: 86,
          temp: "HOT",
          assigned: "Smit Sir",
          location: "Surat",
          budget: "₹50,000–₹1,00,000",
          urgency: "High",
          decisionMaker: "Yes",
          meetingDate: "30-09-2026",
          meetingTime: "4:00 PM",
          meetingType: "Office Meeting",
          callStatus: "Done",
          callDuration: "6m 42s",
          meetingStatus: "Scheduled",
          proposalStatus: "Accepted",
          followupStatus: "None",
          adCampaign: "Surat Business Owners - Video 04"
        },
        {
          id: "LD-10002",
          name: "Rajesh Patel",
          phone: "9876543210",
          email: "rajesh@patelenterprise.in",
          company: "Patel Enterprise",
          website: "https://www.patelenterprise.in/",
          source: "Website",
          status: "Proposal",
          nextAction: "02 Oct, 11 AM",
          score: 72,
          temp: "WARM",
          assigned: "Rahul",
          location: "Ahmedabad",
          budget: "₹1,00,000–₹2,00,000",
          urgency: "Medium",
          decisionMaker: "Yes",
          meetingDate: "30-09-2026",
          meetingTime: "5:30 PM",
          meetingType: "Google Meet",
          callStatus: "Done",
          callDuration: "12m 10s",
          meetingStatus: "Scheduled",
          proposalStatus: "Sent",
          followupStatus: "FU1 Pending",
          adCampaign: "Gujarat Founders Scale Up"
        },
        {
          id: "LD-10003",
          name: "Amit Shah",
          phone: "9723456789",
          email: "amit@shahco.com",
          company: "Shah & Co",
          website: "https://www.shahco.com/",
          source: "Referral",
          status: "Follow-up",
          nextAction: "01 Oct, 3 PM",
          score: 68,
          temp: "WARM",
          assigned: "Smit Sir",
          location: "Ahmedabad",
          budget: "₹75,000–₹1,50,000",
          urgency: "Medium",
          decisionMaker: "Yes",
          meetingDate: "30-09-2026",
          meetingTime: "6:00 PM",
          meetingType: "Client Office",
          callStatus: "Done",
          callDuration: "4m 18s",
          meetingStatus: "Scheduled",
          proposalStatus: "Sent",
          followupStatus: "Overdue (+1d)",
          adCampaign: "Referral Network"
        },
        {
          id: "LD-10004",
          name: "Nikhil Jain",
          phone: "9898989898",
          email: "",
          company: "Jain Traders",
          website: "https://www.jaintraders.com/",
          source: "Meta Ads",
          status: "Contacted",
          nextAction: "Today 5 PM",
          score: 40,
          temp: "COLD",
          assigned: "Jay",
          location: "Surat",
          budget: "₹30,000–₹50,000",
          urgency: "Low",
          decisionMaker: "Partner",
          meetingDate: "",
          meetingTime: "",
          meetingType: "",
          callStatus: "No Answer",
          callDuration: "0m 00s",
          meetingStatus: "Pending",
          proposalStatus: "Pending",
          followupStatus: "FU1 Pending",
          adCampaign: "Surat Business Owners - Video 04"
        },
        {
          id: "LD-10005",
          name: "Karan Desai",
          phone: "9090909090",
          email: "",
          company: "Desai Group",
          website: "",
          source: "Instagram",
          status: "New",
          nextAction: "Call Today",
          score: 15,
          temp: "COLD",
          assigned: "Rahul",
          location: "Vadodara",
          budget: "₹25,000",
          urgency: "Low",
          decisionMaker: "No",
          meetingDate: "",
          meetingTime: "",
          meetingType: "",
          callStatus: "Pending",
          callDuration: "",
          meetingStatus: "Pending",
          proposalStatus: "Pending",
          followupStatus: "Pending",
          adCampaign: "Instagram Organic"
        },
        {
          id: "LD-10006",
          name: "Mehul Trivedi",
          phone: "9823456781",
          email: "mehul@trivediexports.com",
          company: "Trivedi Exports",
          website: "https://www.trivediexports.com/",
          source: "Website",
          status: "Meeting",
          nextAction: "01 Oct, 11 AM",
          score: 78,
          temp: "WARM",
          assigned: "Smit Sir",
          location: "Surat",
          budget: "₹1,50,000+",
          urgency: "High",
          decisionMaker: "Yes",
          meetingDate: "01-10-2026",
          meetingTime: "11:00 AM",
          meetingType: "Office Meeting",
          callStatus: "Done",
          callDuration: "8m 05s",
          meetingStatus: "Scheduled",
          proposalStatus: "Draft",
          followupStatus: "None",
          adCampaign: "Direct SEO"
        },
        {
          id: "LD-10007",
          name: "Pooja Mehta",
          phone: "9723987654",
          email: "pooja@mehtafashion.store",
          company: "Mehta Fashion",
          website: "https://www.mehtafashion.store/",
          source: "WhatsApp",
          status: "Proposal",
          nextAction: "03 Oct, 10 AM",
          score: 68,
          temp: "WARM",
          assigned: "Jay",
          location: "Surat",
          budget: "₹80,000",
          urgency: "Medium",
          decisionMaker: "Yes",
          meetingDate: "",
          meetingTime: "",
          meetingType: "",
          callStatus: "Done",
          callDuration: "5m 20s",
          meetingStatus: "Completed",
          proposalStatus: "Sent",
          followupStatus: "FU2 Pending",
          adCampaign: "WhatsApp Direct Click"
        },
        {
          id: "LD-10008",
          name: "Vishal Parmar",
          phone: "9823012345",
          email: "",
          company: "Parmar Infra",
          website: "https://www.parmarinfra.com/",
          source: "Meta Ads",
          status: "Contacted",
          nextAction: "Today 6 PM",
          score: 32,
          temp: "COLD",
          assigned: "Rahul",
          location: "Surat",
          budget: "₹50,000",
          urgency: "Low",
          decisionMaker: "Yes",
          meetingDate: "",
          meetingTime: "",
          meetingType: "",
          callStatus: "No Answer",
          callDuration: "0m 00s",
          meetingStatus: "Pending",
          proposalStatus: "Pending",
          followupStatus: "Overdue (3h)",
          adCampaign: "Surat Business Owners - Video 04"
        },
        {
          id: "LD-10009",
          name: "Hareshbhai Dholakiya",
          phone: "9898123456",
          email: "",
          company: "Dholakiya Gems",
          website: "",
          source: "Meta Ads",
          status: "New",
          nextAction: "Initial Call Due",
          score: 84,
          temp: "HOT",
          assigned: "Unassigned",
          location: "Surat",
          budget: "",
          urgency: "High",
          decisionMaker: "Unknown",
          meetingDate: "",
          meetingTime: "",
          meetingType: "",
          callStatus: "Pending",
          callDuration: "",
          meetingStatus: "Pending",
          proposalStatus: "Pending",
          followupStatus: "Pending",
          adCampaign: "Surat Founders Video 04"
        },
        {
          id: "LD-10010",
          name: "Ketan Savaliya",
          phone: "9825678901",
          email: "",
          company: "Savaliya Textiles",
          website: "",
          source: "Meta Ads",
          status: "New",
          nextAction: "Initial Call Due",
          score: 80,
          temp: "HOT",
          assigned: "Unassigned",
          location: "Surat",
          budget: "",
          urgency: "High",
          decisionMaker: "Unknown",
          meetingDate: "",
          meetingTime: "",
          meetingType: "",
          callStatus: "Pending",
          callDuration: "",
          meetingStatus: "Pending",
          proposalStatus: "Pending",
          followupStatus: "Pending",
          adCampaign: "Gujarat Founders Scale Up"
        }
      ],
      calls: [
        { time: "03:45 PM", name: "Chiragbhai Moradiya", company: "Siriocraft", outcome: "Connected", duration: "6m 42s", notes: "Confirmed 4 PM office meeting with Smit Sir.", caller: "Smit Sir" },
        { time: "02:15 PM", name: "Rajesh Patel", company: "Patel Enterprise", outcome: "Connected", duration: "12m 10s", notes: "Walked through proposal terms. Google Meet at 5:30 PM.", caller: "Rahul" },
        { time: "01:05 PM", name: "Nikhil Jain", company: "Jain Traders", outcome: "No Answer", duration: "0m 00s", notes: "No answer. Triggered automated Gujarati WhatsApp.", caller: "Jay" },
        { time: "11:30 AM", name: "Amit Shah", company: "Shah & Co", outcome: "Connected", duration: "4m 18s", notes: "Requested quote revision. Follow-up 1 scheduled.", caller: "Smit Sir" },
        { time: "10:15 AM", name: "Mehul Trivedi", company: "Trivedi Exports", outcome: "Connected", duration: "8m 05s", notes: "Tomorrow 11 AM consultation booked.", caller: "Smit Sir" }
      ],
      proposals: [
        { id: "PROP-8901", client: "Chiragbhai Moradiya", company: "Siriocraft", scope: "Brand Scaling + E-Commerce Infrastructure", amount: 95000, date: "30 Sep 2026", status: "Accepted" },
        { id: "PROP-8902", client: "Rajesh Patel", company: "Patel Enterprise", scope: "Full Funnel Meta Ads Engine", amount: 150000, date: "29 Sep 2026", status: "Sent" },
        { id: "PROP-8903", client: "Pooja Mehta", company: "Mehta Fashion", scope: "Instagram D2C Growth & Retainer", amount: 80000, date: "28 Sep 2026", status: "Viewed" },
        { id: "PROP-8904", client: "Mehul Trivedi", company: "Trivedi Exports", scope: "Global B2B Catalog & SEO", amount: 120000, date: "30 Sep 2026", status: "Draft" }
      ],
      payments: [
        { id: "INV-2026-081", client: "Chiragbhai Moradiya", company: "Siriocraft", desc: "Advance 50% Project Kickoff", amount: 50000, due: "30 Sep 2026", status: "Paid" },
        { id: "INV-2026-082", client: "Chiragbhai Moradiya", company: "Siriocraft", desc: "Milestone 2 Final Launch", amount: 45000, due: "15 Oct 2026", status: "Pending" },
        { id: "INV-2026-079", client: "Rajesh Patel", company: "Patel Enterprise", desc: "Monthly Performance Retainer", amount: 60000, due: "28 Sep 2026", status: "Paid" },
        { id: "INV-2026-078", client: "Ramesh Vora", company: "Luxe Apparel", desc: "Autumn Retainer Balance", amount: 35000, due: "25 Sep 2026", status: "Overdue" }
      ],
      tasks: [
        { id: "TSK-1", title: "Call Chiragbhai Moradiya & confirm meeting", sub: "Completed at 11:30 AM", done: true, priority: "High" },
        { id: "TSK-2", title: "Conduct 4:00 PM Consultation with Chiragbhai", sub: "Surat Office • Siriocraft E-com", done: false, priority: "Urgent" },
        { id: "TSK-3", title: "Send formal proposal to Rajesh Patel", sub: "Due Today 6:30 PM • ₹1.5L", done: false, priority: "High" },
        { id: "TSK-4", title: "Review Meta Ad campaign ROI for Surat Real Estate", sub: "AdSet: Business Owners Video 04", done: false, priority: "Normal" }
      ]
    };

    let crmLeads = [];
    let crmCalls = [];
    let crmProposals = [];
    let crmPayments = [];
    let crmTasks = [];
    let activeLeadId = "LD-10001";
    let activeTableFilter = "all";
    let activeNavRoute = "dashboard";
    let activeKpiCategory = "total";
    let activeKpiSubfilter = "all";
    let activeMetaStreamFilter = "all";

    // WORKFLOW & REMAINING DETAILS ENGINE
    function getLeadMissingDetails(l) {
      const missing = [];
      if (!l.email || l.email.trim() === '') missing.push('Missing Email');
      if (!l.website || l.website.trim() === '' || l.website === '#') missing.push('Missing Website');
      if (!l.budget || l.budget.trim() === '' || l.budget === 'Unspecified') missing.push('Budget Unspecified');
      if (!l.assigned || l.assigned === 'Unassigned') missing.push('Closer Unassigned');
      if (!l.decisionMaker || l.decisionMaker === 'Unknown') missing.push('Decision Maker Unknown');
      return missing;
    }

    function getLeadPendingWorkflow(l) {
      const pending = [];
      if (l.callStatus === 'Pending') {
        pending.push({ type: 'call', label: 'Initial Discovery Call Pending', badge: '📞 Call Pending', action: 'call', color: 'rose' });
      } else if (l.callStatus === 'No Answer') {
        pending.push({ type: 'call', label: 'No Answer — Callback Required', badge: '📞 Callback Due', action: 'call', color: 'amber' });
      }

      if (l.status !== 'Won') {
        if (!l.meetingDate || l.meetingStatus === 'Pending') {
          pending.push({ type: 'meeting', label: 'Consultation Meeting Not Booked', badge: '📅 Meeting Needed', action: 'meeting', color: 'blue' });
        }
      }

      if (l.meetingStatus === 'Completed' || l.status === 'Proposal' || l.status === 'Qualified') {
        if (l.proposalStatus !== 'Sent' && l.proposalStatus !== 'Accepted') {
          pending.push({ type: 'proposal', label: 'Custom Proposal Draft Pending', badge: '📄 Proposal Needed', action: 'proposal', color: 'amber' });
        }
      }

      if (l.followupStatus && (l.followupStatus.includes('Pending') || l.followupStatus.includes('Overdue'))) {
        pending.push({ type: 'followup', label: l.followupStatus, badge: '🔔 ' + l.followupStatus, action: 'followup', color: 'purple' });
      }

      return pending;
    }

    function init() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          crmLeads = parsed.leads || [...SEED_DATA.leads];
          crmCalls = parsed.calls || [...SEED_DATA.calls];
          crmProposals = parsed.proposals || [...SEED_DATA.proposals];
          crmPayments = parsed.payments || [...SEED_DATA.payments];
          crmTasks = parsed.tasks || [...SEED_DATA.tasks];
        } catch(e) {
          loadSeed();
        }
      } else {
        loadSeed();
      }

      // Ensure every lead has valid workflow attributes
      crmLeads.forEach(l => {
        if (!l.callStatus) l.callStatus = (l.status === 'New' ? 'Pending' : 'Done');
        if (!l.meetingStatus) l.meetingStatus = (l.meetingDate ? 'Scheduled' : 'Pending');
        if (!l.proposalStatus) l.proposalStatus = (l.status === 'Proposal' ? 'Sent' : 'Pending');
      });

      renderTable();
      renderAllViews();
    }

    function loadSeed() {
      crmLeads = JSON.parse(JSON.stringify(SEED_DATA.leads));
      crmCalls = JSON.parse(JSON.stringify(SEED_DATA.calls));
      crmProposals = JSON.parse(JSON.stringify(SEED_DATA.proposals));
      crmPayments = JSON.parse(JSON.stringify(SEED_DATA.payments));
      crmTasks = JSON.parse(JSON.stringify(SEED_DATA.tasks));
      persist();
    }

    function persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        leads: crmLeads,
        calls: crmCalls,
        proposals: crmProposals,
        payments: crmPayments,
        tasks: crmTasks
      }));
      updateDashboardCounts();
    }

    function updateDashboardCounts() {
      const kpiTotal = document.getElementById('kpi-total-leads');
      if (kpiTotal) kpiTotal.innerText = crmLeads.length;

      const newLeads = crmLeads.filter(l => l.status === 'New');
      const kpiNew = document.getElementById('kpi-new-leads');
      if (kpiNew) kpiNew.innerText = newLeads.length;

      const unassignedCount = crmLeads.filter(l => l.assigned === 'Unassigned').length;
      const kpiNewSub = document.querySelector('#kpi-new-leads + span');
      if (kpiNewSub) kpiNewSub.innerText = `● ${unassignedCount} Unassigned`;

      const kpiCalls = document.getElementById('kpi-calls-made');
      if (kpiCalls) kpiCalls.innerText = crmCalls.length;

      const meetingsCount = crmLeads.filter(l => l.status === 'Meeting' || l.meetingDate).length;
      const kpiMeetings = document.getElementById('kpi-meetings');
      if (kpiMeetings) kpiMeetings.innerText = meetingsCount;

      const propCount = crmProposals.length;
      const kpiProp = document.getElementById('kpi-proposals');
      if (kpiProp) kpiProp.innerText = propCount;

      const wonCount = crmLeads.filter(l => l.status === 'Won').length;
      const kpiWon = document.getElementById('kpi-won');
      if (kpiWon) kpiWon.innerText = wonCount;

      // Meta Stream Pending Calls SLA
      const metaPendingCount = crmLeads.filter(l => l.source === 'Meta Ads' && l.callStatus === 'Pending').length;
      const metaPendingEl = document.getElementById('meta-pending-calls-count');
      if (metaPendingEl) metaPendingEl.innerText = `${metaPendingCount} Calls Pending (<15m SLA)`;
    }

    // ==============================================================
    // NAVIGATION ROUTER (16 Pages)
    // ==============================================================
    function switchNav(route) {
      activeNavRoute = route;
      const views = [
        'dashboard', 'leads', 'calls', 'meetings', 'followups', 'proposals',
        'clients', 'projects', 'payments', 'whatsapp', 'meta-ads', 'team',
        'reports', 'automation', 'templates', 'settings'
      ];

      views.forEach(v => {
        const btn = document.getElementById(`nav-${v}`);
        const viewEl = document.getElementById(`view-${v}`);
        if (btn) {
          if (v === route) {
            btn.className = "w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-semibold bg-brandgold text-black shadow-md shadow-brandgold/20 transition-all";
          } else {
            btn.className = "w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium text-slate-400 hover:text-white hover:bg-brandcard transition-all";
          }
        }
        if (viewEl) {
          if (v === route) viewEl.classList.remove('hidden');
          else viewEl.classList.add('hidden');
        }
      });

      const titleMap = {
        dashboard: "Executive Overview",
        leads: "Leads Management & Pipeline",
        calls: "Call Center & Dispositions",
        meetings: "Meeting Schedule & Attendance",
        followups: "Follow-up Queue & Cadence",
        proposals: "Proposals & Commercials",
        clients: "Active Client Accounts",
        projects: "Client Projects & Delivery",
        payments: "Payments & Invoicing",
        whatsapp: "WhatsApp Hub & Dispatcher",
        'meta-ads': "Meta Lead Ads Integration",
        team: "Team Performance & Leaderboard",
        reports: "Executive Sales Reports",
        automation: "Workflow Automations Engine",
        templates: "Template Management",
        settings: "System & Company Settings"
      };

      const topTitle = document.getElementById('topbar-title');
      if (topTitle) topTitle.innerText = titleMap[route] || "CRM Command Center";

      const sidebar = document.getElementById('main-sidebar');
      if (sidebar && window.innerWidth < 768) {
        sidebar.classList.add('-translate-x-full');
      }

      renderAllViews();
      const viewport = document.getElementById('app-viewport');
      if (viewport) viewport.scrollTop = 0;
    }

    function renderAllViews() {
      renderKanban();
      renderFullLeadsTable();
      renderCallsLog();
      renderMeetingsTable();
      renderFollowups();
      renderProposalsTable();
      renderClientsGrid();
      renderProjectsList();
      renderPaymentsTable();
      renderWhatsAppHub();
      renderTeamRoster();
      renderAutomationsList();
      renderTemplatesManage();
      renderMetaAdsTable();
      updateDashboardCounts();
    }

    // ==============================================================
    // TABLE VIEW IN DASHBOARD (With Workflow & Remaining Details)
    // ==============================================================
    function renderTable(list) {
      const data = list || crmLeads;
      const tbody = document.getElementById("leads-table-body");
      if (!tbody) return;

      tbody.innerHTML = data.map(l => {
        let statusClass = "bg-slate-800 text-slate-300";
        if (l.status === "Meeting") statusClass = "bg-blue-500/20 text-blue-400 border border-blue-500/30";
        else if (l.status === "Proposal") statusClass = "bg-amber-900/30 text-amber-300 border border-amber-800/40";
        else if (l.status === "Follow-up") statusClass = "bg-purple-900/30 text-purple-300 border border-purple-800/40";
        else if (l.status === "Won") statusClass = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";

        let scoreClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
        if (l.score < 50) scoreClass = "bg-blue-500/20 text-sky-400 border-blue-500/40";
        else if (l.score < 80) scoreClass = "bg-amber-500/20 text-amber-400 border-amber-500/40";

        const missing = getLeadMissingDetails(l);
        const pendingWf = getLeadPendingWorkflow(l);

        return `
          <tr class="hover:bg-brandcard/70 transition-colors cursor-pointer group" onclick="openLeadDrawer('${l.id}')">
            <td class="p-2.5" onclick="event.stopPropagation()">
              <input type="checkbox" class="w-3.5 h-3.5 rounded text-brandgold bg-brandcard border-slate-700">
            </td>
            <td class="p-2.5 font-bold text-white group-hover:text-brandgold transition-colors truncate max-w-[130px]">
              ${escapeHtml(l.name)}
            </td>
            <td class="p-2.5 text-slate-400 font-mono text-[11px]">${l.phone}</td>
            <td class="p-2.5 text-slate-300 truncate max-w-[110px]">${escapeHtml(l.company || '-')}</td>
            <td class="p-2.5">
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${l.source === 'Meta Ads' ? 'bg-sky-950 text-sky-400 border border-sky-800' : 'bg-slate-800 text-slate-300'}">
                ${escapeHtml(l.source)}
              </span>
            </td>
            <td class="p-2.5">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusClass}">${l.status}</span>
            </td>
            <td class="p-2.5 max-w-[260px]">
              <div class="flex flex-wrap gap-1 items-center">
                <!-- Call Badge -->
                <span class="px-1.5 py-0.2 rounded text-[9px] font-bold ${l.callStatus === 'Done' ? 'bg-emerald-950 text-emerald-400' : (l.callStatus === 'No Answer' ? 'bg-amber-950 text-amber-300' : 'bg-rose-950 text-rose-400 border border-rose-800')}">
                  📞 ${l.callStatus || 'Pending'}
                </span>
                <!-- Meeting Badge -->
                <span class="px-1.5 py-0.2 rounded text-[9px] font-bold ${l.meetingDate ? 'bg-blue-950 text-blue-400' : 'bg-slate-800 text-slate-400'}">
                  🗓 ${l.meetingDate ? 'Scheduled' : 'Meet Needed'}
                </span>
                <!-- Missing details pill -->
                ${missing.length > 0 ? `
                  <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-800 cursor-pointer" onclick="event.stopPropagation(); openEditDetailsModal('${l.id}')" title="${missing.join(', ')}">
                    ⚠️ ${missing.length} Missing Info
                  </span>
                ` : '<span class="text-[9px] text-emerald-400 font-bold">✓ Profile 100%</span>'}
              </div>
            </td>
            <td class="p-2.5">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${scoreClass}">
                ${l.score} ${l.temp}
              </span>
            </td>
            <td class="p-2.5 font-semibold ${l.assigned === 'Unassigned' ? 'text-brandgold font-bold' : 'text-slate-300'} text-[11px]">
              ${escapeHtml(l.assigned)}
            </td>
            <td class="p-2.5 text-right space-x-1" onclick="event.stopPropagation()">
              <a href="tel:${l.phone}" class="p-1 rounded bg-brandcard hover:bg-slate-700 text-sky-400 hover:text-white inline-block" title="Call">📞</a>
              <button onclick="openWhatsAppModal('${l.id}', 'meeting_confirm')" class="p-1 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-400 hover:text-white" title="WhatsApp">📲</button>
              <button onclick="openEditDetailsModal('${l.id}')" class="p-1 rounded bg-brandcard hover:bg-slate-700 text-brandgold hover:text-white" title="Edit Missing Details">✏️</button>
              <button onclick="openLeadDrawer('${l.id}')" class="p-1 rounded bg-brandcard hover:bg-slate-700 text-slate-400 hover:text-white" title="View Full Lead">↗</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // ==============================================================
    // META ADS LIVE STREAM & WORKFLOW TRACKER TABLE
    // ==============================================================
    function renderMetaAdsTable() {
      const tbody = document.getElementById('meta-leads-stream-body');
      if (!tbody) return;

      let metaLeads = crmLeads.filter(l => l.source === 'Meta Ads');

      if (activeMetaStreamFilter === 'pending_call') {
        metaLeads = metaLeads.filter(l => l.callStatus === 'Pending' || l.callStatus === 'No Answer');
      } else if (activeMetaStreamFilter === 'missing_details') {
        metaLeads = metaLeads.filter(l => getLeadMissingDetails(l).length > 0);
      } else if (activeMetaStreamFilter === 'unassigned') {
        metaLeads = metaLeads.filter(l => l.assigned === 'Unassigned');
      }

      tbody.innerHTML = metaLeads.map(l => {
        const missing = getLeadMissingDetails(l);
        const isSlaBreached = l.callStatus === 'Pending';

        return `
          <tr class="hover:bg-brandcard/70 transition-colors cursor-pointer" onclick="openLeadDrawer('${l.id}')">
            <td class="p-2.5">
              <span class="font-bold text-white block">${escapeHtml(l.name)}</span>
              <span class="text-[11px] text-slate-400 font-mono">${l.phone}</span>
            </td>
            <td class="p-2.5">
              <span class="text-brandgold font-semibold block">${escapeHtml(l.company || 'Enterprise')}</span>
              <span class="text-[10px] text-slate-400">${escapeHtml(l.adCampaign || 'Surat Founders Video 04')}</span>
            </td>
            <td class="p-2.5">
              ${l.callStatus === 'Done' ? `
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ✓ Connected (${l.callDuration || '5m'})
                </span>
              ` : `
                <div class="space-y-0.5">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800 animate-pulse">
                    🚨 Call Pending (SLA 15m)
                  </span>
                  <button onclick="event.stopPropagation(); quickMarkCallDone('${l.id}')" class="block text-[9px] text-sky-400 hover:underline">Mark Called ✓</button>
                </div>
              `}
            </td>
            <td class="p-2.5">
              ${l.meetingDate ? `
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800">
                  📅 ${l.meetingDate} ${l.meetingTime || ''}
                </span>
              ` : `
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  ⏳ Meeting Needed
                </span>
              `}
            </td>
            <td class="p-2.5">
              ${l.proposalStatus === 'Sent' || l.proposalStatus === 'Accepted' ? `
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400">
                  ✓ ${l.proposalStatus}
                </span>
              ` : `
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                  ⏳ Pending
                </span>
              `}
            </td>
            <td class="p-2.5">
              ${missing.length > 0 ? `
                <div class="flex flex-wrap gap-1">
                  ${missing.map(m => `<span class="px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-800 text-[9px] font-semibold">${m}</span>`).join('')}
                </div>
              ` : '<span class="text-emerald-400 font-bold text-[10px]">✓ Complete</span>'}
            </td>
            <td class="p-2.5">
              ${l.assigned === 'Unassigned' ? `
                <button onclick="event.stopPropagation(); quickAssignCloser('${l.id}', 'Smit Sir')" class="px-2 py-0.5 rounded bg-brandgold text-black font-bold text-[10px] hover:bg-brandgoldlight">
                  + Assign Smit Sir
                </button>
              ` : `<span class="text-white font-medium">${l.assigned}</span>`}
            </td>
            <td class="p-2.5 text-right space-x-1" onclick="event.stopPropagation()">
              <a href="tel:${l.phone}" class="p-1 rounded bg-slate-800 text-sky-400 hover:text-white" title="Call">📞</a>
              <button onclick="openWhatsAppModal('${l.id}', 'call_nr')" class="p-1 rounded bg-emerald-950 text-emerald-400 hover:text-white" title="WhatsApp">📲</button>
              <button onclick="openEditDetailsModal('${l.id}')" class="p-1 rounded bg-brandcard text-brandgold hover:text-white" title="Edit Missing Details">✏️</button>
              <button onclick="openLeadDrawer('${l.id}')" class="p-1 rounded bg-slate-800 text-slate-300 hover:text-white" title="View Full">↗</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    function filterMetaStream(filterKey) {
      activeMetaStreamFilter = filterKey;
      ['all', 'pending_call', 'missing_details', 'unassigned'].forEach(k => {
        const btn = document.getElementById(`meta-flt-${k}`);
        if (btn) {
          if (k === filterKey) {
            btn.className = "px-2.5 py-1 rounded font-bold bg-brandgold text-black";
          } else {
            btn.className = "px-2.5 py-1 rounded font-medium text-slate-400 hover:text-white bg-brandcard";
          }
        }
      });
      renderMetaAdsTable();
    }

    // ==============================================================
    // KPI DRILLDOWN & REMAINING DETAILS AUDIT ENGINE (Click Dashboard Cards)
    // ==============================================================
    function openKpiDrilldown(category, subfilter) {
      activeKpiCategory = category || 'total';
      activeKpiSubfilter = subfilter || 'all';

      const configMap = {
        total: {
          icon: "📊",
          title: "Total Leads Breakdown & Workflow Audit",
          subtitle: "Comprehensive audit of all leads, pending stage actions, and remaining personal details",
          badge: `${crmLeads.length} Total Leads`,
          getLeads: () => crmLeads
        },
        new: {
          icon: "⚡",
          title: "New Leads — Immediate Workflow Actions",
          subtitle: "Newly captured leads requiring 15-minute discovery calls, closer assignment, and profile data",
          badge: `${crmLeads.filter(l => l.status === 'New').length} New Leads`,
          getLeads: () => crmLeads.filter(l => l.status === 'New')
        },
        calls: {
          icon: "📞",
          title: "Call Center Pipeline & Pending Queue",
          subtitle: "Leads with initial calls pending, no-answer callbacks due, and logged call dispositions",
          badge: `${crmCalls.length} Logged Calls`,
          getLeads: () => crmLeads.filter(l => l.callStatus === 'Pending' || l.callStatus === 'No Answer' || l.status === 'Contacted')
        },
        meetings: {
          icon: "🗓",
          title: "Consultation Meetings & Pending Bookings",
          subtitle: "Today's consultations, confirmed appointments, and qualified leads waiting to schedule",
          badge: `${crmLeads.filter(l => l.meetingDate || l.status === 'Meeting').length} Active Meetings`,
          getLeads: () => crmLeads.filter(l => l.meetingDate || l.status === 'Meeting' || l.status === 'Qualified')
        },
        proposals: {
          icon: "💼",
          title: "Proposals Pipeline & Commercial Quotes",
          subtitle: "Commercial proposals delivered, quotes pending drafting, and contracts awaiting approval",
          badge: `${crmProposals.length} Commercial Quotes`,
          getLeads: () => crmLeads.filter(l => l.status === 'Proposal' || l.proposalStatus === 'Sent' || l.proposalStatus === 'Draft')
        },
        won: {
          icon: "🏆",
          title: "Won Deals — Onboarding & Milestones",
          subtitle: "Successfully closed client accounts, project kickoff checklist, and invoice tracking",
          badge: `${crmLeads.filter(l => l.status === 'Won').length} Won Deals`,
          getLeads: () => crmLeads.filter(l => l.status === 'Won')
        },
        revenue: {
          icon: "💰",
          title: "Revenue & Invoicing Collections",
          subtitle: "Collected revenue, milestone payments pending receipt, and overdue invoices",
          badge: "₹4.82 Lakhs Collected",
          getLeads: () => crmLeads.filter(l => l.status === 'Won' || l.budget)
        },
        attention_all: {
          icon: "🚨",
          title: "Action Center — All Attention Alerts",
          subtitle: "Overdue follow-ups, today's consultations, unassigned leads, and SLA breached calls",
          badge: "5 Urgent Alert Groups",
          getLeads: () => crmLeads.filter(l => (l.followupStatus && l.followupStatus.includes('Overdue')) || l.meetingDate || l.assigned === 'Unassigned' || l.callStatus === 'Pending')
        },
        overdue_fu: {
          icon: "🚨",
          title: "Overdue Follow-ups Queue",
          subtitle: "Leads with past-due cadence follow-ups requiring immediate WhatsApp or call outreach",
          badge: "Overdue Alerts",
          getLeads: () => crmLeads.filter(l => l.followupStatus && l.followupStatus.includes('Overdue'))
        },
        meetings_today: {
          icon: "📅",
          title: "Today's Consultations Schedule",
          subtitle: "3 meetings scheduled today in Surat office, Google Meet, and client site",
          badge: "3 Today",
          getLeads: () => crmLeads.filter(l => l.meetingDate && (l.meetingDate.includes('30-09-2026') || l.meetingDate.includes('Today') || l.id === 'LD-10001' || l.id === 'LD-10002' || l.id === 'LD-10003'))
        },
        high_value: {
          icon: "💼",
          title: "High Value Deals (₹1.0L+)",
          subtitle: "High ticket enterprise branding and Meta Ads performance accounts",
          badge: "High Value Pipeline",
          getLeads: () => crmLeads.filter(l => l.score >= 70 && (l.budget.includes('1,00,000') || l.budget.includes('1.5') || l.company === 'Patel Enterprise' || l.company === 'Siriocraft'))
        },
        unassigned: {
          icon: "👤",
          title: "Unassigned Leads Queue",
          subtitle: "Inbound Meta Ad leads that require closer assignment to Smit Sir, Rahul, or Jay",
          badge: "Unassigned",
          getLeads: () => crmLeads.filter(l => l.assigned === 'Unassigned')
        },
        no_call: {
          icon: "📞",
          title: "Leads with No Call Done (15m SLA)",
          subtitle: "Inquiries that have not received an initial outbound discovery call",
          badge: "SLA Breached",
          getLeads: () => crmLeads.filter(l => l.callStatus === 'Pending')
        },
        stage_new: { icon: "🌱", title: "Funnel Stage: New Leads", subtitle: "All leads in New pipeline stage", badge: "Stage: New", getLeads: () => crmLeads.filter(l => l.status === 'New') },
        stage_contacted: { icon: "📞", title: "Funnel Stage: Contacted Leads", subtitle: "Leads where initial call was completed or attempted", badge: "Stage: Contacted", getLeads: () => crmLeads.filter(l => l.status === 'Contacted') },
        stage_qualified: { icon: "🎯", title: "Funnel Stage: Qualified Prospects", subtitle: "Prospects verified with budget, authority, and need", badge: "Stage: Qualified", getLeads: () => crmLeads.filter(l => l.status === 'Qualified') },
        stage_meeting: { icon: "🗓", title: "Funnel Stage: Meetings Scheduled", subtitle: "Prospects with active consultation appointments", badge: "Stage: Meeting", getLeads: () => crmLeads.filter(l => l.status === 'Meeting' || l.meetingDate) },
        stage_proposal: { icon: "📄", title: "Funnel Stage: Proposals Sent", subtitle: "Prospects reviewing commercial quotes and deliverables", badge: "Stage: Proposal", getLeads: () => crmLeads.filter(l => l.status === 'Proposal') },
        stage_negotiation: { icon: "🤝", title: "Funnel Stage: In Negotiation", subtitle: "Prospects finalizing contract terms and pricing", badge: "Stage: Negotiation", getLeads: () => crmLeads.filter(l => l.status === 'Negotiation') },
        stage_won: { icon: "🏆", title: "Funnel Stage: Won Clients", subtitle: "Closed and onboarding client accounts", badge: "Stage: Won", getLeads: () => crmLeads.filter(l => l.status === 'Won') }
      };

      const cfg = configMap[category] || configMap.total;
      document.getElementById('kpi-modal-icon-container').innerText = cfg.icon;
      document.getElementById('kpi-modal-title').innerText = cfg.title;
      document.getElementById('kpi-modal-subtitle').innerText = cfg.subtitle;
      document.getElementById('kpi-modal-count-badge').innerText = cfg.badge;

      renderKpiDrilldown();
      document.getElementById('kpi-drilldown-modal').classList.remove('hidden');
    }

    function closeKpiDrilldown() {
      document.getElementById('kpi-drilldown-modal').classList.add('hidden');
    }

    function filterKpiDrilldown(subfilter) {
      activeKpiSubfilter = subfilter;
      renderKpiDrilldown();
    }

    function renderKpiDrilldown() {
      const configMap = {
        total: () => crmLeads,
        new: () => crmLeads.filter(l => l.status === 'New'),
        calls: () => crmLeads.filter(l => l.callStatus === 'Pending' || l.callStatus === 'No Answer' || l.status === 'Contacted'),
        meetings: () => crmLeads.filter(l => l.meetingDate || l.status === 'Meeting' || l.status === 'Qualified'),
        proposals: () => crmLeads.filter(l => l.status === 'Proposal' || l.proposalStatus === 'Sent' || l.proposalStatus === 'Draft'),
        won: () => crmLeads.filter(l => l.status === 'Won'),
        revenue: () => crmLeads.filter(l => l.status === 'Won' || l.budget),
        attention_all: () => crmLeads.filter(l => (l.followupStatus && l.followupStatus.includes('Overdue')) || l.meetingDate || l.assigned === 'Unassigned' || l.callStatus === 'Pending'),
        overdue_fu: () => crmLeads.filter(l => l.followupStatus && l.followupStatus.includes('Overdue')),
        meetings_today: () => crmLeads.filter(l => l.meetingDate && (l.meetingDate.includes('30-09-2026') || l.meetingDate.includes('Today') || l.id === 'LD-10001' || l.id === 'LD-10002' || l.id === 'LD-10003')),
        high_value: () => crmLeads.filter(l => l.score >= 70 && (l.budget.includes('1,00,000') || l.budget.includes('1.5') || l.company === 'Patel Enterprise' || l.company === 'Siriocraft')),
        unassigned: () => crmLeads.filter(l => l.assigned === 'Unassigned'),
        no_call: () => crmLeads.filter(l => l.callStatus === 'Pending'),
        stage_new: () => crmLeads.filter(l => l.status === 'New'),
        stage_contacted: () => crmLeads.filter(l => l.status === 'Contacted'),
        stage_qualified: () => crmLeads.filter(l => l.status === 'Qualified'),
        stage_meeting: () => crmLeads.filter(l => l.status === 'Meeting' || l.meetingDate),
        stage_proposal: () => crmLeads.filter(l => l.status === 'Proposal'),
        stage_negotiation: () => crmLeads.filter(l => l.status === 'Negotiation'),
        stage_won: () => crmLeads.filter(l => l.status === 'Won')
      };

      const getBase = configMap[activeKpiCategory] || (() => crmLeads);
      const baseLeads = getBase();

      // Category Summary Counts
      const totalCount = baseLeads.length;
      const callPendingCount = baseLeads.filter(l => l.callStatus === 'Pending' || l.callStatus === 'No Answer').length;
      const meetNeededCount = baseLeads.filter(l => !l.meetingDate && l.status !== 'Won').length;
      const propNeededCount = baseLeads.filter(l => l.proposalStatus !== 'Sent' && l.proposalStatus !== 'Accepted').length;
      const missingDetailsCount = baseLeads.filter(l => getLeadMissingDetails(l).length > 0).length;

      document.getElementById('kpi-sum-total').innerText = totalCount;
      document.getElementById('kpi-sum-calls').innerText = callPendingCount;
      document.getElementById('kpi-sum-meetings').innerText = meetNeededCount;
      document.getElementById('kpi-sum-proposals').innerText = propNeededCount;
      document.getElementById('kpi-sum-missing').innerText = missingDetailsCount;

      // Filter tabs inside modal
      const tabs = [
        { key: 'all', label: `All in Category (${totalCount})` },
        { key: 'call_pending', label: `📞 Call Pending (${callPendingCount})` },
        { key: 'meet_needed', label: `📅 Meeting Needed (${meetNeededCount})` },
        { key: 'prop_needed', label: `📄 Proposal Needed (${propNeededCount})` },
        { key: 'missing_details', label: `⚠️ Missing Details (${missingDetailsCount})` }
      ];

      const tabsContainer = document.getElementById('kpi-modal-filter-tabs');
      if (tabsContainer) {
        tabsContainer.innerHTML = tabs.map(t => `
          <button onclick="filterKpiDrilldown('${t.key}')" class="px-3 py-1 rounded-lg font-medium transition-all ${activeKpiSubfilter === t.key ? 'bg-brandgold text-black font-bold' : 'bg-brandcard text-slate-400 hover:text-white'}">
            ${t.label}
          </button>
        `).join('');
      }

      // Filtered Leads
      let displayLeads = baseLeads;
      if (activeKpiSubfilter === 'call_pending') {
        displayLeads = baseLeads.filter(l => l.callStatus === 'Pending' || l.callStatus === 'No Answer');
      } else if (activeKpiSubfilter === 'meet_needed') {
        displayLeads = baseLeads.filter(l => !l.meetingDate && l.status !== 'Won');
      } else if (activeKpiSubfilter === 'prop_needed') {
        displayLeads = baseLeads.filter(l => l.proposalStatus !== 'Sent' && l.proposalStatus !== 'Accepted');
      } else if (activeKpiSubfilter === 'missing_details') {
        displayLeads = baseLeads.filter(l => getLeadMissingDetails(l).length > 0);
      }

      const listContainer = document.getElementById('kpi-modal-leads-container');
      if (!listContainer) return;

      if (displayLeads.length === 0) {
        listContainer.innerHTML = `
          <div class="text-center py-12 glass-card space-y-2">
            <span class="text-3xl">🎉</span>
            <h4 class="font-bold text-white text-sm">No Pending Items in this Category!</h4>
            <p class="text-xs text-slate-400">All workflow steps and personal details for these leads are fully up to date.</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = displayLeads.map(l => {
        const missing = getLeadMissingDetails(l);
        const pendingWf = getLeadPendingWorkflow(l);

        return `
          <div class="p-3.5 rounded-xl bg-brandcard/70 border border-brandborder hover:border-brandgold/40 transition-all space-y-2.5">
            <!-- Lead Row Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-brandborder/50">
              <div class="flex items-center space-x-3">
                <div class="w-9 h-9 rounded-lg bg-brandgold/10 border border-brandgold/30 text-brandgold font-bold flex items-center justify-center font-brand text-sm">
                  ${escapeHtml(l.name[0])}
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="font-bold text-white text-sm hover:text-brandgold cursor-pointer" onclick="closeKpiDrilldown(); openLeadDrawer('${l.id}')">
                      ${escapeHtml(l.name)}
                    </span>
                    <span class="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">${l.id}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold ${l.source === 'Meta Ads' ? 'bg-sky-950 text-sky-400 border border-sky-800' : 'bg-slate-800 text-slate-400'}">
                      ${escapeHtml(l.source)}
                    </span>
                  </div>
                  <div class="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                    <span class="font-mono text-slate-300">${l.phone}</span>
                    <span>•</span>
                    <span class="text-brandgold font-semibold">${escapeHtml(l.company || 'Enterprise')}</span>
                    <span>•</span>
                    <span>${l.location || 'Surat'}</span>
                    <span>•</span>
                    <span class="text-sky-300">Closer: <strong>${l.assigned || 'Unassigned'}</strong></span>
                  </div>
                </div>
              </div>

              <!-- Quick Action Toolbar -->
              <div class="flex items-center space-x-1.5 self-end sm:self-auto">
                <a href="tel:${l.phone}" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs flex items-center space-x-1">
                  <span>📞 Call</span>
                </a>
                <button onclick="openWhatsAppModal('${l.id}', 'meeting_confirm')" class="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 font-bold text-xs flex items-center space-x-1">
                  <span>📲 WA</span>
                </button>
                <button onclick="closeKpiDrilldown(); openLeadDrawer('${l.id}')" class="px-2.5 py-1 rounded bg-brandcard hover:bg-slate-700 text-brandgold font-bold text-xs flex items-center space-x-1">
                  <span>↗ Details</span>
                </button>
              </div>
            </div>

            <!-- SEPARATE DETAILS REMAINING / BAKI ITEMS BREAKDOWN -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
              <!-- Pending Sales Workflow Steps -->
              <div class="p-2.5 rounded-lg bg-brandbg/80 border border-brandborder/70 space-y-1.5">
                <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  ⚡ Sales Workflow Status:
                </span>
                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-slate-300">1. Discovery Call:</span>
                    ${l.callStatus === 'Done' ? `
                      <span class="text-emerald-400 font-bold font-mono">✓ Completed (${l.callDuration || '5m'})</span>
                    ` : `
                      <span class="text-rose-400 font-bold font-mono flex items-center space-x-1">
                        <span>⚠️ Pending</span>
                        <button onclick="quickMarkCallDone('${l.id}')" class="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 hover:bg-rose-900 text-white ml-1">Mark Done</button>
                      </span>
                    `}
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-slate-300">2. Consultation Meeting:</span>
                    ${l.meetingDate ? `
                      <span class="text-blue-400 font-bold font-mono">✓ Scheduled (${l.meetingDate} ${l.meetingTime || ''})</span>
                    ` : `
                      <span class="text-amber-400 font-bold font-mono flex items-center space-x-1">
                        <span>⏳ Not Scheduled</span>
                        <button onclick="closeKpiDrilldown(); openMeetingModal();" class="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 hover:bg-amber-900 text-white ml-1">Schedule</button>
                      </span>
                    `}
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-slate-300">3. Custom Proposal:</span>
                    ${l.proposalStatus === 'Sent' || l.proposalStatus === 'Accepted' ? `
                      <span class="text-emerald-400 font-bold font-mono">✓ ${l.proposalStatus}</span>
                    ` : `
                      <span class="text-slate-400 font-mono">⏳ Draft Pending</span>
                    `}
                  </div>
                </div>
              </div>

              <!-- Remaining Personal / Profile Details -->
              <div class="p-2.5 rounded-lg bg-brandbg/80 border border-brandborder/70 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    📋 Profile Information Completeness:
                  </span>
                  <button onclick="openEditDetailsModal('${l.id}')" class="text-[10px] text-brandgold hover:underline font-bold">
                    ✏️ Fill Missing
                  </button>
                </div>

                ${missing.length > 0 ? `
                  <div class="space-y-1">
                    <span class="text-[11px] text-rose-300 font-semibold block">⚠️ ${missing.length} Details Missing:</span>
                    <div class="flex flex-wrap gap-1">
                      ${missing.map(m => `
                        <span class="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 text-[10px] font-mono">
                          ✗ ${m}
                        </span>
                      `).join('')}
                    </div>
                  </div>
                ` : `
                  <div class="flex items-center space-x-1.5 text-emerald-400 font-medium py-1">
                    <span>✓</span>
                    <span>All personal contact details, website, budget & closer assigned!</span>
                  </div>
                `}

                <div class="text-[10px] text-slate-400 pt-1 flex items-center justify-between border-t border-brandborder/40">
                  <span>Website: <strong class="text-slate-200">${l.website || 'Not Provided'}</strong></span>
                  <span>Budget: <strong class="text-brandgold">${l.budget || 'Unspecified'}</strong></span>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // ==============================================================
    // QUICK ACTIONS & MODAL HELPERS
    // ==============================================================
    function quickMarkCallDone(leadId) {
      const lead = crmLeads.find(l => l.id === leadId);
      if (lead) {
        lead.callStatus = 'Done';
        lead.callDuration = '4m 12s';
        if (lead.status === 'New') lead.status = 'Contacted';
        crmCalls.unshift({
          time: "Just Now",
          name: lead.name,
          company: lead.company,
          outcome: "Connected",
          duration: "4m 12s",
          notes: "Initial discovery call completed via dashboard quick action.",
          caller: "Smit Sir"
        });
        persist();
        renderTable();
        renderAllViews();
        if (!document.getElementById('kpi-drilldown-modal').classList.contains('hidden')) {
          renderKpiDrilldown();
        }
        showToastNotification(`📞 Call logged as Connected for ${lead.name}!`);
      }
    }

    function quickAssignCloser(leadId, closer) {
      const lead = crmLeads.find(l => l.id === leadId);
      if (lead) {
        lead.assigned = closer;
        persist();
        renderTable();
        renderAllViews();
        if (!document.getElementById('kpi-drilldown-modal').classList.contains('hidden')) {
          renderKpiDrilldown();
        }
        showToastNotification(`👤 Assigned closer ${closer} to ${lead.name}!`);
      }
    }

    // EDIT MISSING DETAILS MODAL
    function openEditDetailsModal(leadId) {
      const lead = crmLeads.find(l => l.id === leadId);
      if (!lead) return;

      document.getElementById('edit-lead-id').value = lead.id;
      document.getElementById('edit-lead-name').value = lead.name || "";
      document.getElementById('edit-lead-phone').value = lead.phone || "";
      document.getElementById('edit-lead-company').value = lead.company || "";
      document.getElementById('edit-lead-email').value = lead.email || "";
      document.getElementById('edit-lead-website').value = (lead.website && lead.website !== '#') ? lead.website : "";
      document.getElementById('edit-lead-location').value = lead.location || "Surat, Gujarat";
      document.getElementById('edit-lead-budget').value = lead.budget || "";
      document.getElementById('edit-lead-decision').value = lead.decisionMaker || "Yes";
      document.getElementById('edit-lead-assigned').value = lead.assigned || "Smit Sir";

      document.getElementById('edit-details-subtitle').innerText = `Updating profile & missing information for ${lead.name} (${lead.company || 'Enterprise'})`;
      document.getElementById('edit-details-modal').classList.remove('hidden');
    }

    function closeEditDetailsModal() {
      document.getElementById('edit-details-modal').classList.add('hidden');
    }

    function handleEditDetailsSubmit(e) {
      e.preventDefault();
      const id = document.getElementById('edit-lead-id').value;
      const lead = crmLeads.find(l => l.id === id);
      if (lead) {
        lead.name = document.getElementById('edit-lead-name').value.trim();
        lead.phone = document.getElementById('edit-lead-phone').value.trim();
        lead.company = document.getElementById('edit-lead-company').value.trim();
        lead.email = document.getElementById('edit-lead-email').value.trim();
        lead.website = document.getElementById('edit-lead-website').value.trim();
        lead.location = document.getElementById('edit-lead-location').value.trim();
        lead.budget = document.getElementById('edit-lead-budget').value;
        lead.decisionMaker = document.getElementById('edit-lead-decision').value;
        lead.assigned = document.getElementById('edit-lead-assigned').value;

        persist();
        renderTable();
        renderAllViews();
        closeEditDetailsModal();
        if (!document.getElementById('kpi-drilldown-modal').classList.contains('hidden')) {
          renderKpiDrilldown();
        }
        if (activeLeadId === lead.id) {
          openLeadDrawer(lead.id);
        }
        showToastNotification(`✅ Profile details updated for ${lead.name}!`);
      }
    }

    // ALL TASKS MODAL
    function openTasksModal() {
      renderTasksModal();
      document.getElementById('tasks-modal').classList.remove('hidden');
    }

    function closeTasksModal() {
      document.getElementById('tasks-modal').classList.add('hidden');
    }

    function filterTasksModal(filterKey) {
      ['all', 'pending', 'completed'].forEach(k => {
        const btn = document.getElementById(`task-filter-${k}`);
        if (btn) {
          if (k === filterKey) {
            btn.className = "px-3 py-1 rounded font-bold bg-brandgold text-black";
          } else {
            btn.className = "px-3 py-1 rounded font-medium text-slate-400 hover:text-white";
          }
        }
      });
      renderTasksModal(filterKey);
    }

    function renderTasksModal(filterKey = 'all') {
      const container = document.getElementById('modal-tasks-list');
      if (!container) return;

      const total = crmTasks.length;
      const completed = crmTasks.filter(t => t.done).length;
      const pending = total - completed;

      const cAll = document.getElementById('count-tasks-all');
      const cPend = document.getElementById('count-tasks-pending');
      const cComp = document.getElementById('count-tasks-completed');
      if (cAll) cAll.innerText = total;
      if (cPend) cPend.innerText = pending;
      if (cComp) cComp.innerText = completed;

      let filtered = crmTasks;
      if (filterKey === 'pending') filtered = crmTasks.filter(t => !t.done);
      else if (filterKey === 'completed') filtered = crmTasks.filter(t => t.done);

      container.innerHTML = filtered.map((t, idx) => `
        <label class="flex items-start justify-between p-3 rounded-xl bg-brandcard/50 border border-brandborder hover:border-slate-700 cursor-pointer transition-colors">
          <div class="flex items-start space-x-3">
            <input type="checkbox" onchange="toggleTaskDone('${t.id}')" ${t.done ? 'checked' : ''} class="mt-0.5 rounded text-brandgold bg-brandcard border-slate-700 w-4 h-4">
            <div>
              <span class="${t.done ? 'line-through text-slate-500' : 'text-white font-bold'} text-xs">${escapeHtml(t.title)}</span>
              <div class="text-[10px] text-slate-400 font-mono mt-0.5">${escapeHtml(t.sub)}</div>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded text-[9px] font-bold ${t.priority === 'Urgent' ? 'bg-rose-950 text-rose-400 border border-rose-800' : (t.priority === 'High' ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-400')}">
            ${t.priority}
          </span>
        </label>
      `).join('');
    }

    function toggleTaskDone(id) {
      const t = crmTasks.find(item => item.id === id);
      if (t) {
        t.done = !t.done;
        persist();
        renderTasksModal();
      }
    }

    function addTaskFromModal() {
      const input = document.getElementById('modal-task-input');
      const priority = document.getElementById('modal-task-priority').value;
      if (!input || !input.value.trim()) return;

      const newTask = {
        id: "TSK-" + Math.floor(100 + Math.random() * 900),
        title: input.value.trim(),
        sub: "Created Today • High Priority",
        done: false,
        priority: priority
      };

      crmTasks.unshift(newTask);
      persist();
      renderTasksModal();
      input.value = "";
    }

    // SIMULATE INCOMING META LEAD (With Full Workflow Tracking)
    function simulateIncomingMetaLead() {
      const metaSampleNames = [
        { name: "Hareshbhai Dholakiya", comp: "Dholakiya Gems", form: "Surat Founders Video 04" },
        { name: "Ketan Savaliya", comp: "Savaliya Textiles", form: "Gujarat SMBs Carousel" },
        { name: "Dhaval Gajera", comp: "Gajera Real Estate", form: "Surat Founders Video 04" },
        { name: "Bhavin Patel", comp: "Patel Agro Exports", form: "Gujarat SMBs Carousel" },
        { name: "Jignesh Vaghani", comp: "Vaghani Diamond Tools", form: "Surat Founders Video 04" }
      ];

      const chosen = metaSampleNames[Math.floor(Math.random() * metaSampleNames.length)];
      const randomPhone = "98" + Math.floor(10000000 + Math.random() * 90000000);
      
      const newLead = {
        id: "LD-" + Math.floor(10000 + Math.random() * 90000),
        name: chosen.name,
        phone: randomPhone,
        email: "",
        company: chosen.comp,
        website: "",
        source: "Meta Ads",
        status: "New",
        nextAction: "Initial Call Due",
        score: 84,
        temp: "HOT",
        assigned: "Unassigned",
        location: "Surat",
        budget: "",
        urgency: "High",
        decisionMaker: "Unknown",
        meetingDate: "",
        meetingTime: "",
        meetingType: "",
        callStatus: "Pending",
        callDuration: "",
        meetingStatus: "Pending",
        proposalStatus: "Pending",
        followupStatus: "Pending",
        adCampaign: chosen.form
      };

      crmLeads.unshift(newLead);
      persist();
      renderTable();
      renderAllViews();
      
      showToastNotification(`🎉 New Meta Lead Ingested: ${newLead.name} (${newLead.company}) — Call SLA Active (<15m) & Missing Details Tracked!`);
    }

    // TOAST NOTIFICATIONS
    function showToastNotification(msg) {
      let toast = document.getElementById('app-live-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-live-toast';
        toast.className = 'fixed bottom-5 right-5 z-50 p-4 rounded-xl bg-slate-900 border border-brandgold/60 text-white shadow-2xl text-xs max-w-sm flex items-start space-x-3 animate-bounce';
        document.body.appendChild(toast);
      }
      toast.innerHTML = `
        <span class="text-xl">⚡</span>
        <div class="flex-1">
          <div class="font-bold text-brandgold font-brand">Bulletproof Automation</div>
          <div class="text-slate-200 mt-0.5">${escapeHtml(msg)}</div>
        </div>
        <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-white">✕</button>
      `;
      setTimeout(() => { if (toast && toast.parentElement) toast.remove(); }, 6000);
    }

    // DRAWER LOGIC WITH WORKFLOW CHECKLIST
    function openLeadDrawer(leadId) {
      const lead = crmLeads.find(l => l.id === leadId) || crmLeads[0];
      if (!lead) return;
      activeLeadId = lead.id;

      document.getElementById('drawer-lead-name').innerText = lead.name;
      document.getElementById('drawer-lead-company').innerText = lead.company || "Bulletproof Prospect";
      document.getElementById('drawer-phone').innerText = lead.phone;
      document.getElementById('drawer-email').innerText = lead.email || ((lead.name.toLowerCase().split(' ')[0] || "client") + "@" + (lead.company ? lead.company.toLowerCase().replace(/\\s/g,'') + ".com" : "gmail.com"));
      document.getElementById('drawer-company-name').innerText = lead.company || "Enterprise";
      document.getElementById('drawer-website-link').href = lead.website || "#";
      document.getElementById('drawer-website-link').innerText = (lead.website || "bulletproofbrands.com").replace('https://','');
      document.getElementById('drawer-location').innerText = lead.location || "Surat";
      document.getElementById('drawer-source').innerText = lead.source || "Meta Ads";
      document.getElementById('drawer-meeting-person').innerText = lead.assigned || "Smit Sir";
      document.getElementById('drawer-meeting-type').innerText = lead.meetingType || "Office Meeting";
      document.getElementById('drawer-assigned-to').innerText = lead.assigned || "Smit Sir";
      document.getElementById('drawer-gauge-score').innerText = lead.score || "86";
      document.getElementById('drawer-lead-score-badge').innerText = (lead.score || 86) + "/100";
      document.getElementById('drawer-lead-temp-badge').innerText = (lead.temp || "HOT") + " LEAD";
      document.getElementById('drawer-budget').innerText = lead.budget || "₹50,000–₹1,00,000";
      document.getElementById('drawer-call-btn').href = "tel:" + lead.phone;

      const circle = document.getElementById('score-gauge-bar');
      if (circle) circle.style.strokeDasharray = `${lead.score || 86} 100`;

      // Render Dynamic Workflow Checklist in Drawer
      const wfList = document.getElementById('drawer-workflow-items-list');
      if (wfList) {
        wfList.innerHTML = `
          <div class="p-2.5 rounded-lg bg-brandbg border border-brandborder flex items-center justify-between">
            <div class="flex items-center space-x-2.5">
              <span class="text-base">${lead.callStatus === 'Done' ? '✅' : '📞'}</span>
              <div>
                <div class="font-bold text-white text-xs">Step 1: Discovery Call</div>
                <div class="text-[10px] text-slate-400 font-mono">${lead.callStatus === 'Done' ? `Connected (${lead.callDuration || '6m 42s'})` : 'Call Pending — SLA Breached'}</div>
              </div>
            </div>
            ${lead.callStatus === 'Done' ? `
              <span class="text-[10px] text-emerald-400 font-bold">COMPLETED</span>
            ` : `
              <button onclick="quickMarkCallDone('${lead.id}')" class="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px]">
                Mark Called
              </button>
            `}
          </div>

          <div class="p-2.5 rounded-lg bg-brandbg border border-brandborder flex items-center justify-between">
            <div class="flex items-center space-x-2.5">
              <span class="text-base">${lead.meetingDate ? '✅' : '🗓'}</span>
              <div>
                <div class="font-bold text-white text-xs">Step 2: Consultation Meeting</div>
                <div class="text-[10px] text-slate-400 font-mono">${lead.meetingDate ? `${lead.meetingDate} at ${lead.meetingTime || '4:00 PM'}` : 'Not Booked Yet'}</div>
              </div>
            </div>
            ${lead.meetingDate ? `
              <span class="text-[10px] text-blue-400 font-bold">CONFIRMED</span>
            ` : `
              <button onclick="openMeetingModal()" class="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px]">
                Book Meeting
              </button>
            `}
          </div>

          <div class="p-2.5 rounded-lg bg-brandbg border border-brandborder flex items-center justify-between">
            <div class="flex items-center space-x-2.5">
              <span class="text-base">${lead.proposalStatus === 'Accepted' || lead.proposalStatus === 'Sent' ? '✅' : '📄'}</span>
              <div>
                <div class="font-bold text-white text-xs">Step 3: Custom Proposal</div>
                <div class="text-[10px] text-slate-400 font-mono">${lead.proposalStatus || 'Draft Pending'}</div>
              </div>
            </div>
            ${lead.proposalStatus === 'Accepted' ? `
              <span class="text-[10px] text-emerald-400 font-bold">ACCEPTED</span>
            ` : (lead.proposalStatus === 'Sent' ? `
              <span class="text-[10px] text-blue-400 font-bold">SENT</span>
            ` : `
              <button onclick="openProposalModal()" class="px-2 py-0.5 rounded bg-brandcard hover:bg-slate-700 text-brandgold font-bold text-[10px]">
                Draft Proposal
              </button>
            `)}
          </div>
        `;
      }

      // Check missing details
      const missing = getLeadMissingDetails(lead);
      const missingBox = document.getElementById('drawer-missing-details-alert');
      const missingText = document.getElementById('drawer-missing-details-text');
      const compBadge = document.getElementById('drawer-workflow-completion-badge');

      if (missing.length > 0) {
        if (missingBox) missingBox.classList.remove('hidden');
        if (missingText) missingText.innerText = missing.join(', ');
        if (compBadge) {
          compBadge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30";
          compBadge.innerText = `${missing.length} Details Missing`;
        }
      } else {
        if (missingBox) missingBox.classList.add('hidden');
        if (compBadge) {
          compBadge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
          compBadge.innerText = "All Details Complete ✓";
        }
      }

      document.getElementById('lead-drawer').classList.remove('translate-x-full');
    }

    function closeLeadDrawer() {
      document.getElementById('lead-drawer').classList.add('translate-x-full');
    }

    function switchDrawerTab(tab) {
      ['details', 'timeline', 'notes', 'documents', 'tasks'].forEach(t => {
        const body = document.getElementById(`drawer-tab-${t}`);
        const btn = document.getElementById(`dtab-${t}`);
        if (body && btn) {
          if (t === tab) {
            body.classList.remove('hidden');
            btn.className = "py-2.5 px-3 border-b-2 border-brandgold text-brandgold";
          } else {
            body.classList.add('hidden');
            btn.className = "py-2.5 px-3 border-b-2 border-transparent text-slate-400 hover:text-white";
          }
        }
      });
    }

    function addDrawerNote() {
      const noteInput = document.getElementById('drawer-new-note');
      if (!noteInput || !noteInput.value.trim()) return;
      alert("✅ Internal note saved: " + noteInput.value.trim());
      noteInput.value = "";
    }

    // TABLE FILTERS
    function filterLeadsTable(filterType) {
      activeTableFilter = filterType;
      ['all', 'my', 'hot', 'meetings', 'followups'].forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        if (btn) {
          if (t === filterType) {
            btn.className = "px-3 py-1 rounded text-xs font-bold bg-brandgold text-black";
          } else {
            btn.className = "px-3 py-1 rounded text-xs font-medium text-slate-400 hover:text-white";
          }
        }
      });

      if (filterType === 'all') renderTable();
      else if (filterType === 'my') renderTable(crmLeads.filter(l => l.assigned === 'Smit Sir'));
      else if (filterType === 'hot') renderTable(crmLeads.filter(l => l.score >= 80));
      else if (filterType === 'meetings') renderTable(crmLeads.filter(l => l.status === 'Meeting' || l.meetingDate));
      else if (filterType === 'followups') renderTable(crmLeads.filter(l => l.status === 'Follow-up' || l.followupStatus));
    }

    function filterPipelineStage(stage) {
      if (stage === 'all') renderTable();
      else renderTable(crmLeads.filter(l => l.status.toLowerCase() === stage.toLowerCase()));
    }

    function filterByAttention(alertKey) {
      openKpiDrilldown(alertKey);
    }

    function handleGlobalSearch() {
      const q = document.getElementById('global-search').value.toLowerCase();
      const filtered = crmLeads.filter(l => 
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.company && l.company.toLowerCase().includes(q)) ||
        (l.website && l.website.toLowerCase().includes(q))
      );
      renderTable(filtered);
    }

    // WHATSAPP MODAL
    function openWhatsAppModal(leadId, templateKey) {
      const lead = crmLeads.find(l => l.id === leadId) || crmLeads[0];
      if (!lead) return;
      activeLeadId = lead.id;

      let cleanPhone = String(lead.phone).replace(/\\D/g, "");
      if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;

      document.getElementById('wa-modal-sub').innerText = `Normalized: +${cleanPhone} • ${lead.name}`;
      document.getElementById('wa-template-select').value = templateKey || "meeting_confirm";
      changeWhatsAppTemplate();

      document.getElementById('whatsapp-modal').classList.remove('hidden');
    }

    function openWhatsAppModalFromDrawer() {
      if (activeLeadId) openWhatsAppModal(activeLeadId, 'meeting_confirm');
    }

    function changeWhatsAppTemplate() {
      const lead = crmLeads.find(l => l.id === activeLeadId) || crmLeads[0];
      const templateKey = document.getElementById('wa-template-select').value;
      
      const templates = {
        meeting_confirm: `*Namaste ${lead.name} ji,* 🙏\\n\\nTamari consultation meeting *${lead.assigned || 'Smit Sir'}* sathe successfully confirm thai gayi chhe.\\n\\n📌 *Meeting Details:*\\n🗓 *Date:* 30 September 2026\\n⏰ *Time:* ${lead.meetingTime || '4:00 PM'}\\n🏢 *Type:* ${lead.meetingType || 'Office Meeting'}\\n📍 *Location:* Surat\\n🌐 *Website:* ${lead.website || 'siriocraft.com'}\\n\\n_Jo tame koi time change karva mangta hoy to direct reply kari shako chho._\\n\\nLooking forward to meeting you!\\n*Team Bulletproof Brands*\\n_IMPOSSIBLE TO IGNORE_`,
        meeting_reminder: `🔔 *Reminder: Meeting Today*\\n\\nNamaste *${lead.name} ji*,\\nAa quick reminder chhe ke aaje tamari meeting *${lead.meetingTime || '4:00 PM'}* vage schedule chhe.\\n\\n🗓 Date: 30 Sep 2026\\n🏢 Location: Surat\\n🤝 Person: ${lead.assigned || 'Smit Sir'}\\n\\nTamari raah joi rahya chhiye!\\n*Team Bulletproof Brands*`,
        reschedule_not_attend: `*Namaste ${lead.name} ji,* 🙏\\n\\nAaje tamari consultation meeting schedule hati, parantu tame attend nathi kari shakya.\\nTame have kyare free chho meeting reschedule karva mate? Please tamaro anukool samay janavjo.\\n\\n*Team Bulletproof Brands*`,
        call_nr: `*Namaste ${lead.name} ji,* 🙏\\n\\nAme *Bulletproof Brands* mathi tamari inquiry anusamdhan call karyo hato, parantu call receive nathi thayo.\\nTame have kyare call par vaat kari shaksho? Reply apva vinanti.\\n\\n*Team Bulletproof Brands*`,
        proposal_fu_1: `*Namaste ${lead.name} ji,* 🙏\\n\\nAme tamne moklelo brand & website proposal check karyo? Koi questions hoy to janavjo, Smit Sir sathe quick call set kari shakay chhe.\\n\\n*Team Bulletproof Brands*`,
        proposal_fu_3: `*Namaste ${lead.name} ji,*\\n\\nAapna brand project sambhandhit aa amaro aakhri follow-up chhe. Jo have project plan pending hoy to amne janavjo.\\n\\nDhanyawad,\\n*Bulletproof Brands*`
      };

      const msg = templates[templateKey] || templates.meeting_confirm;
      document.getElementById('wa-preview-text').value = msg;

      let cleanPhone = String(lead.phone).replace(/\\D/g, "");
      if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;

      document.getElementById('wa-send-link').href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    }

    function dispatchQuickTemplate(templateKey) {
      openWhatsAppModal(crmLeads[0].id, templateKey);
    }

    function closeWhatsAppModal() {
      document.getElementById('whatsapp-modal').classList.add('hidden');
    }

    function copyWhatsAppText() {
      const text = document.getElementById('wa-preview-text').value;
      navigator.clipboard.writeText(text);
      alert("✅ WhatsApp message copied!");
    }

    // SHARE SUMMARY MODAL
    function openShareSummaryModal() {
      const lead = crmLeads.find(l => l.id === activeLeadId) || crmLeads[0];
      const summary = `BULLETPROOF BRANDS\\n\\nCLIENT: ${lead.name}\\nCOMPANY: ${lead.company}\\nPHONE: ${lead.phone}\\nDATE: 30 September 2026\\nTIME: ${lead.meetingTime || '4:00 PM'}\\nMEETING: ${lead.meetingType || 'Office Meeting'}\\nMEETING PERSON: ${lead.assigned || 'Smit Sir'}\\nLOCATION: ${lead.location || 'Surat'}\\nWEBSITE: ${lead.website || 'siriocraft.com'}\\nSTATUS: ${lead.status}`;
      
      document.getElementById('share-content').innerText = summary;
      document.getElementById('share-modal').classList.remove('hidden');
    }

    function closeShareModal() {
      document.getElementById('share-modal').classList.add('hidden');
    }

    function copyShareSummary() {
      const text = document.getElementById('share-content').innerText;
      navigator.clipboard.writeText(text);
      alert("✅ Client Summary Copied!");
    }

    // ADD LEAD MODAL
    function openLeadModal() {
      document.getElementById('lead-form').reset();
      document.getElementById('form-lead-id').value = "";
      
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      const todayStr = `${dd}-${mm}-${yyyy}`;
      
      let hour = now.getHours() + 1;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = (hour % 12) || 12;
      const timeStr = `${String(formattedHour).padStart(2, '0')}:00 ${ampm}`;

      document.getElementById('form-meeting-date').placeholder = `e.g. ${todayStr}`;
      document.getElementById('form-meeting-time').placeholder = `e.g. ${timeStr}`;
      document.getElementById('form-meeting-date').value = "";
      document.getElementById('form-meeting-time').value = "";

      document.getElementById('lead-modal').classList.remove('hidden');
    }

    function closeLeadModal() {
      document.getElementById('lead-modal').classList.add('hidden');
    }

    function handleLeadSubmit(e) {
      e.preventDefault();
      const leadObj = {
        id: document.getElementById('form-lead-id').value || "LD-" + Math.floor(10000 + Math.random() * 90000),
        name: document.getElementById('form-name').value.trim(),
        phone: document.getElementById('form-phone').value.trim(),
        company: document.getElementById('form-company').value.trim(),
        website: document.getElementById('form-website').value.trim(),
        email: "",
        source: document.getElementById('form-source').value,
        assigned: document.getElementById('form-assigned').value,
        status: document.getElementById('form-status').value,
        meetingDate: document.getElementById('form-meeting-date').value.trim(),
        meetingTime: document.getElementById('form-meeting-time').value.trim(),
        meetingType: "Office Meeting",
        nextAction: document.getElementById('form-meeting-date').value ? `Meeting ${document.getElementById('form-meeting-date').value}` : "Initial Call",
        score: 80,
        temp: "HOT",
        location: "Surat",
        budget: "₹50,000–₹1,00,000",
        decisionMaker: "Yes",
        callStatus: "Pending",
        meetingStatus: document.getElementById('form-meeting-date').value ? "Scheduled" : "Pending",
        proposalStatus: "Pending",
        followupStatus: "Pending"
      };

      crmLeads.unshift(leadObj);
      persist();
      renderTable();
      renderAllViews();
      closeLeadModal();
      showToastNotification(`🎉 New Lead Added: ${leadObj.name} (${leadObj.company})!`);
    }

    // CALL MODAL
    function openCallModal() {
      const select = document.getElementById('call-form-lead');
      if (select) select.innerHTML = crmLeads.map(l => `<option value="${l.id}">${escapeHtml(l.name)} (${escapeHtml(l.company)})</option>`).join('');
      document.getElementById('call-modal').classList.remove('hidden');
    }

    function closeCallModal() {
      document.getElementById('call-modal').classList.add('hidden');
    }

    function handleCallSubmit(e) {
      e.preventDefault();
      const leadId = document.getElementById('call-form-lead').value;
      const lead = crmLeads.find(l => l.id === leadId);
      const disposition = document.getElementById('call-form-disposition').value;
      const newCall = {
        time: "Just Now",
        name: lead ? lead.name : "Client",
        company: lead ? lead.company : "Enterprise",
        outcome: disposition,
        duration: document.getElementById('call-form-duration').value || "3m 10s",
        notes: document.getElementById('call-form-notes').value || "Discussed requirements.",
        caller: "Smit Sir"
      };

      if (lead) {
        lead.callStatus = disposition === 'Connected' ? 'Done' : 'No Answer';
        lead.callDuration = newCall.duration;
        if (disposition === 'Connected' && lead.status === 'New') {
          lead.status = 'Contacted';
        }
      }

      crmCalls.unshift(newCall);
      persist();
      renderCallsLog();
      renderTable();
      closeCallModal();
      showToastNotification(`📞 Call Disposition logged: ${disposition}!`);
    }

    // MEETING MODAL
    function openMeetingModal() {
      const select = document.getElementById('meeting-form-lead');
      if (select) select.innerHTML = crmLeads.map(l => `<option value="${l.id}">${escapeHtml(l.name)} (${escapeHtml(l.company)})</option>`).join('');
      document.getElementById('meeting-modal').classList.remove('hidden');
    }

    function closeMeetingModal() {
      document.getElementById('meeting-modal').classList.add('hidden');
    }

    function handleMeetingSubmit(e) {
      e.preventDefault();
      const leadId = document.getElementById('meeting-form-lead').value;
      const lead = crmLeads.find(l => l.id === leadId);
      if (lead) {
        lead.meetingDate = document.getElementById('meeting-form-date').value;
        lead.meetingTime = document.getElementById('meeting-form-time').value;
        lead.meetingType = document.getElementById('meeting-form-type').value;
        lead.assigned = document.getElementById('meeting-form-host').value;
        lead.meetingStatus = "Scheduled";
        lead.status = "Meeting";
        persist();
        renderMeetingsTable();
        renderTable();
        showToastNotification(`📅 Meeting Scheduled with ${lead.name} on ${lead.meetingDate} at ${lead.meetingTime}!`);
      }
      closeMeetingModal();
    }

    // PROPOSAL MODAL
    function openProposalModal() {
      const select = document.getElementById('prop-form-lead');
      if (select) select.innerHTML = crmLeads.map(l => `<option value="${l.id}">${escapeHtml(l.name)} (${escapeHtml(l.company)})</option>`).join('');
      document.getElementById('proposal-modal').classList.remove('hidden');
    }

    function closeProposalModal() {
      document.getElementById('proposal-modal').classList.add('hidden');
    }

    function handleProposalSubmit(e) {
      e.preventDefault();
      const leadId = document.getElementById('prop-form-lead').value;
      const lead = crmLeads.find(l => l.id === leadId);
      const newProp = {
        id: "PROP-" + Math.floor(1000 + Math.random() * 9000),
        client: lead ? lead.name : "Client",
        company: lead ? lead.company : "Enterprise",
        scope: document.getElementById('prop-form-scope').value,
        amount: Number(document.getElementById('prop-form-amount').value),
        date: "Today",
        status: document.getElementById('prop-form-status').value
      };

      if (lead) {
        lead.proposalStatus = newProp.status;
        lead.status = "Proposal";
      }

      crmProposals.unshift(newProp);
      persist();
      renderProposalsTable();
      renderTable();
      closeProposalModal();
      showToastNotification(`📄 Proposal ${newProp.id} created for ₹${newProp.amount.toLocaleString('en-IN')}!`);
    }

    // PAYMENT MODAL
    function openPaymentModal() {
      const select = document.getElementById('pay-form-client');
      if (select) {
        select.innerHTML = crmLeads.map(l => `<option value="${escapeHtml(l.name)} — ${escapeHtml(l.company || 'Enterprise')}">${escapeHtml(l.name)} — ${escapeHtml(l.company || 'Enterprise')}</option>`).join('');
      }
      document.getElementById('pay-form-amount').value = "";
      document.getElementById('pay-form-desc').value = "";
      document.getElementById('payment-modal').classList.remove('hidden');
    }

    function closePaymentModal() {
      document.getElementById('payment-modal').classList.add('hidden');
    }

    function handlePaymentSubmit(e) {
      e.preventDefault();
      const newPayment = {
        id: "INV-2026-" + Math.floor(100 + Math.random() * 900),
        client: document.getElementById('pay-form-client').value.split('—')[0].trim(),
        company: (document.getElementById('pay-form-client').value.split('—')[1] || "Enterprise").trim(),
        desc: document.getElementById('pay-form-desc').value,
        amount: Number(document.getElementById('pay-form-amount').value),
        due: "Today",
        status: "Paid"
      };

      crmPayments.unshift(newPayment);
      persist();
      renderPaymentsTable();
      closePaymentModal();
      showToastNotification(`💰 Payment Recorded: ₹${newPayment.amount.toLocaleString('en-IN')} from ${newPayment.client}!`);
    }

    // KANBAN BOARD
    function renderKanban() {
      const container = document.getElementById('leads-kanban-container');
      if (!container) return;

      const stages = ['New', 'Contacted', 'Qualified', 'Meeting', 'Proposal', 'Won'];
      container.innerHTML = stages.map(st => {
        const stageLeads = crmLeads.filter(l => l.status.toLowerCase() === st.toLowerCase());
        return `
          <div class="glass-card p-3 flex flex-col h-full bg-brandcard/30">
            <div class="flex items-center justify-between pb-2 mb-2 border-b border-brandborder/50">
              <span class="font-bold text-xs text-white">${st}</span>
              <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-brandgold font-bold">${stageLeads.length}</span>
            </div>
            <div class="space-y-2 flex-1 overflow-y-auto">
              ${stageLeads.map(l => {
                const missing = getLeadMissingDetails(l);
                return `
                  <div onclick="openLeadDrawer('${l.id}')" class="p-2.5 rounded-lg bg-brandbg border border-brandborder hover:border-brandgold/50 cursor-pointer transition-all">
                    <div class="flex justify-between items-start">
                      <span class="font-bold text-white text-xs">${escapeHtml(l.name)}</span>
                      <span class="text-[9px] px-1 rounded bg-rose-500/20 text-rose-400 font-bold font-mono">${l.score}</span>
                    </div>
                    <div class="text-[10px] text-brandgold font-semibold mt-0.5">${escapeHtml(l.company)}</div>
                    <div class="text-[10px] text-slate-400 mt-1">${l.budget || '₹50k+'}</div>
                    ${missing.length > 0 ? `<div class="text-[9px] text-rose-400 font-bold mt-1">⚠️ ${missing.length} Missing Info</div>` : ''}
                    <div class="flex items-center justify-between mt-2 pt-1 border-t border-brandborder/40 text-[10px]">
                      <span class="text-slate-400">${l.assigned}</span>
                      <span class="text-sky-400">View ↗</span>
                    </div>
                  </div>
                `;
              }).join('')}
              ${stageLeads.length === 0 ? '<div class="text-[10px] text-slate-600 text-center py-4">No leads</div>' : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    function setLeadsViewMode(mode) {
      const kanban = document.getElementById('leads-kanban-container');
      const table = document.getElementById('leads-table-container');
      const kBtn = document.getElementById('mode-btn-kanban');
      const tBtn = document.getElementById('mode-btn-table');

      if (mode === 'kanban') {
        kanban.classList.remove('hidden');
        table.classList.add('hidden');
        kBtn.className = "px-3 py-1 rounded text-xs font-semibold bg-brandgold text-black";
        tBtn.className = "px-3 py-1 rounded text-xs font-medium text-slate-400 hover:text-white";
      } else {
        kanban.classList.add('hidden');
        table.classList.remove('hidden');
        tBtn.className = "px-3 py-1 rounded text-xs font-semibold bg-brandgold text-black";
        kBtn.className = "px-3 py-1 rounded text-xs font-medium text-slate-400 hover:text-white";
      }
    }

    function renderFullLeadsTable() {
      const tbody = document.getElementById('full-leads-table-body');
      if (!tbody) return;
      tbody.innerHTML = crmLeads.map(l => {
        const missing = getLeadMissingDetails(l);
        return `
          <tr class="hover:bg-brandcard/70 transition-colors cursor-pointer" onclick="openLeadDrawer('${l.id}')">
            <td class="p-2.5 font-bold text-white">${escapeHtml(l.name)}</td>
            <td class="p-2.5 text-slate-400 font-mono">${l.phone}</td>
            <td class="p-2.5 text-brandgold font-semibold">${escapeHtml(l.company)}</td>
            <td class="p-2.5 text-slate-400">${escapeHtml(l.source)}</td>
            <td class="p-2.5"><span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">${l.status}</span></td>
            <td class="p-2.5 font-mono text-emerald-400 font-bold">${l.score} ${l.temp}</td>
            <td class="p-2.5 text-slate-300">
              ${l.assigned}
              ${missing.length > 0 ? `<span class="text-rose-400 block text-[9px] font-bold">⚠️ ${missing.length} Missing Info</span>` : ''}
            </td>
            <td class="p-2.5 text-right space-x-1" onclick="event.stopPropagation()">
              <button onclick="openWhatsAppModal('${l.id}')" class="p-1 rounded bg-emerald-950 text-emerald-400">📲</button>
              <button onclick="openEditDetailsModal('${l.id}')" class="p-1 rounded bg-brandcard text-brandgold">✏️</button>
              <button onclick="deleteLead('${l.id}')" class="p-1 rounded bg-rose-950 text-rose-400">🗑</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    function deleteLead(id) {
      if (confirm("Are you sure you want to remove this lead?")) {
        crmLeads = crmLeads.filter(l => l.id !== id);
        persist();
        renderTable();
        renderAllViews();
      }
    }

    function exportLeadsCSV() {
      let csv = "ID,Name,Phone,Company,Source,Status,Score,Assigned,CallStatus,MeetingStatus,ProposalStatus\\n";
      crmLeads.forEach(l => {
        csv += `"${l.id}","${l.name}","${l.phone}","${l.company}","${l.source}","${l.status}","${l.score}","${l.assigned}","${l.callStatus || ''}","${l.meetingStatus || ''}","${l.proposalStatus || ''}"\\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bulletproof_Leads_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
    }

    // CALLS LOG
    function renderCallsLog() {
      const tbody = document.getElementById('calls-log-body');
      if (!tbody) return;
      tbody.innerHTML = crmCalls.map(c => `
        <tr class="hover:bg-brandcard/70 transition-colors">
          <td class="p-2.5 font-mono text-slate-400">${c.time}</td>
          <td class="p-2.5 font-bold text-white">${escapeHtml(c.name)}</td>
          <td class="p-2.5 text-brandgold font-semibold">${escapeHtml(c.company)}</td>
          <td class="p-2.5">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${c.outcome === 'Connected' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}">
              ${c.outcome}
            </span>
          </td>
          <td class="p-2.5 font-mono text-slate-300">${c.duration}</td>
          <td class="p-2.5 text-slate-300 max-w-xs truncate">${escapeHtml(c.notes)}</td>
          <td class="p-2.5 text-slate-400">${c.caller}</td>
          <td class="p-2.5 text-right space-x-1">
            <button onclick="dispatchQuickTemplate('call_nr')" class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">WA ↗</button>
          </td>
        </tr>
      `).join('');
    }

    // MEETINGS TABLE
    function renderMeetingsTable() {
      const tbody = document.getElementById('meetings-table-body');
      if (!tbody) return;
      const meetings = crmLeads.filter(l => l.status === 'Meeting' || l.meetingTime || l.meetingDate);
      tbody.innerHTML = meetings.map(m => `
        <tr class="hover:bg-brandcard/70 transition-colors">
          <td class="p-2.5 font-mono text-brandgold font-bold">${m.meetingDate || '30-09-2026'} • ${m.meetingTime || '4:00 PM'}</td>
          <td class="p-2.5 font-bold text-white">${escapeHtml(m.name)}</td>
          <td class="p-2.5 text-slate-300 font-semibold">${escapeHtml(m.company)}</td>
          <td class="p-2.5 text-slate-400">${m.meetingType || 'Office Meeting'}</td>
          <td class="p-2.5 text-sky-400 font-semibold">${m.assigned}</td>
          <td class="p-2.5"><span class="px-2 py-0.5 rounded bg-blue-950 text-blue-400 font-bold text-[10px]">Confirmed</span></td>
          <td class="p-2.5 text-right space-x-1">
            <button onclick="markMeetingAttendance('${m.id}', 'Show')" class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">Show</button>
            <button onclick="openWhatsAppModal('${m.id}', 'reschedule_not_attend')" class="px-2 py-0.5 rounded bg-rose-950 text-rose-400 font-bold text-[10px]">No-Show</button>
          </td>
        </tr>
      `).join('');
    }

    function markMeetingAttendance(id, status) {
      alert(`✅ Meeting attendance updated: ${status}`);
    }

    // FOLLOW-UPS LISTS
    function renderFollowups() {
      const overdueList = document.getElementById('fu-overdue-list');
      const todayList = document.getElementById('fu-today-list');
      const upcomingList = document.getElementById('fu-upcoming-list');

      if (overdueList) {
        overdueList.innerHTML = `
          <div class="p-2 rounded bg-brandbg border border-rose-900/40 flex justify-between items-center">
            <div><span class="font-bold text-white block">Amit Shah</span><span class="text-[10px] text-slate-400">Quote review • 1 day overdue</span></div>
            <button onclick="openWhatsAppModal('LD-10003', 'proposal_fu_1')" class="px-2 py-1 bg-emerald-950 text-emerald-400 rounded font-bold text-[10px]">WA ↗</button>
          </div>
          <div class="p-2 rounded bg-brandbg border border-rose-900/40 flex justify-between items-center">
            <div><span class="font-bold text-white block">Vishal Parmar</span><span class="text-[10px] text-slate-400">Callback • 3 hours overdue</span></div>
            <button onclick="openWhatsAppModal('LD-10008', 'call_nr')" class="px-2 py-1 bg-emerald-950 text-emerald-400 rounded font-bold text-[10px]">WA ↗</button>
          </div>
        `;
      }

      if (todayList) {
        todayList.innerHTML = `
          <div class="p-2 rounded bg-brandbg border border-amber-900/40 flex justify-between items-center">
            <div><span class="font-bold text-white block">Chiragbhai Moradiya</span><span class="text-[10px] text-slate-400">Post-meeting consultation follow-up</span></div>
            <button onclick="openWhatsAppModal('LD-10001', 'meeting_confirm')" class="px-2 py-1 bg-emerald-950 text-emerald-400 rounded font-bold text-[10px]">WA ↗</button>
          </div>
          <div class="p-2 rounded bg-brandbg border border-amber-900/40 flex justify-between items-center">
            <div><span class="font-bold text-white block">Rajesh Patel</span><span class="text-[10px] text-slate-400">Proposal discussion review</span></div>
            <button onclick="openWhatsAppModal('LD-10002', 'proposal_fu_1')" class="px-2 py-1 bg-emerald-950 text-emerald-400 rounded font-bold text-[10px]">WA ↗</button>
          </div>
        `;
      }

      if (upcomingList) {
        upcomingList.innerHTML = `
          <div class="p-2 rounded bg-brandbg border border-brandborder flex justify-between items-center">
            <div><span class="font-bold text-white block">Pooja Mehta</span><span class="text-[10px] text-slate-400">FU2 (Day 3) • 03 Oct</span></div>
            <span class="text-[10px] text-slate-500">Scheduled</span>
          </div>
          <div class="p-2 rounded bg-brandbg border border-brandborder flex justify-between items-center">
            <div><span class="font-bold text-white block">Mehul Trivedi</span><span class="text-[10px] text-slate-400">FU1 (24h) • 02 Oct</span></div>
            <span class="text-[10px] text-slate-500">Scheduled</span>
          </div>
        `;
      }
    }

    // PROPOSALS TABLE
    function renderProposalsTable() {
      const tbody = document.getElementById('proposals-table-body');
      if (!tbody) return;
      tbody.innerHTML = crmProposals.map(p => `
        <tr class="hover:bg-brandcard/70 transition-colors">
          <td class="p-2.5 font-mono text-brandgold font-bold">${p.id}</td>
          <td class="p-2.5 font-bold text-white">${escapeHtml(p.client)} <span class="text-slate-400 block text-[10px]">${escapeHtml(p.company)}</span></td>
          <td class="p-2.5 text-slate-300">${p.scope}</td>
          <td class="p-2.5 font-mono font-bold text-white">₹${Number(p.amount).toLocaleString('en-IN')}</td>
          <td class="p-2.5 text-slate-400 font-mono">${p.date}</td>
          <td class="p-2.5">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'Accepted' ? 'bg-emerald-950 text-emerald-400' : (p.status === 'Sent' ? 'bg-blue-950 text-blue-400' : 'bg-slate-800 text-slate-300')}">
              ${p.status}
            </span>
          </td>
          <td class="p-2.5 text-right space-x-1">
            <button onclick="dispatchQuickTemplate('proposal_fu_1')" class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">WA ↗</button>
          </td>
        </tr>
      `).join('');
    }

    // CLIENTS GRID
    function renderClientsGrid() {
      const grid = document.getElementById('clients-cards-grid');
      if (!grid) return;
      const clients = [
        { name: "Chiragbhai Moradiya", comp: "Siriocraft", rev: "₹95,000", status: "Active Retainer", tags: ["Shopify", "Meta Ads"] },
        { name: "Rajesh Patel", comp: "Patel Enterprise", rev: "₹1,50,000", status: "Scaling Stage", tags: ["B2B Funnel", "Lead Engine"] },
        { name: "Ramesh Vora", comp: "Luxe Apparel", rev: "₹80,000", status: "Active Project", tags: ["Brand Identity", "Packaging"] },
        { name: "Mehul Trivedi", comp: "Trivedi Exports", rev: "₹1,20,000", status: "Contract Signed", tags: ["Export SEO", "Web Catalog"] }
      ];

      grid.innerHTML = clients.map(c => `
        <div class="glass-card p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-white font-brand">${c.name}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">${c.status}</span>
          </div>
          <div class="text-xs text-brandgold font-semibold">${c.comp}</div>
          <div class="flex justify-between items-center text-xs pt-1 border-t border-brandborder/50">
            <span class="text-slate-400">Total Value</span>
            <span class="font-mono font-bold text-white">${c.rev}</span>
          </div>
          <div class="flex flex-wrap gap-1 pt-1">
            ${c.tags.map(t => `<span class="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[9px]">${t}</span>`).join('')}
          </div>
        </div>
      `).join('');
    }

    // PROJECTS LIST
    function renderProjectsList() {
      const tbody = document.getElementById('projects-table-body');
      if (!tbody) return;
      const projs = [
        { id: "PRJ-901", client: "Chiragbhai Moradiya", comp: "Siriocraft", title: "Brand Identity & Shopify D2C", progress: 75, lead: "Smit Sir" },
        { id: "PRJ-902", client: "Rajesh Patel", comp: "Patel Enterprise", title: "Meta Lead Gen System v2", progress: 40, lead: "Rahul" },
        { id: "PRJ-903", client: "Mehul Trivedi", comp: "Trivedi Exports", title: "Corporate Web App & SEO", progress: 15, lead: "Jay" }
      ];

      tbody.innerHTML = projs.map(p => `
        <tr class="hover:bg-brandcard/70 transition-colors">
          <td class="p-2.5 font-mono text-brandgold font-bold">${p.id}</td>
          <td class="p-2.5 font-bold text-white">${escapeHtml(p.client)} <span class="text-slate-400 block text-[10px]">${p.comp}</span></td>
          <td class="p-2.5 text-slate-300">${p.title}</td>
          <td class="p-2.5">
            <div class="w-full bg-brandbg rounded-full h-1.5 max-w-[100px]">
              <div class="bg-brandgold h-1.5 rounded-full" style="width: ${p.progress}%"></div>
            </div>
            <span class="text-[9px] text-slate-400 font-mono mt-0.5 block">${p.progress}% Complete</span>
          </td>
          <td class="p-2.5 text-sky-400">${p.lead}</td>
          <td class="p-2.5 text-right">
            <button onclick="alert('Viewing project timeline for ${p.id}')" class="px-2 py-0.5 rounded bg-brandcard text-slate-300 text-[10px] hover:text-white">View ↗</button>
          </td>
        </tr>
      `).join('');
    }

    // PAYMENTS TABLE
    function renderPaymentsTable() {
      const tbody = document.getElementById('payments-table-body');
      if (!tbody) return;
      tbody.innerHTML = crmPayments.map(p => `
        <tr class="hover:bg-brandcard/70 transition-colors">
          <td class="p-2.5 font-mono text-brandgold font-bold">${p.id}</td>
          <td class="p-2.5 font-bold text-white">${escapeHtml(p.client)} <span class="text-slate-400 block text-[10px]">${p.company}</span></td>
          <td class="p-2.5 text-slate-300">${p.desc}</td>
          <td class="p-2.5 font-mono font-bold text-white">₹${Number(p.amount).toLocaleString('en-IN')}</td>
          <td class="p-2.5 text-slate-400 font-mono">${p.due}</td>
          <td class="p-2.5">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'Paid' ? 'bg-emerald-950 text-emerald-400' : (p.status === 'Pending' ? 'bg-amber-950 text-amber-400' : 'bg-rose-950 text-rose-400')}">
              ${p.status}
            </span>
          </td>
          <td class="p-2.5 text-right">
            <button onclick="openWhatsAppModal('${crmLeads[0].id}', 'meeting_reminder')" class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">Reminder ↗</button>
          </td>
        </tr>
      `).join('');
    }

    // WHATSAPP HUB
    function renderWhatsAppHub() {
      const select = document.getElementById('hub-lead-select');
      if (select && select.children.length === 0) {
        select.innerHTML = crmLeads.map(l => `<option value="${l.id}">${escapeHtml(l.name)} (${escapeHtml(l.company)}) — ${l.phone}</option>`).join('');
      }
      renderHubPreview();
    }

    function selectHubTemplate(tpl) {
      document.getElementById('hub-template-select').value = tpl;
      renderHubPreview();
    }

    function renderHubPreview() {
      const leadId = document.getElementById('hub-lead-select')?.value || crmLeads[0].id;
      const lead = crmLeads.find(l => l.id === leadId) || crmLeads[0];
      const templateKey = document.getElementById('hub-template-select')?.value || "meeting_confirm";

      const templates = {
        meeting_confirm: `*Namaste ${lead.name} ji,* 🙏\\n\\nTamari consultation meeting *${lead.assigned || 'Smit Sir'}* sathe successfully confirm thai gayi chhe.\\n\\n📌 *Meeting Details:*\\n🗓 *Date:* 30 September 2026\\n⏰ *Time:* ${lead.meetingTime || '4:00 PM'}\\n🏢 *Type:* ${lead.meetingType || 'Office Meeting'}\\n📍 *Location:* Surat\\n🌐 *Website:* ${lead.website || 'siriocraft.com'}\\n\\n_Jo tame koi time change karva mangta hoy to direct reply kari shako chho._\\n\\nLooking forward to meeting you!\\n*Team Bulletproof Brands*\\n_IMPOSSIBLE TO IGNORE_`,
        meeting_reminder: `🔔 *Reminder: Meeting Today*\\n\\nNamaste *${lead.name} ji*,\\nAa quick reminder chhe ke aaje tamari meeting *${lead.meetingTime || '4:00 PM'}* vage schedule chhe.\\n\\n🗓 Date: 30 Sep 2026\\n🏢 Location: Surat\\n🤝 Person: ${lead.assigned || 'Smit Sir'}\\n\\nTamari raah joi rahya chhiye!\\n*Team Bulletproof Brands*`,
        reschedule_not_attend: `*Namaste ${lead.name} ji,* 🙏\\n\\nAaje tamari consultation meeting schedule hati, parantu tame attend nathi kari shakya.\\nTame have kyare free chho meeting reschedule karva mate? Please tamaro anukool samay janavjo.\\n\\n*Team Bulletproof Brands*`,
        call_nr: `*Namaste ${lead.name} ji,* 🙏\\n\\nAme *Bulletproof Brands* mathi tamari inquiry anusamdhan call karyo hato, parantu call receive nathi thayo.\\nTame have kyare call par vaat kari shaksho? Reply apva vinanti.\\n\\n*Team Bulletproof Brands*`,
        proposal_fu_1: `*Namaste ${lead.name} ji,* 🙏\\n\\nAme tamne moklelo brand & website proposal check karyo? Koi questions hoy to janavjo, Smit Sir sathe quick call set kari shakay chhe.\\n\\n*Team Bulletproof Brands*`,
        proposal_fu_3: `*Namaste ${lead.name} ji,*\\n\\nAapna brand project sambhandhit aa amaro aakhri follow-up chhe. Jo have project plan pending hoy to amne janavjo.\\n\\nDhanyawad,\\n*Bulletproof Brands*`
      };

      const msg = templates[templateKey] || templates.meeting_confirm;
      const preview = document.getElementById('hub-message-preview');
      if (preview) preview.value = msg;

      let clean = String(lead.phone).replace(/\\D/g, "");
      if (clean.length === 10) clean = "91" + clean;
      const link = document.getElementById('hub-direct-link');
      if (link) link.href = `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
    }

    function copyHubMessage() {
      const text = document.getElementById('hub-message-preview').value;
      navigator.clipboard.writeText(text);
      alert("✅ WhatsApp message copied to clipboard!");
    }

    // TEAM ROSTER
    function renderTeamRoster() {
      const grid = document.getElementById('team-roster-grid');
      if (!grid) return;
      const reps = [
        { name: "Smit Sir", role: "Closer & Admin", won: 14, rev: "₹4.82L", calls: 86, rate: "92%" },
        { name: "Rahul", role: "Sales Executive", won: 9, rev: "₹2.40L", calls: 78, rate: "76%" },
        { name: "Jay", role: "SDR & Outreach", won: 5, rev: "₹1.18L", calls: 64, rate: "68%" }
      ];

      grid.innerHTML = reps.map(r => `
        <div class="glass-card p-4 space-y-3">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-brandgold text-black font-bold flex items-center justify-center font-brand text-sm">
              ${r.name[0]}
            </div>
            <div>
              <h3 class="font-bold text-white text-sm">${r.name}</h3>
              <span class="text-xs text-slate-400">${r.role}</span>
            </div>
          </div>
          <div class="space-y-1.5 text-xs text-slate-300 pt-1">
            <div class="flex justify-between"><span>Deals Closed:</span> <strong class="text-white font-mono">${r.won}</strong></div>
            <div class="flex justify-between"><span>Total Revenue:</span> <strong class="text-emerald-400 font-mono">${r.rev}</strong></div>
            <div class="flex justify-between"><span>Calls Logged:</span> <strong class="text-slate-200 font-mono">${r.calls}</strong></div>
            <div class="flex justify-between"><span>Meeting Attendance:</span> <strong class="text-brandgold font-mono">${r.rate}</strong></div>
          </div>
        </div>
      `).join('');
    }

    // AUTOMATIONS LIST
    function renderAutomationsList() {
      const grid = document.getElementById('automations-list-grid');
      if (!grid) return;
      const autos = [
        { name: "Instant WhatsApp on Meta Ad Lead", trigger: "Meta Webhook Form Submitted", action: "Send Welcome WhatsApp + Brochure", active: true },
        { name: "2-Hour Pre-Meeting WhatsApp Reminder", trigger: "Meeting Time - 2 Hours", action: "Dispatch Gujarati Reminder with GPS", active: true },
        { name: "Auto-Reschedule on No-Show", trigger: "Meeting Marked 'No-Show'", action: "Send Reschedule Inquiry WhatsApp", active: true },
        { name: "15-Minute Call SLA Escalation", trigger: "Lead Uncontacted > 15m", action: "Notify Assigned Closer & Super Admin", active: true },
        { name: "Dynamic Lead Scoring (0-100)", trigger: "Form Filled / Call Finished", action: "Evaluate Authority + Budget + Timeline", active: true },
        { name: "Auto Client Provisioning on Deal Won", trigger: "Lead Status 'Won'", action: "Create Client, Project & Drive Folder", active: true }
      ];

      grid.innerHTML = autos.map(a => `
        <div class="glass-card p-4 space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-white text-xs">${a.name}</h3>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">ACTIVE</span>
          </div>
          <div class="text-[11px] text-slate-400">⚡ Trigger: <strong class="text-slate-300">${a.trigger}</strong></div>
          <div class="text-[11px] text-slate-400">🎯 Action: <strong class="text-brandgold">${a.action}</strong></div>
        </div>
      `).join('');
    }

    // TEMPLATES MANAGE
    function renderTemplatesManage() {
      const grid = document.getElementById('templates-manage-grid');
      if (!grid) return;
      const tpls = [
        { name: "Meeting Confirmation", cat: "Meeting", vars: "{{name}}, {{meeting_person}}, {{date}}, {{time}}" },
        { name: "2-Hour Reminder", cat: "Meeting", vars: "{{name}}, {{time}}, {{address}}" },
        { name: "No-Show Reschedule", cat: "Meeting", vars: "{{name}}, {{date}}, {{website}}" },
        { name: "Call Unanswered", cat: "Call", vars: "{{name}}, {{website}}" }
      ];

      grid.innerHTML = tpls.map(t => `
        <div class="glass-card p-3.5 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-white text-xs">${t.name}</span>
            <span class="px-1.5 py-0.2 rounded bg-slate-800 text-brandgold font-mono text-[10px]">${t.cat}</span>
          </div>
          <div class="text-[11px] text-slate-400 font-mono">${t.vars}</div>
          <button onclick="switchNav('whatsapp')" class="text-[11px] text-brandgold hover:underline">Edit in WhatsApp Hub ↗</button>
        </div>
      `).join('');
    }

    function toggleSidebar() {
      document.getElementById('main-sidebar').classList.toggle('-translate-x-full');
    }

    function toggleNotifications() {
      openKpiDrilldown('attention_all');
    }

    function runHealthCheck() {
      alert("🛡️ Bulletproof Brands Health Check:\\n✓ Google Sheets Database: 19/19 Sheets Connected\\n✓ CacheService & Mutex Lock: Operational\\n✓ Meta Webhooks API v19.0: Active\\n✓ WhatsApp Dispatcher: Ready\\n✓ Storage Integrity: 100% Valid");
    }

    function addQuickTask() {
      const input = document.getElementById('quick-task-input');
      if (!input || !input.value.trim()) return;

      const newTask = {
        id: "TSK-" + Math.floor(100 + Math.random() * 900),
        title: input.value.trim(),
        sub: "Added Just Now • High Priority",
        done: false,
        priority: "Normal"
      };

      crmTasks.unshift(newTask);
      persist();

      const list = document.getElementById('my-tasks-list');
      if (list) {
        const item = document.createElement('label');
        item.className = "flex items-start space-x-2.5 p-2 rounded-lg bg-brandbg border border-brandborder hover:border-slate-700 cursor-pointer";
        item.innerHTML = `
          <input type="checkbox" onchange="toggleTaskDone('${newTask.id}')" class="mt-0.5 rounded text-brandgold bg-brandcard border-slate-700">
          <div class="flex-1">
            <span class="text-white font-medium">${escapeHtml(newTask.title)}</span>
            <div class="text-[10px] text-slate-500 font-mono">${newTask.sub}</div>
          </div>
        `;
        list.prepend(item);
      }
      input.value = "";
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
      });
    }

    window.addEventListener('keydown', function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search').focus();
      }
    });

    window.onload = init;"""

script_end_idx = content.find(script_end_marker) + len(script_end_marker)
content = content[:script_idx] + new_script_logic + "\n  </script>" + content[script_end_idx:]
print("9. Replaced entire script engine with Full Workflow & Remaining Details tracker")

# Save back to build_full_crm.py
with open("build_full_crm.py", "w", encoding="utf-8") as f:
    f.write(content)

print("10. Saved updated build_full_crm.py successfully!")
