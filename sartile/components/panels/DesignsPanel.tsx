'use client'

import type { Brand } from '@/types/brand'
import AskSartiBtn from './AskSartiBtn'

const FREE_TOOLS = [
  {
    icon: '🎨', name: 'Canva', tag: 'Free', url: 'https://canva.com',
    desc: 'Design graphics, logos, and social content. Free tier is more than enough to start.',
    prompt: 'Walk me through setting up Canva for my brand — what templates and features should I be using?',
  },
  {
    icon: '✨', name: 'Adobe Express', tag: 'Free', url: 'https://express.adobe.com',
    desc: 'Quick branded content, social posts, and short videos. Free with Adobe account.',
    prompt: 'How can I use Adobe Express specifically for my brand\'s social content?',
  },
  {
    icon: '✂️', name: 'Remove.bg', tag: 'Free', url: 'https://remove.bg',
    desc: 'Instantly remove backgrounds from product photos and mockup images.',
    prompt: 'How do I use Remove.bg to make my product photos look professional?',
  },
]

const MOCKUP_TOOLS = [
  {
    icon: '👕', name: 'Printify Mockups', tag: 'Free with Printify', url: 'https://printify.com',
    desc: 'Generate professional product mockups directly inside Printify.',
    prompt: 'Walk me through creating mockups in Printify for my products.',
  },
  {
    icon: '📸', name: 'Placeit', tag: 'Paid', url: 'https://placeit.net',
    desc: 'Thousands of clothing mockup templates. Lifestyle shots, flat lays, model photos.',
    prompt: 'Is Placeit worth paying for at my current stage, or should I stick to free options?',
  },
  {
    icon: '🖼️', name: 'Smartmockups', tag: 'Free / Paid', url: 'https://smartmockups.com',
    desc: 'High-quality apparel mockups. Good for hoodie and tee presentations.',
    prompt: 'How do I create high-quality clothing mockups with Smartmockups?',
  },
]

const AI_TOOLS = [
  {
    icon: '🤖', name: 'Midjourney', tag: 'Paid', url: 'https://midjourney.com',
    desc: 'Generate graphic concepts and design inspiration from text prompts.',
    prompt: 'How can I use Midjourney to generate design concepts and graphics for my clothing brand?',
  },
  {
    icon: '🧠', name: 'DALL·E (ChatGPT)', tag: 'Free / Paid', url: 'https://chat.openai.com',
    desc: 'Fast AI image generation. Good for rough concept ideation.',
    prompt: 'Help me use AI image generation to brainstorm design ideas for my brand.',
  },
]

const HIRE_TOOLS = [
  {
    icon: '💼', name: 'Fiverr', tag: 'From $5', url: 'https://fiverr.com', featured: true,
    desc: 'Hire a designer for logos, brand identity, or original artwork. Budget-friendly options starting at $5.',
    prompt: 'Help me find and brief a designer on Fiverr — what should I be looking for and what do I tell them about my brand?',
  },
]

function ToolCard({ icon, name, desc, url, tag, featured, prompt, onAskSarti }: {
  icon: string; name: string; desc: string; url: string; tag: string
  featured?: boolean; prompt: string; onAskSarti: (msg: string) => void
}) {
  return (
    <div className={`tool-card ${featured ? 'tool-card-featured' : ''}`}>
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

export default function DesignsPanel({ brand, onAskSarti }: { brand: Brand; onAskSarti: (msg: string) => void }) {
  return (
    <div className="panel-view">
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Designs</h1>
          <p className="panel-sub">Every tool you need to go from idea to finished graphic — free and paid.</p>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">Design & content creation</div>
        <div className="tool-grid">
          {FREE_TOOLS.map(t => <ToolCard key={t.name} {...t} onAskSarti={onAskSarti} />)}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">Mockup generators</div>
        <div className="tool-grid">
          {MOCKUP_TOOLS.map(t => <ToolCard key={t.name} {...t} onAskSarti={onAskSarti} />)}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">AI generation</div>
        <div className="tool-grid">
          {AI_TOOLS.map(t => <ToolCard key={t.name} {...t} onAskSarti={onAskSarti} />)}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">Hire a designer</div>
        <div className="tool-grid">
          {HIRE_TOOLS.map(t => <ToolCard key={t.name} {...t} onAskSarti={onAskSarti} />)}
        </div>
      </div>
    </div>
  )
}
