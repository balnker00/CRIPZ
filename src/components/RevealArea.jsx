import { useState } from 'react'
import Card from './Card'

function buildShareText(cards) {
  const lines = cards.map(({ coin, rarity }) => `${rarity} ${coin.icon} ${coin.name} ($${coin.ticker})`)
  const best = cards.reduce((a, b) => {
    const order = ['C', 'R', 'SR', 'UR', 'LEGENDARY']
    return order.indexOf(b.rarity) > order.indexOf(a.rarity) ? b : a
  })
  return [
    '🃏 CryptoRipz Pack Pull',
    '',
    ...lines,
    '',
    `Best pull: ${best.rarity} ${best.coin.icon} $${best.coin.ticker}`,
    '',
    'Memecoins // Own. Trade. Play.',
  ].join('\n')
}

export default function RevealArea({ cards }) {
  const [copied, setCopied] = useState(false)

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

  async function handleShare() {
    const text = buildShareText(cards)
    if (navigator.share) {
      try {
        await navigator.share({ text })
        return
      } catch (_) { /* fallthrough to clipboard */ }
    }
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
          {copied ? '✓ COPIED' : '↗ SHARE PULL'}
        </button>
      </div>
    </div>
  )
}
