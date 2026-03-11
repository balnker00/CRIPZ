import Card from './Card'
import { COINS } from '../data/gameData'

export default function Codex({ collection }) {
  return (
    <div className="collection-grid">
      {COINS.map(coin => {
        const found = collection.find(c => c.coin.ticker === coin.ticker)
        if (found) {
          return <Card key={coin.ticker} coin={found.coin} rarity={found.rarity} />
        }
        return (
          <div
            key={coin.ticker}
            className="card rarity-C codex-unknown"
          >
            <div className="card-art" style={{ height: 108, background: '#E8E8E8' }}>
              <span style={{ fontSize: '2.4rem', opacity: 0.18 }}>?</span>
            </div>
            <div className="card-body">
              <div className="card-name" style={{ color: '#aaa' }}>???</div>
              <div className="card-ticker" style={{ color: '#bbb' }}>UNDISCOVERED</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
