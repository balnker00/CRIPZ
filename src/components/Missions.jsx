export default function Missions({ missions, user, ripzBalance }) {
  const totalReward  = missions.reduce((s, m) => s + m.reward, 0)
  const earnedToday  = missions.filter(m => m.completed).reduce((s, m) => s + m.reward, 0)

  if (!user) {
    return (
      <div className="missions-empty">
        <div className="empty-icon">⚡</div>
        <div className="empty-text">login to track daily missions and earn $RIPZ</div>
      </div>
    )
  }

  return (
    <div className="missions-panel">
      <div className="missions-header">
        <div className="missions-title">// DAILY MISSIONS //</div>
        <div className="missions-progress-summary">
          <span className="missions-earned">{earnedToday} / {totalReward} $RIPZ earned today</span>
        </div>
      </div>

      <div className="missions-progress-bar-wrap">
        <div
          className="missions-progress-bar-fill"
          style={{ width: `${totalReward > 0 ? (earnedToday / totalReward) * 100 : 0}%` }}
        />
      </div>

      <div className="missions-list">
        {missions.map(mission => (
          <div
            key={mission.id}
            className={`mission-item${mission.completed ? ' mission-completed' : ''}`}
          >
            <div className="mission-icon">{mission.icon}</div>
            <div className="mission-info">
              <div className="mission-label">{mission.label}</div>
            </div>
            <div className="mission-reward">
              {mission.completed ? (
                <span className="mission-done-tag">✓ DONE</span>
              ) : (
                <span className="mission-ripz-reward">+{mission.reward} $RIPZ</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="missions-footer">
        <span className="missions-reset-note">Missions reset at midnight UTC</span>
        <span className="missions-balance">Balance: <strong>{ripzBalance.toFixed(0)} $RIPZ</strong></span>
      </div>
    </div>
  )
}
