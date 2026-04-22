#!/bin/sh
set -e

jq -n 'env | to_entries
  | map(select(.key | startswith("J26_PUBLIC_")))
  | map({
      key: (.key[11:] | ascii_downcase | gsub("_(?<c>.)"; "\(.c | ascii_upcase)")),
      value: .value
    })
  | from_entries' > /usr/share/nginx/html/config.json

exec nginx -g "daemon off;"
