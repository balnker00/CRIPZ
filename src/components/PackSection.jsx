import { useState, useEffect } from 'react'
import logoImg from '../assets/pfp1.png'
import { FREE_PACKS, AD_REWARD } from '../hooks/usePacks'

function useCountdown(resetAt) {
  const [display, setDisplay] = useState('')

  useEffect(() => {
    if (!resetAt) { setDisplay(''); return }

    function tick() {
      const ms = resetAt - Date.now()
      if (ms <= 0) { setDisplay(''); return }
      const h = Math.floor(ms / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      const s = Math.floor((ms % 60000) / 1000)
      setDisplay(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      )
    }

    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [resetAt])

  return display
}

export default function PackSection({
  onOpen, pulling, coinsLoading, coinsError,
  packsLeft, onCooldown, resetAt, onWatchAd,
}) {
  console.log('[PackSection] render — onCooldown:', onCooldown, '| onWatchAd type:', typeof onWatchAd, '| onWatchAd:', onWatchAd)
  console.log('[PackSection] render — packsLeft:', packsLeft, '| pulling:', pulling, '| coinsLoading:', coinsLoading, '| coinsError:', coinsError)

  const countdown   = useCountdown(resetAt)
  const packLocked  = pulling || coinsLoading || !!coinsError || onCooldown
  const btnDisabled = packLocked

  const btnLabel = pulling
    ? 'PULLING...'
    : coinsLoading
      ? 'LOADING COINS...'
      : coinsError
        ? 'LOAD ERROR'
        : onCooldown
          ? 'NO PACKS LEFT'
          : 'OPEN PACK'

  return (
    <div className="pack-section">
      <div className="section-label">// Season 1 - the memes //</div>

      {/* Full-screen rip overlay — rendered outside .pack so overflow:hidden doesn't clip it */}
      {pulling && (
        <div className="pack-logo-rip">
          <div className="pack-rip-inner">
            <div className="pack-rip-half pack-rip-top">
              <img src={logoImg} alt="" />
            </div>
            <div className="pack-rip-tear" />
            <div className="pack-rip-half pack-rip-bottom">
              <img src={logoImg} alt="" />
            </div>
          </div>
        </div>
      )}

      <div
        className={`pack-wrapper${packLocked ? ' pack-locked' : ''}`}
        onClick={packLocked ? undefined : onOpen}
      >
        <div className="pack">
          <div className="pack-bg-flower" />
          <img src={logoImg} alt="Pack" className="pack-logo-img" />
          <div className="pack-name">MEMES PACK</div>
          <div className="pack-sub">RIPZ · random rarity</div>
        </div>
      </div>

      {coinsError && (
        <div style={{ color: '#ff4444', fontSize: '0.65rem', textAlign: 'center', marginTop: '6px', opacity: 0.8 }}>
          {coinsError}
        </div>
      )}

      <div className="packs-meta">
        {!onCooldown && (
          <div className="packs-counter">
            {packsLeft} / {FREE_PACKS} packs
          </div>
        )}
        {resetAt && countdown && (
          <div className={`packs-reset${onCooldown ? ' packs-reset--urgent' : ''}`}>
            {onCooldown ? 'resets in ' : ''}
            <span className="packs-timer">{countdown}</span>
          </div>
        )}
      </div>

      <br />

      <button className="pull-btn" onClick={onOpen} disabled={btnDisabled}>
        {btnLabel}
      </button>

      {console.log('[PackSection] ad button check — onCooldown:', onCooldown, '→ button will', onCooldown ? 'RENDER' : 'NOT render')}
      {onCooldown && (
        <button className="watch-ad-btn" onClick={() => {
          console.log('[PackSection] WATCH AD button clicked — calling onWatchAd:', onWatchAd)
          onWatchAd()
          console.log('[PackSection] onWatchAd() returned')
        }}>
          ▶ WATCH AD · +{AD_REWARD} PACKS
        </button>
      )}
    </div>
  )
}
