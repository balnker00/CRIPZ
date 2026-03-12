import { useState, useEffect } from 'react'
import logoImg from '../assets/pfp1.png'
import { AD_REWARD } from '../hooks/usePacks'

const AD_DURATION = 10

export default function AdModal({ onReward }) {
  console.log('[AdModal] MOUNTED — onReward type:', typeof onReward)
  const [secs, setSecs] = useState(AD_DURATION)
  const done            = secs === 0

  useEffect(() => {
    console.log('[AdModal] mount effect ran — AD_DURATION:', AD_DURATION)
    return () => console.log('[AdModal] UNMOUNTED')
  }, [])

  useEffect(() => {
    console.log('[AdModal] secs tick:', secs, '| done:', done)
    if (done) {
      console.log('[AdModal] countdown finished — claim button should now be visible')
      return
    }
    const t = setTimeout(() => setSecs(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secs, done])

  return (
    <div className="ad-overlay">
      <div className="ad-modal">
        <div className="ad-label">// ADVERTISEMENT //</div>

        <div className="ad-static-logo">
          <img src={logoImg} alt="CryptoRipz" />
        </div>

        <div className="ad-timer-area">
          {done ? (
            <button className="ad-claim-btn" onClick={() => {
              console.log('[AdModal] CLAIM button clicked — calling onReward:', onReward)
              onReward()
              console.log('[AdModal] onReward() returned')
            }}>
              ✓ CLAIM +{AD_REWARD} PACKS
            </button>
          ) : (
            <>
              {/* key re-mounts the element each tick, re-triggering the pop animation */}
              <div className="ad-secs" key={secs}>{secs}</div>
              <div className="ad-secs-label">packs unlocking…</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
