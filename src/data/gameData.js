// Base rarities — heavy common pool drives duplicates; legendary/epic extremely scarce
// Total weight = 1000
export const BASE_RARITIES = [
  { rarity: 'LEGENDARY', weight:   2 }, //  0.2%
  { rarity: 'EPIC',      weight:   8 }, //  0.8%
  { rarity: 'RARE',      weight:  90 }, //  9%
  { rarity: 'COMMON',    weight: 900 }, // 90%
]

// Golden: 0.3% — extremely rare overlay
export const GOLDEN_CHANCE = 0.003

export function rollRarity() {
  const total = BASE_RARITIES.reduce((s, r) => s + r.weight, 0)
  let roll = Math.random() * total
  let base = 'COMMON'
  for (const r of BASE_RARITIES) {
    roll -= r.weight
    if (roll <= 0) { base = r.rarity; break }
  }
  return Math.random() < GOLDEN_CHANCE ? `GOLDEN_${base}` : base
}

// Returns only the base rarity (COMMON | RARE | EPIC | LEGENDARY), no golden.
// Used by openPack so coin is chosen from the matching rarity pool first,
// then golden is applied as a separate 2% overlay.
export function rollBaseRarity() {
  const total = BASE_RARITIES.reduce((s, r) => s + r.weight, 0)
  let roll = Math.random() * total
  for (const r of BASE_RARITIES) {
    roll -= r.weight
    if (roll <= 0) return r.rarity
  }
  return 'COMMON'
}

// Ordered from lowest to highest (used for rarest comparison)
export const RARITY_ORDER = [
  'COMMON',
  'GOLDEN_COMMON',
  'RARE',
  'GOLDEN_RARE',
  'EPIC',
  'GOLDEN_EPIC',
  'LEGENDARY',
  'GOLDEN_LEGENDARY',
]

// Fixed IDs matching the `rarities` table in Supabase.
export const RARITY_IDS = {
  COMMON:           1,
  GOLDEN_COMMON:    2,
  RARE:             3,
  GOLDEN_RARE:      4,
  EPIC:             5,
  GOLDEN_EPIC:      6,
  LEGENDARY:        7,
  GOLDEN_LEGENDARY: 8,
}

// Reverse lookup: id → name
export const RARITY_BY_ID = Object.fromEntries(
  Object.entries(RARITY_IDS).map(([name, id]) => [id, name])
)

// ── GAMIFICATION DATA ────────────────────────────────────────────────────────

// Rarity score used for battle power calculations
export const RARITY_SCORE = {
  COMMON:           1,
  GOLDEN_COMMON:    2,
  RARE:             5,
  GOLDEN_RARE:      10,
  EPIC:             25,
  GOLDEN_EPIC:      50,
  LEGENDARY:        100,
  GOLDEN_LEGENDARY: 200,
}

// $RIPZ earning rates (off-chain Phase 1)
export const RIPZ_REWARDS = {
  DAILY_LOGIN:       10,
  PULL_RARE:          5,
  PULL_EPIC:         20,
  PULL_LEGENDARY:    50,
  PULL_GOLDEN:       25,
  WATCH_AD:           2,
  SHARE_PULL:         5,
  WIN_BATTLE:        15,
  LOSE_BATTLE:        5,
  COMPLETE_MISSION:  20, // default; missions override with their own reward
  SELL_FEE:        0.95, // seller gets 95% of sale price
}

// Parse number strings like "1.5B", "400M", "50K"
function _parseNum(val) {
  if (!val && val !== 0) return 0
  if (typeof val === 'number') return val
  const s = String(val).replace(/[$,\s]/g, '').toUpperCase()
  const n = parseFloat(s)
  if (isNaN(n)) return 0
  if (s.endsWith('B')) return n * 1_000_000_000
  if (s.endsWith('M')) return n * 1_000_000
  if (s.endsWith('K')) return n * 1_000
  return n
}

// Compute battle stats from on-chain coin data
export function computeCardStats(coin) {
  const mc      = _parseNum(coin?.['MARKET CAP'])
  const holders = _parseNum(coin?.['HOLDERS'])

  let power = 10
  if      (mc >= 1e9) power = 95
  else if (mc >= 1e8) power = 80
  else if (mc >= 1e7) power = 65
  else if (mc >= 1e6) power = 50
  else if (mc >= 1e5) power = 35
  else if (mc >= 1e4) power = 20

  let hype = 10
  if      (holders >= 1e6) hype = 99
  else if (holders >= 1e5) hype = 85
  else if (holders >= 1e4) hype = 70
  else if (holders >= 1e3) hype = 55
  else if (holders >= 100) hype = 40

  return { power, hype }
}

// Compute card level from duplicate count (1-10)
// Every 3 copies = 1 level up
export function computeCardLevel(count) {
  return Math.min(10, Math.ceil((count ?? 1) / 3))
}

// XP progress within current level (0, 1, or 2 out of 3 needed)
export function computeXpProgress(count) {
  const c = Math.max(1, count ?? 1)
  const xpInLevel = (c - 1) % 3
  return { xpInLevel, xpNeeded: 3 }
}

// ── DAILY MISSIONS ───────────────────────────────────────────────────────────
export const DAILY_MISSIONS = [
  { id: 'daily_login',     label: 'Daily Login Bonus',         reward: 10,  icon: '⚡' },
  { id: 'open_pack',       label: 'Open a pack today',         reward: 10,  icon: '🃏' },
  { id: 'pull_rare',       label: 'Pull a RARE or better',     reward: 15,  icon: '💎' },
  { id: 'pull_epic',       label: 'Pull an EPIC card',         reward: 30,  icon: '🟣' },
  { id: 'pull_legendary',  label: 'Pull a LEGENDARY card',     reward: 50,  icon: '💀' },
  { id: 'pull_golden',     label: 'Pull a GOLDEN card',        reward: 30,  icon: '★'  },
  { id: 'collect_5',       label: 'Collect 5+ cards today',    reward: 20,  icon: '📦' },
  { id: 'win_battle',      label: 'Win a battle',              reward: 25,  icon: '⚔'  },
]

// ── CARD SETS ────────────────────────────────────────────────────────────────
// Tickers are matched against coins in the user's collection.
// Any mismatch (ticker not in DB) is gracefully ignored.
export const CARD_SETS = [
  {
    id:          'og_memes',
    name:        'OG Memes',
    description: 'The originals that started the meme coin era',
    tickers:     ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK'],
    reward:      { ripz: 100, packs: 2 },
    icon:        '🐶',
  },
  {
    id:          'solana_natives',
    name:        'Solana Natives',
    description: 'Born and bred on the fastest L1',
    tickers:     ['BONK', 'WIF', 'POPCAT', 'MYRO', 'BOME'],
    reward:      { ripz: 150, packs: 3 },
    icon:        '◎',
  },
  {
    id:          'degens',
    name:        'Degen Picks',
    description: 'For the true degen collectors',
    tickers:     ['PEPE', 'WOJAK', 'TURBO', 'MOCHI', 'NEIRO'],
    reward:      { ripz: 200, packs: 4 },
    icon:        '🎰',
  },
]
