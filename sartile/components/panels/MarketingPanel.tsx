'use client'

import type { Brand } from '@/types/brand'
import AskSartiBtn from './AskSartiBtn'

const UGC_TOOLS = [
  {
    icon: '💼', name: 'Fiverr', tag: 'From $15', url: 'https://fiverr.com',
    desc: 'Find UGC creators and video editors who know how to make content that converts. Browse by niche.',
    prompt: 'Help me find and brief UGC creators on Fiverr for my clothing brand — what should I look for and what do I say in the brief?',
  },
  {
    icon: '🎬', name: 'Billo', tag: 'From $49/video', url: 'https://billo.app',
    desc: 'On-demand UGC videos from real creators. Brief them, they film it, you own it.',
    prompt: "Is Billo right for my brand at this stage? Walk me through how it works and how to write a brief that gets good content.",
  },
  {
    icon: '🤝', name: 'JoinBrands', tag: 'Free to list', url: 'https://joinbrands.com',
    desc: "Connect with micro-creators who'll make content in exchange for product or a fee.",
    prompt: 'How does JoinBrands work and when should I use it over paid UGC platforms like Billo?',
  },
]

const TACTICS = [
  {
    icon: '📱', title: 'TikTok organic first',
    desc: 'Before running a single ad, post 3–5x per week on TikTok. One video can hit 100k views with zero spend. Build proof before you buy reach.',
    prompt: 'Help me build a TikTok organic content strategy for my brand — what should I be posting and how often?',
  },
  {
    icon: '🔁', title: 'Repurpose everything',
    desc: 'One TikTok video becomes an Instagram Reel, a YouTube Short, and a story. You shoot once, it posts in four places.',
    prompt: 'Set me up a content repurposing workflow so one piece of content goes across all my platforms.',
  },
  {
    icon: '👤', title: 'Founder-led content',
    desc: "The biggest clothing brands on TikTok in 2024 were people showing the process — the packing, the design decisions, the behind the scenes. Your face sells more than your product.",
    prompt: 'Help me build a founder-led content plan — what should I be showing and how do I make it feel natural?',
  },
  {
    icon: '📦', title: 'Packaging reveals',
    desc: 'Unboxing content is proven. Ship to a friend, a family member, or a UGC creator and film the open. It works every time.',
    prompt: 'How do I create packaging reveal content for my brand — who should I send to and how do I film it?',
  },
]

function ToolCard({ icon, name, desc, url, tag, prompt, onAskSarti }: {
  icon: string; name: string; desc: string; url: string; tag: string
  prompt: string; onAskSarti: (msg: string) => void
}) {
  return (
    <div className="tool-card">
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'contents' }}>
        <div className="tool-card-top">
          <span className="tool-card-icon">{icon}</span>
          <span className="tool-card-tag">{tag}</span>
        </div>
        <div className="tool-card-name">{name}</div>
        <div className="tool-card-desc">{desc}</div>
      </a>
      <AskSartiBtn prompt={prompt} onAsk={onAskSarti} />
    </div>
  )
}

export default function MarketingPanel({ brand, onAskSarti }: { brand: Brand; onAskSarti: (msg: string) => void }) {
  return (
    <div className="panel-view">
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Marketing</h1>
          <p className="panel-sub">UGC, ads, and the tactics that actually move product for brands like yours.</p>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">Get UGC content made</div>
        <div className="tool-grid">
          {UGC_TOOLS.map(t => <ToolCard key={t.name} {...t} onAskSarti={onAskSarti} />)}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">AI ad creation</div>
        <div className="featured-tool-card">
          <a href="https://arcads.ai" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
              <div style={{ fontSize: 36 }}>⚡</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span className="tool-card-name" style={{ fontSize: 17 }}>Arcads.ai</span>
                  <span className="tool-card-tag tool-card-tag-teal">Recommended</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--muted-slate)', lineHeight: 1.6 }}>
                  Generate UGC-style video ads with AI avatars in minutes. No filming, no creators needed. Feed it your product and a script — it makes the ad. Works on TikTok and Meta.
                </p>
              </div>
              <div className="panel-cta-btn teal" style={{ alignSelf: 'center', flexShrink: 0 }}>Try it →</div>
            </div>
          </a>
          <AskSartiBtn prompt="Help me create my first ad with Arcads.ai — what should the script say and how do I set it up for my brand?" onAsk={onAskSarti} />
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">Tactics that work</div>
        <div className="tactic-grid">
          {TACTICS.map(t => (
            <div key={t.title} className="tactic-card">
              <span className="tactic-icon">{t.icon}</span>
              <div className="tactic-title">{t.title}</div>
              <p className="tactic-desc">{t.desc}</p>
              <AskSartiBtn prompt={t.prompt} onAsk={onAskSarti} />
            </div>
          ))}
        </div>
      </div>

      <div className="coming-soon-card">
        <span className="coming-soon-label">Coming soon</span>
        <div className="coming-soon-title">Niche-specific strategy</div>
        <p className="coming-soon-desc">sarti will read your brand, your audience data, and your stage — then give you a custom marketing playbook built specifically for your niche. Not generic advice.</p>
        <AskSartiBtn prompt="Give me a marketing strategy specifically built for my brand and niche right now" onAsk={onAskSarti} />
      </div>
    </div>
  )
}
