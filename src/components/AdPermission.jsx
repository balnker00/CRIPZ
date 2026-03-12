import { AD_REWARD } from '../hooks/usePacks'

export default function AdPermission({ onConfirm, onCancel }) {
  return (
    <div className="ad-overlay">
      <div className="ad-permission">
        <div className="ad-perm-site">cryptoripz.com</div>
        <div className="ad-perm-message">
          wants to show an advertisement
        </div>
        <div className="ad-perm-detail">
          Watch a 10-second ad · earn
          <span className="ad-perm-reward"> +{AD_REWARD} packs</span>
        </div>
        <div className="ad-perm-actions">
          <button className="ad-perm-allow" onClick={onConfirm}>ALLOW</button>
          <button className="ad-perm-block" onClick={onCancel}>BLOCK</button>
        </div>
      </div>
    </div>
  )
}
