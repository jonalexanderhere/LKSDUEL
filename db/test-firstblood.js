const fs = require('fs');
const { Client } = require('pg');
const crypto = require('crypto');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const envContent = fs.readFileSync('.env.local', 'utf8');
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        process.env[match[1].trim()] = match[2].trim();
    }
});

async function testFirstBlood() {
    const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    const client = new Client({
        connectionString: connectionString.replace(/sslmode=[^&]+&?/, '').replace(/\?$/, '').replace(/\?&/, '?'),
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        const challId = crypto.randomUUID();
        const userId = '03c2df41-70c3-4b06-9419-cef136e96165'; // fahriazhar148
        
        console.log(`1. Creating a new challenge: Test First Blood (${challId})`);
        await client.query(`
            INSERT INTO public.challenges (id, title, description, category, points, difficulty, is_active)
            VALUES ($1, 'Test First Blood', 'Test Description', 'Test', 100, 'Easy', true)
        `, [challId]);
        
        console.log(`2. Simulating a solve for challenge ${challId} by user ${userId}`);
        const solveId = crypto.randomUUID();
        await client.query(`
            INSERT INTO public.solves (id, user_id, challenge_id, created_at)
            VALUES ($1, $2, $3, now())
        `, [solveId, userId, challId]);
        
        console.log(`3. Checking get_solve_info for the solve...`);
        const res = await client.query(`
            SELECT * FROM get_solve_info($1, $2)
        `, [userId, challId]);
        
        console.log('Result:', JSON.stringify(res.rows[0]));
        
        if (res.rows[0].is_first_blood === true) {
            console.log('SUCCESS: is_first_blood is TRUE for the first solver.');
        } else {
            console.log('FAILED: is_first_blood is FALSE for the first solver.');
        }
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

testFirstBlood();
