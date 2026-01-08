#!/bin/bash
# Build script for DigitalOcean App Platform
# This script injects the PUBLIC_API_KEY into config.js during build

echo "🔧 Building wedding invitation frontend..."

# Check if PUBLIC_API_KEY is set
if [ -z "$PUBLIC_API_KEY" ]; then
    echo "⚠️  Warning: PUBLIC_API_KEY not set. Using placeholder."
    PUBLIC_API_KEY="YOUR_PUBLIC_KEY_HERE"
fi

# Create config.js from template with the actual public key
cat > config.js << EOF
// API Configuration
// This file is auto-generated during build from environment variables
// DO NOT edit manually - changes will be overwritten

const API_CONFIG = {
    // Public API key for RSVP submissions (injected during build)
    PUBLIC_API_KEY: '${PUBLIC_API_KEY}',
    
    // API endpoint
    API_URL: window.location.origin + '/api'
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
EOF

echo "✅ config.js generated with PUBLIC_API_KEY"
echo "✅ Build complete!"
