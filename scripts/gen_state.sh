#!/usr/bin/env bash
set -euo pipefail

vars="${1:?Usage: scripts/gen_state.sh public/divorce/states/tx.env}"
template="public/divorce/_state.template.html"

# load vars
set -a
source "$vars"
set +a

out="public/divorce/${STATE_SLUG}.html"

# render tokens -> output
perl -0777 -pe '
s/\{\{STATE_NAME\}\}/$ENV{STATE_NAME}/g;
s/\{\{STATE_UPPER\}\}/$ENV{STATE_UPPER}/g;
s/\{\{STATE_SLUG\}\}/$ENV{STATE_SLUG}/g;
s/\{\{PRICE_NO_CHILDREN\}\}/$ENV{PRICE_NO_CHILDREN}/g;
s/\{\{PRICE_WITH_CHILDREN\}\}/$ENV{PRICE_WITH_CHILDREN}/g;

# optional fallbacks if template still has bare prices:
s/\$175\b/$ENV{PRICE_NO_CHILDREN}/g;
s/\$199\b/$ENV{PRICE_WITH_CHILDREN}/g;
' "$template" > "$out"

echo "Wrote: $out"
