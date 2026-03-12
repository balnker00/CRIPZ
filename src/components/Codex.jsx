import { useState } from 'react'
import Card from './Card'

export default function Codex({ coins, collection }) {
  const [filter, setFilter] = useState('all')

  const ownedTickers = new Set(collection.map(c => c.coin?.['TICKER']).filter(Boolean))

  const visibleCoins = filter === 'owned'
    ? coins.filter(coin => ownedTickers.has(coin['TICKER']))
    : coins

  return (
    <>
      <div className="filter-row">
        {['all', 'owned'].map(f => (
          <button
            key={f}
            className={`filter-btn${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : `Owned (${ownedTickers.size})`}
          </button>
        ))}
      </div>

      <div className="collection-grid">
        {visibleCoins.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <div className="empty-icon">📖</div>
            <div className="empty-text">no cards discovered yet — start pulling</div>
          </div>
        ) : (
          visibleCoins.map(coin => {
            const found = collection.find(c => c.coin['TICKER'] === coin['TICKER'])
            if (found) {
              return <Card key={coin.id} coin={found.coin} rarity={found.rarity} />
            }
            return (
              <div key={coin.id} className="card rarity-C codex-unknown">
                <div className="card-bg" />
                <div className="card-content" style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '2rem', opacity: 0.3, color: '#fff' }}>?</div>
                  <div style={{ fontSize: '0.55rem', color: '#333', marginTop: '4px', letterSpacing: '0.1em' }}>UNDISCOVERED</div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
