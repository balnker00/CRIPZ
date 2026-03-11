import { useState } from 'react'
import logoImg from '../assets/pfp1.png'

export default function AuthScreen({ onAuth }) {
  const [mode, setMode]         = useState('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username.trim() || !password) return
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')
    const err = await onAuth(mode, username.trim(), password)
    setLoading(false)
    if (err) setError(err.message.replace('User already registered', 'Username already taken'))
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: '#050a05',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Share Tech Mono', 'Courier New', monospace",
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <img src={logoImg} alt="CryptoRipz" style={{ width: '64px', height: '64px', borderRadius: '50%', marginBottom: '12px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '1.4rem', letterSpacing: '0.15em' }}>
          <span style={{ color: '#00ff88' }}>CRYPTO</span>
          <span style={{ color: '#fff' }}>RIPZ</span>
        </div>
        <div style={{ color: '#555', fontSize: '0.6rem', letterSpacing: '0.2em', marginTop: '4px' }}>
          MEMECOINS // OWN. TRADE. PLAY.
        </div>
      </div>

      <div style={{
        background: '#0a140a',
        border: '1px solid #1a3a1a',
        borderRadius: '8px',
        padding: '28px 32px',
        width: '100%',
        maxWidth: '340px',
      }}>
        <div style={{ display: 'flex', marginBottom: '24px', gap: '4px' }}>
          {['signin', 'signup'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              style={{
                flex: 1, padding: '8px',
                background: mode === m ? '#00ff88' : 'transparent',
                color: mode === m ? '#050a05' : '#555',
                border: `1px solid ${mode === m ? '#00ff88' : '#1a3a1a'}`,
                borderRadius: '4px',
                fontSize: '0.65rem', letterSpacing: '0.15em',
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {m === 'signin' ? 'SIGN IN' : 'SIGN UP'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <div style={{ color: '#555', fontSize: '0.55rem', letterSpacing: '0.2em', marginBottom: '6px' }}>USERNAME</div>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: '#060e06', border: '1px solid #1a3a1a',
              borderRadius: '4px', overflow: 'hidden',
            }}>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.replace(/\s+/g, '_'))}
                autoComplete="username"
                spellCheck={false}
                style={{
                  flex: 1, minWidth: 0,
                  background: 'transparent', border: 'none',
                  padding: '10px 12px',
                  color: '#00ff88', fontSize: '0.8rem',
                  fontFamily: 'inherit', outline: 'none',
                }}
              />
              <span style={{
                color: '#2a5a2a', fontSize: '0.65rem',
                paddingRight: '10px', whiteSpace: 'nowrap',
                userSelect: 'none',
              }}>
                @cryptoripz.com
              </span>
            </div>
          </div>

          <label style={{ display: 'block', marginBottom: '20px' }}>
            <div style={{ color: '#555', fontSize: '0.55rem', letterSpacing: '0.2em', marginBottom: '6px' }}>PASSWORD</div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#060e06', border: '1px solid #1a3a1a',
                borderRadius: '4px', padding: '10px 12px',
                color: '#00ff88', fontSize: '0.8rem',
                fontFamily: 'inherit', outline: 'none',
              }}
            />
          </label>

          {error && (
            <div style={{ color: '#ff4444', fontSize: '0.6rem', marginBottom: '14px', letterSpacing: '0.05em' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? '#0a3a0a' : '#00ff88',
              color: '#050a05', border: 'none', borderRadius: '4px',
              fontSize: '0.7rem', letterSpacing: '0.2em',
              fontFamily: 'inherit', fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {loading ? 'PLEASE WAIT...' : mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  )
}
