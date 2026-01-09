import crypto from 'crypto';
import fs from 'fs';

/**
 * Generate API keys for the wedding invitation app
 * Run this script once to generate keys, then add them to your .env file
 */

// Generate public key (for frontend submissions)
const publicKey = 'pk_' + crypto.randomBytes(32).toString('hex');

// Generate private key (for admin operations)
const privateKey = 'sk_' + crypto.randomBytes(32).toString('hex');

// Generate JWT secret (for admin tokens)
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('\n🔐 Generated API Keys & Secrets\n');
console.log('Add these to your .env file or DigitalOcean Environment Variables:\n');
console.log(`PUBLIC_API_KEY=${publicKey}`);
console.log(`PRIVATE_API_KEY=${privateKey}`);
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('\n⚠️  Keep the PRIVATE_API_KEY and JWT_SECRET secret!');
console.log('✅ The PUBLIC_API_KEY can be used in frontend code\n');

const envContent = `
# API Keys & Secrets - Generated on ${new Date().toISOString()}
PUBLIC_API_KEY=${publicKey}
PRIVATE_API_KEY=${privateKey}
JWT_SECRET=${jwtSecret}

# Server Configuration
PORT=3000
NODE_ENV=development

# PostgreSQL Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wedding_db
`;

if (!fs.existsSync('.env')) {
    fs.writeFileSync('.env', envContent.trim());
    console.log('✅ Keys and JWT_SECRET saved to .env file\n');
} else {
    console.log('⚠️  .env file already exists. Please update it manually with the values above.\n');
}
