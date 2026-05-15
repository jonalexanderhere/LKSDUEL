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

async function createDummyUsers() {
    const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    const client = new Client({
        connectionString: connectionString.replace(/sslmode=[^&]+&?/, '').replace(/\?$/, '').replace(/\?&/, '?'),
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        const testerIds = [];
        for (let i = 1; i <= 3; i++) {
            const id = crypto.randomUUID();
            testerIds.push(id);
            const email = `dummy_tester_team_test_${i}_${Date.now()}@example.com`;
            console.log(`Creating dummy user ${i}: ${email} (${id})`);
            
            await client.query(`
                INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, aud, role, raw_app_meta_data, raw_user_meta_data)
                VALUES ($1, '00000000-0000-0000-0000-000000000000', $2, 'dummy_hash', now(), 'authenticated', 'authenticated', '{}', '{}')
            `, [id, email]);
            
            await client.query(`
                INSERT INTO public.users (id, username)
                VALUES ($1, $2)
                ON CONFLICT (id) DO NOTHING
            `, [id, `tester_${i}_${Math.floor(Math.random()*10000)}`]);
        }
        
        console.log('Dummy users created.');
        
        const teamId = 'b2b2b2b2-b2b2-4b2b-c2c2-c2c2c2c2c2c2'; // Cyber Wizards
        
        for (const userId of testerIds) {
            console.log(`Testing join_team for user ${userId} to team ${teamId}...`);
            try {
                // Note: v_count includes existing members.
                // Current member: 1 (steven).
                // 1st join -> v_count 1 (Success, now 2)
                // 2nd join -> v_count 2 (Success, now 3)
                // 3rd join -> v_count 3 (Fail)
                await client.query(`
                    DO $$
                    DECLARE
                        v_count INT;
                    BEGIN
                        SELECT COUNT(*) INTO v_count FROM public.team_members WHERE team_id = '${teamId}';
                        IF v_count >= 3 THEN
                            RAISE EXCEPTION 'Team is full (Max 3 members)';
                        END IF;
                        INSERT INTO public.team_members (team_id, user_id) VALUES ('${teamId}', '${userId}');
                    END $$;
                `);
                console.log(`User ${userId} joined successfully.`);
            } catch (err) {
                console.log(`User ${userId} failed to join: ${err.message}`);
            }
        }
        
    } catch (err) {
        console.error('Fatal Error:', err.message);
    } finally {
        await client.end();
    }
}

createDummyUsers();
