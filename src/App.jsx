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
import AdModal from './components/AdModal'

export default function App() {
  const [appLoading, setAppLoading] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('cripz-theme') || 'dark')
  const [showAuth, setShowAuth] = useState(false)
  const [adOpen, setAdOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('cripz-theme', theme)
  }, [theme])

  const { user, authLoading, username, handleAuth, signOut } = useAuth()

  useEffect(() => {
    if (user) setShowAuth(false)
  }, [user])

  useEffect(() => {
    console.log('[App] adOpen state changed:', adOpen)
  }, [adOpen])

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
    rewardShare,
  } = useGame(user)

  console.log('[App] render — adOpen:', adOpen, '| onCooldown:', onCooldown, '| packsLeft:', packsLeft, '| user:', !!user)

  const appReady = !appLoading && !authLoading

  function handleOpenPack() {
    if (!user) {
      setShowAuth(true)
    } else {
      openPack()
    }
  }

  function handleWatchAd() {
    console.log('[Ad] handleWatchAd called — adOpen was:', adOpen)
    setAdOpen(true)
    console.log('[Ad] setAdOpen(true) called')
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch((e) => console.warn('[Ad] Notification.requestPermission error:', e))
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

      {adOpen && (
        <AdModal
          onReward={() => {
            console.log('[App] onReward fired — calling rewardAd(), then setAdOpen(false)')
            rewardAd()
            console.log('[App] rewardAd() returned — calling setAdOpen(false)')
            setAdOpen(false)
            console.log('[App] setAdOpen(false) called')
          }}
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
            onWatchAd={handleWatchAd}
          />

          <RevealArea
            cards={revealedCards}
            onShare={rewardShare}
            totalCards={stats.totalCards}
          />

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
