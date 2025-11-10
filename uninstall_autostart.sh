#!/bin/bash

echo "Removing Task & Time Tracker autostart..."

# Unload the launch agent if it's loaded
launchctl unload ~/Library/LaunchAgents/com.taskandtime.app.plist 2>/dev/null

# Remove the plist file
rm ~/Library/LaunchAgents/com.taskandtime.app.plist 2>/dev/null

echo ""
echo "✓ Autostart removed successfully!"
echo ""

