import { useNavigate } from 'react-router-dom'
const CATEGORIES = ['Нийгэм', 'Улс төр', 'Эдийн засаг', 'Спорт', 'Технологи', 'Соёл', 'Дэлхий']
export default function Footer() {
  const navigate = useNavigate()
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <div className="footer-logo"><span>МОНГОЛ</span> МЭДЭЭ</div>
            <p className="footer-desc">
              Монголын хамгийн найдвартай мэдээллийн эх сурвалж. Өдөр бүрийн мэдээг цаг алдалгүй хүргэнэ.
            </p>
          </div>
          
          <div className="footer-links">
            <div className="footer-col">
              <h4>Холбоос</h4>
              <a onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Нүүр хуудас</a>
              <a onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Нэвтрэх</a>
              <a onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>Бүртгүүлэх</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} Монгол Мэдээ. Бүх эрх хуулиар хамгаалагдсан.</span>
        </div>
      </div>
    </footer>
  )
}
