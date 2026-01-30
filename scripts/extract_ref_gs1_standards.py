#!/usr/bin/env python3
import json, re, sys, urllib.request, urllib.parse
from html.parser import HTMLParser
from datetime import date, datetime

UA="isa-catalogue-proto/0.1 (+https://www.gs1isa.com)"

class LinkParser(HTMLParser):
  def __init__(self):
    super().__init__()
    self.links=[]
  def handle_starttag(self, tag, attrs):
    if tag.lower()!="a": 
      return
    href=None
    for k,v in attrs:
      if k.lower()=="href":
        href=v
        break
    if href:
      self.links.append(href)

def fetch(url, timeout=30):
  req=urllib.request.Request(url, headers={"User-Agent":UA, "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"})
  with urllib.request.urlopen(req, timeout=timeout) as r:
    ct=r.headers.get("content-type","")
    b=r.read()
  return ct, b

def text_from_html(b):
  s=b.decode("utf-8","ignore")
  return s

def abs_url(base, href):
  return urllib.parse.urljoin(base, href)

def norm(u):
  u=u.split("#",1)[0]
  if u.endswith("/"):
    return u
  return u

def month_to_date(s):
  s=s.strip()
  for fmt in ("%B %Y","%b %Y","%B %d, %Y","%b %d, %Y"):
    try:
      dt=datetime.strptime(s, fmt)
      return dt.date()
    except:
      pass
  return None

def parse_standard_page(url):
  ct,b=fetch(url)
  html=text_from_html(b)
  title=None
  m=re.search(r"<h1[^>]*>(.*?)</h1>", html, re.I|re.S)
  if m:
    title=re.sub(r"\s+"," ", re.sub(r"<[^>]+>","", m.group(1))).strip()
  ver=None
  m=re.search(r"Current version\s*</[^>]*>\s*([0-9]+\.[0-9]+\.[0-9]+)", html, re.I)
  if not m:
    m=re.search(r"Current version\s*([0-9]+\.[0-9]+\.[0-9]+)", html, re.I)
  if m:
    ver=m.group(1)
  lm=None
  m=re.search(r"Last modified\s*</[^>]*>\s*([A-Za-z]{3,9}\s+\d{4}|[A-Za-z={3,9}\s+\d{1,2},\s*\d{4})", html, re.I)
  if not m:
    m=re.search(r"Last modified\s*([A-Za-z]{3,9}\s+\d{4}|[A-Za-z={3,9}\s+\d{1,2},\s*\d{4})", html, re.I)
  if m:
    lm=month_to_date(m.group(1))
  return title or url.rstrip("/").split("/")[-1], ver, lm

def parse_artefacts(url):
  try:
    ct,b=fetch(url)
  except:
    return set(), []
  html=text_from_html(b)
  p=LinkParser()
  p.feed(html)
  links=[abs_url(url,h) for h in p.links]
  fmts=set()
  files=[]
  for u in links:
    uu=urllib.parse.urlparse(u)
    if uu.scheme not in ("http","https"):
      continue
    path=uu.path.lower()
    m=re.search(r"\.([a-z0-9]{1,6})$", path)
    ext=m.group(1) if m else None
    if ext and ext not in ("html","htm","php","asp","aspx"):
      fmts.add(ext.upper())
      files.append(u)
  return fmts, files

def main():
  root="https://ref.gs1.org/standards/"
  ct,b=fetch(root)
  html=text_from_html(b)
  p=LinkParser()
  p.feed(html)
  cands=set()
  for h in p.links:
    u=abs_url(root,h)
    if not u.startswith("https://ref.gs1.org/standards/"): continue
    if "/archive" in u or "/artefacts" in u: continue
    path=urllib.parse.urlparse(u).path.strip("/").split("/")
    if len(path)==2 and path[0]=="standards":
      cands.add(norm(u + "/") if not u.endswith("/") else norm(u))
  items=[]
  today=str(date.today())
  for u in sorted(cands):
    try:
      title, ver, pubd=parse_standard_page(u)
    except:
      continue
    archive=u.rstrip("/")+"/archive"
    artefacts=u.rstrip("/")+"/artefacts"
    fmts, files=parse_artefacts(artefacts)
    items.append({"issuing_body":"GS1_GLOBAL","source_entrypoint_url":root,"canonical_url":u,"title":title,"publication_date":pubd.isoformat() if pubd else None,"version":ver,"status":"current","formats":sorted(fmts) if fmts else [],"related_urls":[archive,artefacts]+files,"last_verified_at":today})
  sys.stdout.write(json.dumps(items,ensure_ascii=False,indent=2))

if __name__=="__main__":
  main()
