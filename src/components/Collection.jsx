import { useState, useEffect, useMemo } from 'react'
import Card from './Card'

const FILTERS = [
  { label: 'All',       value: 'ALL'       },
  { label: 'Common',    value: 'COMMON'    },
  { label: 'Rare',      value: 'RARE'      },
  { label: 'Epic',      value: 'EPIC'      },
  { label: 'Legendary', value: 'LEGENDARY' },
  { label: '★ Golden',  value: 'GOLDEN'    },
]

const PAGE_SIZE = 20

export default function Collection({ collection, filter, setFilter }) {
  const [page, setPage] = useState(1)

  const items = useMemo(() => {
    const list = [...collection].reverse()
    if (filter === 'ALL')    return list
    if (filter === 'GOLDEN') return list.filter(c => c.rarity.startsWith('GOLDEN_'))
    return list.filter(c => c.rarity === filter)
  }, [collection, filter])

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const paged = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset to page 1 whenever filter changes
  useEffect(() => { setPage(1) }, [filter])

  return (
    <>
      <div className="filter-row">
        {FILTERS.map(f => (
          <button
            key={f.value}
            className={`filter-btn${filter === f.value ? ' active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="collection-grid">
        {items.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <div className="empty-icon">🌺</div>
            <div className="empty-text">
              {collection.length === 0
                ? 'your collection is empty — start pulling'
                : 'no cards match this filter'}
            </div>
          </div>
        ) : (
          paged.map(({ id, coin, rarity }) => (
            <Card key={id} coin={coin} rarity={rarity} />
          ))
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
