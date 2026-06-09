import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../styles/login.css'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Бүх талбарыг бөглөнө үү'); return }
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.data))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Нэвтрэхэд алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page login-page">
      <div className="auth-box">
        <h2 className="auth-title">Нэвтрэх</h2>
        <p className="auth-subtitle">Тавтай морилно уу!</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Имэйл хаяг</label>
            <input
              name="email" type="email"
              className={`form-input ${error ? 'error' : ''}`}
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Нууц үг</label>
            <input
              name="password" type="password"
              className={`form-input ${error ? 'error' : ''}`}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className="btn btn-solid btn-full"
            disabled={loading}
          >
            {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
          </button>
        </form>

        <div className="auth-link">
          Бүртгэлгүй юу? <a onClick={() => navigate('/register')} style={{ cursor:'pointer' }}>Бүртгүүлэх</a>
        </div>
      </div>
    </div>
  )
}
