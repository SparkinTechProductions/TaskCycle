#!/bin/bash
# Auto-generated restore script for version update on 20250908_064736
echo "🔄 Restoring files from backup..."

# Copy files back to main directory
cp miniCycle.html ../miniCycle.html 2>/dev/null && echo "✅ Restored miniCycle.html"
cp miniCycle-lite.html ../miniCycle-lite.html 2>/dev/null && echo "✅ Restored miniCycle-lite.html"
cp miniCycle-scripts.js ../miniCycle-scripts.js 2>/dev/null && echo "✅ Restored miniCycle-scripts.js"
cp miniCycle-lite-scripts.js ../miniCycle-lite-scripts.js 2>/dev/null && echo "✅ Restored miniCycle-lite-scripts.js"
cp service-worker.js ../service-worker.js 2>/dev/null && echo "✅ Restored service-worker.js"
cp manifest.json ../manifest.json 2>/dev/null && echo "✅ Restored manifest.json"

echo "🎉 Restore completed!"
