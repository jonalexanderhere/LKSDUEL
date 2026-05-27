const fs = require('fs');

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

const botToken = process.env.DISCORD_BOT_TOKEN;
const channelId = process.env.DISCORD_CHANNEL_ID;

if (!botToken || !channelId) {
  console.error('[Test] DISCORD_BOT_TOKEN or DISCORD_CHANNEL_ID not set in .env.local');
  process.exit(1);
}

async function testConnection() {
  console.log('[Test] Sending test message to Discord Channel:', channelId);
  const payload = {
    embeds: [
      {
        title: '🧪 SCTF Bot Connection Test',
        description: 'Successfully connected! The Discord bot is ready to notify First Bloods.',
        color: 3066993, // Green
        fields: [
          {
            name: 'Status',
            value: '✅ Online & Authorized',
            inline: true
          },
          {
            name: 'Channel ID',
            value: channelId,
            inline: true
          }
        ],
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log('[Test] Success! Check your Discord channel for the test message.');
    } else {
      const text = await res.text();
      console.error('[Test] Failed to send message. Discord API Response:', text);
    }
  } catch (err) {
    console.error('[Test] Fetch error:', err.message);
  }
}

testConnection();
