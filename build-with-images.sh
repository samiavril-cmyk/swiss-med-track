#!/bin/bash

# Build script that ensures images are copied to docs folder

echo "🔨 Building project..."
npm run build

echo "📁 Copying images to docs folder..."
cp public/*.png docs/

echo "🔄 Updating 404.html for SPA routing..."
cp docs/index.html docs/404.html

echo "✅ Build complete with images!"
echo "📊 Files in docs folder:"
ls -la docs/*.png
