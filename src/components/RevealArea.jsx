import Card from './Card'

export default function RevealArea({ cards }) {
  if (cards.length === 0) {
    return (
      <div className="reveal-area">
        <div className="empty-state">
          <div className="empty-icon">🌸</div>
          <div className="empty-text">open a pack to pull your first $RIPZ cards</div>
        </div>
      </div>
    )
  }

  return (
    <div className="reveal-area">
      {cards.map(({ id, coin, rarity }, i) => (
        <Card key={id} coin={coin} rarity={rarity} animate delay={i * 140} />
      ))}
    </div>
  )
}
