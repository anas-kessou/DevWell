#!/bin/bash

# Helper script to add your Gemini API key to the .env file
# Usage: ./add-api-key.sh YOUR_API_KEY

if [ -z "$1" ]; then
    echo "❌ Error: Please provide your Gemini API key as an argument"
    echo ""
    echo "Usage: ./add-api-key.sh YOUR_API_KEY"
    echo ""
    echo "Get your API key from: https://aistudio.google.com/apikey"
    exit 1
fi

API_KEY="$1"

# Update the .env file
if grep -q "VITE_API_KEY=" .env; then
    # Replace existing placeholder
    sed -i "s|VITE_API_KEY=.*|VITE_API_KEY=$API_KEY|" .env
    echo "✅ API key updated in .env file"
else
    # Add new line
    echo "VITE_API_KEY=$API_KEY" >> .env
    echo "✅ API key added to .env file"
fi

echo ""
echo "🔄 Next steps:"
echo "1. Restart your dev server (Ctrl+C, then 'npm run dev')"
echo "2. Click 'Start Session' on the dashboard"
echo ""
