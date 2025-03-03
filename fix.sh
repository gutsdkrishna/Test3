#!/bin/bash

echo "🔍 Checking for issues in BoostIQ Pro Mobile..."

# Fix assets
echo "📦 Ensuring assets directory exists..."
mkdir -p assets

# Download default assets if they don't exist
if [ ! -f "assets/icon.png" ]; then
  echo "📥 Downloading default icon..."
  curl -s https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/icon.png -o assets/icon.png
fi

if [ ! -f "assets/splash.png" ]; then
  echo "📥 Downloading default splash screen..."
  curl -s https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/splash.png -o assets/splash.png
fi

if [ ! -f "assets/adaptive-icon.png" ]; then
  echo "📥 Downloading default adaptive icon..."
  curl -s https://raw.githubusercontent.com/expo/expo/main/templates/expo-template-blank/assets/adaptive-icon.png -o assets/adaptive-icon.png
fi

# Clear cache and reinstall dependencies
echo "🧹 Cleaning Expo cache..."
expo doctor --fix-dependencies

echo "🔄 Reinstalling dependencies..."
npm install

echo "✅ Setup fixed! Try running 'npm start' again."
