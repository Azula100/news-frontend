import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function NewsDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [canEdit, setCanEdit] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', content: '' })
  const [categories, setCategories] = useState([])
  const [editCategory, setEditCategory] = useState('')
  const [editImage, setEditImage] = useState(null)
  const [editPreview, setEditPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const imgRef = useRef()

  useEffect(() => {
    setLoading(true)
    axios.get(`/api/news/${id}`)
      .then(res => {
        const art = res.data.data
        setArticle(art)
        setEditForm({ title: art.title, content: art.content })
        setEditCategory(art.category?._id || '')
        setEditPreview(art.image && art.image !== 'no-photo.jpg' ? art.image : '')

        if (art.category?.name) {
          axios.get(`/api/news?category=${encodeURIComponent(art.category.name)}&limit=4`)
            .then(r => setRelated(r.data.data.filter(n => n._id !== id).slice(0, 3)))
            .catch(() => {})
        }

        const stored = localStorage.getItem('user')
        if (stored) {
          const u = JSON.parse(stored)
          if (u._id === art.author?._id || u.role === 'admin') setCanEdit(true)
        }
      })
      .catch(() => setError('Мэдээ олдсонгүй'))
      .finally(() => setLoading(false))

    axios.get('/api/categories')
      .then(res => setCategories(res.data.data))
      .catch(() => {})
  }, [id])

  const handleSave = async () => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      setEditError('Гарчиг болон агуулга хоосон байж болохгүй')
      return
    }
    setSaving(true)
    setEditError('')
    try {
      const token = localStorage.getItem('token')
      let res
      if (editImage) {
        // ✅ Зураг байвал FormData
        const formData = new FormData()
        formData.append('title',    editForm.title)
        formData.append('content',  editForm.content)
        formData.append('category', editCategory)
        formData.append('image',    editImage)
        res = await axios.put(`/api/news/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        })
      } else {
        // Зураг байхгүй бол JSON
        res = await axios.put(`/api/news/${id}`,
          { title: editForm.title, content: editForm.content, category: editCategory },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      setArticle(res.data.data)
      setEditMode(false)
      setEditImage(null)
    } catch (err) {
      setEditError(err.response?.data?.message || 'Хадгалахад алдаа гарлаа')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Энэ мэдээг устгах уу?')) return
    setDeleting(true)
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/news/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      navigate('/')
    } catch {
      setError('Устгахад алдаа гарлаа')
      setDeleting(false)
    }
  }

  if (loading) return <div className="loading"><div className="spinner"></div><span>Уншиж байна...</span></div>

  if (error) return (
    <div style={{ textAlign:'center', padding:'80px 24px' }}>
      <div style={{ fontSize:48 }}>😕</div>
      <p style={{ marginTop:16, color:'var(--ink-faint)' }}>{error}</p>
      <button className="btn btn-outline" style={{ marginTop:20 }} onClick={() => navigate('/')}>← Нүүр хуудас</button>
    </div>
  )

  const { title, content, category, image, author, createdAt, views } = article

  // ——— ЗАСАХ ГОРИМ ———
  if (editMode) return (
    <div className="detail-wrap">
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24, alignItems:'center' }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700 }}>✏️ Мэдээ засах</h2>
        <button className="btn btn-outline" onClick={() => { setEditMode(false); setEditError('') }}>✕ Болих</button>
      </div>

      {editError && <div className="alert alert-error">{editError}</div>}

      <div className="form-group">
        <label className="form-label">Гарчиг</label>
        <input className="form-input" value={editForm.title}
          onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
      </div>

      <div className="form-group">
        <label className="form-label">Категори</label>
        <select className="form-input" value={editCategory} onChange={e => setEditCategory(e.target.value)}>
          {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
        </select>
      </div>

      {/* ✅ Зураг upload */}
      <div className="form-group">
        <label className="form-label">Зураг</label>
        {editPreview && (
          <div style={{ marginBottom:12, position:'relative' }}>
            <img src={editPreview} alt="preview"
              style={{ width:'100%', maxHeight:240, objectFit:'cover', borderRadius:6 }} />
            <div style={{ fontSize:12, color:'var(--ink-faint)', marginTop:4 }}>
              {editImage ? `✅ Шинэ зураг: ${editImage.name}` : 'Одоогийн зураг — өөрчлөхгүй бол хэвээр үлдэнэ'}
            </div>
          </div>
        )}
        <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
          id="edit-img" style={{ display:'none' }} ref={imgRef}
          onChange={e => {
            const file = e.target.files[0]
            if (!file) return
            setEditImage(file)
            setEditPreview(URL.createObjectURL(file))
          }} />
        <label htmlFor="edit-img" style={{
          display:'flex', alignItems:'center', gap:10, cursor:'pointer',
          padding:'10px 16px', border:'2px dashed var(--border)',
          borderRadius:6, color:'var(--ink-light)', fontSize:14
        }}>
          📷 {editImage ? editImage.name : 'Шинэ зураг сонгох (jpg, png, webp)'}
        </label>
      </div>

      <div className="form-group">
        <label className="form-label">Агуулга</label>
        <textarea className="form-input" rows={12} style={{ resize:'vertical', lineHeight:1.7 }}
          value={editForm.content} onChange={e => setEditForm({ ...editForm, content: e.target.value })} />
      </div>

      <div style={{ display:'flex', gap:12 }}>
        <button className="btn btn-solid" onClick={handleSave} disabled={saving}
          style={{ flex:1, padding:13, fontSize:15 }}>
          {saving ? '💾 Хадгалж байна...' : '💾 Хадгалах'}
        </button>
        <button className="btn btn-outline" onClick={() => { setEditMode(false); setEditError('') }}
          style={{ padding:'13px 28px' }}>Болих</button>
      </div>
    </div>
  )

  // ——— ХАРАХ ГОРИМ ———
  return (
    <div className="detail-wrap">
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>← Буцах</button>
        {canEdit && (
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn-outline" style={{ color:'#e67e22', borderColor:'#e67e22' }}
              onClick={() => setEditMode(true)}>✏️ Засах</button>
            <button className="btn btn-solid" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Устгаж байна...' : '🗑️ Устгах'}
            </button>
          </div>
        )}
      </div>

      <div className="detail-header">
        <span className="badge">{category?.name}</span>
        <h1 className="detail-title">{title}</h1>
        <div className="detail-meta">
          <span>✍️ Нийтэлсэн: <strong>{author?.name}</strong></span>
          <span>📅 {new Date(createdAt).toLocaleDateString('mn-MN', { year:'numeric', month:'long', day:'numeric' })}</span>
          <span>👁️ {views} үзэлт</span>
        </div>
      </div>

      {/* ✅ Мэдээний зураг — үгүй бол категорийн зураг */}
      {image && image !== 'no-photo.jpg'
        ? <img src={image} alt={title} className="detail-img" />
        : category?.photo && category.photo !== 'no-photo.jpg'
          ? <img src={category.photo} alt={category.name} className="detail-img" style={{ opacity:0.75 }} />
          : null
      }

      <div className="detail-content">
        {content && content.split('\n').map((para, i) =>
          para.trim() ? <p key={i}>{para}</p> : null
        )}
      </div>

      {related.length > 0 && (
        <div style={{ marginTop:60, paddingTop:32, borderTop:'3px double var(--border)' }}>
          <h3 className="section-title">📌 Холбоотой мэдээ</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {related.map(item => (
              <div key={item._id}
                onClick={() => { navigate(`/news/${item._id}`); window.scrollTo(0,0) }}
                style={{ cursor:'pointer', border:'1px solid var(--border)', borderRadius:4, overflow:'hidden' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow='var(--shadow)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
              >
                {/* ✅ Мэдээний зураг → үгүй бол категорийн зураг → үгүй бол placeholder */}
                {item.image && item.image !== 'no-photo.jpg'
                  ? <img src={item.image} alt={item.title} style={{ width:'100%', height:120, objectFit:'cover' }} />
                  : item.category?.photo && item.category.photo !== 'no-photo.jpg'
                    ? <img src={item.category.photo} alt={item.category?.name}
                        style={{ width:'100%', height:120, objectFit:'cover', opacity:0.65 }} />
                    : <div style={{ width:'100%', height:120, background:'#f0ece4',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:13, fontWeight:700, color:'#888' }}>
                        {item.category?.name}
                      </div>
                }
                <div style={{ padding:14 }}>
                  <span className="badge badge-outline" style={{ fontSize:10 }}>{item.category?.name}</span>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, marginTop:8, lineHeight:1.4 }}>
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
