import { useState, useCallback, useRef, useEffect } from 'react'
import { rollBaseRarity, GOLDEN_CHANCE, RARITY_ORDER, RARITY_BY_ID } from '../data/gameData'
import { supabase } from '../lib/supabase'

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
  const notifTimer      = useRef(null)
  const coinsRef        = useRef([])
  const rarityPoolsRef  = useRef({}) // { COMMON: [coinId,...], RARE: [...], ... }
  // Stores DB-format cards: [{coin_id, is_golden}] — one row per user
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
        ;(data ?? []).forEach(r => { pools[r.name] = r.coin_ids ?? [] })
        rarityPoolsRef.current = pools
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
              // new format: look up base rarity from the pool each coin belongs to
              const base = Object.entries(rarityPoolsRef.current)
                .find(([, ids]) => ids.includes(c.coin_id))?.[0] ?? 'COMMON'
              rarity = c.is_golden ? `GOLDEN_${base}` : base
            }
            return { id: `db-${i}-${c.coin_id}`, coin, rarity }
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
    if (pulling || coinsLoading || coins.length === 0) return
    setPulling(true)

    setFlash(true)
    setTimeout(() => setFlash(false), 650)

    const pulls = Array.from({ length: 1 }, (_, i) => {
      const baseRarity = rollBaseRarity()
      const pool = rarityPoolsRef.current[baseRarity] ?? []
      let coin
      if (pool.length > 0) {
        const coinId = pool[Math.floor(Math.random() * pool.length)]
        coin = coinsRef.current.find(c => c.id === coinId)
      }
      // Fallback: pool empty or coin not found — pick random from all coins
      if (!coin) coin = coinsRef.current[Math.floor(Math.random() * coinsRef.current.length)]
      const isGolden = Math.random() < GOLDEN_CHANCE
      return {
        id:       `${Date.now()}-${i}`,
        coin,
        rarity:   isGolden ? `GOLDEN_${baseRarity}` : baseRarity,
        isGolden,
      }
    })

    setRevealedCards(pulls)
    setCollection(prev => [...prev, ...pulls])

    // Persist as single row with cards array: {coin_id, is_golden}
    if (user) {
      const newDbCards = pulls.map(p => ({ coin_id: p.coin.id, is_golden: p.isGolden }))
      userCardsRef.current = [...userCardsRef.current, ...newDbCards]
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

    setTimeout(() => setPulling(false), 640)
  }, [pulling, coins, user, showNotif])

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

  const stats = {
    totalPulls:    collection.length,
    totalCards:    collection.length,
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
  }
}
