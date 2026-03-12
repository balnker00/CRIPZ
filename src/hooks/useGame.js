import { useState, useCallback, useRef, useEffect } from 'react'
import { GOLDEN_CHANCE, RARITY_ORDER, RARITY_BY_ID } from '../data/gameData'
import { supabase } from '../lib/supabase'
import { usePacks } from './usePacks'

export function useGame(user) {
  const [coins, setCoins]               = useState([])
  const [coinsReady, setCoinsReady]     = useState(false)
  const [coinsLoading, setCoinsLoading] = useState(true)
  const [coinsError, setCoinsError]     = useState(null)
  const [collection, setCollection]     = useState([])
  const [revealedCards, setRevealedCards] = useState([])
  const [collFilter, setCollFilter]     = useState('ALL')
  const [activeTab, setActiveTab]       = useState('collection')
  const [notif, setNotif]               = useState({ msg: '', rare: false, show: false })
  const [flash, setFlash]               = useState(false)
  const [pulling, setPulling]           = useState(false)
  const [rarityPoolsReady, setRarityPoolsReady] = useState(false)
  const {
    packsLeft, onCooldown, resetAt, packsReady,
    rewardAd, rewardShare, consumePack,
  } = usePacks(user)
  const notifTimer      = useRef(null)
  const coinsRef        = useRef([])
  const rarityPoolsRef  = useRef({}) // { COMMON: [coinId,...], RARE: [...], ... }
  const coinRarityRef   = useRef({}) // { coinId: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' }
  // Stores DB-format cards: [{coin_id, is_golden, count}] — one row per user
  const userCardsRef = useRef([])

  // Fetch coins once on mount
  useEffect(() => {
    supabase
      .from('coinz')
      .select('*')
      .then(({ data, error }) => {
        setCoinsLoading(false)
        if (error) {
          console.error('Supabase error loading coins:', error)
          setCoinsError(error.message)
        } else {
          coinsRef.current = data ?? []
          setCoins(data ?? [])
          setCoinsReady(true)
          if (!data?.length) setCoinsError('No coins found — check RLS policies on the coinz table')
        }
      })
  }, [])

  // Fetch rarity pools (coin_ids per base rarity) once on mount
  useEffect(() => {
    supabase
      .from('rarities')
      .select('name, coin_ids')
      .then(({ data, error }) => {
        if (error) console.error('Failed to load rarity pools:', error)
        const pools = {}
        const map   = {}
        ;(data ?? []).forEach(r => {
          pools[r.name] = r.coin_ids ?? []
          ;(r.coin_ids ?? []).forEach(id => { map[id] = r.name })
        })
        rarityPoolsRef.current = pools
        coinRarityRef.current  = map
        setRarityPoolsReady(true)
      })
  }, [])

  // Clear all state on logout
  useEffect(() => {
    if (!user) {
      setRevealedCards([])
      setCollFilter('ALL')
      setActiveTab('collection')
    }
  }, [user])

  // Load user's collection (single row with cards array) when user + coins + pools are ready
  useEffect(() => {
    setCollection([])
    userCardsRef.current = []
    if (!user || !coinsReady || !rarityPoolsReady) return

    supabase
      .from('user_collection')
      .select('cards')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) { console.error('Failed to load collection:', error); return }
        const dbCards = data?.cards ?? []
        userCardsRef.current = dbCards
        const loaded = dbCards
          .map((c, i) => {
            const coin = coinsRef.current.find(coin => coin.id === c.coin_id)
            let rarity
            if (c.rarity_id != null) {
              // legacy format: derive from stored rarity_id
              rarity = RARITY_BY_ID[c.rarity_id] ?? 'COMMON'
            } else {
              const base = coinRarityRef.current[c.coin_id] ?? 'COMMON'
              rarity = c.is_golden ? `GOLDEN_${base}` : base
            }
            return { id: `db-${i}-${c.coin_id}`, coin, rarity, count: c.count ?? 1 }
          })
          .filter(item => item.coin)
        setCollection(loaded)
      })
  }, [user?.id, coinsReady, rarityPoolsReady]) // eslint-disable-line react-hooks/exhaustive-deps

  const showNotif = useCallback((msg, rare = false) => {
    setNotif({ msg, rare, show: true })
    clearTimeout(notifTimer.current)
    notifTimer.current = setTimeout(
      () => setNotif(n => ({ ...n, show: false })),
      3800
    )
  }, [])

  const openPack = useCallback(() => {
    if (pulling || coinsLoading || coins.length === 0 || packsLeft === 0 || !packsReady) return
    consumePack()
    setPulling(true)

    setFlash(true)
    setTimeout(() => setFlash(false), 650)

    const pulls = Array.from({ length: 4 }, (_, i) => {
      const coin = coinsRef.current[Math.floor(Math.random() * coinsRef.current.length)]
      const baseRarity = coinRarityRef.current[coin.id] ?? 'COMMON'
      const isGolden   = Math.random() < GOLDEN_CHANCE
      return {
        id:       `${Date.now()}-${i}`,
        coin,
        rarity:   isGolden ? `GOLDEN_${baseRarity}` : baseRarity,
        isGolden,
      }
    })

    setRevealedCards(pulls)

    // De-dup optimistic collection state: increment count for existing entries
    setCollection(prev => {
      const next = prev.map(c => ({ ...c }))
      for (const pull of pulls) {
        const idx = next.findIndex(c => c.coin?.id === pull.coin.id && c.rarity === pull.rarity)
        if (idx >= 0) {
          next[idx] = { ...next[idx], count: (next[idx].count ?? 1) + 1 }
        } else {
          next.push({ ...pull, count: 1 })
        }
      }
      return next
    })

    // Persist as single row with cards array: {coin_id, is_golden, count}
    if (user) {
      const merged = userCardsRef.current.map(c => ({ ...c }))
      for (const p of pulls) {
        const existing = merged.find(c => c.coin_id === p.coin.id && !!c.is_golden === p.isGolden)
        if (existing) {
          existing.count = (existing.count ?? 1) + 1
        } else {
          merged.push({ coin_id: p.coin.id, is_golden: p.isGolden, count: 1 })
        }
      }
      userCardsRef.current = merged
      supabase
        .from('user_collection')
        .upsert({ user_id: user.id, cards: userCardsRef.current }, { onConflict: 'user_id' })
        .then(({ error }) => {
          if (error) console.error('Failed to save cards:', error)
        })
    }

    const best = pulls.reduce(
      (b, p) => RARITY_ORDER.indexOf(p.rarity) > RARITY_ORDER.indexOf(b.rarity) ? p : b,
      pulls[0]
    )
    const isGolden  = best.rarity.startsWith('GOLDEN_')
    const baseRarity = isGolden ? best.rarity.replace('GOLDEN_', '') : best.rarity
    const goldPrefix = isGolden ? '★ GOLDEN ' : ''

    if (baseRarity === 'LEGENDARY') {
      showNotif(`${goldPrefix}💀 LEGENDARY!\n${best.coin['NAME']} ($${best.coin['TICKER']})`, true)
    } else if (baseRarity === 'EPIC') {
      showNotif(`${goldPrefix}🟣 EPIC!\n${best.coin['NAME']} ($${best.coin['TICKER']})`, isGolden)
    } else if (isGolden) {
      showNotif(`★ GOLDEN ${baseRarity}: ${best.coin['NAME']}`, false)
    }

    setTimeout(() => setPulling(false), 4 * 140 + 500)
  }, [pulling, coins, user, showNotif, packsLeft, packsReady, consumePack])

  function parseNum(val) {
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

  const totalPulled = collection.reduce((s, c) => s + (c.count ?? 1), 0)

  const stats = {
    totalPulls:    totalPulled,
    totalCards:    totalPulled,
    unique:        new Set(collection.map(c => c.coin?.['TICKER']).filter(Boolean)).size,
    totalHolders:  collection.reduce((s, c) => s + parseNum(c.coin?.['HOLDERS']), 0),
    totalMC:       collection.reduce((s, c) => s + parseNum(c.coin?.['MARKET CAP']), 0),
    rarest: collection.length > 0
      ? collection.reduce(
          (b, p) => RARITY_ORDER.indexOf(p.rarity) > RARITY_ORDER.indexOf(b.rarity) ? p : b,
          collection[0]
        )
      : null,
  }

  return {
    coins,
    coinsLoading,
    coinsError,
    collection,
    revealedCards,
    collFilter,
    setCollFilter,
    activeTab,
    setActiveTab,
    notif,
    flash,
    stats,
    pulling,
    openPack,
    packsLeft,
    onCooldown,
    resetAt,
    rewardAd,
    rewardShare,
    showNotif,
  }
}
