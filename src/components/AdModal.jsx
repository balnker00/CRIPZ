import { useState, useEffect } from 'react'
import logoImg from '../assets/pfp1.png'
import { AD_REWARD } from '../hooks/usePacks'

const AD_DURATION = 10

export default function AdModal({ onReward }) {
  const [secs, setSecs] = useState(AD_DURATION)

  useEffect(() => {
    const id = setInterval(() => {
      setSecs(prev => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="ad-overlay">
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
