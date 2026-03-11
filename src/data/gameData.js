// Base rarities with weights (must sum to 100)
export const BASE_RARITIES = [
  { rarity: 'LEGENDARY', weight: 2  },
  { rarity: 'EPIC',      weight: 10 },
  { rarity: 'RARE',      weight: 25 },
  { rarity: 'COMMON',    weight: 63 },
]

// 12% chance any pull becomes a golden copy
export const GOLDEN_CHANCE = 0.12

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
