export default function Contact({ onBack }) {
  return (
    <div className="about-panel">
      <div className="about-section-title" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
        Contact
      </div>

      <section className="about-section">
        <div className="about-section-title">Reach Us</div>
        <p className="about-desc">
          For questions, feedback, bug reports, or partnership inquiries, hit us on X (Twitter) or Telegram.
        </p>
        <a
          href="https://x.com/cryptoripz_sol"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-x-link"
        >
          ↗ @cryptoripz_sol on X
        </a>
        <a
          href="https://t.me/cryptoripz"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-x-link"
        >
          ↗ t.me/cryptoripz on Telegram
        </a>
      </section>

      <section className="about-section">
        <div className="about-section-title">Privacy & Legal</div>
        <p className="about-desc">
          For privacy-related requests — including data deletion or questions about your stored data — contact us via the link above and include "Privacy Request" in your message.
        </p>
      </section>

      <button className="legal-back-btn" onClick={onBack}>← Back</button>
    </div>
  )
}
