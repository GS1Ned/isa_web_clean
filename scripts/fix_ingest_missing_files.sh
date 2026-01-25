#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="${1:-$(pwd)}"
DATA_DIR="$ROOT_DIR/data"
TMP_DIR="$ROOT_DIR/tmp_isa_ingest_missing_files"
mkdir -p "$DATA_DIR/gs1/gdsn" "$DATA_DIR/efrag" "$DATA_DIR/cbv" "$DATA_DIR/digital_link" "$DATA_DIR/external/archive2_docs"
rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"
if [ ! -f "$ROOT_DIR/isa_ingest_missing_files.zip" ]; then
  echo "isa_ingest_missing_files.zip not found in $ROOT_DIR"
  exit 1
fi
unzip -o "$ROOT_DIR/isa_ingest_missing_files.zip" -d "$TMP_DIR" >/dev/null
if [ -f "$TMP_DIR/gdsn_classes.json" ]; then
  cp -f "$TMP_DIR/gdsn_classes.json" "$DATA_DIR/gs1/gdsn/gdsn_classes.json"
else
  echo "gdsn_classes.json not found in zip"
  exit 1
fi
if [ -f "$TMP_DIR/gdsn_classAttributes.json" ]; then
  cp -f "$TMP_DIR/gdsn_classAttributes.json" "$DATA_DIR/gs1/gdsn/gdsn_classAttributes.json"
else
  echo "gdsn_classAttributes.json not found in zip"
  exit 1
fi
if [ -f "$TMP_DIR/gdsn_validationRules.json" ]; then
  cp -f "$TMP_DIR/gdsn_validationRules.json" "$DATA_DIR/gs1/gdsn/gdsn_validationRules.json"
else
  echo "gdsn_validationRules.json not found in zip"
  exit 1
fi
EFRAG_TARGET="$DATA_DIR/efrag/EFRAGIG3ListofESRSDataPoints.xlsx"
if [ -f "$ROOT_DIR/EFRAGIG3ListofESRSDataPoints(1)(1).xlsx" ]; then
  cp -f "$ROOT_DIR/EFRAGIG3ListofESRSDataPoints(1)(1).xlsx" "$EFRAG_TARGET"
elif [ -f "$TMP_DIR/EFRAGIG3ListofESRSDataPoints.xlsx" ]; then
  cp -f "$TMP_DIR/EFRAGIG3ListofESRSDataPoints.xlsx" "$EFRAG_TARGET"
else
  echo "EFRAGIG3ListofESRSDataPoints source file not found"
  exit 1
fi
if [ -f "$TMP_DIR/cbv_esg_curated.json" ]; then
  cp -f "$TMP_DIR/cbv_esg_curated.json" "$DATA_DIR/cbv/cbv_esg_curated.json"
else
  echo "cbv_esg_curated.json not found in zip"
  exit 1
fi
if [ -f "$TMP_DIR/linktypes.json" ]; then
  cp -f "$TMP_DIR/linktypes.json" "$DATA_DIR/digital_link/linktypes.json"
else
  echo "linktypes.json not found in zip"
  exit 1
fi
if [ -f "$ROOT_DIR/Archive.zip" ]; then
  unzip -o "$ROOT_DIR/Archive.zip" -d "$DATA_DIR/external/archive2_docs" >/dev/null
fi
echo "All files placed successfully"
