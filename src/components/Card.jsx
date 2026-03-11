import { useState, useEffect } from 'react'

export default function Card({ coin, rarity, animate = false, delay = 0 }) {
  const [revealed, setRevealed] = useState(!animate)

  useEffect(() => {
    if (!animate) return
    const t = setTimeout(() => setRevealed(true), 60 + delay)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isPos       = coin.change.startsWith('+')
  const isInf       = coin.change.includes('∞')
  const changeClass = isInf ? 'neutral' : isPos ? 'positive' : 'negative'

  return (
    <div className={`card rarity-${rarity}${revealed ? ' revealed' : ''}`}>
      <div className="card-bg" />
      <div className="card-content">
        <div className="card-rarity-badge">{rarity}</div>
        <div className="card-emoji">{coin.icon}</div>
        <div className="card-name">{coin.name}</div>
        <div className="card-ticker">${coin.ticker}</div>
        <div className="card-divider" />
        <div className="card-stat">
          <span className="card-stat-label">MCAP</span>
          <span className="card-stat-val neutral">{coin.mcap}</span>
        </div>
        <div className="card-stat">
          <span className="card-stat-label">VOL</span>
          <span className="card-stat-val neutral">{coin.vol}</span>
        </div>
        <div className="card-stat">
          <span className="card-stat-label">AGE</span>
          <span className="card-stat-val neutral">{coin.age}</span>
        </div>
        <div className="card-stat">
          <span className="card-stat-label">24H</span>
          <span className={`card-stat-val ${changeClass}`}>{coin.change}</span>
        </div>
        <div className="card-chain">{coin.chain}</div>
      </div>
    </div>
  )
}
