import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './pages/Header.jsx'
import Footer from './pages/Footer.jsx'
import Home from './pages/Home.jsx'
import NewsDetail from './pages/newsDetail.jsx'
import Category from './pages/Category.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import CreateNews from './pages/CreateNews.jsx'
import MyNews from './pages/MyNews.jsx'

function App() {
  return (
    <Router basename="/news-frontend/">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news/create" element={<CreateNews />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/category/:name" element={<Category />} />
          <Route path="/my-news" element={<MyNews />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  )
}
export default App
