import { useState } from 'react'
import { useGame } from './hooks/useGame'
import Header from './components/Header'
import StatsBar from './components/StatsBar'
import PackSection from './components/PackSection'
import RevealArea from './components/RevealArea'
import TabsPanel from './components/TabsPanel'
import Notification from './components/Notification'
import LoadingScreen from './components/LoadingScreen'

export default function App() {
  const [loading, setLoading] = useState(true)

  const {
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
  } = useGame()

  return (
    <>
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}

      <div className={`app-content${loading ? ' app-content-hidden' : ''}`}>
        {flash && <div className="flash" />}

        <Header />
        <StatsBar stats={stats} />

        <main>
          <PackSection
            pullCount={pullCount}
            setPullCount={setPullCount}
            onOpen={openPack}
            pulling={pulling}
          />

          <RevealArea cards={revealedCards} />

          <TabsPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            collection={collection}
            collFilter={collFilter}
            setCollFilter={setCollFilter}
          />
        </main>

        <Notification msg={notif.msg} rare={notif.rare} show={notif.show} />
      </div>
    </>
  )
}
