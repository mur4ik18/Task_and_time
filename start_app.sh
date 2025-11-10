#!/bin/bash

# Script to start Task & Time Tracker application
# This script is designed to run on system startup

# Change to the application directory
cd "$(dirname "$0")"

# Wait a bit for system to fully start
sleep 5

# Activate pixi environment and run the application in daemon mode
/opt/homebrew/bin/pixi run python start_app_daemon.py >> /tmp/task_and_time.log 2>&1 &

# Open browser after a short delay
sleep 3
open http://localhost:5010

