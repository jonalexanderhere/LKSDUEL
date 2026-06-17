const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgres://postgres.yjnazvgjbqleseevnrcm:CdyHVvymA5Q3b8BV@aws-1-us-east-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  
  const sql = `
CREATE OR REPLACE FUNCTION public.create_team(p_name text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_team_id UUID;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admin can create teams';
  END IF;
  INSERT INTO public.teams(name, invite_code, secret_key, access_token, captain_user_id)
  VALUES (p_name, generate_random_token(), generate_random_token(), generate_random_token(), NULL)
  RETURNING id INTO v_team_id;
  RETURN v_team_id;
END;
$function$
  `;
  
  await client.query(sql);
  console.log("Function create_team updated successfully.");
  await client.end();
}

main().catch(console.error);
