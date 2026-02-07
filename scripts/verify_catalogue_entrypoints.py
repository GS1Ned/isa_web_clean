import os
from pathlib import Path
import json, datetime, ssl, urllib.request, urllib.error

OUT_JSON=Path("os.environ.get("ISA_EVIDENCE_OUT_DIR", "docs/evidence/_generated")/CATALOGUE_ENTRYPOINTS_STATUS.json")
OUT_MD=Path("os.environ.get("ISA_EVIDENCE_OUT_DIR", "docs/evidence/_generated")/CATALOGUE_ENTRYPOINTS_STATUS.md")
CFG=Path("config/catalogue_sources.json")

def norm_seed(s):
  if isinstance(s, dict):
    u=s.get("url","")
  else:
    u=str(s)
  return u.strip()

def fetch(url, method="HEAD", timeout=20):
  ctx=ssl.create_default_context()
  req=urllib.request.Request(url, method=method, headers={"User-Agent":"ISA-IRON/1.0"})
  try:
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
      final=r.geturl()
      headers={k.lower():v for k,v in r.headers.items()}
      return {"status":getattr(r,"status",200),"final_url":final,"headers":headers}
  except urllib.error.HTTPError as e:
    final=getattr(e,"url",url)
    headers={k.lower():v for k,v in getattr(e,"headers",{}).items()} if getattr(e,"headers",None) else {}
    return {"status":e.code,"final_url":final,"headers":headers}
  except Exception:
    return {"status":None,"final_url":url,"headers":{}}

def main():
  d=json.loads(CFG.read_text(encoding="utf-8"))
  today=datetime.date.today().isoformat()
  now=datetime.datetime.utcnow().replace(microsecond=0).isoformat()+"Z"
  items=[]
  for body,bd in (d.get("bodies") or {}).items():
    seeds=[norm_seed(s) for s in (bd.get("seeds") or [])]
    for u in [x for x in seeds if x]:
      r=fetch(u,"HEAD")
      if r["status"] in (405,501) or (r["status"] is None):
        r2=fetch(u,"GET")
        if r2["status"] is not None:
          r=r2
      h=r.get("headers") or {}
      items.append({
        "issuing_body": body,
        "entrypoint_url": u,
        "final_url": r.get("final_url") or u,
        "http_status": r.get("status"),
        "content_type": h.get("content-type",""),
        "etag": h.get("etag",""),
        "last_modified": h.get("last-modified",""),
        "verified_at": now,
        "ok": bool(r.get("status")) and int(r["status"])<400
      })
  out={
    "schema_version":"1.0.0",
    "last_verified_at": today,
    "verified_at": now,
    "source_config": str(CFG),
    "required_bodies": d.get("required_bodies") or [],
    "counts": {"total": len(items),"ok": sum(1 for i in items if i["ok"]),"fail": sum(1 for i in items if not i["ok"])},
    "items": items
  }
  OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
  OUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
  lines=[]
  lines.append("# Catalogue entrypoints status\n")
  lines.append(f"- last_verified_at: `{today}`")
  lines.append(f"- verified_at: `{now}`")
  lines.append(f"- total: `{out['counts']['total']}`, ok: `{out['counts']['ok']}`, fail: `{out['counts']['fail']}`\n")
  for body in sorted(set(i["issuing_body"] for i in items)):
    bi=[i for i in items if i["issuing_body"]==body]
    lines.append(f"## {body}\n")
    for i in bi:
      lines.append(f"- {i['http_status']} ok={str(i['ok']).lower()} `{i['entrypoint_url']}`")
      if i["final_url"] and i["final_url"]!=i["entrypoint_url"]:
        lines.append(f"  - final_url: `{i['final_url']}`")
      if i["content_type"]:
        lines.append(f"  - content_type: `{i['content_type']}`")
      if i["last_modified"]:
        lines.append(f"  - last_modified: `{i['last_modified']}`")
      if i["etag"]:
        lines.append(f"  - etag: `{i['etag']}`")
    lines.append("")
  OUT_MD.write_text("\n".join(lines).strip()+"\n", encoding="utf-8")

if __name__=="__main__":
  main()
