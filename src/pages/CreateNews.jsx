import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  ClassicEditor,
  Bold, Italic, Underline, Strikethrough,
  Heading, FontSize, FontColor, FontBackgroundColor, FontFamily,
  BlockQuote, Link, List, Alignment,
  Image, ImageUpload, ImageToolbar, ImageCaption, ImageStyle, ImageResize,
  Table, TableToolbar, TableCellProperties, TableColumnResize,
  HorizontalLine, Indent, IndentBlock,
  Essentials, Paragraph, Autoformat, PasteFromOffice,
  FindAndReplace, RemoveFormat, SpecialCharacters, SpecialCharactersEssentials,
  MediaEmbed, PageBreak
} from 'ckeditor5'
import 'ckeditor5/ckeditor5.css'

export default function CreateNews() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', content: '', category: '' })
  const [categories, setCategories] = useState([])
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState('')
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    axios.get('/api/categories')
      .then(res => {
        setCategories(res.data.data)
        if (res.data.data.length > 0) {
          setForm(f => ({ ...f, category: res.data.data[0]._id }))
        }
      })
      .catch(() => setApiError('Категори татахад алдаа гарлаа'))
  }, [])

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }
  const handleImage = e => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }
  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title    = 'Гарчиг оруулна уу'
    if (!form.content.trim()) e.content  = 'Агуулга оруулна уу'
    if (!form.category) e.category = 'Категори сонгоно уу'
    return e
  }
  const handleSubmit = async e => {
    e.preventDefault()
    setApiError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('title',    form.title)
      formData.append('content',  form.content)
      formData.append('category', form.category)
      if (image) formData.append('image', image)
      const res = await axios.post('/api/news', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      navigate(`/news/${res.data.data._id}`)
    } catch (err) {
      setApiError(err.response?.data?.message || 'Мэдээ нэмэхэд алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>← Буцах</button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }}>
          ✍️ Шинэ мэдээ нэмэх
        </h1>
      </div>
      {apiError && <div className="alert alert-error">{apiError}</div>}
      <form onSubmit={handleSubmit}>
    
        <div className="form-group">
          <label className="form-label">Гарчиг *</label>
          <input
            name="title"
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder="Мэдээний гарчиг..."
            value={form.title}
            onChange={handleChange}
          />
          {errors.title && <p className="form-error">{errors.title}</p>}
        </div>

        
        <div className="form-group">
          <label className="form-label">Категори *</label>
          <select
            name="category"
            className={`form-input ${errors.category ? 'error' : ''}`}
            value={form.category}
            onChange={handleChange}
          >
            <option value="">-- Категори сонгоно уу --</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          {errors.category && <p className="form-error">{errors.category}</p>}
        </div>

        
        <div className="form-group">
          <label className="form-label">Зураг (заавал биш)</label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImage}
            style={{ display: 'none' }}
            id="img-upload"
          />
          <label htmlFor="img-upload" style={{
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            padding: '10px 16px', border: '2px dashed var(--border)',
            borderRadius: 4, color: 'var(--ink-light)', fontSize: 14,
            transition: 'border-color 0.2s'
          }}>
            📷 {image ? image.name : 'Зураг сонгох (jpg, png, webp — 5MB хүртэл)'}
          </label>
          {preview && (
            <div style={{ marginTop: 12, position: 'relative', display: 'inline-block' }}>
              <img src={preview} alt="preview"
                style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 4 }} />
              <button type="button" onClick={() => { setImage(null); setPreview('') }}
                style={{
                  position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)',
                  color: 'white', border: 'none', borderRadius: '50%',
                  width: 28, height: 28, cursor: 'pointer', fontSize: 14
                }}>✕</button>
            </div>
          )}
        </div>

       
        <div className="form-group">
          <label className="form-label">Агуулга *</label>
          <textarea
            name="content"
            className={`form-input ${errors.content ? 'error' : ''}`}
            placeholder="Мэдээний агуулга энд бичнэ..."
            rows={14}
            style={{ resize: 'vertical', lineHeight: 1.8 }}
            value={form.content}
            onChange={handleChange}
          />
          {errors.content && <p className="form-error">{errors.content}</p>}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            type="submit"
            className="btn btn-solid"
            disabled={loading}
            style={{ flex: 1, padding: 14, fontSize: 16 }}
          >
            {loading ? '📤 Нийтэлж байна...' : '🚀 Нийтлэх'}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(-1)}
            style={{ padding: '14px 28px' }}
          >
            Болих
          </button>
        </div>
      </form>
    </div>
  )
}
