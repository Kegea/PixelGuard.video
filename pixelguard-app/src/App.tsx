import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import AppPage from './pages/AppPage'
import PricingPage from './pages/PricingPage'

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="/pricing" element={<PricingPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
