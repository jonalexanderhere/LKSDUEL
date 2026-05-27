import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/const';

async function sendDiscordNotification(payload: any) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_CHANNEL_ID;
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (botToken && channelId) {
    console.log('[FirstBlood Webhook] Sending via Discord Bot Token to channel:', channelId);
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Discord Bot API Error: ${text}`);
    }
    return true;
  } else if (webhookUrl) {
    console.log('[FirstBlood Webhook] Sending via Discord Webhook URL');
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Discord Webhook Error: ${text}`);
    }
    return true;
  } else {
    throw new Error('Neither Discord Bot (DISCORD_BOT_TOKEN + DISCORD_CHANNEL_ID) nor Webhook (DISCORD_WEBHOOK_URL) is configured.');
  }
}

export async function POST(req: Request) {
  try {
    const secretToken = process.env.WEBHOOK_SECRET;
    if (secretToken) {
      const headerSecret = req.headers.get('x-webhook-secret');
      if (headerSecret !== secretToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await req.json();
    console.log('[FirstBlood Webhook] Received payload:', body);

    // Support both Supabase Webhook payload format and direct JSON
    // Supabase Webhook format: { type: 'INSERT', table: 'solves', record: { id, user_id, challenge_id } }
    const record = body.record || body;
    const challengeId = record.challenge_id;
    const userId = record.user_id;
    const solveId = record.id;

    if (!challengeId || !userId) {
      return NextResponse.json({ error: 'Missing challenge_id or user_id' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Verify if this solve is the first blood for the challenge
    const { data: solves, error: solvesError } = await supabase
      .from('solves')
      .select('id, user_id, created_at')
      .eq('challenge_id', challengeId)
      .order('created_at', { ascending: true });

    if (solvesError || !solves || solves.length === 0) {
      return NextResponse.json({ error: 'No solves found for this challenge' }, { status: 404 });
    }

    const firstSolve = solves[0];
    const isFirstBlood = solveId ? firstSolve.id === solveId : firstSolve.user_id === userId;

    if (!isFirstBlood) {
      console.log(`[FirstBlood Webhook] Solve is not first blood. Solve owner: ${userId}, First solver: ${firstSolve.user_id}`);
      return NextResponse.json({ message: 'Not a first blood solve. Notification skipped.' });
    }

    // 2. Fetch User Info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    const username = user?.username || 'Unknown Player';

    // 3. Fetch Challenge Info
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('title, category')
      .eq('id', challengeId)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Challenge details not found' }, { status: 404 });
    }

    // 4. Fetch Team Name
    let teamName = '-';
    try {
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('teams(name)')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      const resolvedTeam = (teamMember as any)?.teams?.name;
      if (resolvedTeam) {
        teamName = resolvedTeam;
      }
    } catch (err) {
      console.error('[FirstBlood Webhook] Failed to fetch team info:', err);
    }

    // 5. Send to Discord
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

    await sendDiscordNotification(discordPayload);

    console.log(`[FirstBlood Webhook] Sent Discord notification for ${username} on ${challenge.title}`);
    return NextResponse.json({ success: true, message: 'First blood notification sent to Discord' });

  } catch (err: any) {
    console.error('[FirstBlood Webhook] Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
