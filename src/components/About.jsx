export default function About() {
  return (
    <div className="about-panel">

      <section className="about-section">
        <div className="about-section-title">🔷 About CryptoRipz</div>
        <ul className="about-list">
          <li>Collect memecoin trading cards through gacha pack pulls. Each card represents a real memecoin — from legendary OGs to fresh off-the-pump newcomers.</li>
          <li>Each pack contains <strong>5 cards</strong>. Open packs to grow your Collection and complete your Codex.</li>
          <li>Cards are pulled randomly by rarity weight. Rarer pulls = bigger market cap, bigger legend.</li>
          <li>Any card can come as a <strong style={{ color: '#FFD700' }}>★ Golden</strong> copy — a special foil version with ~12% chance per pull.</li>
        </ul>
      </section>

      <section className="about-section">
        <div className="about-section-title">🔷 Rarity</div>
        <p className="about-desc">Rarity is assigned by weighted probability. Higher rarity = lower drop rate. Any card can also drop as a golden foil copy.</p>
        <table className="about-table">
          <thead>
            <tr>
              <th>Rarity</th>
              <th>Drop Rate</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr className="rarity-row legendary">
              <td>LEGENDARY</td>
              <td>~1.8%</td>
              <td>The OGs — untouchable cultural icons</td>
            </tr>
            <tr className="rarity-row epic">
              <td>EPIC</td>
              <td>~8.8%</td>
              <td>Top-tier memes with serious staying power</td>
            </tr>
            <tr className="rarity-row r">
              <td>RARE</td>
              <td>~22%</td>
              <td>Established memes with real volume</td>
            </tr>
            <tr className="rarity-row c">
              <td>COMMON</td>
              <td>~55%</td>
              <td>Fresh off the pump — anything can moon</td>
            </tr>
            <tr>
              <td style={{ color: '#FFD700', fontWeight: 'bold', fontFamily: "'Orbitron', monospace" }}>★ GOLDEN</td>
              <td>~12% each</td>
              <td>Foil copy of any rarity — rarer than it sounds</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="about-section">
        <div className="about-section-title">📊 Card Stats</div>
        <ul className="about-list">
          <li><strong>MCAP</strong> — Market Capitalization. Total value of all coins in circulation.</li>
          <li><strong>HOLDERS</strong> — Number of wallet addresses holding the coin.</li>
          <li><strong>AGE</strong> — How long the coin has existed. Older = more battle-tested.</li>
        </ul>
      </section>

      <section className="about-section">
        <div className="about-section-title">📖 Collection &amp; Codex</div>
        <ul className="about-list">
          <li><strong>Collection</strong> — Every card you've pulled, sorted by rarity. Duplicates count — stack those gains.</li>
          <li><strong>Codex</strong> — All memecoins. Unpulled entries are greyed out. Complete the codex to flex on the timeline.</li>
          <li>Click any card to view it on <strong>DexScreener</strong>.</li>
        </ul>
      </section>

      <section className="about-section">
        <div className="about-section-title">⚠️ Disclaimer</div>
        <p className="about-desc about-dim-text">CryptoRipz is a collectible card game for entertainment only. Card stats are approximate and for gameplay purposes. Nothing here is financial advice. Always DYOR.</p>
      </section>

    </div>
  )
}
