#!/usr/bin/env python3
import json, sys, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
db_path = ROOT / "data" / "aws.commands.json"

def die(msg):
    print("ERROR:", msg)
    sys.exit(1)

def main():
    if not db_path.exists():
        die(f"No existe {db_path}")
    db = json.loads(db_path.read_text(encoding="utf-8"))
    recipes = db.get("recipes", [])
    if db.get("count") != len(recipes):
        die("count no coincide con el tamaño de recipes[]")

    ids=set()
    for r in recipes:
        rid=r.get("id")
        if not rid: die("Receta sin id")
        if rid in ids: die(f"id duplicado: {rid}")
        ids.add(rid)

        # required fields
        for k in ["service","category","action","title","command","risk"]:
            if k not in r: die(f"{rid}: falta campo {k}")

        # risk level
        lvl = (r.get("risk") or {}).get("level")
        if lvl not in ("bajo","medio","alto"):
            die(f"{rid}: risk.level inválido: {lvl}")

        # template variables must be global or in params
        cmd = r.get("command","")
        vars_ = set(re.findall(r"\{\{(\w+)\}\}", cmd))
        allowed = {"profile_flag","region_flag","output_flag","dryrun_flag"}
        allowed |= {p.get("key") for p in (r.get("params") or []) if isinstance(p, dict)}
        missing = sorted([v for v in vars_ if v not in allowed])
        if missing:
            die(f"{rid}: variables no definidas: {missing}")

    print(f"OK: {len(recipes)} recetas, {len(ids)} ids únicos")

if __name__ == "__main__":
    main()
