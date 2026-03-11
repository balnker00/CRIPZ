import Collection from './Collection'
import Codex from './Codex'
import About from './About'
import { COINS } from '../data/gameData'

export default function TabsPanel({
  activeTab, setActiveTab,
  collection, collFilter, setCollFilter,
}) {
  const uniqueCount = new Set(collection.map(c => c.coin.ticker)).size

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
          <span className="tab-badge">{uniqueCount}/{COINS.length}</span>
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
          <Codex collection={collection} />
        ) : (
          <About />
        )}
      </div>
    </div>
  )
}
