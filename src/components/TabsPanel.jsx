import Collection from './Collection'
import Codex from './Codex'
import About from './About'
import Marketplace from './Marketplace'
import Missions from './Missions'
import Battle from './Battle'
import Leaderboard from './Leaderboard'

export default function TabsPanel({
  activeTab, setActiveTab,
  coins,
  collection, collFilter, setCollFilter,
  user,
  ripzBalance, earnRipz, spendRipz,
  missions,
  battleHistory, battling, lastResult, onStartBattle, onClearResult,
  listCard, unlistCard, removeListedCard, receiveCard,
  showNotif,
}) {
  const totalPulled   = collection.reduce((s, c) => s + (c.count ?? 1), 0)
  const uniqueCount   = new Set(collection.map(c => c.coin?.['TICKER']).filter(Boolean)).size
  const missionsDone  = (missions ?? []).filter(m => m.completed).length
  const missionsTotal = (missions ?? []).length

  const TABS = [
    { id: 'collection',  label: 'Collection', badge: totalPulled },
    { id: 'codex',       label: 'Codex',      badge: uniqueCount },
    { id: 'market',      label: 'Market',     badge: null },
    { id: 'battle',      label: 'Battle',     badge: null },
    { id: 'missions',    label: 'Missions',   badge: missionsTotal > 0 ? missionsDone + '/' + missionsTotal : null },
    { id: 'leaderboard', label: 'Rankings',   badge: null },
    { id: 'about',       label: 'About',      badge: null },
  ]

  return (
    <div className="tabs-wrapper">
      <div className="tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={'tab-btn' + (activeTab === t.id ? ' active' : '')}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
            {t.badge != null && <span className="tab-badge">{t.badge}</span>}
          </button>
        ))}
      </div>

      <div className="tab-panel active">
        {activeTab === 'collection' && (
          <Collection
            collection={collection}
            filter={collFilter}
            setFilter={setCollFilter}
            user={user}
            onListCard={user ? () => setActiveTab('market') : undefined}
          />
        )}
        {activeTab === 'codex' && (
          <Codex coins={coins} collection={collection} />
        )}
        {activeTab === 'market' && (
          <Marketplace
            user={user}
            ripzBalance={ripzBalance}
            earnRipz={earnRipz}
            spendRipz={spendRipz}
            collection={collection}
            listCard={listCard}
            unlistCard={unlistCard}
            removeListedCard={removeListedCard}
            receiveCard={receiveCard}
            showNotif={showNotif}
          />
        )}
        {activeTab === 'battle' && (
          <Battle
            user={user}
            collection={collection}
            coins={coins}
            battleHistory={battleHistory || []}
            battling={battling}
            lastResult={lastResult}
            onStartBattle={onStartBattle}
            onClearResult={onClearResult}
          />
        )}
        {activeTab === 'missions' && (
          <Missions missions={missions || []} user={user} ripzBalance={ripzBalance} />
        )}
        {activeTab === 'leaderboard' && (
          <Leaderboard user={user} />
        )}
        {activeTab === 'about' && (
          <About />
        )}
      </div>
    </div>
  )
}
