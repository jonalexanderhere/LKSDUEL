const { Client } = require('pg');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const conn = 'postgres://postgres.yjnazvgjbqleseevnrcm:CdyHVvymA5Q3b8BV@aws-1-us-east-1.pooler.supabase.com:5432/postgres';
const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });

async function main() {
    await client.connect();
    try {
        const res = await client.query(`
            INSERT INTO public.users (id, username, is_admin) 
            SELECT id, split_part(email, '@', 1), true 
            FROM auth.users 
            WHERE email IN ('king@lksduel.com', 'queen@lksduel.com', 'knight@lksduel.com') 
            ON CONFLICT (id) DO UPDATE SET is_admin = true;
        `);
        console.log('Inserted ' + res.rowCount + ' admins into public.users');
    } catch(err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}
main();
