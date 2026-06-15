import { LINKS, YEAR, DIFFICULTY_STYLES, LKSDUEL_ARENA } from './const'

export const APP = {
  shortName: "LKSDUEL",
  fullName: "LKS DUEL",
  description: "Platform kompetisi siber modern yang dikhususkan untuk penyelenggaraan lomba Capture The Flag.",
  flagFormat: "LKSDUEL{your_flag_here}",

  challengeCategories: [
    "Intro",
    "Boot To Root",
    "Web",
    "Forensics",
    "Osint",
    "Crypto",
    "Reverse",
    "Pwn",
    "Stegnography",
    "Misc",
    "Network"
  ],

  // Base URL (ambil dari env kalau ada). Prefer changing NEXT_PUBLIC_SITE_URL in .env.local.
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  image_icon: 'lks-980x917.png',
  image_logo: 'lks-980x917.png',
  image_preview: '68065832af587.webp',

  // Turnstile aktif otomatis kalau site key ada di env.
  captchaEnabled: Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()),
  captchaSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || '',

  /* Setting Config */
  notifSolves: true, // notifikasi global saat ada yang solve challenge

  teams: {
    enabled: true,
    hideScoreboardIndividual: false,
    hidescoreboardTotal: false,
  },
  hideEventMain: false, // enable / disable hiding "Main Event" in event selector (useful for single event nxctf)
  // Label untuk challenges tanpa event_id (event_id = NULL). Jika kosong, fallback ke "Main".

  eventMainLabel: "main",
  // Gambar untuk "Main/Featured" event (boleh URL external atau path public). Contoh:
  // 'https://example.com/banner.png' atau '/images/banner.png'
  eventMainImageUrl: "/68065832af587.webp",
  // Fallback image untuk event yang tidak punya image_url.
  eventFallbackImageUrl: "/telkom.jpg",

  /* Maintenance configuration (env-only): NEXT_PUBLIC_MAINTENANCE_MODE should be 'yes' or 'no'. */
  maintenance: {
    mode: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'yes' ? 'yes' : 'no',
  },

  links: {
    ...LINKS,
    discord: "https://discord.gg/5etKks6aQQ",
  },
  difficultyStyles: DIFFICULTY_STYLES,
  year: YEAR,
  nxctf: LKSDUEL_ARENA
}

export default APP
