import { useState, useCallback, useRef } from 'react'
import { COINS, RARITIES, RARITY_ORDER } from '../data/gameData'

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
  const [collection, setCollection]     = useState([])
  const [pullCount, setPullCount]       = useState(5)
  const [revealedCards, setRevealedCards] = useState([])
  const [collFilter, setCollFilter]     = useState('ALL')
  const [activeTab, setActiveTab]       = useState('collection')
  const [notif, setNotif]               = useState({ msg: '', rare: false, show: false })
  const [flash, setFlash]               = useState(false)
  const [pulling, setPulling]           = useState(false)
  const notifTimer = useRef(null)

  const showNotif = useCallback((msg, rare = false) => {
    setNotif({ msg, rare, show: true })
    clearTimeout(notifTimer.current)
    notifTimer.current = setTimeout(
      () => setNotif(n => ({ ...n, show: false })),
      3800
    )
  }, [])

  const openPack = useCallback(() => {
    if (pulling) return
    setPulling(true)

    // Flash
    setFlash(true)
    setTimeout(() => setFlash(false), 650)

    const pulls = Array.from({ length: pullCount }, (_, i) => ({
      id:     `${Date.now()}-${i}`,
      coin:   COINS[Math.floor(Math.random() * COINS.length)],
      rarity: rollRarity(),
    }))

    setRevealedCards(pulls)
    setCollection(prev => [...prev, ...pulls])

    // Best pull notification
    const best = pulls.reduce(
      (b, p) => RARITY_ORDER.indexOf(p.rarity) > RARITY_ORDER.indexOf(b.rarity) ? p : b,
      pulls[0]
    )
    if (best.rarity === 'LEGENDARY') {
      showNotif(`💀 LEGENDARY!\n${best.coin.name} ($${best.coin.ticker})`, true)
    } else if (best.rarity === 'UR') {
      showNotif(`✨ ULTRA RARE!\n${best.coin.name} ($${best.coin.ticker})`, true)
    } else if (best.rarity === 'SR') {
      showNotif(`🌸 Super Rare: ${best.coin.name}`, false)
    }

    setTimeout(() => setPulling(false), pullCount * 140 + 500)
  }, [pulling, pullCount, showNotif])

  const stats = {
    totalPulls: collection.length,
    totalCards: collection.length,
    unique:     new Set(collection.map(c => c.coin.ticker)).size,
    rarest: collection.length > 0
      ? collection.reduce(
          (b, p) => RARITY_ORDER.indexOf(p.rarity) > RARITY_ORDER.indexOf(b.rarity) ? p : b,
          collection[0]
        )
      : null,
  }

  return {
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
