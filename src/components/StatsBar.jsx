export default function StatsBar({ stats }) {
  const { totalPulls, totalCards, unique, rarest } = stats
  const rarestLabel = rarest ? `${rarest.rarity} · $${rarest.coin.ticker}` : '—'

  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="stat-label">pulls</span>
        <span className="stat-val">{totalPulls}</span>
      </div>
      <div className="stat">
        <span className="stat-label">cards</span>
        <span className="stat-val">{totalCards}</span>
      </div>
      <div className="stat">
        <span className="stat-label">unique</span>
        <span className="stat-val">{unique}</span>
      </div>
      <div className="stat">
        <span className="stat-label">rarest</span>
        <span className="stat-val">{rarestLabel}</span>
      </div>
    </div>
  )
}
