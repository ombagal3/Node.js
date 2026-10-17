# build_full_crm.py
import os

with open(r'c:\Users\NAYAN\Downloads\Bulletproof lead Dashboard\Dashboard.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

with open(r'c:\Users\NAYAN\Downloads\Bulletproof lead Dashboard\index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print('Synchronized Dashboard.html and index.html! Length:', len(html_content))
