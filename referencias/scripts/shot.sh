#!/bin/bash
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="/Users/hammad/Desktop/coding & projects/TedxUPM/referencias/shots"
url="$1"
name=$(echo "$url" | sed -E 's#https?://(www\.)?##; s#/.*##; s#\.#_#g')
"$CH" --headless=new --disable-gpu --hide-scrollbars --no-first-run --user-data-dir=/tmp/chr_$name --window-size=1440,4200 --virtual-time-budget=9000 --timeout=25000 --screenshot="$OUT/${name}_full.png" "$url" >/dev/null 2>&1
"$CH" --headless=new --disable-gpu --hide-scrollbars --no-first-run --user-data-dir=/tmp/chr_$name --window-size=390,1600 --virtual-time-budget=7000 --timeout=20000 --user-agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148" --screenshot="$OUT/${name}_mobile.png" "$url" >/dev/null 2>&1
echo "done $name"
