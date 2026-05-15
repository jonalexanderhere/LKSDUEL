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

async function testBroadcast() {
    const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    const client = new Client({
        connectionString: connectionString.replace(/sslmode=[^&]+&?/, '').replace(/\?$/, '').replace(/\?&/, '?'),
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        const userId = '03c2df41-70c3-4b06-9419-cef136e96165'; // Admin user
        
        console.log('Testing create_notification RPC...');
        // We simulate the RPC call via SQL since we are direct. 
        // But we want to see if it works when called as the user.
        
        // Let's check if the function exists and its parameters
        const funcRes = await client.query(`
            SELECT proname, proargnames, proargtypes 
            FROM pg_proc 
            WHERE proname = 'create_notification';
        `);
        console.log('Function info:', funcRes.rows[0]);

        // Attempt to create a notification
        const res = await client.query(`
            SELECT create_notification($1, $2, $3)
        `, ['Test Broadcast', 'This is a test message', 'info']);
        
        console.log('Created notification ID:', res.rows[0].create_notification);
        
        // Verify it exists in table
        const checkRes = await client.query(`
            SELECT * FROM public.notifications WHERE id = $1
        `, [res.rows[0].create_notification]);
        
        console.log('Notification in DB:', checkRes.rows[0]);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

testBroadcast();
