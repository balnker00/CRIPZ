// scripts/update-coins.js
// Fetches current MARKET CAP, ATH, and HOLDERS from Birdeye and updates the coinz table.
// Run via GitHub Actions every 12h. Requires Node 18+.

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL        = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const BIRDEYE_API_KEY     = process.env.BIRDEYE_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !BIRDEYE_API_KEY) {
  console.error('Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, BIRDEYE_API_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const BIRDEYE_HEADERS = {
  'X-API-KEY': BIRDEYE_API_KEY,
  'x-chain':   'solana',
  'accept':    'application/json',
}

// ── Helpers ────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/** Format a raw number into display string: 1500000 → "1.5M" */
function fmt(n) {
  if (n == null || isNaN(n)) return null
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return String(Math.round(n))
}

/** GET with retry logic. Backs off on 429 and transient errors. */
async function get(url, retries = 4) {
  let delay = 2000
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: BIRDEYE_HEADERS })
      if (res.status === 429) {
        console.warn(`  ⚠ Rate limited — waiting 60s (attempt ${attempt})`)
        await sleep(60_000)
        continue
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
      return await res.json()
    } catch (err) {
      if (attempt === retries) throw err
      console.warn(`  ⚠ Attempt ${attempt} failed: ${err.message} — retrying in ${delay / 1000}s`)
      await sleep(delay)
      delay *= 2
    }
  }
}

// ── Phase 1: MARKET CAP via multi_price (50 addresses per request) ─────────

async function updateMarketCaps(coins) {
  const batches = chunk(coins, 50)
  console.log(`\n[MCAP] ${coins.length} coins → ${batches.length} batches of 50`)

  let updated = 0

  for (const [i, batch] of batches.entries()) {
    const addrList = batch.map(c => c['CONTRACT ADDRESS']).join(',')
    let data

    try {
      data = await get(
        `https://public-api.birdeye.so/defi/multi_price?list_address=${addrList}`
      )
    } catch (err) {
      console.error(`  [MCAP] Batch ${i + 1} fetch failed:`, err.message)
      await sleep(1500)
      continue
    }

    const tokenMap = data?.data ?? {}
    const upserts  = []

    for (const coin of batch) {
      const entry = tokenMap[coin['CONTRACT ADDRESS']]
      // Birdeye returns marketCap or mc depending on endpoint version
      const mcap  = entry?.marketCap ?? entry?.mc ?? null
      if (mcap != null) {
        upserts.push({ id: coin.id, 'MARKET CAP': fmt(mcap) })
        updated++
      }
    }

    if (upserts.length > 0) {
      const { error } = await supabase.from('coinz').upsert(upserts)
      if (error) console.error(`  [MCAP] Upsert error on batch ${i + 1}:`, error.message)
    }

    process.stdout.write(`  Batch ${i + 1}/${batches.length} — ${updated} updated so far\r`)

    // 1.5s between batches ≈ 33 req/min, well under the 100/min free-tier limit
    await sleep(1500)
  }

  console.log(`\n[MCAP] Done — ${updated} coins updated`)
}

// ── Phase 2: HOLDERS + ATH via token_overview (one at a time) ────────────

async function updateHoldersAndAth(coins) {
  console.log(`\n[HOLDERS/ATH] ${coins.length} coins — one request per coin`)
  console.log('  Estimated time at 700ms/req:', Math.round((coins.length * 0.7) / 60), 'minutes\n')

  let holdersUpdated = 0
  let athUpdated     = 0
  let skipped        = 0

  for (const [i, coin] of coins.entries()) {
    let data

    try {
      data = await get(
        `https://public-api.birdeye.so/defi/token_overview?address=${coin['CONTRACT ADDRESS']}`
      )
    } catch (err) {
      console.error(`  Coin ${coin.id} (${coin['CONTRACT ADDRESS']}) failed:`, err.message)
      skipped++
      await sleep(700)
      continue
    }

    const tokenData = data?.data
    if (!tokenData) { skipped++; await sleep(700); continue }

    const patch = {}

    const holders = tokenData.holder ?? tokenData.holders ?? null
    if (holders != null) {
      patch['HOLDERS'] = fmt(holders)
      holdersUpdated++
    }

    // Birdeye returns ATH as all-time-high price in USD. We store it formatted.
    const ath = tokenData.ath ?? tokenData.athPrice ?? null
    if (ath != null) {
      patch['ATH'] = `$${Number(ath).toFixed(ath < 0.01 ? 6 : 4)}`
      athUpdated++
    }

    if (Object.keys(patch).length > 0) {
      const { error } = await supabase
        .from('coinz')
        .update(patch)
        .eq('id', coin.id)
      if (error) console.error(`  Supabase update error for coin ${coin.id}:`, error.message)
    }

    // Progress log every 100 coins
    if ((i + 1) % 100 === 0 || i === coins.length - 1) {
      console.log(
        `  [${i + 1}/${coins.length}] holders: ${holdersUpdated} | ath: ${athUpdated} | skipped: ${skipped}`
      )
    }

    // 700ms delay ≈ 85 req/min — safely under 100/min free-tier limit
    await sleep(700)
  }

  console.log(`\n[HOLDERS/ATH] Done — holders: ${holdersUpdated} | ath: ${athUpdated} | skipped: ${skipped}`)
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== CryptoRipz coin data updater ===')
  console.log('Started:', new Date().toISOString())

  // Fetch all coins that have a contract address
  const { data: coins, error } = await supabase
    .from('coinz')
    .select('id, "CONTRACT ADDRESS"')
    .not('"CONTRACT ADDRESS"', 'is', null)
    .neq('"CONTRACT ADDRESS"', '')

  if (error) {
    console.error('Failed to fetch coins from Supabase:', error.message)
    process.exit(1)
  }

  console.log(`Loaded ${coins.length} coins with contract addresses`)

  await updateMarketCaps(coins)
  await updateHoldersAndAth(coins)

  console.log('\n=== Finished:', new Date().toISOString(), '===')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
