# Catalogue entrypoints status

- last_verified_at: `2026-01-31`
- verified_at: `2026-01-31T04:44:26Z`
- total: `14`, ok: `10`, fail: `4`

## EFRAG

- 200 ok=true `https://www.efrag.org/en/sustainability-reporting-publications`
  - content_type: `text/html; charset=UTF-8`
  - last_modified: `Fri, 30 Jan 2026 10:18:48 GMT`
  - etag: `W/"1769768328-gzip"`
- 200 ok=true `https://www.efrag.org/en/news-and-calendar/news`
  - content_type: `text/html; charset=UTF-8`
  - last_modified: `Fri, 30 Jan 2026 10:53:21 GMT`
  - etag: `W/"1769770401-gzip"`
- 200 ok=true `https://www.efrag.org/en/projects/esrs-xbrl-taxonomy/concluded`
  - content_type: `text/html; charset=UTF-8`
  - last_modified: `Fri, 30 Jan 2026 10:38:08 GMT`
  - etag: `W/"1769769488-gzip"`
- 302 ok=true `https://efrag-website.azurewebsites.net/Activities/2304270816111835/Article-8-XBRL-Taxonomy`
  - final_url: `https://efrag-website.azurewebsites.net/Activities/2304270816111835/Article-8-XBRL-Taxonomy?AspxAutoDetectCookieSupport=1`
  - content_type: `text/html; charset=utf-8`
- 200 ok=true `https://knowledgehub.efrag.org/eng`
  - content_type: `text/html; charset=utf-8`
  - etag: `W/"7f056-Gv1rnnNbpdGRIYc55Kt8nTjyarM"`

## GS1_EUROPE

- 200 ok=true `https://gs1.eu/publications/`
  - content_type: `text/html; charset=UTF-8`

## GS1_GLOBAL

- 403 ok=false `https://www.gs1.org/standards/log`
  - content_type: `text/html`
- 403 ok=false `https://www.gs1.org/standards`
  - content_type: `text/html`
- 200 ok=true `https://ref.gs1.org/standards/`
  - content_type: `text/html; charset=UTF-8`
- 403 ok=false `https://www.gs1.org/standards/barcodes-epcrfid-id-keys/gs1-general-specifications`
  - content_type: `text/html`

## GS1_NL

- 200 ok=true `https://www.gs1.nl/kennisbank/`
  - content_type: `text/html; charset=utf-8`
- 404 ok=false `https://www.gs1.nl/media/`
  - content_type: `text/html; charset=utf-8`
- 200 ok=true `https://www.gs1.nl/kennisbank/gs1-edi/`
  - content_type: `text/html; charset=utf-8`
- 200 ok=true `https://www.gs1.nl/kennisbank/gs1-data-source/`
  - content_type: `text/html; charset=utf-8`
=======
# Catalogue Entrypoints Status

- generated_at: `2026-01-31T08:51:46.428955Z`
- rows: `1677`
- items_csv_sha256: `c65cba03d5c7b6dc585a15ee79716ee8132ba6754c33dccbe00a1a76195b7704`
- max_last_verified_date: `2026-01-30T00:00:00Z`

## By source
- `GS1 Global`: `884`
- `entrypoints`: `406`
- `EFRAG`: `190`
- `GS1 Netherlands`: `174`
- `GS1 Europe`: `23`

## By entrypoint (source_url)
- `https://www.gs1.org/`: `884`
- `https://www.efrag.org/News`: `404`
- `https://www.efrag.org/`: `190`
- `https://www.gs1.nl/`: `174`
- `https://www.gs1.eu/`: `23`
- `https://www.efrag.org/News/Publications-and-Submissions`: `1`
- `https://www.gs1.org/standards`: `1`

## By http_status
- `200`: `1574`
- `405`: `48`
- `404`: `42`
- `403`: `12`
- ``: `1`
