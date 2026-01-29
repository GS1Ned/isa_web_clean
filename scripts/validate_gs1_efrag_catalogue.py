import json, os, sys
from datetime import date, datetime
CAT="docs/evidence/_generated/GS1_EFRAG_CATALOGUE.json"
MAX_AGE_DAYS=int(os.environ.get("GS1_EFRAG_CATALOGUE_MAX_AGE_DAYS","30"))
def parse(d): return datetime.strptime(d,"%Y-%m-%d").date()
def main():
  if not os.path.exists(CAT): print(f"::error::Missing {CAT}"); sys.exit(1)
  d=json.load(open(CAT,"r",encoding="utf-8"))
  lv=d.get("last_verified_at") or d.get("last_verified") or ""
  if not lv: print("::error::Missing last verified date"); sys.exit(1)
  age=(date.today()-parse(lv)).days
  if age>MAX_AGE_DAYS: print(f"::error::Stale catalogue last_verified={lv} age={age} max={MAX_AGE_DAYS}"); sys.exit(1)
  req=d.get("required_bodies",[])
  items=d.get("items",[])
  bodies=set([i.get("issuing_body","") for i in items])
  miss=[b for b in req if b not in bodies]
  if miss: print(f"::error::Missing bodies: {miss}"); sys.exit(1)
  for f in ["docs/evidence/_generated/GS1_EFRAG_CATALOGUE.csv","docs/evidence/_generated/GS1_EFRAG_CATALOGUE_INDEX.md"]:
    if not os.path.exists(f): print(f"::error::Missing {f}"); sys.exit(1)
  print("ok")
if __name__=="__main__": main()
