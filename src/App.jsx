import { useGame } from './hooks/useGame'
import Header from './components/Header'
import StatsBar from './components/StatsBar'
import PackSection from './components/PackSection'
import RevealArea from './components/RevealArea'
import TabsPanel from './components/TabsPanel'
import Notification from './components/Notification'

export default function App() {
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
    </>
  )
}
