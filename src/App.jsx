import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useGame } from './hooks/useGame'
import Header from './components/Header'
import StatsBar from './components/StatsBar'
import PackSection from './components/PackSection'
import RevealArea from './components/RevealArea'
import TabsPanel from './components/TabsPanel'
import Notification from './components/Notification'
import LoadingScreen from './components/LoadingScreen'
import AuthScreen from './components/AuthScreen'
import AdPermission from './components/AdPermission'
import AdModal from './components/AdModal'

export default function App() {
  const [appLoading, setAppLoading] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('cripz-theme') || 'dark')
  const [showAuth, setShowAuth] = useState(false)

  // Ad flow state machine: null → 'confirm' → 'watching' → null
  const [adStep, setAdStep] = useState(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('cripz-theme', theme)
  }, [theme])

  const { user, authLoading, username, handleAuth, signOut } = useAuth()

  useEffect(() => {
    if (user) setShowAuth(false)
  }, [user])

  const {
    coins,
    coinsLoading,
    coinsError,
    collection,
    revealedCards,
    collFilter, setCollFilter,
    activeTab, setActiveTab,
    notif,
    flash,
    stats,
    pulling,
    openPack,
    packsLeft,
    onCooldown,
    resetAt,
    rewardAd,
  } = useGame(user)

  const appReady = !appLoading && !authLoading

  function handleOpenPack() {
    if (!user) {
      setShowAuth(true)
    } else {
      openPack()
    }
  }

  return (
    <>
      {(appLoading || authLoading) && (
        <LoadingScreen onDone={() => setAppLoading(false)} />
      )}

      {appReady && showAuth && (
        <AuthScreen onAuth={handleAuth} onClose={() => setShowAuth(false)} />
      )}

      {/* Step 1: permission prompt */}
      {adStep === 'confirm' && (
        <AdPermission
          onConfirm={() => setAdStep('watching')}
          onCancel={() => setAdStep(null)}
        />
      )}

      {/* Step 2: ad player */}
      {adStep === 'watching' && (
        <AdModal
          onReward={() => { rewardAd(); setAdStep(null) }}
        />
      )}

      <div className={`app-content${!appReady ? ' app-content-hidden' : ''}`}>
        {flash && <div className="flash" />}

        <Header username={username} onSignOut={signOut} onLogin={() => setShowAuth(true)} />
        <StatsBar stats={stats} />

        <main>
          <PackSection
            onOpen={handleOpenPack}
            pulling={pulling}
            coinsLoading={coinsLoading}
            coinsError={coinsError}
            packsLeft={packsLeft}
            onCooldown={onCooldown}
            resetAt={resetAt}
            onWatchAd={() => setAdStep('confirm')}
          />

          <RevealArea cards={revealedCards} />

          <TabsPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            coins={coins}
            collection={collection}
            collFilter={collFilter}
            setCollFilter={setCollFilter}
          />
        </main>

        <Notification msg={notif.msg} rare={notif.rare} show={notif.show} />
      </div>

      <button
        className="theme-switch"
        onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        title="Toggle theme"
      >
        {theme === 'dark' ? '◑ LIGHT' : '● DARK'}
      </button>
    </>
  )
}
