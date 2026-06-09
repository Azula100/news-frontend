import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
const CATEGORY_EMOJI = {
  'Нийгэм':'🏙️','Улс төр':'🏛️','Эдийн засаг':'📈',
  'Спорт':'⚽','Технологи':'💻','Соёл':'🎭','Дэлхий':'🌍'
}
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000)
  if (diff < 60)   return `${diff} минутын өмнө`
  if (diff < 1440) return `${Math.floor(diff/60)} цагийн өмнө`
  return `${Math.floor(diff/1440)} өдрийн өмнө`
}
export default function Category() {
  const { name } = useParams()
  const navigate  = useNavigate()
  const category  = decodeURIComponent(name)

  const [news, setNews]         = useState([])
  const [catInfo, setCatInfo]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const LIMIT = 9

  useEffect(() => {
    setLoading(true)
    setPage(1)
    axios.get('/api/categories')
      .then(res => {
        const found = res.data.data.find(c => c.name === category)
        if (found) setCatInfo(found)
      })
      .catch(() => {})

    axios.get('/api/news', { params: { category, page: 1, limit: LIMIT } })
      .then(res => { setNews(res.data.data); setTotal(res.data.total) })
      .finally(() => setLoading(false))
  }, [category])

  useEffect(() => {
    if (page === 1) return
    setLoading(true)
    axios.get('/api/news', { params: { category, page, limit: LIMIT } })
      .then(res => { setNews(res.data.data); setTotal(res.data.total) })
      .finally(() => setLoading(false))
  }, [page])

  const totalPages = Math.ceil(total / LIMIT)

  const photoUrl = catInfo?.photo && catInfo.photo !== 'no-photo.jpg'
    ? catInfo.photo
    : null

  if (loading) return (
    <div className="loading"><div className="spinner"></div><span>Ачааллаж байна...</span></div>
  )

  return (
    <div>
      <div style={{
        position: 'relative',
        height: photoUrl ? 280 : 140,
        overflow: 'hidden',
        background: 'var(--ink)',
        marginBottom: 40
      }}>
        {photoUrl && (
          <img
            src={photoUrl}
            alt={category}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              opacity: 0.45
            }}
          />
        )}

        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center',
          padding: '0 40px',
          background: photoUrl
            ? 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%)'
            : 'none'
        }}>
          <div>
            {!photoUrl && (
              <span style={{ fontSize: 52, display: 'block', marginBottom: 8 }}>
                {CATEGORY_EMOJI[category] || '📰'}
              </span>
            )}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.1,
              textShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}>
              {category}
            </h1>
            {catInfo?.description && (
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                marginTop: 8, fontSize: 15,
                maxWidth: 500,
                textShadow: '0 1px 4px rgba(0,0,0,0.4)'
              }}>
                {catInfo.description}
              </p>
            )}
            <p style={{ color: 'rgba(255,255,255,0.65)', marginTop: 8, fontSize: 14 }}>
              Нийт {total} мэдээ
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        {news.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div style={{ fontSize:48 }}>📭</div>
            <p style={{ color:'var(--ink-faint)', marginTop:16 }}>
              Энэ ангиллын мэдээ алга байна
            </p>
          </div>
        ) : (
          <div className="card-grid">
            {news.map(item => (
              <div key={item._id} className="card" onClick={() => navigate(`/news/${item._id}`)}>
                <div className="card-img-wrap">
                  {item.image && item.image !== 'no-photo.jpg'
                    ? <img src={item.image} alt={item.title} className="card-img" />
                    : <div className="card-no-img">
                        {CATEGORY_EMOJI[item.category?.name] || '📰'}
                      </div>
                  }
                </div>
                <div className="card-body">
                  <span className="badge">{item.category?.name}</span>
                  <h3 className="card-title">{item.title}</h3>
                  <div className="card-meta">
                    <span>✍️ {item.author?.name}</span>
                    <span>{timeAgo(item.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
              <button key={p} className={`page-btn ${page===p?'active':''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}>›</button>
          </div>
        )}
      </div>
    </div>
  )
}
