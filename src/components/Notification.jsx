export default function Notification({ msg, rare, show }) {
  return (
    <div className={`notif${show ? ' show' : ''}${rare ? ' rare' : ''}`}>
      {msg}
    </div>
  )
}
