// Base rarities — high common/rare rates, very hard epic/legendary
export const BASE_RARITIES = [
  { rarity: 'LEGENDARY', weight: 1  }, //  ~0.98% base
  { rarity: 'EPIC',      weight: 4  }, //  ~3.92% base
  { rarity: 'RARE',      weight: 20 }, // ~19.61% base
  { rarity: 'COMMON',    weight: 77 }, // ~75.49% base
]
// Total = 102 (normalised internally)

// Golden: ~2% of all pulls — sits between Epic and Legendary in rarity
// After rolling base rarity, there is a 2% flat chance it becomes a golden copy
export const GOLDEN_CHANCE = 0.02

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
