import json
from pathlib import Path
from collections import defaultdict
import sys
import re

ROOT = Path(__file__).resolve().parents[1]
meta_file = ROOT / "data" / "meta.json"
langs_dir = ROOT / "data" / "lang"

meta = json.loads(meta_file.read_text(encoding="utf-8"))
cases = meta["casos"]
langs = meta["meta"]["lenguajes"]

# Identify duplicates by 'descripcion' because descriptions define the actual logic to resolve
desc_to_cases = defaultdict(list)
for c in cases:
    # Some descriptions have trailing spaces
    desc = c["descripcion"].strip()
    desc_to_cases[desc].append(c)

cases_to_keep = []
ids_to_remove = set()
removed_count = 0

for desc, case_list in desc_to_cases.items():
    if len(case_list) == 1:
        cases_to_keep.append(case_list[0])
    else:
        # Sort by ID to reliably keep the original (first) case
        case_list.sort(key=lambda x: x["id"])
        
        # Keep the first one, but clean up its name if it has bloat like "Trabajo #X" or identical suffixes
        keeper = case_list[0]
        
        # Clean bloat from name
        keeper["nombre"] = re.sub(r'\s*\(\s*Trabajo\s*#\d+\s*\)', '', keeper["nombre"])
        keeper["nombre"] = re.sub(r'\s*Trabajo\s*#\d+', '', keeper["nombre"])
        
        cases_to_keep.append(keeper)
        
        # Mark the rest for removal
        for duplicate in case_list[1:]:
            ids_to_remove.add(duplicate["id"])
            removed_count += 1

# Update meta.json
# Sort cases by ID to maintain a nice order
cases_to_keep.sort(key=lambda x: x["id"])
meta["casos"] = cases_to_keep

meta_file.write_text(json.dumps(meta, indent=2, ensure_ascii=False) + '\n', encoding="utf-8")
print(f"Removed {removed_count} duplicated case definitions from meta.json.")
print(f"Remaining unique cases: {len(cases_to_keep)}")

# Now clean up language files
langs_cleaned = 0
snippets_removed = 0

for l in langs:
    k = l["key"]
    p = langs_dir / f"{k}.json"
    if not p.exists(): continue
    
    try:
        lang_data = json.loads(p.read_text(encoding="utf-8"))
        modified = False
        
        if "snippets" in lang_data and isinstance(lang_data["snippets"], dict):
            for id_rm in ids_to_remove:
                if id_rm in lang_data["snippets"]:
                    del lang_data["snippets"][id_rm]
                    snippets_removed += 1
                    modified = True
                    
        if "overrides" in lang_data and isinstance(lang_data["overrides"], dict):
            for id_rm in ids_to_remove:
                if id_rm in lang_data["overrides"]:
                    del lang_data["overrides"][id_rm]
                    snippets_removed += 1
                    modified = True
                    
        if modified:
            p.write_text(json.dumps(lang_data, indent=2, ensure_ascii=False) + '\n', encoding="utf-8")
            langs_cleaned += 1
            
    except Exception as e:
        print(f"Error processing {p.name}: {e}")

print(f"Cleaned {langs_cleaned} language files, removing {snippets_removed} deprecated keys.")
