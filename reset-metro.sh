#!/bin/bash

echo "🧹 Clearing Metro bundler cache..."

# Kill any running Metro processes
echo "📱 Stopping any running Metro processes..."
pkill -f "cli.js start" || true

# Clear cache
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-map-* 2>/dev/null || true
rm -rf node_modules/.cache/babel-loader/* 2>/dev/null || true
rm -rf .expo/ 2>/dev/null || true

echo "📦 Reinstalling node modules..."
npm install

echo "🚀 Starting Expo with clean cache..."
npm start -- --clear
