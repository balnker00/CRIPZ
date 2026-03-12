import logoImg from '../assets/pfp1.png'

export default function PackSection({ onOpen, pulling, coinsLoading, coinsError }) {
  const btnDisabled = pulling || coinsLoading || !!coinsError
  const btnLabel = pulling
    ? 'PULLING...'
    : coinsLoading
      ? 'LOADING COINS...'
      : coinsError
        ? 'LOAD ERROR'
        : 'OPEN PACK'

  return (
    <div className="pack-section">
      <div className="section-label">// Season 1 - the memes //</div>

      <div className="pack-wrapper" onClick={btnDisabled ? undefined : onOpen}>
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

      <br />
      <button className="pull-btn" onClick={onOpen} disabled={btnDisabled}>
        {btnLabel}
      </button>
    </div>
  )
}
