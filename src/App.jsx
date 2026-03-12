import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './hooks/useAuth'
import { useGame } from './hooks/useGame'
import { useRipz } from './hooks/useRipz'
import { useMissions } from './hooks/useMissions'
import { useBattle } from './hooks/useBattle'
import { RIPZ_REWARDS } from './data/gameData'
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
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('cripz-theme', theme)
  }, [theme])

  const { user, authLoading, username, handleAuth, signOut } = useAuth()

  useEffect(() => {
    if (user) setShowAuth(false)
  }, [user])

  // ── $RIPZ balance ─────────────────────────────────────────────────────────
  const { ripzBalance, ripzReady, earnRipz, spendRipz } = useRipz(user)

  // ── Missions (needs earnRipz to reward completions) ───────────────────────
  const { missions, trackProgress } = useMissions(user, earnRipz)

  // Daily login bonus — fire once per session when user logs in
  const [loginBonusFired, setLoginBonusFired] = useState(false)
  useEffect(() => {
    if (user && ripzReady && !loginBonusFired) {
      setLoginBonusFired(true)
      trackProgress('login', {})
    }
    if (!user) setLoginBonusFired(false)
  }, [user, ripzReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pack pull callback — earn $RIPZ + track missions ─────────────────────
  const handlePullComplete = useCallback((pulls) => {
    if (!user) return
    let ripzEarned = 0
    for (const card of pulls) {
      const isGolden  = card.rarity.startsWith('GOLDEN_')
      const base      = isGolden ? card.rarity.replace('GOLDEN_', '') : card.rarity
      if (isGolden)              ripzEarned += RIPZ_REWARDS.PULL_GOLDEN
      if (base === 'LEGENDARY')  ripzEarned += RIPZ_REWARDS.PULL_LEGENDARY
      else if (base === 'EPIC')  ripzEarned += RIPZ_REWARDS.PULL_EPIC
      else if (base === 'RARE')  ripzEarned += RIPZ_REWARDS.PULL_RARE
    }
    if (ripzEarned > 0) earnRipz(ripzEarned)
    trackProgress('pack_opened', { cards: pulls })
  }, [user, earnRipz, trackProgress])

  // ── Game state ────────────────────────────────────────────────────────────
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
    showNotif,
    listCard,
    unlistCard,
    removeListedCard,
    receiveCard,
  } = useGame(user, handlePullComplete)

  // Share reward + $RIPZ
  const handleShare = useCallback(() => {
    rewardShare()
    if (user) earnRipz(RIPZ_REWARDS.SHARE_PULL)
  }, [rewardShare, earnRipz, user])

  // Ad reward + $RIPZ
  const handleAdReward = useCallback(() => {
    rewardAd()
    if (user) earnRipz(RIPZ_REWARDS.WATCH_AD)
  }, [rewardAd, earnRipz, user])

  // ── Battle ────────────────────────────────────────────────────────────────
  const {
    battleHistory, battling, lastResult, startBattle, clearResult,
  } = useBattle(user, collection, coins, earnRipz, trackProgress)

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

      <div className={'app-content' + (!appReady ? ' app-content-hidden' : '')}>
        {flash && <div className="flash" />}

        <Header
          username={username}
          onSignOut={signOut}
          onLogin={() => setShowAuth(true)}
          ripzBalance={user ? ripzBalance : null}
        />
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
            rewardAd={handleAdReward}
            showNotif={showNotif}
          />

          <RevealArea
            cards={revealedCards}
            onShare={handleShare}
            totalCards={stats.totalCards}
          />

          <TabsPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            coins={coins}
            collection={collection}
            collFilter={collFilter}
            setCollFilter={setCollFilter}
            user={user}
            ripzBalance={ripzBalance}
            earnRipz={earnRipz}
            spendRipz={spendRipz}
            missions={missions}
            battleHistory={battleHistory}
            battling={battling}
            lastResult={lastResult}
            onStartBattle={startBattle}
            onClearResult={clearResult}
            listCard={listCard}
            unlistCard={unlistCard}
            removeListedCard={removeListedCard}
            receiveCard={receiveCard}
            showNotif={showNotif}
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
