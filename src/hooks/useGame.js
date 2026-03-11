import { useState, useCallback, useRef, useEffect } from 'react'
import { RARITIES, RARITY_ORDER } from '../data/gameData'
import { supabase } from '../lib/supabase'

function rollRarity() {
  const total = RARITIES.reduce((s, r) => s + r.weight, 0)
  let roll = Math.random() * total
  for (const r of RARITIES) {
    roll -= r.weight
    if (roll <= 0) return r.rarity
  }
  return 'C'
}

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
  const notifTimer = useRef(null)
  const coinsRef = useRef([])

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

  // Load user's saved collection when user + coins are ready
  useEffect(() => {
    setCollection([])
    if (!user || !coinsReady) return

    supabase
      .from('user_collection')
      .select('*')
      .eq('user_id', user.id)
      .order('pulled_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) { console.error('Failed to load collection:', error); return }
        const loaded = (data ?? [])
          .map(row => ({
            id:     row.id,
            coin:   coinsRef.current.find(c => c.id === row.coin_id),
            rarity: row.rarity,
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

    // Persist to DB if logged in
    if (user) {
      supabase
        .from('user_collection')
        .insert(pulls.map(p => ({
          user_id: user.id,
          coin_id: p.coin.id,
          rarity:  p.rarity,
        })))
        .then(({ error }) => {
          if (error) console.error('Failed to save pulls:', error)
        })
    }

    const best = pulls.reduce(
      (b, p) => RARITY_ORDER.indexOf(p.rarity) > RARITY_ORDER.indexOf(b.rarity) ? p : b,
      pulls[0]
    )
    if (best.rarity === 'LEGENDARY') {
      showNotif(`💀 LEGENDARY!\n${best.coin['NAME']} ($${best.coin['TICKER']})`, true)
    } else if (best.rarity === 'UR') {
      showNotif(`✨ ULTRA RARE!\n${best.coin['NAME']} ($${best.coin['TICKER']})`, true)
    } else if (best.rarity === 'SR') {
      showNotif(`🌸 Super Rare: ${best.coin['NAME']}`, false)
    }

    setTimeout(() => setPulling(false), pullCount * 140 + 500)
  }, [pulling, pullCount, coins, user, showNotif])

  const stats = {
    totalPulls: collection.length,
    totalCards: collection.length,
    unique:     new Set(collection.map(c => c.coin['TICKER'])).size,
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
