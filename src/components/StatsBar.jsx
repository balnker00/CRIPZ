function fmtMC(n) {
  if (!n) return '—'
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
  return `$${n}`
}

function fmtHolders(n) {
  if (!n) return '—'
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`
  return `${n}`
}

export default function StatsBar({ stats }) {
  const { totalPulls, unique, rarest, totalHolders, totalMC } = stats
  const isGolden   = rarest?.rarity.startsWith('GOLDEN_')
  const baseRarity = rarest ? (isGolden ? rarest.rarity.replace('GOLDEN_', '') : rarest.rarity) : null
  const rarestLabel = rarest
    ? `${isGolden ? '★ ' : ''}${baseRarity} · $${rarest.coin?.['TICKER'] ?? '?'}`
    : '—'

  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="stat-label">pulls:</span>
        <span className="stat-val">{totalPulls}</span>
      </div>
      <div className="stat">
        <span className="stat-label">unique:</span>
        <span className="stat-val">{unique}</span>
      </div>
      <div className="stat">
        <span className="stat-label">total mc:</span>
        <span className="stat-val">{fmtMC(totalMC)}</span>
      </div>
      <div className="stat">
        <span className="stat-label">total holders:</span>
        <span className="stat-val">{fmtHolders(totalHolders)}</span>
      </div>
      <div className="stat">
        <span className="stat-label">rarest:</span>
        <span className="stat-val">{rarestLabel}</span>
      </div>
    </div>
  )
}
