#!/usr/bin/env bash
set -euo pipefail

echo "=== OpenClaw Model Routing Policy Gate ==="

FILE="config/openclaw/model-routing.policy.json"
if [[ ! -f "$FILE" ]]; then
  echo "❌ FAIL: Missing $FILE"
  exit 1
fi

jq -e '
  .version | type == "string"
' "$FILE" >/dev/null

jq -e '
  .mode == "operational_assisted_routing"
  and (.selection_scope | type == "string")
  and (.router.helper_script == "scripts/openclaw-model-route.sh")
  and (.router.selection_method | type == "string")
  and (.router.default_route_id | type == "string")
  and (.defaults.route_id | type == "string")
  and (.defaults.alias | type == "string")
  and (.defaults.model | type == "string")
  and (.routes | type == "array" and length == 7)
' "$FILE" >/dev/null || {
  echo "❌ FAIL: model routing policy missing required top-level fields"
  exit 1
}

jq -e '
  all(.routes[];
    (.id | type == "string")
    and (.alias | type == "string")
    and (.model | type == "string")
    and (.priority | type == "number")
    and (.cost_profile | type == "string")
    and (.task_profiles | type == "array" and length > 0)
    and (.match_any | type == "array" and length > 0)
    and (.best_for | type == "array" and length > 0)
    and (.better_options_when | type == "array" and length > 0)
    and (.avoid_for | type == "array")
    and (.cost_benefit | type == "string")
  )
' "$FILE" >/dev/null || {
  echo "❌ FAIL: malformed route entry"
  exit 1
}

jq -e '
  ([.routes[].id] | unique | length) == (.routes | length)
' "$FILE" >/dev/null || {
  echo "❌ FAIL: duplicate route ids"
  exit 1
}

jq -e '
  ([.defaults.model] + [.routes[].model]) | all(.[]; test("^openrouter/"))
' "$FILE" >/dev/null || {
  echo "❌ FAIL: policy only supports explicit OpenRouter model ids"
  exit 1
}

jq -e '
  . as $root
  | ([.routes[].id] | index($root.router.default_route_id)) != null
  and ([.routes[].id] | index($root.defaults.route_id)) != null
' "$FILE" >/dev/null || {
  echo "❌ FAIL: default route ids do not exist in routes"
  exit 1
}

[[ -x "scripts/openclaw-model-route.sh" ]] || {
  echo "❌ FAIL: helper script missing or not executable"
  exit 1
}

echo "✅ OpenClaw model routing policy gate PASSED"
