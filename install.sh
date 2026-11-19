#!/usr/bin/env bash
set -e
SRC="$(cd "$(dirname "$0")" && pwd)"
DST="$HOME/.workbuddy/skills/novel-promo-video"
mkdir -p "$(dirname "$DST")"
if [ -L "$DST" ]; then rm "$DST"; elif [ -d "$DST" ]; then rm -rf "$DST"; fi
ln -s "$SRC" "$DST"
echo "[+] installed: $DST"
echo "    restart the agent session to load the skill"
