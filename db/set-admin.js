const fs = require('fs');
const { Client } = require('pg');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Manual env parser
const envContent = fs.readFileSync('.env.local', 'utf8');
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        process.env[match[1].trim()] = match[2].trim();
    }
});

async function setAdmins() {
    const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
    const client = new Client({
        connectionString: connectionString.replace(/sslmode=[^&]+&?/, '').replace(/\?$/, '').replace(/\?&/, '?'),
        ssl: { rejectUnauthorized: false }
    });

    const adminIds = [
        '03c2df41-70c3-4b06-9419-cef136e96165',
        '5fcf673b-9223-4087-bb71-e1727c80fef2'
    ];

    try {
        await client.connect();
        for (const id of adminIds) {
            console.log(`Setting admin for user ID: ${id}`);
            const res = await client.query('UPDATE public.users SET is_admin = true WHERE id = $1', [id]);
            console.log(`Updated ${res.rowCount} row(s).`);
        }
        console.log('Admin update complete.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

setAdmins();
