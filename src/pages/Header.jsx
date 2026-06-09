import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser]       = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const currentDate = new Date().toLocaleDateString('mn-MN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  })

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try { setUser(JSON.parse(stored)) }
      catch { setUser(null) }
    } else {
      setUser(null)
    }
    setMenuOpen(false)
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-date">{currentDate}</div>

        <div className="header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span>МОНГОЛ</span> МЭДЭЭ
        </div>

        <div className="header-auth">
          {user ? (
            <div style={{ position: 'relative' }}>
              {/* Нэвтэрсэн хэрэглэгчийн товч */}
              <div
                onClick={() => setMenuOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  cursor: 'pointer', padding: '6px 14px',
                  border: '1.5px solid var(--border)', borderRadius: 6,
                  background: menuOpen ? 'var(--ink)' : 'white',
                  color: menuOpen ? 'white' : 'var(--ink)',
                  transition: 'all 0.2s', userSelect: 'none'
                }}
              >
                <span style={{ fontSize: 18 }}>👤</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{user.name || user.email}</span>
                <span style={{ fontSize: 11 }}>{menuOpen ? '▲' : '▼'}</span>
              </div>

              {/* Dropdown menu */}
              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: 'white', border: '1px solid var(--border)',
                  borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  minWidth: 200, zIndex: 200, overflow: 'hidden'
                }}>
                  {/* Хэрэглэгчийн мэдээлэл */}
                  <div style={{
                    padding: '14px 16px', borderBottom: '1px solid var(--border)',
                    background: '#fafaf8'
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{user.name} {user.ovog}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 2 }}>{user.email}</div>
                    <div style={{ marginTop: 6 }}>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 10,
                        background: user.role === 'admin' ? '#fdecea' : '#eafaf1',
                        color: user.role === 'admin' ? '#c0392b' : '#1e8449',
                        fontWeight: 600
                      }}>
                        {user.role === 'admin' ? '👑 Admin' :
                         user.role === 'editor' ? '✏️ Editor' : '👤 User'}
                      </span>
                    </div>
                  </div>

                  {/* Миний мэдээнүүд */}
                  <button onClick={() => navigate('/my-news')} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '12px 16px', background: 'none',
                    border: 'none', cursor: 'pointer', fontSize: 14,
                    color: 'var(--ink)', transition: 'background 0.15s', textAlign: 'left'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f5f5f0'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    📋 Миний мэдээнүүд
                  </button>

                  {/* Шинэ мэдээ */}
                  <button onClick={() => navigate('/news/create')} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '12px 16px', background: 'none',
                    border: 'none', cursor: 'pointer', fontSize: 14,
                    color: 'var(--ink)', transition: 'background 0.15s', textAlign: 'left'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f5f5f0'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    ✍️ Шинэ мэдээ нэмэх
                  </button>

                  {/* Гарах */}
                  <button onClick={handleLogout} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '12px 16px', background: 'none',
                    border: 'none', borderTop: '1px solid var(--border)',
                    cursor: 'pointer', fontSize: 14,
                    color: 'var(--accent)', transition: 'background 0.15s', textAlign: 'left'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fdecea'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    🚪 Гарах
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => navigate('/login')}>Нэвтрэх</button>
              <button className="btn btn-solid"   onClick={() => navigate('/register')}>Бүртгүүлэх</button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
