const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgres://postgres.yjnazvgjbqleseevnrcm:CdyHVvymA5Q3b8BV@aws-1-us-east-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  
  const sql = `
CREATE OR REPLACE FUNCTION public.set_user_admin_status(p_user_id uuid, p_is_admin boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admin can change admin status';
  END IF;
  
  UPDATE public.users 
  SET is_admin = p_is_admin 
  WHERE id = p_user_id;
  
  RETURN TRUE;
END;
$function$
  `;
  
  await client.query(sql);
  console.log("Function set_user_admin_status created successfully.");
  await client.end();
}

main().catch(console.error);
