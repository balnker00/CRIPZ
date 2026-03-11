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

export function useGame() {
  const [coins, setCoins]               = useState([])
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
          console.log(`Loaded ${data?.length ?? 0} coins from Supabase`)
          if (data?.length) console.log('First coin object:', JSON.stringify(data[0], null, 2))
          setCoins(data ?? [])
          if (!data?.length) setCoinsError('No coins found — check RLS policies on the coinz table')
        }
      })
  }, [])

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
  }, [pulling, pullCount, coins, showNotif])

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
