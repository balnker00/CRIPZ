import { useState, useEffect, useMemo, memo } from 'react'
import { computeCardLevel, computeXpProgress, computeCardStats } from '../data/gameData'

function computeAge(createdAt) {
  if (!createdAt) return '?'
  const diff = Date.now() - new Date(createdAt).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return '<1d'
  if (days < 30) return `${days}d`
  if (days < 365) return `${Math.floor(days / 30)}mo`
  return `${Math.floor(days / 365)}y`
}

function rarityClass(rarity) {
  return rarity.toLowerCase().replace('_', '-')
}

function dexscreenerUrl(coin) {
  const contract = coin['CONTRACT ADDRESS'] || coin['CONTRACT']
  if (contract) return `https://dexscreener.com/solana/${contract}`
  return `https://dexscreener.com/search?q=${encodeURIComponent(coin['TICKER'] ?? coin['NAME'] ?? '')}`
}

const Card = memo(function Card({ coin, rarity, animate = false, delay = 0, count = 1, onList, listed = false }) {
  const [revealed, setRevealed] = useState(!animate)
  const [imgErr, setImgErr]     = useState(false)

  const isGolden   = rarity.startsWith('GOLDEN_')
  const baseRarity = isGolden ? rarity.replace('GOLDEN_', '') : rarity
  const age        = useMemo(() => computeAge(coin['CREATED AT']), [coin])
  const level      = useMemo(() => computeCardLevel(count), [count])
  const { xpInLevel, xpNeeded } = useMemo(() => computeXpProgress(count), [count])
  const { power, hype }         = useMemo(() => computeCardStats(coin), [coin])

  useEffect(() => {
    if (!animate) return
    const t = setTimeout(() => setRevealed(true), 60 + delay)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleClick(e) {
    // Don't navigate if list button was clicked
    if (e.target.closest('.card-list-btn')) return
    window.open(dexscreenerUrl(coin), '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className={`card rarity-${rarityClass(rarity)}${revealed ? ' revealed' : ''}${listed ? ' card-listed' : ''}`}
      onClick={handleClick}
      title={listed ? 'Listed for sale' : `View ${coin['NAME']} on DexScreener`}
    >
      <div className="card-bg" />

      {/* Level badge — top-right corner */}
      <div className="card-level-badge">
        <span className="card-level-num">LV{level}</span>
        <span className="card-xp-dots">
          {Array.from({ length: xpNeeded }, (_, i) => (
            <span key={i} className={`card-xp-dot${i < xpInLevel ? ' filled' : ''}`} />
          ))}
        </span>
      </div>

      {listed && <div className="card-listed-tag">LISTED</div>}

      <div className="card-content">
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '6px', overflow: 'hidden' }}>
          <div className="card-rarity-badge">{baseRarity}</div>
          {isGolden && <div className="card-golden-tag">GOLDEN</div>}
        </div>

        <div className="card-image">
          {coin['IMAGE URL'] && !imgErr
            && !(coin['IMAGE URL'].startsWith('http://') && location.protocol === 'https:')
            ? <img
                src={coin['IMAGE URL']}
                alt={coin['NAME']}
                loading="lazy"
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
          <span className="card-stat-val neutral">{age}</span>
        </div>

        {/* Power / Hype bars */}
        <div className="card-stat-bars">
          <div className="card-bar-row">
            <span className="card-bar-label">PWR</span>
            <div className="card-bar-track">
              <div className="card-bar-fill card-bar-power" style={{ width: `${power}%` }} />
            </div>
            <span className="card-bar-num">{power}</span>
          </div>
          <div className="card-bar-row">
            <span className="card-bar-label">HYP</span>
            <div className="card-bar-track">
              <div className="card-bar-fill card-bar-hype" style={{ width: `${hype}%` }} />
            </div>
            <span className="card-bar-num">{hype}</span>
          </div>
        </div>
      </div>

      {/* List-for-sale button (only in Collection view) */}
      {onList && !listed && (
        <button
          className="card-list-btn"
          onClick={(e) => { e.stopPropagation(); onList() }}
          title="List this card for sale"
        >
          SELL
        </button>
      )}
    </div>
  )
})

export default Card
