import logoImg from '../assets/pfp1.png'

export default function Header({ username, onSignOut }) {
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
            <div className="tagline">CRYPTO</div>
          </div>
        </div>

        {username && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <span style={{ color: '#00ff88', fontSize: '0.6rem', letterSpacing: '0.15em', opacity: 0.7 }}>
              {username.toUpperCase()}
            </span>
            <button
              onClick={onSignOut}
              style={{
                background: 'transparent',
                border: '1px solid #1a3a1a',
                color: '#555',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.55rem',
                letterSpacing: '0.15em',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              LOGOUT
            </button>
          </div>
        )}
      </header>
    </>
  )
}
