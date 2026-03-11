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

export default function App() {
  const [appLoading, setAppLoading] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('cripz-theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('cripz-theme', theme)
  }, [theme])

  const { user, authLoading, username, handleAuth, signOut } = useAuth()

  const {
    coins,
    coinsLoading,
    coinsError,
    collection,
    pullCount, setPullCount,
    revealedCards,
    collFilter, setCollFilter,
    activeTab, setActiveTab,
    notif,
    flash,
    stats,
    pulling,
    openPack,
  } = useGame(user)

  const showGame = !appLoading && !authLoading && !!user

  return (
    <>
      {(appLoading || authLoading) && (
        <LoadingScreen onDone={() => setAppLoading(false)} />
      )}

      {!appLoading && !authLoading && !user && (
        <AuthScreen onAuth={handleAuth} />
      )}

      <div className={`app-content${!showGame ? ' app-content-hidden' : ''}`}>
        {flash && <div className="flash" />}

        <Header username={username} onSignOut={signOut} />
        <StatsBar stats={stats} />

        <main>
          <PackSection
            pullCount={pullCount}
            setPullCount={setPullCount}
            onOpen={openPack}
            pulling={pulling}
            coinsLoading={coinsLoading}
            coinsError={coinsError}
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

      {/* Theme switch — fixed bottom-left */}
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
