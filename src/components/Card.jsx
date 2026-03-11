import { useState, useEffect } from 'react'

function computeAge(createdAt) {
  if (!createdAt) return '?'
  const diff = Date.now() - new Date(createdAt).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return '<1d'
  if (days < 30) return `${days}d`
  if (days < 365) return `${Math.floor(days / 30)}mo`
  return `${Math.floor(days / 365)}y`
}

export default function Card({ coin, rarity, animate = false, delay = 0 }) {
  const [revealed, setRevealed] = useState(!animate)
  const [imgErr, setImgErr]     = useState(false)

  useEffect(() => {
    if (!animate) return
    const t = setTimeout(() => setRevealed(true), 60 + delay)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`card rarity-${rarity}${revealed ? ' revealed' : ''}`}>
      <div className="card-bg" />
      <div className="card-content">
        <div className="card-rarity-badge">{rarity}</div>

        <div className="card-emoji">
          {coin['IMAGE URL'] && !imgErr
            ? <img
                src={coin['IMAGE URL']}
                alt={coin['NAME']}
                onError={() => setImgErr(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
              />
            : <span style={{ fontSize: '1.8rem' }}>🪙</span>
          }
        </div>

        <div className="card-name">{coin['NAME']}</div>
        <div className="card-ticker">${coin['TICKER']}</div>
        <div className="card-divider" />

        <div className="card-stat">
          <span className="card-stat-label">MCAP</span>
          <span className="card-stat-val neutral">{coin['MARKET CAP'] ?? '?'}</span>
        </div>
        <div className="card-stat">
          <span className="card-stat-label">HOLDERS</span>
          <span className="card-stat-val neutral">{coin['HOLDERS'] ?? '?'}</span>
        </div>
        <div className="card-stat">
          <span className="card-stat-label">AGE</span>
          <span className="card-stat-val neutral">{computeAge(coin['CREATED AT'])}</span>
        </div>
      </div>
    </div>
  )
}
