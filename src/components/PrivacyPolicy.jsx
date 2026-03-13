export default function PrivacyPolicy({ onBack }) {
  return (
    <div className="about-panel">
      <div className="about-section-title" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
        Privacy Policy
        <span className="about-dim" style={{ fontSize: '0.6rem', marginLeft: '1rem', fontFamily: "'Share Tech Mono', monospace" }}>Last updated: 2026-02-20</span>
      </div>

      <section className="about-section">
        <div className="about-section-title">1. What We Store</div>
        <p className="about-desc">
          CryptoRipz stores your game state — pack count, cooldown timers, and pulled card collection — locally in your browser and, if you're logged in, in our database. We do not collect wallet addresses, private keys, seed phrases, or any on-chain data. We never ask for them.
        </p>
      </section>

      <section className="about-section">
        <div className="about-section-title">2. Account Data</div>
        <p className="about-desc">
          If you create an account, we store your email address and username for authentication and save your collection server-side. This data is used solely to operate the service. You can request deletion at any time via our contact page.
        </p>
      </section>

      <section className="about-section">
        <div className="about-section-title">3. Coin & Market Data</div>
        <p className="about-desc">
          Card stats (market cap, holders, age) are pulled from third-party data providers including DexScreener. We display this data for gameplay purposes only — it is approximate and may be delayed or inaccurate. We are not responsible for its accuracy.
        </p>
      </section>

      <section className="about-section">
        <div className="about-section-title">4. Advertising & Analytics</div>
        <p className="about-desc">
          This site may use third-party advertising and analytics services. These providers may place cookies or use similar technologies to serve relevant ads or measure traffic. You can opt out via your browser settings or ad provider opt-out tools.
        </p>
      </section>

      <section className="about-section">
        <div className="about-section-title">5. Third-Party Sharing</div>
        <p className="about-desc">
          We do not sell or share your personal data with third parties for marketing purposes. Data may be disclosed if required by law or to prevent abuse of the service.
        </p>
      </section>

      <section className="about-section">
        <div className="about-section-title">6. Changes</div>
        <p className="about-desc">
          We may update this policy as the service evolves. Changes take effect when published on this page.
        </p>
      </section>

      <button className="legal-back-btn" onClick={onBack}>← Back</button>
    </div>
  )
}
