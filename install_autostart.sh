#!/bin/bash

echo "Installing Task & Time Tracker autostart..."

# Make start script executable
chmod +x /Users/alex/Task_and_time/start_app.sh

# Copy plist file to LaunchAgents directory
cp /Users/alex/Task_and_time/com.taskandtime.app.plist ~/Library/LaunchAgents/

# Load the launch agent
launchctl load ~/Library/LaunchAgents/com.taskandtime.app.plist

echo ""
echo "✓ Autostart installed successfully!"
echo ""
echo "The application will now start automatically when you log in."
echo ""
echo "Commands:"
echo "  To stop autostart:    launchctl unload ~/Library/LaunchAgents/com.taskandtime.app.plist"
echo "  To start now:         launchctl start com.taskandtime.app"
echo "  To stop now:          launchctl stop com.taskandtime.app"
echo "  To remove autostart:  rm ~/Library/LaunchAgents/com.taskandtime.app.plist"
echo ""
echo "Logs are located at:"
echo "  /tmp/task_and_time.log"
echo "  /tmp/task_and_time_stdout.log"
echo "  /tmp/task_and_time_stderr.log"
echo ""

