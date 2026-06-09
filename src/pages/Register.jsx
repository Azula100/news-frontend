import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', ovog: '', number: '', email: '', password: '', confirm: ''
  })
  const [errors, setErrors]     = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    const e = {}
    if (!form.name  || form.name.length < 2)  e.name   = 'Нэр хамгийн багадаа 2 тэмдэгт байна'
    if (!form.ovog  || form.ovog.length < 2)  e.ovog   = 'Овог хамгийн багадаа 2 тэмдэгт байна'
    if (!form.number || isNaN(form.number))   e.number = 'Зөв утасны дугаар оруулна уу'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Зөв имэйл хаяг оруулна уу'
    if (!form.password || form.password.length < 4) e.password = 'Нууц үг хамгийн багадаа 4 тэмдэгт байна'
    if (form.password !== form.confirm) e.confirm = 'Нууц үг таарахгүй байна'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setApiError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/register', {
        name:     form.name,
        ovog:     form.ovog,
        number:   Number(form.number),
        email:    form.email,
        password: form.password,
        role:     'user'
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.data))
      navigate('/')
    } catch (err) {
      setApiError(err.response?.data?.message || err.response?.data?.error || 'Бүртгэхэд алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: 'name',     label: 'Нэр',           type: 'text',     placeholder: 'Нэрээ оруулна уу' },
    { name: 'ovog',     label: 'Овог',          type: 'text',     placeholder: 'Овгоо оруулна уу' },
    { name: 'number',   label: 'Утасны дугаар', type: 'text',     placeholder: 'Утасны дугаараа оруулна уу' },
    { name: 'email',    label: 'Имэйл хаяг',    type: 'email',    placeholder: 'Имэйл хаягаа оруулна уу' },
    { name: 'password', label: 'Нууц үг',       type: 'password', placeholder: '••••' },
    { name: 'confirm',  label: 'Нууц үг давтах',type: 'password', placeholder: '••••' },
  ]

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2 className="auth-title">Бүртгүүлэх</h2>
        <p className="auth-subtitle">Шинэ бүртгэл үүсгэх</p>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          {fields.map(field => (
            <div className="form-group" key={field.name}>
              <label className="form-label">{field.label}</label>
              <input
                name={field.name}
                type={field.type}
                className={`form-input ${errors[field.name] ? 'error' : ''}`}
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={handleChange}
              />
              {errors[field.name] && <p className="form-error">{errors[field.name]}</p>}
            </div>
          ))}

          <button type="submit" className="btn btn-solid btn-full" disabled={loading}>
            {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
          </button>
        </form>

        <div className="auth-link">
          Бүртгэлтэй юу?{' '}
          <a onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Нэвтрэх</a>
        </div>
      </div>
    </div>
  )
}