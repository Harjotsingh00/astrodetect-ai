import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import StarField from './components/StarField'
import HomePage from './pages/HomePage'
import ModelStatsPage from './pages/ModelStatsPage'
import HistoryPage from './pages/HistoryPage'
import AboutPage from './pages/AboutPage'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#04040f', color: 'white', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>
      <StarField />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stats" element={<ModelStatsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </div>
  )
}