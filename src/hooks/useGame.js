import { useState, useCallback, useRef, useEffect } from 'react'
import { rollRarity, RARITY_ORDER } from '../data/gameData'
import { supabase } from '../lib/supabase'

export function useGame(user) {
  const [coins, setCoins]               = useState([])
  const [coinsReady, setCoinsReady]     = useState(false)
  const [coinsLoading, setCoinsLoading] = useState(true)
  const [coinsError, setCoinsError]     = useState(null)
  const [collection, setCollection]     = useState([])
  const [pullCount, setPullCount]       = useState(5)
  const [revealedCards, setRevealedCards] = useState([])
  const [collFilter, setCollFilter]     = useState('ALL')
  const [activeTab, setActiveTab]       = useState('collection')
  const [notif, setNotif]               = useState({ msg: '', rare: false, show: false })
  const [flash, setFlash]               = useState(false)
  const [pulling, setPulling]           = useState(false)
  const notifTimer  = useRef(null)
  const coinsRef    = useRef([])
  // Stores DB-format cards: [{coin_id, rarity}] — one row per user
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

  // Clear all state on logout
  useEffect(() => {
    if (!user) {
      setRevealedCards([])
      setCollFilter('ALL')
      setActiveTab('collection')
    }
  }, [user])

  // Load user's collection (single row with cards array) when user + coins are ready
  useEffect(() => {
    setCollection([])
    userCardsRef.current = []
    if (!user || !coinsReady) return

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
          .map((c, i) => ({
            id:     `db-${i}-${c.coin_id}`,
            coin:   coinsRef.current.find(coin => coin.id === c.coin_id),
            rarity: c.rarity,
          }))
          .filter(item => item.coin)
        setCollection(loaded)
      })
  }, [user?.id, coinsReady]) // eslint-disable-line react-hooks/exhaustive-deps

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

    const pulls = Array.from({ length: pullCount }, (_, i) => ({
      id:     `${Date.now()}-${i}`,
      coin:   coins[Math.floor(Math.random() * coins.length)],
      rarity: rollRarity(),
    }))

    setRevealedCards(pulls)
    setCollection(prev => [...prev, ...pulls])

    // Persist as single row with cards array
    if (user) {
      const newDbCards = pulls.map(p => ({ coin_id: p.coin.id, rarity: p.rarity }))
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

    setTimeout(() => setPulling(false), pullCount * 140 + 500)
  }, [pulling, pullCount, coins, user, showNotif])

  const stats = {
    totalPulls: collection.length,
    totalCards: collection.length,
    unique:     new Set(collection.map(c => c.coin?.['TICKER']).filter(Boolean)).size,
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
    pullCount,
    setPullCount,
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
