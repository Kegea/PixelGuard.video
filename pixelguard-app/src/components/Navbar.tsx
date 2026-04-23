import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Shield, Menu, X, Zap } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <Shield size={20} />
          </div>
          <span className="logo-text">Pixel<span className="logo-accent">Guard</span></span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/app" className={`nav-link ${location.pathname === '/app' ? 'active' : ''}`}>Try it Free</Link>
          <Link to="/pricing" className={`nav-link ${location.pathname === '/pricing' ? 'active' : ''}`}>Pricing</Link>
        </div>

        <div className="navbar-actions">
          <Link to="/app" className="btn btn-primary btn-sm">
            <Zap size={14} /> Start Free
          </Link>
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link">Home</Link>
          <Link to="/app" className="mobile-link">Try it Free</Link>
          <Link to="/pricing" className="mobile-link">Pricing</Link>
          <Link to="/app" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 8 }}>
            <Zap size={15} /> Start Free
          </Link>
        </div>
      )}
    </nav>
  )
}
