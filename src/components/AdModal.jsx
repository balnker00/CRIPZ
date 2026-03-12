import { useState, useEffect } from 'react'
import { AD_REWARD } from '../hooks/usePacks'

const AD_DURATION = 5   // seconds before claim unlocks

export default function AdModal({ onReward }) {
  const [secs, setSecs] = useState(AD_DURATION)
  const done = secs === 0

  useEffect(() => {
    if (done) return
    const t = setTimeout(() => setSecs(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secs, done])

  return (
    <div className="ad-overlay">
      <div className="ad-modal">
        <div className="ad-label">// ADVERTISEMENT //</div>

        <div className="ad-placeholder">
          <div className="ad-placeholder-text">AD SPACE</div>
          <div className="ad-placeholder-sub">your ad here</div>
        </div>

        <div className="ad-footer">
          {done ? (
            <button className="ad-claim-btn" onClick={onReward}>
              ✓ CLAIM +{AD_REWARD} PACKS
            </button>
          ) : (
            <div className="ad-countdown">closing in {secs}s</div>
          )}
        </div>
      </div>
    </div>
  )
}
