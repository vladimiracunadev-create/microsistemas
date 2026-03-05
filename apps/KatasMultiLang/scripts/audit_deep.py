import json
from pathlib import Path
from collections import defaultdict
import sys

# Get the directory of the script to resolve paths correctly
ROOT = Path(__file__).resolve().parents[1]

try:
    meta_text = (ROOT / "data" / "meta.json").read_text(encoding="utf-8")
    meta = json.loads(meta_text)
except Exception as e:
    print(f"Error loading meta.json: {e}")
    sys.exit(1)

langs = meta["meta"]["lenguajes"]
cases = meta["casos"]
case_dict = {c["id"]: c for c in cases}

lang_json = {}
for l in langs:
    k = l["key"]
    p = ROOT / "data" / "lang" / f"{k}.json"
    if p.exists():
        try:
            lang_json[k] = json.loads(p.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"Error reading {p}: {e}")

def merged_snippets(key, stack=None):
    if stack is None: stack = []
    if key in stack: return {}
    d = lang_json.get(key)
    if not d: return {}
    
    if "snippets" in d and isinstance(d["snippets"], dict) and d["snippets"]:
        return d["snippets"]
        
    base = d.get("extends") or (d.get("language", {}) or {}).get("extends")
    if base:
        base_snips = merged_snippets(base, stack + [key])
        overrides = d.get("overrides", {}) or {}
        merged = dict(base_snips)
        merged.update(overrides)
        return merged
    return d.get("snippets", {}) or {}

placeholders = ["TODO", "FIXME", "PENDING", "PENDIENTE", "IMPLEMENT ME", "NOT IMPLEMENTED"]

issues = []

for l in langs:
    k = l["key"]
    snips = merged_snippets(k)
    
    # Check for identical snippets within the same language (excluding TODOs)
    snippet_content_to_ids = defaultdict(list)
    
    for cid, val in snips.items():
        if cid not in case_dict:
            continue
            
        val_str = str(val).strip()
        val_upper = val_str.upper()
        
        is_placeholder = False
        if not val_str or len(val_str) < 5:
            is_placeholder = True
        else:
            for p in placeholders:
                if p in val_upper:
                    is_placeholder = True
                    break
                    
        if not is_placeholder:
            # Normalize snippet string to ignore minor whitespace differences
            norm_val = " ".join(val_str.split())
            snippet_content_to_ids[norm_val].append(cid)

    # Report duplicates
    for content, cids in snippet_content_to_ids.items():
        if len(cids) > 1:
            # Check if these are the duplicates we already know about (the bloated ones with "Trabajo #X")
            is_all_bloat = all("Trabajo #" in case_dict[cid]["nombre"] or case_dict[cid]["nombre"].endswith(")") for cid in cids)
            
            case_names = [f"{cid} ({case_dict[cid]['nombre']})" for cid in cids]
            
            severity = "LOW" if is_all_bloat else "HIGH"
            issues.append(f"[{severity}][{k}] CODE DUPLICATION: {', '.join(case_names)}.\nSnippet preview: {content[:100]}...\n")

issues.sort()

high_issues_count = sum(1 for i in issues if "[HIGH]" in i)

print(f"Deep Audit completed. Found {len(issues)} instances of identical code being used across different problem IDs.")
print(f"Of those, {high_issues_count} are HIGH severity (not related to the known inflated case bloat).")

if issues:
    (ROOT / "audit_deep_log.txt").write_text("\n".join(issues), encoding="utf-8")
    for i in issues[:10]:
        print(i.split('\n')[0])
