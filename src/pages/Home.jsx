import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000)
  if (diff < 1) return 'Дөнгөж сая'
  if (diff < 60) return `${diff} минутын өмнө`
  if (diff < 1440) return `${Math.floor(diff/60)} цагийн өмнө`
  return `${Math.floor(diff/1440)} өдрийн өмнө`
}

const getCatPhoto = (categories, catName) => {
  const cat = categories.find(c => c.name === catName)
  return cat?.photo && cat.photo !== 'no-photo.jpg' ? cat.photo : null
}

const CATEGORY_COLOR = {
  'Нийгэм':'#2c3e50','Улс төр':'#8e44ad','Эдийн засаг':'#27ae60',
  'Спорт':'#e74c3c','Технологи':'#2980b9','Соёл':'#d35400','Дэлхий':'#16a085'
}

function ImgPlaceholder({ catName, categories, height = '100%' }) {
  const photo = getCatPhoto(categories, catName)
  const color = CATEGORY_COLOR[catName] || '#888'
  if (photo) return (
    <img src={photo} alt={catName}
      style={{ width:'100%', height, objectFit:'cover', opacity:0.65 }} />
  )
  return (
    <div style={{
      width:'100%', height,
      background: `linear-gradient(135deg, ${color}33, ${color}66)`,
      display:'flex', alignItems:'center', justifyContent:'center',
      borderBottom: `3px solid ${color}`
    }}>
      <span style={{ fontSize:13, fontWeight:700, letterSpacing:1, color, textTransform:'uppercase', opacity:0.8 }}>
        {catName}
      </span>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [news, setNews] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('Бүгд')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 9

  useEffect(() => {
    axios.get('/api/categories')
      .then(res => setCategories(res.data.data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page, limit: LIMIT }
    if (query) params.search = query
    if (activeCategory !== 'Бүгд') params.category = activeCategory
    axios.get('/api/news', { params })
      .then(res => { setNews(res.data.data); setTotal(res.data.total) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, query, activeCategory])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setQuery(search)
  }

  const handleCategory = (catName) => {
    setActiveCategory(catName)
    setPage(1)
    setQuery('')
    setSearch('')
  }

  const heroMain   = news?.[0]
  const heroSide   = news?.slice(1, 4) || []
  const cardNews   = news?.slice(4)    || []
  const totalPages = Math.ceil(total / LIMIT)

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
      <span>Мэдээ ачааллаж байна...</span>
    </div>
  )
  return (
    <div className="container" style={{ paddingTop: 32 }}>

      <form onSubmit={handleSearch} className="search-bar">
        <input
          className="search-input"
          placeholder="Мэдээ хайх..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" className="search-btn">🔍 Хайх</button>
      </form>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', margin:'16px 0' }}>
        <button onClick={() => handleCategory('Бүгд')} style={{
          padding:'6px 14px', borderRadius:20, cursor:'pointer', fontSize:13,
          background: activeCategory === 'Бүгд' ? 'var(--ink)' : 'transparent',
          color:      activeCategory === 'Бүгд' ? 'var(--paper)' : 'var(--ink)',
          border:'1px solid var(--ink)', transition:'all 0.2s'
        }}> Бүгд </button>

        {categories.map(cat => {
          const photo = getCatPhoto(categories, cat.name)
          const isActive = activeCategory === cat.name
          return (
            <button key={cat._id} onClick={() => handleCategory(cat.name)} style={{
              padding:'4px 12px', borderRadius:20, cursor:'pointer', fontSize:13,
              background: isActive ? 'var(--ink)' : 'transparent',
              color:      isActive ? 'var(--paper)' : 'var(--ink)',
              border:'1px solid var(--ink)', transition:'all 0.2s',
              display:'flex', alignItems:'center', gap:6
            }}>
              {photo
                ? <img src={photo} alt={cat.name}
                    style={{ width:20, height:20, borderRadius:'50%', objectFit:'cover' }} />
                : null
              }
              {cat.name}
            </button>
          )
        })}
      </div>

      {!query && activeCategory === 'Бүгд' && heroMain && (
        <>
          <h2 className="section-title">📰 Тэргүүн мэдээ</h2>
          <div className="hero-grid">
            <div className="hero-main" onClick={() => navigate(`/news/${heroMain._id}`)}>
              <div className="hero-img-wrap">
                {heroMain.image && heroMain.image !== 'no-photo.jpg'
                  ? <img src={heroMain.image} alt={heroMain.title} className="hero-img" />
                  : <ImgPlaceholder catName={heroMain.category?.name} categories={categories} />
                }
              </div>
              <div className="hero-body">
                <span className="badge">{heroMain.category?.name}</span>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, lineHeight:1.25, margin:'12px 0 16px' }}>
                  {heroMain.title}
                </h2>
                <div style={{ display:'flex', gap:16, fontSize:13, color:'var(--ink-faint)' }}>
                  <span>✍️ {heroMain.author?.name}</span>
                  <span>🕐 {timeAgo(heroMain.createdAt)}</span>
                  <span>👁️ {heroMain.views}</span>
                </div>
              </div>
            </div>

            <div className="hero-side">
              {heroSide.map(item => (
                <div key={item._id} className="hero-side-item" onClick={() => navigate(`/news/${item._id}`)}>
                  {/* ✅ Hero side-д жижиг зураг */}
                  {item.image && item.image !== 'no-photo.jpg' ? (
                    <img src={item.image} alt={item.title}
                      style={{ width:'100%', height:80, objectFit:'cover', borderRadius:4, marginBottom:8 }} />
                  ) : getCatPhoto(categories, item.category?.name) ? (
                    <img src={getCatPhoto(categories, item.category?.name)} alt={item.category?.name}
                      style={{ width:'100%', height:80, objectFit:'cover', borderRadius:4, marginBottom:8, opacity:0.6 }} />
                  ) : null}
                  <span className="badge badge-outline">{item.category?.name}</span>
                  <h4 style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, lineHeight:1.4, margin:'8px 0 10px' }}>
                    {item.title}
                  </h4>
                  <div style={{ fontSize:12, color:'var(--ink-faint)' }}>
                    {item.author?.name} · {timeAgo(item.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <h2 className="section-title">
        {query
          ? `🔍 "${query}" — хайлтын үр дүн`
          : activeCategory !== 'Бүгд'
            ? activeCategory
            : '🗞️ Сүүлийн мэдээнүүд'
        }
        <span style={{ fontSize:14, fontWeight:400, color:'var(--ink-faint)', marginLeft:'auto' }}>
          Нийт {total} мэдээ
        </span>
      </h2>

      {news?.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--ink-faint)' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📭</div>
          <p>Мэдээ олдсонгүй</p>
        </div>
      ) : (
        <div className="card-grid">
          {(query || activeCategory !== 'Бүгд' ? news : cardNews).map(item => (
            <div key={item._id} className="card" onClick={() => navigate(`/news/${item._id}`)}>
              <div className="card-img-wrap">
                {item.image && item.image !== 'no-photo.jpg'
                  ? <img src={item.image} alt={item.title} className="card-img" />
                  : getCatPhoto(categories, item.category?.name)
                    ? <img
                        src={getCatPhoto(categories, item.category?.name)}
                        alt={item.category?.name}
                        className="card-img"
                        style={{ opacity: 0.65 }}
                      />
                    : <ImgPlaceholder catName={item.category?.name} categories={categories} height={180} />
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
            <button key={p} className={`page-btn ${page===p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}>›</button>
        </div>
      )}
    </div>
  )
}
