import Card from './Card'

const FILTERS = [
  { label: 'All',       value: 'ALL'       },
  { label: 'Common',    value: 'COMMON'    },
  { label: 'Rare',      value: 'RARE'      },
  { label: 'Epic',      value: 'EPIC'      },
  { label: 'Legendary', value: 'LEGENDARY' },
  { label: '★ Golden',  value: 'GOLDEN'    },
]

export default function Collection({ collection, filter, setFilter }) {
  const items = (() => {
    const list = [...collection].reverse()
    if (filter === 'ALL')    return list
    if (filter === 'GOLDEN') return list.filter(c => c.rarity.startsWith('GOLDEN_'))
    return list.filter(c => c.rarity === filter)
  })()

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
          items.map(({ id, coin, rarity }) => (
            <Card key={id} coin={coin} rarity={rarity} />
          ))
        )}
      </div>
    </>
  )
}
