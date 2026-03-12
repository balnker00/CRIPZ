# CryptoRipz

A collectible card game built on top of real memecoin data. Users rip packs, pull randomised rarity cards representing crypto memecoins, and build a collection. Cards display live on-chain data pulled from a Supabase database.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Rarity System](#rarity-system)
- [Pack Economy](#pack-economy)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Local Development](#local-development)
- [Deployment](#deployment)

---

## Overview

CryptoRipz is a browser-based gacha card game. Each pack yields four cards. Cards show a coin's name, ticker, market cap, holder count, and age. Rarity is determined by a weighted roll, with an independent golden overlay chance applied on top. The full coin catalogue is browsable in the Codex, regardless of whether the user has pulled a card yet.

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React 18, Vite 5                  |
| Styling     | Vanilla CSS (no framework)        |
| Backend     | Supabase (Postgres + Auth)        |
| Deployment  | Vercel                            |
| Fonts       | Orbitron, Share Tech Mono (Google Fonts) |

---

## Features

### Card Pulling
- Each pack opens four cards.
- Cards are drawn by first rolling a base rarity, then selecting a random coin from that rarity's pool in the database.
- A 0.3% independent golden chance is applied per card on top of the base rarity.
- A rip animation plays on pack open: the logo zooms to full screen and splits into two halves that fly off screen in opposite directions.

### Collection
- Logged-in users have their full card history persisted in Supabase.
- The collection tab shows all pulled cards with rarity filtering (All, Common, Rare, Epic, Legendary, Golden) and paginated at 20 cards per page.

### Codex
- Shows every coin in the database, whether or not the user has pulled it.
- Unpulled coins appear as greyed-out "UNDISCOVERED" placeholders.
- Owned coins are marked inline. Paginated at 20 per page.

### Stats Bar
- Always-visible bar showing total pulls, unique coins collected, sum of market caps in collection, sum of holder counts, and rarest card pulled.

### Authentication
- Username and password sign-up and sign-in.
- Supabase Auth handles sessions. Emails are generated internally as `{username}@cryptoripz.com`.
- Usernames are stored in user metadata.

### Pack Economy
- Users receive 10 free packs per 15-minute cooldown window.
- After packs are exhausted, a countdown timer shows time until reset.
- Watching a 10-second ad awards 3 additional packs.
- Sharing a pull to X (Twitter) awards 2 additional packs and opens a pre-filled tweet.
- For logged-in users, pack state (count and reset timestamp) is stored in Supabase so the cooldown is consistent across all browsers and devices. Anonymous users have pack state stored in localStorage.

### Ad System
- Clicking "Watch Ad" triggers a native browser notification permission request (handles Brave shields via a 400ms timeout race).
- A 10-second countdown modal plays. The claim button appears on completion.

### Theme
- Dark and light themes, toggled via a button in the bottom-left corner.
- Theme preference is persisted in localStorage.

### Share to X
- After pulling a pack, the share button opens a pre-filled tweet containing the number of cards pulled, the best rarity from the pull, and the user's total collection count.
- Always attributes the best pull as $RIPZ regardless of specific coin.

---

## Rarity System

### Base Rarities

| Rarity    | Weight | Drop Rate |
|-----------|--------|-----------|
| COMMON    | 900    | 90.0%     |
| RARE      | 90     | 9.0%      |
| EPIC      | 8      | 0.8%      |
| LEGENDARY | 2      | 0.2%      |

### Golden Overlay

Applied independently per card after the base rarity is determined.

| Variant          | Approximate Rate |
|------------------|-----------------|
| GOLDEN_COMMON    | 0.30%           |
| GOLDEN_RARE      | 0.027%          |
| GOLDEN_EPIC      | 0.0024%         |
| GOLDEN_LEGENDARY | 0.0006%         |

### Rarity Order (lowest to highest)

COMMON, GOLDEN_COMMON, RARE, GOLDEN_RARE, EPIC, GOLDEN_EPIC, LEGENDARY, GOLDEN_LEGENDARY

### Coin Assignment

Each base rarity has a `coin_ids` JSON array in the `rarities` table. On pull, a coin is randomly selected from the matching pool. If a pool is empty (not yet populated), a random coin from the full catalogue is used as fallback. Golden variants are computed at pull time — they do not have separate database rows.

---

## Pack Economy

| Constant       | Value         |
|----------------|---------------|
| Free packs     | 10 per window |
| Cooldown       | 15 minutes    |
| Ad reward      | +3 packs      |
| Share reward   | +2 packs      |

Pack state is persisted in `user_packs` (Supabase) for authenticated users and in localStorage (`cripz-packs`) for anonymous users. The cooldown timer auto-resets via a client-side `setTimeout` and is re-validated on load against the stored `reset_at` timestamp.

---

## Project Structure

```
src/
  App.jsx                  Root component, ad flow, theme toggle
  main.jsx                 React entry point
  index.css                All styles (dark/light themes, animations, responsive)

  assets/
    pfp1.png               Logo image used in header, pack, and cards

  components/
    Header.jsx             Logo, tagline, login/logout
    StatsBar.jsx           Aggregate stats across the collection
    PackSection.jsx        Pack artwork, open button, cooldown, watch-ad button
    RevealArea.jsx         Card reveal after pull, share button
    Card.jsx               Individual card (memo, lazy image, rarity styles)
    Collection.jsx         User's pulled cards with filter and pagination
    Codex.jsx              Full coin encyclopedia with owned/undiscovered states
    TabsPanel.jsx          Tab switcher (Collection, Codex, About)
    About.jsx              Rules, rarity table, data sources
    Notification.jsx       Toast for legendary/epic/golden pulls
    LoadingScreen.jsx      Splash screen on first load
    AuthScreen.jsx         Sign in / sign up modal
    AdModal.jsx            10-second reward ad countdown

  hooks/
    useAuth.js             Supabase auth state, sign in, sign up, sign out
    useGame.js             Coins fetch, collection fetch, openPack, stats
    usePacks.js            Pack count, cooldown, rewards, Supabase/LS sync

  data/
    gameData.js            Rarity weights, rollBaseRarity(), RARITY_ORDER,
                           RARITY_IDS, RARITY_BY_ID, GOLDEN_CHANCE

  lib/
    supabase.js            Supabase client initialisation
```

---

## Database Schema

All tables live in a Supabase (Postgres) project. Row Level Security is enabled on every table.

### coinz

Stores all available memecoin cards. Populated manually.

| Column           | Type | Notes                              |
|------------------|------|------------------------------------|
| id               | int  | Primary key                        |
| NAME             | text | Full coin name                     |
| TICKER           | text | Symbol, e.g. DOGE                  |
| IMAGE URL        | text | Logo URL                           |
| MARKET CAP       | text | e.g. "1.5B", "400M"               |
| HOLDERS          | text | e.g. "50K", "1.2M"               |
| CONTRACT ADDRESS | text | On-chain address                   |
| CREATED AT       | text | Used to calculate card age         |

RLS policy: public read.

### rarities

Maps the four base rarity tiers to their coin pools.

| Column     | Type     | Notes                                      |
|------------|----------|--------------------------------------------|
| id         | smallint | 1=COMMON, 3=RARE, 5=EPIC, 7=LEGENDARY     |
| name       | text     | COMMON, RARE, EPIC, LEGENDARY              |
| order_rank | smallint | Sort order                                 |
| coin_ids   | jsonb    | Array of coinz.id values for this tier     |

Golden variants (IDs 2, 4, 6, 8) are computed at runtime. No rows needed.

SQL to create:

```sql
CREATE TABLE rarities (
  id         smallint PRIMARY KEY,
  name       text     UNIQUE NOT NULL,
  order_rank smallint NOT NULL,
  coin_ids   jsonb    NOT NULL DEFAULT '[]'
);
INSERT INTO rarities (id, name, order_rank) VALUES
  (1, 'COMMON',    1),
  (3, 'RARE',      3),
  (5, 'EPIC',      5),
  (7, 'LEGENDARY', 7);
ALTER TABLE rarities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read rarities" ON rarities FOR SELECT USING (true);
```

To assign coins to a rarity:

```sql
UPDATE rarities SET coin_ids = '[1, 4, 7, 12]' WHERE name = 'RARE';
```

### user_collection

Stores each user's full pull history as a single JSONB array row.

| Column  | Type | Notes                                    |
|---------|------|------------------------------------------|
| user_id | uuid | Primary key, references auth.users       |
| cards   | jsonb | Array of `{coin_id, is_golden}` objects |

SQL to create:

```sql
CREATE TABLE user_collection (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cards   jsonb NOT NULL DEFAULT '[]'
);
ALTER TABLE user_collection ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own collection" ON user_collection
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### user_packs

Tracks pack allowance per user for cross-browser cooldown consistency.

| Column     | Type        | Notes                               |
|------------|-------------|-------------------------------------|
| user_id    | uuid        | Primary key, references auth.users  |
| packs_left | smallint    | Current remaining packs (0–10)      |
| reset_at   | timestamptz | Cooldown expiry timestamp           |

SQL to create:

```sql
CREATE TABLE user_packs (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  packs_left smallint NOT NULL DEFAULT 10,
  reset_at   timestamptz
);
ALTER TABLE user_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own packs" ON user_packs
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

---

## Local Development

### Prerequisites

- Node.js 18 or later
- A Supabase project with the tables above created

### Setup

```bash
git clone <repo-url>
cd CRIPZ
npm install
```

The Supabase credentials are embedded in `src/lib/supabase.js` as publishable keys. No `.env` file is required for development.

```bash
npm run dev
```

The app runs at `http://localhost:5173` by default.

### Build

```bash
npm run build       # outputs to dist/
npm run preview     # preview the production build locally
```

---

## Deployment

The project is configured for Vercel. The `vercel.json` at the project root handles the SPA rewrite so all routes resolve to `index.html`.

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install --include=dev",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Push to the connected Git branch and Vercel deploys automatically. No environment variables need to be set in the Vercel dashboard — the Supabase publishable key is safe to include in client-side code.
