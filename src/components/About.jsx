export default function About() {
  return (
    <div className="about-panel">

      <section className="about-section">
        <div className="about-section-title">🔷 About CryptoRipz</div>
        <ul className="about-list">
          <li>Collect memecoin trading cards through gacha pack pulls. Each card represents a real memecoin — from legendary OGs to fresh off-the-pump newcomers.</li>
          <li>Each pack contains <strong>5 cards</strong>. Open packs to grow your Collection and complete your Codex.</li>
          <li>Cards are pulled randomly by rarity weight. Rarer pulls = bigger market cap, bigger legend.</li>
        </ul>
      </section>

      <section className="about-section">
        <div className="about-section-title">🔷 Rarity</div>
        <p className="about-desc">Rarity is assigned by weighted probability. Higher rarity = lower drop rate. Land a LEGENDARY and you've found the top of the food chain.</p>
        <table className="about-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Meaning</th>
              <th>Drop Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr className="rarity-row legendary">
              <td>LEGENDARY</td>
              <td>Legend</td>
              <td>The OGs — untouchable cultural icons</td>
              <td>1%</td>
            </tr>
            <tr className="rarity-row ur">
              <td>UR</td>
              <td>Ultra Rare</td>
              <td>Mega-cap meme royalty</td>
              <td>4%</td>
            </tr>
            <tr className="rarity-row sr">
              <td>SR</td>
              <td>Super Rare</td>
              <td>Top-tier coins with staying power</td>
              <td>10%</td>
            </tr>
            <tr className="rarity-row r">
              <td>R</td>
              <td>Rare</td>
              <td>Established memes with real volume</td>
              <td>25%</td>
            </tr>
            <tr className="rarity-row c">
              <td>C</td>
              <td>Common</td>
              <td>Fresh off the pump — anything can moon</td>
              <td>60%</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="about-section">
        <div className="about-section-title">📊 Card Stats</div>
        <ul className="about-list">
          <li><strong>MCAP</strong> — Market Capitalization. Total value of all coins in circulation.</li>
          <li><strong>VOL</strong> — 24h Trading Volume. How much action the coin is seeing right now.</li>
          <li><strong>AGE</strong> — How long the coin has existed. Older = more battle-tested.</li>
          <li><strong>24H</strong> — 24-hour price change. <span className="about-green">Green = pumping.</span> <span className="about-red">Red = dumping.</span> <span className="about-dim">∞ = just launched.</span></li>
          <li><strong>CHAIN</strong> — The blockchain the coin lives on (SOL, ETH, BASE, BSC, etc.).</li>
        </ul>
      </section>

      <section className="about-section">
        <div className="about-section-title">📖 Collection &amp; Codex</div>
        <ul className="about-list">
          <li><strong>Collection</strong> — Every card you've pulled, sorted by rarity. Duplicates count — stack those gains.</li>
          <li><strong>Codex</strong> — All 50 memecoins. Unpulled entries are greyed out. Complete the codex to flex on the timeline.</li>
        </ul>
      </section>

      <section className="about-section">
        <div className="about-section-title">⚠️ Disclaimer</div>
        <p className="about-desc about-dim-text">CryptoRipz is a collectible card game for entertainment only. Card stats are approximate and for gameplay purposes. Nothing here is financial advice. Always DYOR.Rugs happen.</p>
      </section>

    </div>
  )
}
