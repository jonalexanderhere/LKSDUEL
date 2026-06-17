const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgres://postgres.yjnazvgjbqleseevnrcm:CdyHVvymA5Q3b8BV@aws-1-us-east-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  const res = await client.query(`
    SELECT proname, proargnames FROM pg_proc WHERE proname LIKE '%admin%';
  `);
  console.log(res.rows);
  await client.end();
}

main().catch(console.error);
