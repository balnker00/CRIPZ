import { useState, useEffect } from 'react'
import logoImg from '../assets/pfp1.png'
import { AD_REWARD } from '../hooks/usePacks'

const AD_DURATION = 10

export default function AdModal({ open, onReward }) {
  const [secs, setSecs] = useState(AD_DURATION)

  // Reset and run countdown whenever modal opens
  useEffect(() => {
    if (!open) return
    setSecs(AD_DURATION)
    const id = setInterval(() => {
      setSecs(prev => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [open])

  return (
    <div className="ad-overlay" style={{ display: open ? 'flex' : 'none' }}>
      <div className="ad-modal">
        <div className="ad-label">// ADVERTISEMENT //</div>

        <div className="ad-static-logo">
          <img src={logoImg} alt="CryptoRipz" />
        </div>

        <div className="ad-timer-area">
          {secs === 0 ? (
            <button className="ad-claim-btn" onClick={onReward}>
              ✓ CLAIM +{AD_REWARD} PACKS
            </button>
          ) : (
            <>
              <div className="ad-secs" key={secs}>{secs}</div>
              <div className="ad-secs-label">packs unlocking…</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
