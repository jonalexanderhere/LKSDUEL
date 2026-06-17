const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgres://postgres.yjnazvgjbqleseevnrcm:CdyHVvymA5Q3b8BV@aws-1-us-east-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  const res = await client.query(`
    SELECT table_name FROM information_schema.tables WHERE table_schema='public';
  `);
  console.log(res.rows);
  
  const cols = await client.query(`
    SELECT column_name, data_type FROM information_schema.columns WHERE table_name='users';
  `);
  console.log(cols.rows);
  
  await client.end();
}

main().catch(console.error);
