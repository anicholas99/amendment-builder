const fs = require('fs');
const path = require('path');

// Get the environment from command line argument
const env = process.argv[2];
const validEnvs = ['development', 'staging', 'production'];

if (!env || !validEnvs.includes(env)) {
  console.error(`Please specify a valid environment: ${validEnvs.join(', ')}`);
  process.exit(1);
}

// Port mapping for different environments
const ports = {
  development: 3000,
  staging: 3001,
  production: 3002,
};

// Load the appropriate .env file
const envFile = path.join(process.cwd(), `.env.${env}`);
if (!fs.existsSync(envFile)) {
  console.error(`Environment file ${envFile} not found`);
  process.exit(1);
}

// Read the environment file
const envContent = fs.readFileSync(envFile, 'utf8');

// Create/update .env.local with the content
fs.writeFileSync(path.join(process.cwd(), '.env.local'), envContent);

console.log(`Switched to ${env} environment (Port ${ports[env]})`);
console.log(`To start the server, run: npm run dev -- -p ${ports[env]}`);
