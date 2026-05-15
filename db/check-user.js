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

async function check() {
    const id = 'd8851b33-5415-4c29-a378-ef21f4fe0086';
    const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    const client = new Client({
        connectionString: connectionString.replace(/sslmode=[^&]+&?/, '').replace(/\?$/, '').replace(/\?&/, '?'),
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query("SELECT id FROM auth.users WHERE id = $1", [id]);
        console.log('Auth user found:', res.rows.length > 0);
        
        const res2 = await client.query("SELECT id, username FROM public.users WHERE id = $1", [id]);
        console.log('Public user found:', res2.rows.length > 0 ? res2.rows[0] : 'No');
        
        if (res.rows.length > 0 && res2.rows.length === 0) {
            console.log('User exists in auth but not public. Inserting into public...');
            await client.query("INSERT INTO public.users (id, username) VALUES ($1, $2)", [id, 'tester_user']);
            console.log('Inserted.');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

check();
