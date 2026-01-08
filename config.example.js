// API Configuration Template
// Copy this file to config.js and add your actual public API key

const API_CONFIG = {
    // Public API key for RSVP submissions
    // Get this from your backend .env file (PUBLIC_API_KEY)
    // This will be visible in the frontend code, which is OK
    // It only allows submitting RSVPs, not viewing or deleting them
    PUBLIC_API_KEY: 'YOUR_PUBLIC_KEY_HERE',

    // API endpoint (usually auto-detected)
    API_URL: window.location.origin + '/api'
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
