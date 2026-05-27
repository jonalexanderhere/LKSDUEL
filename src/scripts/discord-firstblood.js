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
            const val = match[2].trim().replace(/^["']|["']$/g, ''); // strip optional quotes
            process.env[key] = val;
          }
        });
        console.log(`[Discord Bot] Loaded environment from ${envPath}`);
        return;
      }
    } catch (err) {
      console.warn(`[Discord Bot] Failed to read ${envPath}:`, err.message);
    }
  }
};

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Discord Bot] Missing Supabase credentials in environment.');
  process.exit(1);
}

if (!webhookUrl) {
  console.error('[Discord Bot] Missing DISCORD_WEBHOOK_URL in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('[Discord Bot] Subscribing to solves table INSERT events...');

const channel = supabase
  .channel('discord-firstblood-listener')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'solves' }, async (payload) => {
    try {
      const solve = payload.new;
      if (!solve || !solve.challenge_id || !solve.user_id) {
        console.log('[Discord Bot] Invalid solve event payload:', payload);
        return;
      }

      console.log(`[Discord Bot] New solve detected! Solve ID: ${solve.id}, Challenge ID: ${solve.challenge_id}`);

      // 1. Check if first blood
      const { data: solves, error: solvesError } = await supabase
        .from('solves')
        .select('id, user_id, created_at')
        .eq('challenge_id', solve.challenge_id)
        .order('created_at', { ascending: true });

      if (solvesError || !solves || solves.length === 0) {
        console.warn('[Discord Bot] Failed to fetch solves list:', solvesError);
        return;
      }

      const isFirstBlood = solves[0].id === solve.id;
      if (!isFirstBlood) {
        console.log('[Discord Bot] Solve is not first blood. Skipping Discord notification.');
        return;
      }

      console.log('[Discord Bot] First Blood detected! Preparing Discord embed...');

      // 2. Fetch Player Info
      const { data: user } = await supabase
        .from('users')
        .select('username')
        .eq('id', solve.user_id)
        .single();
      
      const username = user ? user.username : 'Unknown';

      // 3. Fetch Challenge Info
      const { data: challenge } = await supabase
        .from('challenges')
        .select('title, category')
        .eq('id', solve.challenge_id)
        .single();

      if (!challenge) {
        console.warn('[Discord Bot] Challenge not found. ID:', solve.challenge_id);
        return;
      }

      // 4. Fetch Team Name
      let teamName = '-';
      try {
        const { data: teamMember } = await supabase
          .from('team_members')
          .select('teams(name)')
          .eq('user_id', solve.user_id)
          .limit(1)
          .maybeSingle();

        const resolvedTeam = teamMember?.teams?.name;
        if (resolvedTeam) {
          teamName = resolvedTeam;
        }
      } catch (err) {
        console.error('[Discord Bot] Failed to resolve team name:', err.message);
      }

      // 5. Send Discord Webhook
      const discordPayload = {
        embeds: [
          {
            title: '🩸 FIRST BLOOD!',
            description: `A challenge has been solved for the first time!`,
            color: 15158332, // Red
            fields: [
              {
                name: '👤 Player',
                value: username,
                inline: true
              },
              {
                name: '👥 Team',
                value: teamName,
                inline: true
              },
              {
                name: '📂 Category',
                value: challenge.category,
                inline: true
              },
              {
                name: '🚩 Challenge',
                value: `**${challenge.title}**`,
                inline: true
              }
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: 'SCTF Platform Alert'
            }
          }
        ]
      };

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(discordPayload)
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('[Discord Bot] Discord Webhook API Error:', text);
      } else {
        console.log(`[Discord Bot] Successfully sent first blood alert to Discord for player "${username}" on challenge "${challenge.title}"`);
      }

    } catch (err) {
      console.error('[Discord Bot] Error handling solve change:', err.message);
    }
  })
  .subscribe((status) => {
    console.log(`[Discord Bot] Supabase subscription status: ${status}`);
  });

// Keep process alive
console.log('[Discord Bot] Standalone Listener is running. Press Ctrl+C to exit.');
setInterval(() => {}, 60000);
