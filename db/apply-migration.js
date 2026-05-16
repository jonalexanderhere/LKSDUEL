const { Client } = require('pg');
const fs = require('fs');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
const env = {};
envLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const connectionString = env.POSTGRES_URL;

if (!connectionString) {
  console.error('POSTGRES_URL not found in .env.local');
  process.exit(1);
}

const migrationPath = path.join(__dirname, 'migration_teams.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    console.log('Connecting to Supabase Postgres...');
    await client.connect();
    console.log('Applying migration...');
    await client.query(sql);
    console.log('Migration applied successfully!');
  } catch (err) {
    console.error('Error applying migration:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
