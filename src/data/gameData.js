// Base rarities — high common/rare rates, very hard epic/legendary
export const BASE_RARITIES = [
  { rarity: 'LEGENDARY', weight: 1  }, //  ~0.98% base
  { rarity: 'EPIC',      weight: 4  }, //  ~3.92% base
  { rarity: 'RARE',      weight: 20 }, // ~19.61% base
  { rarity: 'COMMON',    weight: 77 }, // ~75.49% base
]

// Golden: ~2% of all pulls — sits between Epic and Legendary in rarity
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

// Fixed IDs matching the `rarities` table in Supabase.
// Run this SQL once in your dashboard:
//
//   CREATE TABLE rarities (
//     id smallint PRIMARY KEY, name text UNIQUE NOT NULL, order_rank smallint NOT NULL
//   );
//   INSERT INTO rarities (id, name, order_rank) VALUES
//     (1,'COMMON',1),(2,'GOLDEN_COMMON',2),(3,'RARE',3),(4,'GOLDEN_RARE',4),
//     (5,'EPIC',5),(6,'GOLDEN_EPIC',6),(7,'LEGENDARY',7),(8,'GOLDEN_LEGENDARY',8);
//   ALTER TABLE rarities ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "Public read rarities" ON rarities FOR SELECT USING (true);
//
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
