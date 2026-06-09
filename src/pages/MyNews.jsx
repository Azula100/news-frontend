import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000)
  if (diff < 60)   return `${diff} минутын өмнө`
  if (diff < 1440) return `${Math.floor(diff / 60)} цагийн өмнө`
  return `${Math.floor(diff / 1440)} өдрийн өмнө`
}

export default function MyNews() {
  const navigate = useNavigate()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }

    axios.get('/api/news?limit=100')
      .then(res => {
        const mine = res.data.data.filter(n => n.author?._id === user._id)
        setNews(mine)
      })
      .catch(() => setError('Мэдээ татахад алдаа гарлаа'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Энэ мэдээг устгах уу?')) return
    setDeleting(id)
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNews(prev => prev.filter(n => n._id !== id))
    } catch {
      setError('Устгахад алдаа гарлаа')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return (
    <div className="loading"><div className="spinner"></div><span>Уншиж байна...</span></div>
  )

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }}>
          📋 Миний мэдээнүүд
        </h1>
        <button className="btn btn-solid" onClick={() => navigate('/news/create')}>
          ✍️ Шинэ мэдээ
        </button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {news.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
          <p style={{ color: 'var(--ink-faint)', fontSize: 18, marginBottom: 24 }}>
            Та одоогоор мэдээ оруулаагүй байна
          </p>
          <button className="btn btn-solid" onClick={() => navigate('/news/create')}>
            ✍️ Анхны мэдээгээ нэмэх
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {news.map(item => (
            <div key={item._id} style={{
              display: 'flex', gap: 16, alignItems: 'center',
              background: 'white', border: '1px solid var(--border)',
              borderRadius: 8, padding: 16,
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
            }}>

              <div style={{
                width: 90, height: 70, flexShrink: 0,
                borderRadius: 6, overflow: 'hidden',
                background: '#f0ece4', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 28
              }}>
                {item.image && item.image !== 'no-photo.jpg'
                  ? <img src={item.image} alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : '📰'
                }
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className="badge" style={{ fontSize: 11 }}>{item.category?.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
                    {timeAgo(item.createdAt)}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
                    👁️ {item.views}
                  </span>
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
                  lineHeight: 1.3, margin: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {item.title}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  className="btn btn-outline"
                  style={{ padding: '6px 14px', fontSize: 13 }}
                  onClick={() => navigate(`/news/${item._id}`)}
                >
                  👁️ Харах
                </button>
                <button
                  className="btn btn-outline"
                  style={{ padding: '6px 14px', fontSize: 13, color: '#e67e22', borderColor: '#e67e22' }}
                  onClick={() => navigate(`/news/${item._id}`)}
                >
                  ✏️ Засах
                </button>
                <button
                  className="btn btn-solid"
                  style={{ padding: '6px 14px', fontSize: 13 }}
                  onClick={() => handleDelete(item._id)}
                  disabled={deleting === item._id}
                >
                  {deleting === item._id ? '...' : '🗑️'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
