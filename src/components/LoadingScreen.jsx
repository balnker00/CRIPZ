import { useEffect, useState } from 'react'
import logoImg from '../assets/pfpGGO.png'

export default function LoadingScreen({ onDone }) {
  const [phase, setPhase] = useState('enter') // enter → loaded → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('loaded'), 400)
    const t2 = setTimeout(() => setPhase('exit'),  2100)
    const t3 = setTimeout(() => onDone(),           2500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`loading-screen loading-${phase}`}>
      <div className="loading-inner">
        <div className="loading-logo-wrap">
          <img src={logoImg} alt="CryptoRipz" className="loading-logo" />
          <div className="loading-glow" />
        </div>
        <div className="loading-title">
          <span className="loading-crypto">CRYPTO</span><span className="loading-ripz">RIPZ</span>
        </div>
        <div className="loading-tagline">Crypto // Own. Trade. Play.</div>
        <div className="loading-bar-wrap">
          <div className={`loading-bar loading-bar-${phase}`} />
        </div>
        <div className="loading-status">INITIALIZING...</div>
      </div>
    </div>
  )
}
