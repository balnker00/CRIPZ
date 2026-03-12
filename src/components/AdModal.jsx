import { useState, useEffect } from 'react'
import logoImg from '../assets/pfp1.png'
import { AD_REWARD } from '../hooks/usePacks'

const AD_DURATION = 10

export default function AdModal({ onReward }) {
  const [secs, setSecs] = useState(AD_DURATION)
  const [torn, setTorn] = useState(false)
  const done            = secs === 0

  // Trigger the rip 400 ms after mount
  useEffect(() => {
    const t = setTimeout(() => setTorn(true), 400)
    return () => clearTimeout(t)
  }, [])

  // Countdown tick
  useEffect(() => {
    if (done) return
    const t = setTimeout(() => setSecs(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secs, done])

  return (
    <div className="ad-overlay">
      <div className="ad-modal">
        <div className="ad-label">// WATCH TO EARN PACKS //</div>

        {/* ── Rip scene ── */}
        <div className="ad-rip-stage">
          <div className={`ad-logo-wrap${torn ? ' is-torn' : ''}`}>

            {/* Top half — flies up and away on rip */}
            <div className="ad-half ad-half-top">
              <img src={logoImg} alt="" draggable={false} />
            </div>

            {/* Jagged tear line — glows on rip */}
            <div className="ad-tear-line" />

            {/* Bottom half — stays */}
            <div className="ad-half ad-half-bottom">
              <img src={logoImg} alt="" draggable={false} />
            </div>
          </div>

          {torn && <div className="ad-rip-label">R I P Z</div>}
        </div>

        {/* ── Timer / Claim ── */}
        <div className="ad-timer-area">
          {done ? (
            <button className="ad-claim-btn" onClick={onReward}>
              ✓ CLAIM +{AD_REWARD} PACKS
            </button>
          ) : (
            <>
              {/* key forces re-mount so the pulse animation fires on every tick */}
              <div className="ad-secs" key={secs}>{secs}</div>
              <div className="ad-secs-label">packs unlocking…</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
