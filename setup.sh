#!/bin/bash

echo "Setting up Task & Time Tracker..."

# Install dependencies
echo "Installing dependencies with Pixi..."
pixi install

# Create necessary directories
mkdir -p data
mkdir -p static/sounds

echo ""
echo "Setup complete!"
echo ""
echo "To start the application, run:"
echo "  pixi run dev"
echo ""
echo "Then open your browser and navigate to:"
echo "  http://localhost:5000"

