#!/bin/bash
# Auto-generated restore script for version update on 20250907_160011
echo "🔄 Restoring files from backup..."

# Copy files back to main directory
cp miniCycle.html ../miniCycle.html 2>/dev/null && echo "✅ Restored miniCycle.html"
cp miniCycle-lite.html ../miniCycle-lite.html 2>/dev/null && echo "✅ Restored miniCycle-lite.html"
cp service-worker.js ../service-worker.js 2>/dev/null && echo "✅ Restored service-worker.js"
cp manifest.json ../manifest.json 2>/dev/null && echo "✅ Restored manifest.json"

echo "🎉 Restore completed!"
