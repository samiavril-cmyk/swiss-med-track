#!/bin/bash

# Build script that ensures images are copied to docs folder

echo "🔨 Building project..."
npm run build

echo "📁 Copying images to docs/images folder..."
mkdir -p docs/images
cp public/*.png docs/images/

echo "🔄 Updating 404.html for SPA routing..."
cp docs/index.html docs/404.html

echo "✅ Build complete with images!"
echo "📊 Files in docs/images folder:"
ls -la docs/images/*.png
