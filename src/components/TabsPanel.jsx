import Collection from './Collection'
import Codex from './Codex'
import About from './About'

export default function TabsPanel({
  activeTab, setActiveTab,
  coins,
  collection, collFilter, setCollFilter,
}) {
  const uniqueCount = new Set(collection.map(c => c.coin?.['TICKER']).filter(Boolean)).size

  return (
    <div className="tabs-wrapper">
      <div className="tabs">
        <button
          className={`tab-btn${activeTab === 'collection' ? ' active' : ''}`}
          onClick={() => setActiveTab('collection')}
        >
          Collection
          <span className="tab-badge">{collection.length}</span>
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
