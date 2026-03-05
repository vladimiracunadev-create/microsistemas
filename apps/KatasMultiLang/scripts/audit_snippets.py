import json
from pathlib import Path
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

suspicious = []
placeholders = ["TODO", "FIXME", "PENDING", "PENDIENTE", "IMPLEMENT ME", "NOT IMPLEMENTED"]

total_snippets_checked = 0

for l in langs:
    k = l["key"]
    snips = merged_snippets(k)
    for c in cases:
        cid = c["id"]
        cname = c["nombre"]
        if cid not in snips:
            continue
            
        total_snippets_checked += 1
        
        val = str(snips[cid]).strip()
        
        # Check empty or very short
        if not val or (len(val) < 2 and cname.lower() != val.lower()):
            suspicious.append(f"[{k}] {cid} ({cname}): Very short or empty -> '{val}'")
            continue
            
        # Check placeholders
        val_upper = val.upper()
        for p in placeholders:
            if p in val_upper:
                suspicious.append(f"[{k}] {cid} ({cname}): Contains placeholder '{p}' -> {val[:50]}...")
                break

print(f"Total snippets checked: {total_snippets_checked}")

if suspicious:
    print(f"FOUND {len(suspicious)} SUSPICIOUS SNIPPETS:")
    for s in suspicious[:50]: # limit output
        print(s)
    if len(suspicious) > 50:
        print(f"... and {len(suspicious) - 50} more. Writing to audit_log.txt")
        (ROOT / "audit_log.txt").write_text("\n".join(suspicious), encoding="utf-8")
else:
    print("NO SUSPICIOUS SNIPPETS FOUND (No blanks, no standard placeholders).")
