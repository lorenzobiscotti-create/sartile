'use client'

import type { Brand } from '@/types/brand'
import AskSartiBtn from './AskSartiBtn'

const stats = [
  { label: 'Revenue', value: '—', sub: 'this month' },
  { label: 'Orders', value: '—', sub: 'this month' },
  { label: 'Store Visitors', value: '—', sub: 'this month' },
  { label: 'Conversion', value: '—', sub: 'rate' },
]

export default function AnalyticsPanel({ brand, onAskSarti }: { brand: Brand; onAskSarti: (msg: string) => void }) {
  return (
    <div className="panel-view">
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Analytics</h1>
          <p className="panel-sub">Connect your store and socials — sarti reads the data and tells you what to do about it.</p>
        </div>
        <button className="panel-cta-btn">Connect Shopify</button>
      </div>

      <div className="stat-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value stat-empty">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="panel-section">
        <div className="panel-section-title">Store</div>
        <div className="connect-card">
          <div className="connect-card-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
            </svg>
          </div>
          <div className="connect-card-body">
            <div className="connect-card-title">Shopify</div>
            <div className="connect-card-desc">Pull in real-time revenue, orders, and traffic. sarti reads your store data and tells you exactly what to fix.</div>
            <AskSartiBtn prompt="Help me connect my Shopify store and understand what my analytics mean" onAsk={onAskSarti} />
          </div>
          <button className="panel-cta-btn">Connect →</button>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">Social</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            {
              name: 'Instagram', icon: '📸',
              desc: 'Reach, engagement, follower growth.',
              prompt: 'What Instagram metrics should I be tracking for my clothing brand, and what do they mean?',
            },
            {
              name: 'TikTok', icon: '🎵',
              desc: 'Views, watch time, profile visits.',
              prompt: 'What TikTok metrics matter most for a clothing brand, and how do I read them?',
            },
          ].map(s => (
            <div key={s.name} className="connect-card" style={{ flex: 1 }}>
              <div className="connect-card-icon" style={{ fontSize: 22 }}>{s.icon}</div>
              <div className="connect-card-body">
                <div className="connect-card-title">{s.name}</div>
                <div className="connect-card-desc">{s.desc}</div>
                <AskSartiBtn prompt={s.prompt} onAsk={onAskSarti} />
              </div>
              <button className="panel-cta-btn">Connect →</button>
            </div>
          ))}
        </div>
      </div>

      <div className="coming-soon-card">
        <span className="coming-soon-label">Coming in Phase 2</span>
        <div className="coming-soon-title">AI-powered insights</div>
        <p className="coming-soon-desc">Once connected, sarti reads your data automatically and tells you what's working, what isn't, and exactly what to do next — no digging through dashboards.</p>
      </div>
    </div>
  )
}
