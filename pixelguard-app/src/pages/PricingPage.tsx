import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X, Zap, Shield, Users, ArrowRight, HelpCircle } from 'lucide-react'
import './PricingPage.css'

interface Plan {
  id: string
  name: string
  price: { monthly: number | 'Custom'; annual: number | 'Custom' }
  badge?: string
  badgeClass?: string
  desc: string
  cta: string
  ctaClass: string
  featured?: boolean
  features: { text: string; included: boolean }[]
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    badge: 'No credit card',
    badgeClass: 'badge-free',
    desc: 'Perfect for trying out PixelGuard or occasional one-off blurring.',
    cta: 'Start Free',
    ctaClass: 'btn-outline',
    features: [
      { text: '1 video per month',              included: true  },
      { text: 'Up to 100MB file size',           included: true  },
      { text: 'All 3 blur modes',                included: true  },
      { text: 'Manual zone drawing',             included: true  },
      { text: 'Browser-based processing',        included: true  },
      { text: 'Watermarked output',              included: true  },
      { text: 'No watermark',                    included: false },
      { text: 'Unlimited videos',                included: false },
      { text: 'Priority processing queue',       included: false },
      { text: 'Video history & re-download',     included: false },
      { text: 'Batch processing',                included: false },
      { text: 'API access',                      included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 9.99, annual: 7.99 },
    badge: 'Most Popular',
    badgeClass: 'badge-accent',
    desc: 'For creators, researchers and privacy-conscious users who need it regularly.',
    cta: 'Start Pro',
    ctaClass: 'btn-primary',
    featured: true,
    features: [
      { text: 'Unlimited videos',                included: true  },
      { text: 'Up to 2GB file size',             included: true  },
      { text: 'All 3 blur modes',                included: true  },
      { text: 'Manual zone drawing',             included: true  },
      { text: 'Browser-based processing',        included: true  },
      { text: 'No watermark',                    included: true  },
      { text: 'Priority processing queue',       included: true  },
      { text: 'Video history & re-download',     included: true  },
      { text: 'Batch processing',                included: false },
      { text: 'API access',                      included: false },
      { text: 'Dedicated support',               included: false },
      { text: 'Custom integrations',             included: false },
    ],
  },
  {
    id: 'team',
    name: 'Team',
    price: { monthly: 49, annual: 39 },
    badge: 'For Teams',
    badgeClass: 'badge-teal',
    desc: 'For organizations, newsrooms and teams processing high volumes of footage.',
    cta: 'Start Team',
    ctaClass: 'btn-outline',
    features: [
      { text: 'Unlimited videos',                included: true  },
      { text: 'Up to 10GB file size',            included: true  },
      { text: 'All 3 blur modes',                included: true  },
      { text: 'Manual zone drawing',             included: true  },
      { text: 'Server-side processing (faster)', included: true  },
      { text: 'No watermark',                    included: true  },
      { text: 'Priority processing queue',       included: true  },
      { text: 'Video history & re-download',     included: true  },
      { text: 'Batch processing',                included: true  },
      { text: 'API access',                      included: true  },
      { text: 'Dedicated support',               included: false },
      { text: 'Custom integrations',             included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: { monthly: 'Custom', annual: 'Custom' },
    badge: 'White-glove',
    badgeClass: 'badge-pink',
    desc: 'Custom deployment, SLAs and integrations for large organizations.',
    cta: 'Contact Sales',
    ctaClass: 'btn-outline',
    features: [
      { text: 'Unlimited everything',            included: true  },
      { text: 'Unlimited file size',             included: true  },
      { text: 'All blur modes',                  included: true  },
      { text: 'On-premise deployment option',    included: true  },
      { text: 'Server-side processing (fastest)',included: true  },
      { text: 'No watermark',                    included: true  },
      { text: 'Priority queue (dedicated)',      included: true  },
      { text: 'Video history & re-download',     included: true  },
      { text: 'Batch processing',                included: true  },
      { text: 'Full API access',                 included: true  },
      { text: 'Dedicated support + SLA',         included: true  },
      { text: 'Custom integrations',             included: true  },
    ],
  },
]

const FAQS = [
  {
    q: 'Is my video stored on your servers?',
    a: 'On the Free and Pro plans, all processing is done 100% in your browser — nothing is ever sent to our servers. Team and Enterprise plans use optional server-side processing for speed, with auto-deletion after 24 hours.',
  },
  {
    q: 'How accurate is the face detection?',
    a: 'We use TensorFlow.js BlazeFace, which achieves >95% accuracy on frontal faces. For edge cases (partial faces, unusual angles) you can use our manual zone drawing tool to cover any missed areas.',
  },
  {
    q: 'What video formats are supported?',
    a: 'We accept MP4, MOV, WebM, and AVI. Processed output is in WebM or MP4 format depending on your browser.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes, absolutely. No questions asked. You keep access until the end of your billing period.',
  },
  {
    q: 'Is there a free trial for Pro?',
    a: 'The Free plan itself acts as a trial — you can process one video and experience all the blur modes before upgrading. No time-limit, no credit card needed.',
  },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="pricing-page">

      {/* ── HEADER ── */}
      <div className="pricing-header">
        <div className="orb orb-purple pricing-orb-1"/>
        <div className="orb orb-teal pricing-orb-2"/>
        <div className="container relative-z1">
          <div className="badge badge-accent badge-mb-16">
            <Zap size={12}/> Simple, Transparent Pricing
          </div>
          <h1 className="pricing-title">Start free. <span className="gradient-text">Scale when ready.</span></h1>
          <p className="pricing-sub">No hidden fees. No surprise charges. Cancel anytime.</p>

          {/* Billing toggle */}
          <div className="billing-toggle">
            <span className={!annual ? 'toggle-active' : ''}>Monthly</span>
            <label className="toggle toggle-label-size">
              <input type="checkbox" title="Toggle Billing Period" placeholder="Toggle Billing Period" checked={annual} onChange={() => setAnnual(a => !a)} id="billing-toggle"/>
              <span className="toggle-slider"/>
            </label>
            <span className={annual ? 'toggle-active' : ''}>
              Annual <span className="badge badge-teal badge-save">Save 20%</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── PLANS ── */}
      <div className="container">
        <div className="plans-grid">
          {PLANS.map(plan => {
            const price = annual ? plan.price.annual : plan.price.monthly
            return (
              <div key={plan.id} className={`plan-card glass ${plan.featured ? 'featured' : ''}`}>
                {plan.featured && <div className="featured-glow"/>}
                <div className="plan-header">
                  <div className="plan-header-row">
                    <span className="plan-name">{plan.name}</span>
                    {plan.badge && <span className={`badge ${plan.badgeClass}`}>{plan.badge}</span>}
                  </div>
                  <div className="plan-price">
                    {price === 'Custom' ? (
                      <span className="price-custom">Custom</span>
                    ) : (
                      <>
                        <span className="price-dollar">$</span>
                        <span className="price-num">{price}</span>
                        <span className="price-period">/mo</span>
                      </>
                    )}
                  </div>
                  {annual && typeof price === 'number' && price > 0 && (
                    <div className="price-savings">Billed annually — save ${((((plan.price.monthly as number) - price) * 12)).toFixed(0)}/yr</div>
                  )}
                  <p className="plan-desc">{plan.desc}</p>
                </div>

                <Link
                  to={plan.id === 'enterprise' ? '#contact' : '/app'}
                  className={`btn ${plan.ctaClass} plan-cta`}
                >
                  {plan.cta} {plan.id !== 'enterprise' && <ArrowRight size={15}/>}
                </Link>

                <div className="feature-list">
                  {plan.features.map((f, i) => (
                    <div key={i} className={`feature-row ${f.included ? 'inc' : 'exc'}`}>
                      {f.included
                        ? <Check size={15} color="var(--teal)"/>
                        : <X     size={15} color="var(--text-muted)"/>
                      }
                      <span>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── TRUST STRIP ── */}
      <div className="container trust-strip">
        <div className="trust-item"><Shield size={18} color="var(--teal)"/><span>Bank-grade security</span></div>
        <div className="trust-item"><Users  size={18} color="var(--accent-light)"/><span>Cancel anytime</span></div>
        <div className="trust-item"><Zap    size={18} color="var(--accent2)"/><span>Instant activation</span></div>
        <div className="trust-item"><Check  size={18} color="var(--teal)"/><span>30-day refund guarantee</span></div>
      </div>

      <div className="divider container"/>

      {/* ── FAQ ── */}
      <section className="section-sm container">
        <div className="section-header">
          <div className="badge badge-accent"><HelpCircle size={12}/> FAQ</div>
          <h2 className="section-title">Frequently Asked <span className="gradient-text">Questions</span></h2>
        </div>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div key={i} className={`faq-item glass ${openFaq === i ? 'open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="faq-question">
                <span>{f.q}</span>
                <span className="faq-arrow">{openFaq === i ? '−' : '+'}</span>
              </div>
              {openFaq === i && <p className="faq-answer">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="section-sm">
        <div className="container">
          <div className="cta-banner glass cta-banner-padded">
            <div className="orb orb-purple pricing-orb-3"/>
            <div className="relative-z1">
              <h2 className="cta-banner-title">
                Ready to protect <span className="gradient-text">your privacy?</span>
              </h2>
              <p className="cta-banner-sub">
                Join thousands of creators, researchers and privacy advocates. Start free today.
              </p>
              <Link to="/app" className="btn btn-primary btn-lg">
                <Zap size={18}/> Start Free — No Card Needed <ArrowRight size={16}/>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
