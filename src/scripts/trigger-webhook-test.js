const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local or .env
const loadEnv = () => {
  const envPaths = ['.env.local', '.env'];
  for (const envPath of envPaths) {
    try {
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
          const match = line.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            const val = match[2].trim().replace(/^["']|["']$/g, '');
            process.env[key] = val;
          }
        });
        console.log(`[Test] Loaded environment from ${envPath}`);
        return;
      }
    } catch (err) {}
  }
};

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Test] Supabase credentials not found in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  try {
    console.log('[Test] Querying database for a test user...');
    
    // 1. Get a test user ID
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, username')
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.error('[Test] No users found in database to simulate solve:', userError);
      return;
    }
    const testUser = users[0];
    console.log(`[Test] Using test user: ${testUser.username} (${testUser.id})`);

    // 2. Create a temporary challenge to guarantee 0 solves
    console.log('[Test] Creating temporary challenge for First Blood test...');
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .insert({
        title: 'Discord Webhook Test',
        description: 'Temp test challenge',
        category: 'Misc',
        points: 100,
        difficulty: 'Easy',
        is_active: true
      })
      .select('id, title, category')
      .single();

    if (challengeError || !challenge) {
      console.error('[Test] Failed to create temp challenge:', challengeError);
      return;
    }
    
    console.log(`[Test] Created temp challenge: "${challenge.title}" (${challenge.id})`);

    // 3. Insert a solve (this will trigger the Supabase webhook)
    console.log('[Test] Inserting solve to trigger Webhook...');
    const { data: solve, error: solveError } = await supabase
      .from('solves')
      .insert({
        user_id: testUser.id,
        challenge_id: challenge.id
      })
      .select('id, created_at')
      .single();

    if (solveError || !solve) {
      console.error('[Test] Failed to insert solve:', solveError);
      // Cleanup challenge
      await supabase.from('challenges').delete().eq('id', challenge.id);
      return;
    }
    
    console.log(`[Test] Solve inserted: ID ${solve.id} at ${solve.created_at}`);
    console.log('[Test] Waiting 10 seconds for Supabase Webhook to trigger Vercel/Discord...');

    // Wait 10 seconds
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 4. Cleanup
    console.log('[Test] Cleaning up temporary database entries...');
    await supabase.from('solves').delete().eq('id', solve.id);
    await supabase.from('challenges').delete().eq('id', challenge.id);

    console.log('[Test] Cleanup complete. Check your Discord server!');

  } catch (err) {
    console.error('[Test] Error during test execution:', err.message);
  }
}

runTest();
