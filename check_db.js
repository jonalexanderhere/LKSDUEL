const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgres://postgres.yjnazvgjbqleseevnrcm:CdyHVvymA5Q3b8BV@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
  });

  await client.connect();
  const res = await client.query(`
    SELECT prosrc FROM pg_proc WHERE proname = 'create_team';
  `);
  console.log(res.rows[0].prosrc);
  await client.end();
}

main().catch(console.error);
