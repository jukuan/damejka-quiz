#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "▶ git pull"
git pull --ff-only

echo "▶ npm install"
npm install

echo "▶ npm run build"
npm run build

echo "▶ bumping SW cache version"
VERSION="$(date +%Y%m%d-%H%M%S)"
sed -i.bak "s/CACHE_NAME = 'damejka-[^']*'/CACHE_NAME = 'damejka-$VERSION'/" dist/sw.js
rm -f dist/sw.js.bak

head -1 dist/sw.js
echo "✓ Built. Now deploy dist/ to the server."
