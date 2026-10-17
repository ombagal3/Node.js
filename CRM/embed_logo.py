# embed_logo.py
import base64

with open('bulletproof_dark_logo.png', 'rb') as f:
    b64_logo = base64.b64encode(f.read()).decode('utf-8')

logo_data_uri = f"data:image/png;base64,{b64_logo}"

with open('build_full_crm.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace sidebar logo box
old_sidebar_box = """        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-brandgoldlight to-brandgold flex items-center justify-center text-black font-black font-brand text-lg shadow-lg shadow-amber-500/10">
          BB
        </div>"""

new_sidebar_box = f"""        <div class="w-9 h-9 rounded-lg bg-black border border-brandgold/40 flex items-center justify-center shadow-lg shadow-red-500/10 shrink-0 overflow-hidden p-1">
          <img src="{logo_data_uri}" alt="Bulletproof Logo" class="w-full h-full object-contain">
        </div>"""

if old_sidebar_box in code:
    code = code.replace(old_sidebar_box, new_sidebar_box)
    print("Replaced sidebar logo box with official shield logo!")

# Replace drawer logo box
old_drawer_box = """        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-brandgoldlight to-brandgold flex items-center justify-center text-black font-black font-brand text-xl shadow-lg shadow-amber-500/10 shrink-0">
          BB
        </div>"""

new_drawer_box = f"""        <div class="w-12 h-12 rounded-xl bg-black border border-brandgold/40 flex items-center justify-center shadow-lg shadow-red-500/10 shrink-0 overflow-hidden p-1.5">
          <img src="{logo_data_uri}" alt="Bulletproof Logo" class="w-full h-full object-contain">
        </div>"""

if old_drawer_box in code:
    code = code.replace(old_drawer_box, new_drawer_box)
    print("Replaced drawer logo box with official shield logo!")

with open('build_full_crm.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("build_full_crm.py updated with official logo!")
