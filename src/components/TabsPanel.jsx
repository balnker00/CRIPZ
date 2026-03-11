import Collection from './Collection'
import Codex from './Codex'
import { COINS } from '../data/gameData'

const TABS = [
  { id: 'collection', label: 'Collection' },
  { id: 'codex',      label: 'Codex'      },
]

export default function TabsPanel({
  activeTab, setActiveTab,
  collection, collFilter, setCollFilter,
}) {
  const uniqueCount = new Set(collection.map(c => c.coin.ticker)).size

  return (
    <div className="tabs-wrapper">
      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span className="tab-badge">
              {tab.id === 'collection'
                ? collection.length
                : `${uniqueCount}/${COINS.length}`}
            </span>
          </button>
        ))}
      </div>

      <div className="tab-panel active">
        {activeTab === 'collection' ? (
          <Collection
            collection={collection}
            filter={collFilter}
            setFilter={setCollFilter}
          />
        ) : (
          <Codex collection={collection} />
        )}
      </div>
    </div>
  )
}
