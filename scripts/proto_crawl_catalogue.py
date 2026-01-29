import csv, json, os, re, hashlib
from datetime import datetime, timezone, date
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse, urldefrag
from urllib.request import Request, urlopen

CFG="config/catalogue_sources.json"
OUT_JSON="docs/evidence/_generated/GS1_EFRAG_CATALOGUE.json"
OUT_CSV="docs/evidence/_generated/GS1_EFRAG_CATALOGUE.csv"
OUT_MD="docs/evidence/_generated/GS1_EFRAG_CATALOGUE_INDEX.md"

UA="ISA-PrototypeCrawler/0.1"
EXTS=(".pdf",".zip",".xsd",".json",".csv",".xml",".ttl",".rdf",".html",".htm",".docx",".xlsx",".pptx")

def iso_now():
  return datetime.now(timezone.utc).replace(microsecond=0).isoformat()
def iso_today():
  return date.today().isoformat()
def stable_id(body, url, version=""):
  return hashlib.sha256(f"{body}|{url}|{version}".encode("utf-8")).hexdigest()
def norm(u):
  return urldefrag(u)[0].strip().rstrip(".,;:)]}>\"'")

def http_get(url, timeout=45):
  req=Request(url, headers={"User-Agent":UA, "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"})
  with urlopen(req, timeout=timeout) as r:
    return r.read(), r.headers.get("Content-Type","")
def http_head(url, timeout=30):
  req=Request(url, method="HEAD", headers={"User-Agent":UA})
  try:
    with urlopen(req, timeout=timeout) as r:
      h=dict(r.headers.items())
      return True, getattr(r,"status",200), h
  except Exception:
    return False, None, {}

def match_any(pats, s):
  for p in pats:
    try:
      if re.search(p, s, re.I): return True
    except re.error:
      if p.lower() in s.lower(): return True
  return False

def guess_format(u, ct):
  p=urlparse(u).path.lower()
  for e in EXTS:
    if p.endswith(e): return e[1:].upper()
  if "pdf" in (ct or "").lower(): return "PDF"
  if "html" in (ct or "").lower(): return "HTML"
  return "URL"

def guess_pub_date(u, txt):
  s=" ".join([u or "", txt or ""])
  m=re.search(r"(20\d{2})[-_/](0[1-9]|1[0-2])[-_/]([0-2]\d|3[01])", s)
  if m: return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
  m=re.search(r"\b(20\d{2})\b", s)
  if m: return m.group(1)
  return ""

class Parser(HTMLParser):
  def __init__(self, base):
    super().__init__()
    self.base=base
    self.links=[]
    self._a=None
    self._t=[]
  def handle_starttag(self, tag, attrs):
    if tag.lower()=="a":
      href=None
      for k,v in attrs:
        if k.lower()=="href":
          href=v
          break
      self._a=href
      self._t=[]
  def handle_endtag(self, tag):
    if tag.lower()=="a":
      if self._a:
        u=norm(urljoin(self.base, self._a))
        t="".join(self._t).strip()
        if u: self.links.append((u,t))
      self._a=None
      self._t=[]
  def handle_data(self, data):
    if self._a is not None:
      self._t.append(data)

def main():
  cfg=json.load(open(CFG,"r",encoding="utf-8"))
  now=iso_now()
  today=iso_today()
  required=cfg.get("required_bodies",[])
  bodies=cfg.get("bodies",{})
  items=[]
  sources={}

  for body, spec in bodies.items():
    seeds=spec.get("seeds",[])
    allow=spec.get("allow_patterns",[]) or []
    deny=spec.get("deny_patterns",[]) or []
    sources[body]={"seed_count":len(seeds),"seeds":seeds,"runs":[]}
    for seed in seeds:
      u = seed["url"] if isinstance(seed, dict) else seed
      rid=stable_id(body,u,"ENTRYPOINT")
      items.append({
        "record_id":rid,
        "issuing_body":body,
        "title":(seed.get("kind","ENTRYPOINT") if isinstance(seed,dict) else "ENTRYPOINT"),
        "publication_date":"",
        "version":"",
        "status":"ENTRYPOINT",
        "document_type":"ENTRYPOINT",
        "canonical_url":u,
        "landing_page_url":u,
        "download_urls":[],
        "formats":[],
        "discovery_method":"ENTRYPOINT",
        "source_collection_url":u,
        "first_seen_at":now,
        "last_seen_at":now,
        "last_verified_at":today,
        "verification_result":{"ok":True}
      })
      u = seed["url"] if isinstance(seed, dict) else seed
      try:
        b, ct = http_get(u)
      except Exception as e:
        sources[body]["runs"].append({"seed":u,"ok":False,"error":str(e)})
        continue
      sources[body]["runs"].append({"seed":u,"ok":True,"content_type":ct})
      if "html" not in (ct or "").lower():
        rid=stable_id(body,u,"")
        items.append({
          "record_id":rid,"issuing_body":body,"title":"","publication_date":"",
          "version":"","status":"UNKNOWN","document_type":"OTHER",
          "canonical_url":u,"landing_page_url":u,"download_urls":[u],
          "formats":[], "discovery_method":"MANUAL_SEED","source_collection_url":u,
          "first_seen_at":now,"last_seen_at":now,"last_verified_at":today,
          "verification_result":{"ok":True}
        })
        continue
      p=Parser(u)
      p.feed(b.decode("utf-8",errors="ignore"))
      for link, txt in p.links[:800]:
        if deny and match_any(deny, link): continue
        if allow and not match_any(allow, link): continue
        path=urlparse(link).path.lower()
        is_doc=path.endswith(EXTS)
        if not is_doc and urlparse(link).netloc.lower()!=urlparse(u).netloc.lower():
          continue
        rid=stable_id(body,link,"")
        dl=[link] if is_doc else []
        it={
          "record_id":rid,"issuing_body":body,"title":(txt or "").strip(),
          "publication_date":guess_pub_date(link, txt),"version":"",
          "status":"UNKNOWN","document_type":"OTHER",
          "canonical_url":link,"landing_page_url":u,"download_urls":dl,
          "formats":[], "discovery_method":"HTML_CRAWL","source_collection_url":u,
          "first_seen_at":now,"last_seen_at":now,"last_verified_at":today,
          "verification_result":{"ok":True}
        }
        if dl:
          for du in dl:
            ok, st, h = http_head(du)
            ct2=h.get("Content-Type","")
            size=h.get("Content-Length","")
            it["formats"].append({
              "format_label":guess_format(du, ct2),
              "mime_type":ct2.split(";")[0].strip() if ct2 else "",
              "file_url":du,
              "file_size_bytes":int(size) if (size and str(size).isdigit()) else None,
              "http_status":st,
              "verification_ok":ok,
              "last_verified_at":today
            })
        items.append(it)

  seen=set()
  uniq=[]
  for it in items:
    k=(it.get("issuing_body",""), it.get("canonical_url",""))
    if k in seen: continue
    seen.add(k)
    uniq.append(it)

  out={
    "catalogue_version":cfg.get("schema_version","1.0.0"),
    "generated_at":now,
    "last_verified_at":today,
    "required_bodies":required,
    "sources":sources,
    "items":uniq
  }
  os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
  json.dump(out, open(OUT_JSON,"w",encoding="utf-8"), ensure_ascii=False, indent=2)

  with open(OUT_CSV,"w",encoding="utf-8",newline="") as f:
    w=csv.writer(f)
    w.writerow(["record_id","issuing_body","title","publication_date","canonical_url","landing_page_url","download_url","format_label","mime_type","http_status","last_verified_at"])
    for it in uniq:
      if it.get("formats"):
        for fm in it["formats"]:
          w.writerow([it.get("record_id",""),it.get("issuing_body",""),it.get("title",""),it.get("publication_date",""),it.get("canonical_url",""),it.get("landing_page_url",""),fm.get("file_url",""),fm.get("format_label",""),fm.get("mime_type",""),fm.get("http_status",""),it.get("last_verified_at","")])
      else:
        w.writerow([it.get("record_id",""),it.get("issuing_body",""),it.get("title",""),it.get("publication_date",""),it.get("canonical_url",""),it.get("landing_page_url",""),"","","","",it.get("last_verified_at","")])

  md=[]
  md.append("# GS1/EFRAG Catalogue (Prototype)")
  md.append("")
  md.append(f"- Generated at: {now}")
  md.append(f"- Last verified date: {today}")
  md.append("")
  md.append("## Coverage")
  for b in required:
    md.append(f"- {b}: {sum(1 for i in uniq if i.get('issuing_body')==b)}")
  md.append("")
  md.append("## Seeds")
  for b in required:
    md.append(f"### {b}")
    for seed in (sources.get(b,{}).get("seeds",[]) or []):
      md.append(f"- {seed['url'] if isinstance(seed,dict) else seed}")
    md.append("")
  open(OUT_MD,"w",encoding="utf-8").write("\n".join(md))

if __name__=="__main__":
  main()
