import Card from './Card'

const FILTERS = [
  { label: 'All',        value: 'ALL'       },
  { label: 'Common',     value: 'C'         },
  { label: 'Rare',       value: 'R'         },
  { label: 'Super Rare', value: 'SR'        },
  { label: 'Ultra Rare', value: 'UR'        },
  { label: 'Legendary',  value: 'LEGENDARY' },
]

export default function Collection({ collection, filter, setFilter }) {
  const items = filter === 'ALL'
    ? [...collection].reverse()
    : [...collection].reverse().filter(c => c.rarity === filter)

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
