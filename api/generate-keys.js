const crypto = require('crypto');

/**
 * Generate API keys for the wedding invitation app
 * Run this script once to generate keys, then add them to your .env file
 */

// Generate public key (for frontend submissions)
const publicKey = 'pk_' + crypto.randomBytes(32).toString('hex');

// Generate private key (for admin operations)
const privateKey = 'sk_' + crypto.randomBytes(32).toString('hex');

console.log('\n🔐 Generated API Keys\n');
console.log('Add these to your .env file:\n');
console.log(`PUBLIC_API_KEY=${publicKey}`);
console.log(`PRIVATE_API_KEY=${privateKey}`);
console.log('\n⚠️  Keep the PRIVATE_API_KEY secret!');
console.log('✅ The PUBLIC_API_KEY can be used in frontend code\n');

// Also save to a file for convenience
const fs = require('fs');
const envContent = `
# API Keys - Generated on ${new Date().toISOString()}
PUBLIC_API_KEY=${publicKey}
PRIVATE_API_KEY=${privateKey}

# Server Configuration
PORT=3000
NODE_ENV=development

# PostgreSQL Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/wedding_rsvp
`;

fs.writeFileSync('.env', envContent.trim());
console.log('✅ Keys saved to .env file\n');
