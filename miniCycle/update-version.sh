#!/bin/bash
# update-version.sh - Interactive version updater for miniCycle

echo "🎯 miniCycle Version Updater"
echo "=============================="

# ✅ Create backup directory if it doesn't exist
BACKUP_DIR="backup"
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    echo "📁 Created backup directory: $BACKUP_DIR"
fi

# ✅ Create timestamped backup subfolder for this update
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FOLDER="$BACKUP_DIR/version_update_$TIMESTAMP"
mkdir -p "$BACKUP_FOLDER"
echo "📂 Backup folder: $BACKUP_FOLDER"
echo ""

# ✅ Get current versions
CURRENT_VERSION=$(grep -o '?v=[0-9.]*' miniCycle.html | head -1 | cut -d'=' -f2)
CURRENT_SW_VERSION=$(grep -o "CACHE_VERSION = 'v[0-9]*'" service-worker.js | cut -d"'" -f2)

echo "📊 Current versions:"
echo "   App version: ${CURRENT_VERSION:-"Not set"}"
echo "   Service Worker: ${CURRENT_SW_VERSION:-"Not set"}"
echo ""

# ✅ Get new version from user
read -p "🔢 Enter new app version (e.g., 1.233): " NEW_VERSION
read -p "⚙️  Enter new service worker version (e.g., v3): " SW_VERSION

# ✅ Validate input
if [[ ! "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+$ ]]; then
    echo "❌ Invalid version format. Use format like 1.233"
    exit 1
fi

if [[ ! "$SW_VERSION" =~ ^v[0-9]+$ ]]; then
    echo "❌ Invalid service worker version. Use format like v3"
    exit 1
fi

# ✅ Confirm changes
echo ""
echo "📝 Changes to be made:"
echo "   App version: $CURRENT_VERSION → $NEW_VERSION"
echo "   Service Worker: $CURRENT_SW_VERSION → $SW_VERSION"
echo "   Backups will be saved to: $BACKUP_FOLDER"
echo ""
read -p "🤔 Continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Update cancelled."
    # Remove empty backup folder
    rmdir "$BACKUP_FOLDER" 2>/dev/null
    exit 1
fi

echo ""
echo "🔄 Updating files..."

# ✅ Enhanced update function that saves to backup folder
update_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        # Create backup in the backup folder
        cp "$file" "$BACKUP_FOLDER/$file"
        echo "💾 Created backup: $BACKUP_FOLDER/$file"
        return 0
    else
        echo "⚠️  Warning: $file not found, skipping $description"
        return 1
    fi
}

# ✅ Update files
if update_file "miniCycle.html" "full version"; then
    sed -i "" "s/?v=[0-9.]*/?v=$NEW_VERSION/g" miniCycle.html
    sed -i "" "s/var currentVersion = '[0-9.]*'/var currentVersion = '$NEW_VERSION'/g" miniCycle.html
    echo "✅ Updated miniCycle.html"
fi

if update_file "miniCycle-lite.html" "lite version"; then
    # Update existing version parameters
    sed -i "" "s/?v=[0-9.]*/?v=$NEW_VERSION/g" miniCycle-lite.html
    
    # Add version parameters if missing
    sed -i "" "s/miniCycle-lite-styles\.css\"/miniCycle-lite-styles.css?v=$NEW_VERSION\"/g" miniCycle-lite.html
    sed -i "" "s/miniCycle-lite-scripts\.js\"/miniCycle-lite-scripts.js?v=$NEW_VERSION\"/g" miniCycle-lite.html
    
    echo "✅ Updated miniCycle-lite.html"
fi

if update_file "service-worker.js" "service worker"; then
    sed -i "" "s/CACHE_VERSION = 'v[0-9]*'/CACHE_VERSION = '$SW_VERSION'/g" service-worker.js
    echo "✅ Updated service-worker.js"
fi

if update_file "manifest.json" "app manifest"; then
    sed -i "" "s/\"version\": \"[0-9.]*\"/\"version\": \"$NEW_VERSION\"/g" manifest.json
    echo "✅ Updated manifest.json"
fi

# ✅ Create a restore script in the backup folder
cat > "$BACKUP_FOLDER/restore.sh" << EOF
#!/bin/bash
# Auto-generated restore script for version update on $TIMESTAMP
echo "🔄 Restoring files from backup..."

# Copy files back to main directory
cp miniCycle.html ../miniCycle.html 2>/dev/null && echo "✅ Restored miniCycle.html"
cp miniCycle-lite.html ../miniCycle-lite.html 2>/dev/null && echo "✅ Restored miniCycle-lite.html"
cp service-worker.js ../service-worker.js 2>/dev/null && echo "✅ Restored service-worker.js"
cp manifest.json ../manifest.json 2>/dev/null && echo "✅ Restored manifest.json"

echo "🎉 Restore completed!"
EOF

chmod +x "$BACKUP_FOLDER/restore.sh"

echo ""
echo "🎉 Update completed successfully!"
echo "📁 All backups saved to: $BACKUP_FOLDER"
echo "🔧 Restore script created: $BACKUP_FOLDER/restore.sh"
echo ""
echo "🧪 Recommended next steps:"
echo "1. Test the app locally"
echo "2. Check browser dev tools for cache updates"
echo "3. Verify service worker registration"
echo "4. Test both full and lite versions"
echo ""
echo "🔄 To restore previous versions, run:"
echo "   cd $BACKUP_FOLDER && ./restore.sh"
echo ""
echo "🗂️  Your backup folder structure:"
ls -la "$BACKUP_FOLDER"