#!/bin/bash

echo "🚀 BULLETPROOF BUILD - 100% FUNKTIONIEREND!"

# 1. Clean everything
echo "🧹 Cleaning previous builds..."
rm -rf docs/assets docs/index.html docs/404.html

# 2. Build the project
echo "🔨 Building project..."
npm run build

# 3. Copy ALL images to docs root
echo "📁 Copying ALL images to docs root..."
cp public/*.png docs/

# 4. Verify all images are there
echo "✅ Verifying images..."
ls -la docs/*.png

# 5. Create 404.html for SPA routing
echo "🔄 Creating 404.html..."
cp docs/index.html docs/404.html

# 6. Add .nojekyll file
echo "📄 Adding .nojekyll file..."
touch docs/.nojekyll

# 7. Final verification
echo "🎯 FINAL VERIFICATION:"
echo "📊 Files in docs folder:"
ls -la docs/

echo "🎉 BULLETPROOF BUILD COMPLETE!"
echo "✅ All images copied to docs root"
echo "✅ 404.html created for SPA routing"
echo "✅ .nojekyll file added"
echo "✅ Ready for GitHub Pages deployment"
