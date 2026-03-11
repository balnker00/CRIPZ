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

function rarityLabel(rarity) {
  if (rarity.startsWith('GOLDEN_')) return `★ ${rarity.replace('GOLDEN_', '')}`
  return rarity
}

function rarityClass(rarity) {
  return rarity.toLowerCase().replace('_', '-')
}

function dexscreenerUrl(coin) {
  return `https://dexscreener.com/search?q=${encodeURIComponent(coin['TICKER'] ?? coin['NAME'] ?? '')}`
}

export default function Card({ coin, rarity, animate = false, delay = 0 }) {
  const [revealed, setRevealed] = useState(!animate)
  const [imgErr, setImgErr]     = useState(false)

  useEffect(() => {
    if (!animate) return
    const t = setTimeout(() => setRevealed(true), 60 + delay)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleClick() {
    window.open(dexscreenerUrl(coin), '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className={`card rarity-${rarityClass(rarity)}${revealed ? ' revealed' : ''}`}
      onClick={handleClick}
      title={`View ${coin['NAME']} on DexScreener`}
    >
      <div className="card-bg" />
      <div className="card-content">
        <div className="card-rarity-badge">{rarityLabel(rarity)}</div>

        <div className="card-image">
          {coin['IMAGE URL'] && !imgErr
            ? <img
                src={coin['IMAGE URL']}
                alt={coin['NAME']}
                onError={() => setImgErr(true)}
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
