const fs = require('fs');
const { Client } = require('pg');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const envContent = fs.readFileSync('.env.local', 'utf8');
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
});
let conn = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
if(conn) conn = conn.replace(/sslmode=[^&]+&?/, '').replace(/\?$/, '').replace(/\?&/, '?');
const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
client.connect().then(() => {
    console.log('Wiping existing schema...');
    return client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;');
}).then(() => {
    console.log('Schema wiped successfully!');
    client.end();
}).catch(err => {
    console.error(err);
    client.end();
});
