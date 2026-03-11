const COUNTS = [5, 10, 1]

export default function PackSection({ pullCount, setPullCount, onOpen, pulling }) {
  return (
    <div className="pack-section">
      <div className="section-label">◆ Chaos Pack · Memecoin Edition ◆</div>

      <div className="pack-wrapper" onClick={pulling ? undefined : onOpen}>
        <div className="pack">
          <div className="pack-bg-flower">◆</div>
          <div className="pack-icon">🃏</div>
          <div className="pack-name">CHAOS PACK</div>
          <div className="pack-sub">$RIPZ · random rarity</div>
          <div className="pack-stripe" />
        </div>
      </div>

      <br />
      <button className="pull-btn" onClick={onOpen} disabled={pulling}>
        {pulling ? '◆ Pulling…' : '◆ Open Pack ◆'}
      </button>

      <div className="count-btns">
        {COUNTS.map(n => (
          <button
            key={n}
            className={`count-btn${pullCount === n ? ' active' : ''}`}
            onClick={() => setPullCount(n)}
          >
            × {n}
          </button>
        ))}
      </div>
    </div>
  )
}
