#!/usr/bin/env python3
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
meta = json.loads((ROOT / "data" / "meta.json").read_text(encoding="utf-8"))
langs = meta["meta"]["lenguajes"]
cases = meta["casos"]
case_ids = [c["id"] for c in cases]

errors = []

# Load all language jsons
lang_json = {}
for l in langs:
    k = l["key"]
    p = ROOT / "data" / "lang" / f"{k}.json"
    if not p.exists():
        errors.append(f"Falta {p}")
        continue
    try:
        lang_json[k] = json.loads(p.read_text(encoding="utf-8"))
    except Exception as e:
        errors.append(f"JSON inválido {p}: {e}")

def merged_snippets(key, stack=None):
    if stack is None:
        stack = []
    if key in stack:
        raise RuntimeError("Ciclo de herencia: " + " -> ".join(stack + [key]))
    d = lang_json.get(key)
    if not d:
        raise RuntimeError(f"No se encontró lenguaje base '{key}'")
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

# 1) required fields and coverage
for l in langs:
    k = l["key"]
    p = ROOT / "data" / "lang" / f"{k}.json"
    d = lang_json.get(k)
    if not d:
        continue

    lang = d.get("language", {}) or {}
    for req in ("key","name","official_url","operators","keywords","comments"):
        if req not in lang:
            errors.append(f"{p}: falta language.{req}")

    # ensure key matches
    if lang.get("key") and lang["key"] != k:
        errors.append(f"{p}: language.key '{lang.get('key')}' no coincide con meta key '{k}'")

    # coverage (supports snippets OR extends+overrides)
    try:
        snips = merged_snippets(k)
    except Exception as e:
        errors.append(f"{p}: error al resolver herencia/snippets: {e}")
        continue

    for cid in case_ids:
        if cid not in snips:
            errors.append(f"{p}: falta snippet para {cid}")

# 2) duplicates in names
names = [l["name"] for l in langs]
dups = sorted({n for n in names if names.count(n) > 1})
if dups:
    errors.append("Nombres duplicados en meta.lenguajes: " + ", ".join(dups))

if errors:
    print("ERRORS:")
    for e in errors:
        print(" -", e)
    sys.exit(1)

print(f"OK: {len(case_ids)} casos, {len(langs)} lenguajes, estructura válida (snippets o herencia).")
