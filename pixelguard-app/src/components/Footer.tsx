import { Link } from 'react-router-dom'
import { Shield, Github, Twitter, Lock } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon logo-icon-md">
                <Shield size={16} />
              </div>
              <span className="brand-text">
                Pixel<span className="text-accent-light">Guard</span>
              </span>
            </div>
            <p className="footer-tagline">
              Privacy-first, browser-based face blurring for everyone.
              No uploads to servers. No tracking. Just privacy.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-btn" aria-label="Twitter"><Twitter size={16}/></a>
              <a href="#" className="social-btn" aria-label="GitHub"><Github size={16}/></a>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Product</h4>
            <Link to="/app" className="footer-link">Face Blur Tool</Link>
            <Link to="/pricing" className="footer-link">Pricing</Link>
            <a href="#features" className="footer-link">Features</a>
            <a href="#how-it-works" className="footer-link">How It Works</a>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Use Cases</h4>
            <a href="#" className="footer-link">Privacy Protection</a>
            <a href="#" className="footer-link">Content Creators</a>
            <a href="#" className="footer-link">Parental Control</a>
            <a href="#" className="footer-link">Research & IRB</a>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Company</h4>
            <a href="#" className="footer-link">About</a>
            <a href="#" className="footer-link">Blog</a>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© 2025 PixelGuard. All rights reserved.</p>
          <div className="footer-trust">
            <Lock size={13} />
            <span>100% client-side processing. Your videos never leave your device.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
