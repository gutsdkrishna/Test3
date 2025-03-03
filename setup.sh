#!/bin/bash

# BoostIQ Pro Mobile Setup Script
echo "🚀 Setting up BoostIQ Pro Mobile..."

# Ensure assets folder exists
mkdir -p assets

# Download default assets if they don't exist
if [ ! -f "assets/icon.png" ]; then
  echo "📥 Downloading default icon..."
  curl -s https://github.com/expo/expo/raw/master/templates/expo-template-blank/assets/icon.png -o assets/icon.png
fi

if [ ! -f "assets/splash.png" ]; then
  echo "📥 Downloading default splash screen..."
  curl -s https://github.com/expo/expo/raw/master/templates/expo-template-blank/assets/splash.png -o assets/splash.png
fi

if [ ! -f "assets/adaptive-icon.png" ]; then
  echo "📥 Downloading default adaptive icon..."
  curl -s https://github.com/expo/expo/raw/master/templates/expo-template-blank/assets/adaptive-icon.png -o assets/adaptive-icon.png
fi

# Fix vulnerabilities
echo "🛡️ Fixing npm vulnerabilities..."
npm audit fix

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Setup complete! You can now run the app with 'npm start'"
