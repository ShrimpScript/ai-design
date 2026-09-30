#!/usr/bin/env bash
# Copy screenshots into two anonymised judge folders with counterbalanced labels.
# judge1: X=A, Y=B   judge2: X=B, Y=A   (mapping kept here, never shown to judges)
set -e; A=${A:-A}; B=${B:-B}
here=$(cd "$(dirname "$0")" && pwd); out=${1:-/tmp/blind}
mkdir -p "$out/j1" "$out/j2"
for v in desktop mobile; do
  cp "$here/shots/$A-$v.png" "$out/j1/X-$v.png"; cp "$here/shots/$B-$v.png" "$out/j1/Y-$v.png"
  cp "$here/shots/$B-$v.png" "$out/j2/X-$v.png"; cp "$here/shots/$A-$v.png" "$out/j2/Y-$v.png"
done
echo "$out"
