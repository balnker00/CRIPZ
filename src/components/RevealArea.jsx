import Card from './Card'
import { RARITY_ORDER } from '../data/gameData'
import { SHARE_REWARD } from '../hooks/usePacks'

function buildTweetText(cards, totalCards) {
  const best = cards.reduce(
    (a, b) => RARITY_ORDER.indexOf(b.rarity) > RARITY_ORDER.indexOf(a.rarity) ? b : a,
    cards[0]
  )
  const isGolden   = best.rarity.startsWith('GOLDEN_')
  const baseRarity = isGolden ? best.rarity.replace('GOLDEN_', '') : best.rarity
  const goldenTag  = isGolden ? '★ GOLDEN ' : ''

  return `just pulled ${cards.length} memecoin cards on CryptoRipz 🃏\n\nbest pull: ${goldenTag}${baseRarity} — $${best['TICKER'] ?? best.ticker ?? best.name}\n\n${totalCards} cards in my collection and counting`
}

export default function RevealArea({ cards, onShare, totalCards = 0 }) {
  if (cards.length === 0) {
    return (
      <div className="reveal-area">
        <div className="empty-state">
          <div className="empty-icon">🃏</div>
          <div className="empty-text">open a pack to pull your first cards</div>
        </div>
      </div>
    )
  }

  function handleShare() {
    const text = buildTweetText(cards, totalCards)
    const url  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    if (onShare) onShare()
  }

  return (
    <div className="reveal-wrapper">
      <div className="reveal-area">
        {cards.map(({ id, coin, rarity }, i) => (
          <Card key={id} coin={coin} rarity={rarity} animate delay={i * 140} />
        ))}
      </div>
      <div className="reveal-actions">
        <button className="share-btn" onClick={handleShare}>
          ↗ SHARE ON X · +{SHARE_REWARD} PACKS
        </button>
      </div>
    </div>
  )
}
