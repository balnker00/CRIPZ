import { useState, useEffect, useMemo } from 'react'
import Card from './Card'

const PAGE_SIZE = 20

export default function Codex({ coins, collection }) {
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)

  const ownedMap = useMemo(() => {
    const m = new Map()
    collection.forEach(c => {
      if (c.coin?.['TICKER']) m.set(c.coin['TICKER'], c)
    })
    return m
  }, [collection])

  const visibleCoins = useMemo(
    () => filter === 'owned' ? coins.filter(coin => ownedMap.has(coin['TICKER'])) : coins,
    [filter, coins, ownedMap]
  )

  const totalPages = Math.max(1, Math.ceil(visibleCoins.length / PAGE_SIZE))
  const paged = visibleCoins.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [filter])

  return (
    <>
      <div className="filter-row">
        {['all', 'owned'].map(f => (
          <button
            key={f}
            className={`filter-btn${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : `Owned (${ownedMap.size})`}
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
          paged.map(coin => {
            const found = ownedMap.get(coin['TICKER'])
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

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >‹</button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              className={`page-btn${page === n ? ' active' : ''}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}

          <button
            className="page-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >›</button>
        </div>
      )}
    </>
  )
}
