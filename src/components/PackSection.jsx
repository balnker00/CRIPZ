import { useState, useEffect } from 'react'
import logoImg from '../assets/pfpP.png'
import { FREE_PACKS, AD_REWARD } from '../hooks/usePacks'

const AD_DURATION = 10

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

const RARITY_TIERS = ['GOLDEN', 'LEGENDARY', 'EPIC', 'RARE']

function bestRipTier(cards) {
  if (!cards?.length) return null
  for (const tier of RARITY_TIERS) {
    if (cards.some(c => c.rarity === tier || c.rarity?.startsWith(tier + '_'))) return tier.toLowerCase()
  }
  return null
}

export default function PackSection({
  onOpen, pulling, coinsLoading, coinsError,
  packsLeft, onCooldown, resetAt, rewardAd, showNotif,
  revealedCards,
}) {
  const [adOpen, setAdOpen] = useState(false)
  const [adSecs, setAdSecs] = useState(AD_DURATION)
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

  useEffect(() => {
    if (!adOpen) return
    setAdSecs(AD_DURATION)
    const id = setInterval(() => {
      setAdSecs(prev => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [adOpen])

  function handleAdReward() {
    rewardAd()
    setAdOpen(false)
    showNotif(`+${AD_REWARD} PACKS FROM AD`)
  }

  return (
    <div className="pack-section">
      <div className="section-label">// Season 1 - the memes //</div>

      {pulling && (
        <div className={`pack-logo-rip${bestRipTier(revealedCards) ? ` pack-rip--${bestRipTier(revealedCards)}` : ''}`}>
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
          <img src={logoImg} alt="Pack" className="pack-logo-img" />
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

      <button className="pull-btn" onClick={onOpen} disabled={btnDisabled}>
        {btnLabel}
      </button>

      {onCooldown && (
        adOpen ? (
          <div className="ad-popup">
            <div className="ad-popup-header">// ADVERTISEMENT //</div>
            <div className="ad-popup-logo">
              <img src={logoImg} alt="CryptoRipz" />
            </div>
            <div className="ad-popup-timer">
              {adSecs > 0 ? (
                <>
                  <div className="ad-popup-secs" key={adSecs}>{adSecs}</div>
                  <div className="ad-popup-label">packs unlocking…</div>
                </>
              ) : (
                <button className="ad-claim-btn" onClick={handleAdReward}>
                  ✓ CLAIM +{AD_REWARD} PACKS
                </button>
              )}
            </div>
          </div>
        ) : (
          <button className="watch-ad-btn" onClick={() => setAdOpen(true)}>
            ▶ WATCH AD · +{AD_REWARD} PACKS
          </button>
        )
      )}
    </div>
  )
}
