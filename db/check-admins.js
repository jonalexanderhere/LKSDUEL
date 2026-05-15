const fs = require('fs');
const { Client } = require('pg');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const envContent = fs.readFileSync('.env.local', 'utf8');
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        process.env[match[1].trim()] = match[2].trim();
    }
});

async function checkAdmins() {
    const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    const client = new Client({
        connectionString: connectionString.replace(/sslmode=[^&]+&?/, '').replace(/\?$/, '').replace(/\?&/, '?'),
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        const res = await client.query(`
            SELECT id, username, is_admin FROM public.users 
            WHERE id IN ('03c2df41-70c3-4b06-9419-cef136e96165', '5fcf673b-9223-4087-bb71-e1727c80fef2')
        `);
        
        console.log('Admin Status:');
        res.rows.forEach(row => {
            console.log(`- ${row.username} (${row.id}): is_admin = ${row.is_admin}`);
        });
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

checkAdmins();
