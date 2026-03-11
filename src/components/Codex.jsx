import Card from './Card'

export default function Codex({ coins, collection }) {
  return (
    <div className="collection-grid">
      {coins.map(coin => {
        const found = collection.find(c => c.coin['TICKER'] === coin['TICKER'])
        if (found) {
          return <Card key={coin.id} coin={found.coin} rarity={found.rarity} />
        }
        return (
          <div
            key={coin.id}
            className="card rarity-C codex-unknown"
          >
            <div className="card-bg" />
            <div className="card-content" style={{ alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '2rem', opacity: 0.3, color: '#fff' }}>?</div>
              <div style={{ fontSize: '0.55rem', color: '#333', marginTop: '4px', letterSpacing: '0.1em' }}>UNDISCOVERED</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
