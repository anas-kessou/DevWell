#!/bin/bash

# Install markdown and syntax highlighting packages for DevWell AI chatbot
echo "📦 Installing markdown and code formatting packages..."

cd "$(dirname "$0")"

npm install \
  react-markdown@^9.0.0 \
  remark-gfm@^4.0.0 \
  react-syntax-highlighter@^15.5.0 \
  @types/react-syntax-highlighter@^15.5.0 \
  --legacy-peer-deps

echo "✅ Packages installed successfully!"
echo "🚀 You can now use:"
echo "   - Markdown formatting (bold, italic, headers)"
echo "   - Code blocks with syntax highlighting"
echo "   - Inline code formatting"
echo "   - Lists, links, and more"
