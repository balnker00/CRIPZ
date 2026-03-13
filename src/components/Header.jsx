import logoImg from '../assets/pfpGGO.png'

export default function Header() {
  return (
    <>
      <div className="rainbow-bar" />
      <header>
        <div className="logo">
          <img src={logoImg} alt="CryptoRipz logo" className="logo-img" />
          <div className="logo-text">
            <div className="logo-wordmark">
              <span className="logo-crypto">CRYPTO</span>
              <span className="logo-ripz">RIPZ</span>
              <span className="ticker-badge">$RIPZ</span>
            </div>
            <div className="tagline">Crypto // Own. Trade. Play.</div>
          </div>
        </div>
      </header>
    </>
  )
}
