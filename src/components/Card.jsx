import { useState, useEffect, useMemo, memo } from 'react'

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

function buildShareUrl(coin, rarity) {
  const isGolden  = rarity.startsWith('GOLDEN_')
  const goldenTag = isGolden ? '★ GOLDEN ' : ''
  const coinName  = (coin['NAME'] ?? '').toUpperCase()
  const text      = `I just RIPZZZed ${goldenTag}${coinName} on CryptoRipz 🃏`
  const imageUrl  = coin['IMAGE URL'] ?? ''
  const params    = new URLSearchParams({ text })
  if (imageUrl) params.set('url', imageUrl)
  return `https://twitter.com/intent/tweet?${params.toString()}`
}

const Card = memo(function Card({ coin, rarity, animate = false, delay = 0, count = 1 }) {
  const [revealed,  setRevealed]  = useState(!animate)
  const [imgErr,    setImgErr]    = useState(false)
  const [hovered,   setHovered]   = useState(false)
  const [expanded,  setExpanded]  = useState(false)

  const isGolden   = rarity.startsWith('GOLDEN_')
  const baseRarity = isGolden ? rarity.replace('GOLDEN_', '') : rarity
  const age        = useMemo(() => computeAge(coin['CREATED AT']), [coin])

  useEffect(() => {
    if (!animate) return
    const t = setTimeout(() => setRevealed(true), 60 + delay)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!expanded) return
    function onKey(e) { if (e.key === 'Escape') setExpanded(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded])

  function handleCardClick() {
    if (hovered) return // overlay buttons handle actions
    window.open(dexscreenerUrl(coin), '_blank', 'noopener,noreferrer')
  }

  function handleShare(e) {
    e.stopPropagation()
    window.open(buildShareUrl(coin, rarity), '_blank', 'noopener,noreferrer')
  }

  function handleExpand(e) {
    e.stopPropagation()
    setExpanded(true)
  }

  const faceContent = (
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
    </div>
  )

  return (
    <>
      <div
        className={`card rarity-${rarityClass(rarity)}${revealed ? ' revealed' : ''}`}
        onClick={handleCardClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={`View ${coin['NAME']} on DexScreener`}
      >
        <div className="card-bg" />
        {count > 1 && <div className="card-count-badge">×{count}</div>}
        {faceContent}

        {revealed && (
          <div
            className={`card-hover-overlay${hovered ? ' visible' : ''}`}
            onClick={e => e.stopPropagation()}
          >
            <button className="card-action-btn" onClick={handleExpand}>
              ⤢ EXPAND
            </button>
            <button className="card-action-btn card-action-share" onClick={handleShare}>
              ↗ SHARE
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="card-modal-backdrop" onClick={() => setExpanded(false)}>
          <div className="card-modal-inner" onClick={e => e.stopPropagation()}>
            <button className="card-modal-close" onClick={() => setExpanded(false)}>✕</button>

            <div className="card-modal-scale-wrap">
              <div className={`card rarity-${rarityClass(rarity)} revealed card-modal-card`}>
                <div className="card-bg" />
                {faceContent}
              </div>
            </div>

            <div className="card-modal-footer">
              <button className="card-action-btn card-action-share card-modal-share-btn" onClick={handleShare}>
                ↗ SHARE ON X
              </button>
              <a
                className="card-modal-dex-link"
                href={dexscreenerUrl(coin)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
              >
                view on dexscreener ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
})

export default Card
