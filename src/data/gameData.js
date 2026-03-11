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
// Only 4 base rows — golden is computed dynamically (no row needed).
// coin_ids is a jsonb array of coinz.id values for each rarity tier;
// populate it manually via Supabase dashboard after adding coins.
//
// Run this SQL once in your dashboard:
//
//   CREATE TABLE rarities (
//     id         smallint PRIMARY KEY,
//     name       text     UNIQUE NOT NULL,
//     order_rank smallint NOT NULL,
//     coin_ids   jsonb    NOT NULL DEFAULT '[]'
//   );
//   INSERT INTO rarities (id, name, order_rank) VALUES
//     (1,'COMMON',1),(3,'RARE',3),(5,'EPIC',5),(7,'LEGENDARY',7);
//   ALTER TABLE rarities ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "Public read rarities" ON rarities FOR SELECT USING (true);
//
// Then populate coin_ids per row, e.g.:
//   UPDATE rarities SET coin_ids = '[3,7,12]' WHERE name = 'RARE';
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
