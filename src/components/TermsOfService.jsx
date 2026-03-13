export default function TermsOfService({ onBack }) {
  return (
    <div className="about-panel">
      <div className="about-section-title" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
        Terms of Service
        <span className="about-dim" style={{ fontSize: '0.6rem', marginLeft: '1rem', fontFamily: "'Share Tech Mono', monospace" }}>Last updated: 2026-02-20</span>
      </div>

      <section className="about-section">
        <div className="about-section-title">1. Entertainment Only</div>
        <p className="about-desc">
          CryptoRipz is a collectible card game for entertainment purposes. Cards represent real memecoins but are purely digital collectibles — they carry no monetary value, no ownership of any underlying asset, and confer no financial rights whatsoever. Opening packs is not investing, trading, or gambling.
        </p>
      </section>

      <section className="about-section">
        <div className="about-section-title">2. Not Financial Advice</div>
        <p className="about-desc">
          Nothing on this platform — card stats, rarity tiers, market cap data, or any other displayed information — constitutes financial advice, investment advice, or a recommendation to buy or sell any cryptocurrency or digital asset. Always DYOR. Crypto markets are highly volatile; you can lose everything.
        </p>
      </section>

      <section className="about-section">
        <div className="about-section-title">3. Prohibited Conduct</div>
        <ul className="about-list">
          <li>Attempting to exploit, manipulate, or cheat the pack or collection systems</li>
          <li>Using automated scripts or bots to open packs or interact with the service</li>
          <li>Using data from this platform to coordinate market manipulation of any token</li>
          <li>Unauthorized access to our backend, database, or API</li>
          <li>Any conduct that violates applicable laws or regulations</li>
        </ul>
      </section>

      <section className="about-section">
        <div className="about-section-title">4. Card Pool & Availability</div>
        <p className="about-desc">
          The coins available in the card pool, their stats, and their rarity assignments may change at any time without notice. Coins can be added, removed, or re-tiered as market conditions change. We make no guarantees about the long-term availability of any specific card.
        </p>
      </section>

      <section className="about-section">
        <div className="about-section-title">5. Disclaimer of Warranties</div>
        <p className="about-desc">
          The service is provided as-is. We make no guarantees of uptime, accuracy of data, or fitness for any purpose. We are not liable for any losses — financial or otherwise — arising from use of this platform, including reliance on any coin stats shown.
        </p>
      </section>

      <section className="about-section">
        <div className="about-section-title">6. Third-Party Trademarks</div>
        <p className="about-desc">
          Coin names, logos, and associated marks belong to their respective projects and communities. CryptoRipz is not affiliated with, endorsed by, or partnered with any featured memecoin project.
        </p>
      </section>

      <section className="about-section">
        <div className="about-section-title">7. Changes to Terms</div>
        <p className="about-desc">
          These terms may be updated at any time. Continued use of the service after updates constitutes acceptance of the revised terms.
        </p>
      </section>

      <button className="legal-back-btn" onClick={onBack}>← Back</button>
    </div>
  )
}
