import { Link } from 'react-router-dom'
import {
  Shield, Zap, Lock, Eye, Users, Star,
  ArrowRight, CheckCircle, Play, Upload,
  Sliders, Download, ChevronRight
} from 'lucide-react'
import './LandingPage.css'

const FEATURES = [
  {
    icon: <Shield size={24}/>,
    title: 'Privacy-First',
    desc: 'All processing happens in your browser. Your videos never touch our servers.',
    color: 'accent',
  },
  {
    icon: <Zap size={24}/>,
    title: 'Instant Detection',
    desc: 'AI-powered face detection with TensorFlow.js. Processes in real-time, frame by frame.',
    color: 'teal',
  },
  {
    icon: <Eye size={24}/>,
    title: '3 Blur Modes',
    desc: 'Choose from Blur, Pixelate, or Mosaic to suit your style and use case.',
    color: 'pink',
  },
  {
    icon: <Sliders size={24}/>,
    title: 'Manual Correction',
    desc: 'AI misses something? Manually draw blur zones over any area you need hidden.',
    color: 'accent',
  },
  {
    icon: <Lock size={24}/>,
    title: 'Zero Data Storage',
    desc: 'We store nothing. No account required to get started. Download your file and go.',
    color: 'teal',
  },
  {
    icon: <Users size={24}/>,
    title: 'Any Use Case',
    desc: 'Content creators, researchers, parents, privacy advocates — built for everyone.',
    color: 'pink',
  },
]

const STEPS = [
  { icon: <Upload size={28}/>, step: '01', title: 'Upload Your Video', desc: 'Drop any video file up to 100MB. MP4, MOV, WebM — all supported.' },
  { icon: <Eye size={28}/>,    step: '02', title: 'AI Detects Faces',  desc: 'Our TensorFlow.js model scans every frame and identifies all faces automatically.' },
  { icon: <Sliders size={28}/>,step: '03', title: 'Customize Effect',  desc: 'Choose blur, pixelate or mosaic. Adjust intensity. Add manual zones if needed.' },
  { icon: <Download size={28}/>,step: '04', title: 'Download & Done',  desc: 'Export your processed video with the original audio track. Ready in seconds.' },
]

const USECASES = [
  { emoji: '🔒', title: 'Privacy Protection',   desc: 'Anonymize yourself or others in videos before sharing online.' },
  { emoji: '👨‍👩‍👧', title: 'Parental Control',    desc: 'Blur inappropriate content while keeping educational audio.' },
  { emoji: '🎬', title: 'Content Creators',     desc: 'Reuse clips by blurring original creators — stay compliant.' },
  { emoji: '🔬', title: 'Research & IRB',       desc: 'Anonymize footage for ethical research and compliance.' },
  { emoji: '🎭', title: 'OnlyFans Creators',    desc: 'Offer blurred "incognito tier" content to subscribers.' },
  { emoji: '🌐', title: 'Journalism',           desc: 'Protect sources and bystanders in sensitive footage.' },
]

const TESTIMONIALS = [
  { name: 'Amara K.', role: 'Content Creator', stars: 5, text: 'PixelGuard saved me hours every week. I can reuse clips without worrying about copyright or privacy issues.' },
  { name: 'Dr. R. Osei', role: 'Research Scientist', stars: 5, text: 'IRB compliance used to mean manual editing in Premiere. Now I drag and drop and I\'m done.' },
  { name: 'Jamie L.', role: 'Privacy Advocate', stars: 5, text: 'The fact that it\'s 100% in-browser sold me immediately. No one gets my videos but me.' },
]

const STATS = [
  { value: '99%', label: 'Processing Accuracy' },
  { value: '<30s', label: 'Average Process Time' },
  { value: '0 bytes', label: 'Data Uploaded to Server' },
  { value: '3', label: 'Blur Effect Modes' },
]

export default function LandingPage() {
  return (
    <div className="landing">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-orbs">
          <div className="orb orb-purple hero-orb-1"/>
          <div className="orb orb-pink hero-orb-2"/>
          <div className="orb orb-teal hero-orb-3"/>
        </div>

        <div className="container hero-content">
          <div className="badge badge-accent animate-fadeUp badge-mb-24">
            <Zap size={12}/> 100% Free to Start · No Sign-Up Required
          </div>

          <h1 className="hero-headline animate-fadeUp delay-1">
            Blur Faces in Videos<br/>
            <span className="gradient-text">Automatically.</span>
          </h1>

          <p className="hero-sub animate-fadeUp delay-2">
            PixelGuard uses AI to detect and blur every face in your video — in the browser,
            in seconds. Your files never leave your device.
          </p>

          <div className="hero-cta animate-fadeUp delay-3">
            <Link to="/app" className="btn btn-primary btn-lg">
              <Zap size={18}/> Start Blurring Free
              <ArrowRight size={16}/>
            </Link>
            <a href="#how-it-works" className="btn btn-outline btn-lg">
              <Play size={16}/> See How It Works
            </a>
          </div>

          <div className="hero-trust animate-fadeUp delay-4">
            <CheckCircle size={14} color="var(--teal)"/>
            <span>No account needed</span>
            <span className="dot"/>
            <CheckCircle size={14} color="var(--teal)"/>
            <span>No data uploaded</span>
            <span className="dot"/>
            <CheckCircle size={14} color="var(--teal)"/>
            <span>Free tier available forever</span>
          </div>
        </div>

        {/* Mock UI preview */}
        <div className="container">
          <div className="hero-preview animate-fadeUp delay-4">
            <div className="preview-bar">
              <div className="preview-dots">
                <span/><span/><span/>
              </div>
              <span className="preview-url">pixelguard.app/tool</span>
            </div>
            <div className="preview-body">
              <div className="preview-dropzone">
                <div className="preview-icon"><Upload size={32}/></div>
                <p>Drop your video here or <span>browse files</span></p>
                <small>MP4, MOV, WebM — up to 100MB free</small>
              </div>
              <div className="preview-controls">
                <div className="ctrl-group">
                  <span className="ctrl-label">Blur Mode</span>
                  <div className="ctrl-pills">
                    <span className="ctrl-pill active">Blur</span>
                    <span className="ctrl-pill">Pixelate</span>
                    <span className="ctrl-pill">Mosaic</span>
                  </div>
                </div>
                <div className="ctrl-group">
                  <span className="ctrl-label">Intensity</span>
                  <div className="ctrl-bar"><div className="ctrl-fill ctrl-fill-65"/></div>
                </div>
                <button className="btn btn-primary btn-sm btn-mt-4">
                  <Zap size={13}/> Process Video
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-strip">
        <div className="container stats-inner">
          {STATS.map(s => (
            <div key={s.label} className="stat-item">
              <span className="stat-value gradient-text">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <div className="badge badge-teal">How It Works</div>
            <h2 className="section-title">Blur faces in <span className="gradient-text">4 simple steps</span></h2>
            <p className="section-sub">No technical knowledge required. Upload, process, download — that's it.</p>
          </div>

          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={i} className="step-card glass">
                <div className="step-number">{s.step}</div>
                <div className="step-icon">{s.icon}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
                {i < STEPS.length - 1 && <div className="step-arrow"><ChevronRight size={20}/></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section features-section" id="features">
        <div className="orb orb-purple features-orb"/>
        <div className="container">
          <div className="section-header">
            <div className="badge badge-accent">Features</div>
            <h2 className="section-title">Everything you need for <span className="gradient-text">video privacy</span></h2>
            <p className="section-sub">Purpose-built for one thing: making face anonymization dead simple.</p>
          </div>
          <div className="grid-3 relative-z1">
            {FEATURES.map((f, i) => (
              <div key={i} className={`feature-card glass feature-${f.color}`}>
                <div className={`feature-icon-wrap icon-${f.color}`}>{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="badge badge-pink">Use Cases</div>
            <h2 className="section-title">Built for <span className="gradient-text-pink">every situation</span></h2>
            <p className="section-sub">From journalists to creators — PixelGuard handles any privacy need.</p>
          </div>
          <div className="grid-3">
            {USECASES.map((u, i) => (
              <div key={i} className="usecase-card glass">
                <span className="usecase-emoji">{u.emoji}</span>
                <h3 className="usecase-title">{u.title}</h3>
                <p className="usecase-desc">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-header">
            <div className="badge badge-accent">Testimonials</div>
            <h2 className="section-title">Loved by <span className="gradient-text">privacy-first</span> users</h2>
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card glass">
                <div className="testimonial-stars">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={14} fill="var(--accent-light)" color="var(--accent-light)"/>
                  ))}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.name[0]}</div>
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="section-sm">
        <div className="container">
          <div className="cta-banner glass">
            <div className="orb orb-purple cta-orb-1"/>
            <div className="orb orb-teal cta-orb-2"/>
            <div className="cta-content">
              <div className="badge badge-teal badge-mb-16">Free Forever</div>
              <h2 className="cta-title">Start protecting privacy <span className="gradient-text">today</span></h2>
              <p className="cta-sub">No sign-up. No credit card. No limits on your first video. Just upload and go.</p>
              <div className="cta-buttons">
                <Link to="/app" className="btn btn-primary btn-lg">
                  <Zap size={18}/> Try It Free Now <ArrowRight size={16}/>
                </Link>
                <Link to="/pricing" className="btn btn-outline btn-lg">View Pricing</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
