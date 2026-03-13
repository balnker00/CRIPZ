import { useState, useEffect, useMemo } from 'react'
import Card from './Card'
import logoImg from '../assets/pfpGL.png'

const FILTERS = [
  { label: 'All',       value: 'ALL'       },
  { label: 'Common',    value: 'COMMON'    },
  { label: 'Rare',      value: 'RARE'      },
  { label: 'Epic',      value: 'EPIC'      },
  { label: 'Legendary', value: 'LEGENDARY' },
  { label: '★ Golden',  value: 'GOLDEN'    },
]

const PAGE_SIZE = 20

function getPageRange(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const left  = Math.max(2, page - 2)
  const right = Math.min(total - 1, page + 2)
  const range = [1]
  if (left > 2) range.push('...')
  for (let i = left; i <= right; i++) range.push(i)
  if (right < total - 1) range.push('...')
  range.push(total)
  return range
}

export default function Collection({ collection, filter, setFilter }) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const items = useMemo(() => {
    const list = [...collection].reverse()
    const byRarity = filter === 'ALL'    ? list
                   : filter === 'GOLDEN' ? list.filter(c => c.rarity.startsWith('GOLDEN_'))
                   : list.filter(c => c.rarity === filter)
    if (!search.trim()) return byRarity
    const q = search.trim().toLowerCase()
    return byRarity.filter(c =>
      c.coin?.['NAME']?.toLowerCase().includes(q) ||
      c.coin?.['TICKER']?.toLowerCase().includes(q)
    )
  }, [collection, filter, search])

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const paged = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [filter, search])

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
        <input
          className="collection-search"
          type="text"
          placeholder="search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="collection-grid">
        {items.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <img src={logoImg} alt="CryptoRipz" className="empty-logo" />
            <div className="empty-text">
              {collection.length === 0
                ? 'your collection is empty — start pulling'
                : 'no cards match this filter'}
            </div>
          </div>
        ) : (
          paged.map(({ id, coin, rarity, count }) => (
            <Card key={id} coin={coin} rarity={rarity} count={count} />
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

          {getPageRange(page, totalPages).map((n, i) =>
            n === '...'
              ? <span key={`dots-${i}`} className="page-dots">…</span>
              : <button
                  key={n}
                  className={`page-btn${page === n ? ' active' : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
          )}

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
