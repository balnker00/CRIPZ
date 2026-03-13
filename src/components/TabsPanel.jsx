import Collection from './Collection'
import About from './About'
import PackSection from './PackSection'
import RevealArea from './RevealArea'

export default function TabsPanel({
  activeTab, setActiveTab,
  coins,
  collection, collFilter, setCollFilter,
  onOpenPack, pulling, coinsLoading, coinsError,
  packsLeft, onCooldown, resetAt, rewardAd, showNotif,
  revealedCards, rewardShare, totalCards,
  username, onSignOut, onLogin,
}) {
  const totalPulled = collection.reduce((s, c) => s + (c.count ?? 1), 0)

  return (
    <div className="tabs-wrapper">
      <div className="tabs">
        <button
          className={`tab-btn${activeTab === 'openpacks' ? ' active' : ''}`}
          onClick={() => setActiveTab('openpacks')}
        >
          Open Packs
        </button>
        <button
          className={`tab-btn${activeTab === 'collection' ? ' active' : ''}`}
          onClick={() => setActiveTab('collection')}
        >
          Collection
          <span className="tab-badge">{totalPulled}</span>
        </button>
        <button
          className={`tab-btn${activeTab === 'about' ? ' active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
        <button
          className={`tab-btn${activeTab === 'market' ? ' active' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          Market
        </button>
        <button
          className={`tab-btn${activeTab === 'battle' ? ' active' : ''}`}
          onClick={() => setActiveTab('battle')}
        >
          Battle
        </button>

        <div className="tabs-user">
          {username ? (
            <>
              <span className="tabs-username">{username.toUpperCase()}</span>
              <button className="tabs-auth-btn" onClick={onSignOut}>LOGOUT</button>
            </>
          ) : (
            <button className="tabs-auth-btn tabs-auth-btn--login" onClick={onLogin}>LOGIN</button>
          )}
        </div>
      </div>

      <div className="tab-panel active">
        {activeTab === 'openpacks' ? (
          <>
            <PackSection
              onOpen={onOpenPack}
              pulling={pulling}
              coinsLoading={coinsLoading}
              coinsError={coinsError}
              packsLeft={packsLeft}
              onCooldown={onCooldown}
              resetAt={resetAt}
              rewardAd={rewardAd}
              showNotif={showNotif}
            />
            <RevealArea
              cards={revealedCards}
              onShare={rewardShare}
              totalCards={totalCards}
            />
          </>
        ) : activeTab === 'collection' ? (
          <Collection
            collection={collection}
            filter={collFilter}
            setFilter={setCollFilter}
          />
        ) : activeTab === 'about' ? (
          <About />
        ) : (
          <div className="coming-soon">
            <div className="coming-soon-inner">
              <span className="coming-soon-icon">🔒</span>
              <h2>{activeTab === 'market' ? 'Market' : 'Battle'}</h2>
              <p>Coming Soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
