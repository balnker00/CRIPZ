import Collection from './Collection'
import Codex from './Codex'
import About from './About'

export default function TabsPanel({
  activeTab, setActiveTab,
  coins,
  collection, collFilter, setCollFilter,
}) {
  const totalPulled = collection.reduce((s, c) => s + (c.count ?? 1), 0)
  const uniqueCount = new Set(collection.map(c => c.coin?.['TICKER']).filter(Boolean)).size

  return (
    <div className="tabs-wrapper">
      <div className="tabs">
        <button
          className={`tab-btn${activeTab === 'collection' ? ' active' : ''}`}
          onClick={() => setActiveTab('collection')}
        >
          Collection
          <span className="tab-badge">{totalPulled}</span>
        </button>
        <button
          className={`tab-btn${activeTab === 'codex' ? ' active' : ''}`}
          onClick={() => setActiveTab('codex')}
        >
          Codex
          <span className="tab-badge">{uniqueCount}</span>
        </button>
        <button
          className={`tab-btn${activeTab === 'about' ? ' active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
      </div>

      <div className="tab-panel active">
        {activeTab === 'collection' ? (
          <Collection
            collection={collection}
            filter={collFilter}
            setFilter={setCollFilter}
          />
        ) : activeTab === 'codex' ? (
          <Codex coins={coins} collection={collection} />
        ) : (
          <About />
        )}
      </div>
    </div>
  )
}
