'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'

const pageStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --frost: #F6F8FC; --slate: #1C2B4A; --teal: #00C4B4;
    --white: #FFFFFF; --frost-blue: #C8D8EC; --muted-slate: #7A8BA8;
  }
  html, body { height: 100%; }
  body { font-family: 'Outfit', sans-serif; background: var(--frost); color: var(--slate); -webkit-font-smoothing: antialiased; }
  .ob-page { min-height: 100vh; display: flex; flex-direction: column; }
  .ob-nav {
    position: fixed; top: 22px; left: 50%; transform: translateX(-50%);
    z-index: 100; width: calc(100% - 48px); max-width: 860px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 14px 12px 26px;
    background: var(--white); border: 1px solid var(--frost-blue);
    border-radius: 999px; box-shadow: 0 4px 14px -10px rgba(28,43,74,0.08);
  }
  .ob-wordmark { font-weight: 700; font-size: 22px; letter-spacing: -0.025em; color: var(--slate); text-decoration: none; }
  .ob-wordmark span { color: var(--teal); }
  .ob-progress-wrap { display: flex; align-items: center; gap: 6px; }
  .ob-progress-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--frost-blue); transition: background 0.3s ease; }
  .ob-progress-dot.active { background: var(--teal); }
  .ob-progress-dot.done { background: var(--slate); }
  .ob-chips { display: flex; flex-wrap: wrap; gap: 10px; }
  .ob-chip {
    font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 14.5px;
    color: var(--slate); background: var(--white);
    border: 1.5px solid var(--frost-blue); border-radius: 999px;
    padding: 10px 20px; cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease, transform 0.12s ease;
  }
  .ob-chip:hover { border-color: rgba(0,196,180,0.5); background: rgba(0,196,180,0.04); color: var(--teal); transform: translateY(-1px); }
  .ob-chip.selected { border-color: var(--teal); background: rgba(0,196,180,0.1); color: var(--teal); }
  .ob-skill-card {
    display: flex; align-items: center; gap: 16px;
    padding: 16px 20px; border-radius: 16px;
    background: var(--white); border: 1.5px solid var(--frost-blue);
    cursor: pointer; transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
  }
  .ob-skill-card:hover { border-color: rgba(0,196,180,0.4); background: rgba(0,196,180,0.03); }
  .ob-skill-card.selected { border-color: var(--teal); background: rgba(0,196,180,0.06); box-shadow: 0 0 0 3px rgba(0,196,180,0.12); }
  .ob-skill-dot { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--frost-blue); flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: border-color 0.15s ease; }
  .ob-skill-card.selected .ob-skill-dot { border-color: var(--teal); background: var(--teal); }
  .ob-skill-card.selected .ob-skill-dot::after { content: ''; display: block; width: 6px; height: 6px; border-radius: 50%; background: var(--white); }
  .ob-skill-label { font-weight: 700; font-size: 15px; color: var(--slate); }
  .ob-skill-sub { font-weight: 400; font-size: 13px; color: var(--muted-slate); margin-top: 2px; }
  .ob-section-label { font-weight: 700; font-size: 13px; color: var(--slate); letter-spacing: 0.01em; margin-bottom: 10px; }

  .ob-main {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 120px 24px 60px; min-height: 100vh;
  }
  .ob-step { width: 100%; max-width: 640px; display: flex; flex-direction: column; gap: 32px; }
  .ob-eyebrow { font-weight: 600; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--teal); }
  .ob-heading { font-weight: 800; font-size: clamp(28px, 4vw, 42px); line-height: 1.08; letter-spacing: -0.025em; color: var(--slate); }
  .ob-sub { font-weight: 400; font-size: 16px; line-height: 1.65; color: var(--muted-slate); }

  .stage-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .stage-card {
    background: var(--white); border: 1.5px solid var(--frost-blue);
    border-radius: 18px; padding: 22px 20px; display: flex; flex-direction: column; gap: 10px;
    cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }
  .stage-card:hover { transform: translateY(-3px); border-color: rgba(0,196,180,0.4); background: var(--white); box-shadow: 0 12px 32px -14px rgba(28,43,74,0.12); }
  .stage-card.selected { border-color: var(--teal); background: rgba(0,196,180,0.05); box-shadow: 0 0 0 3px rgba(0,196,180,0.15); }
  .stage-icon { width: 36px; height: 36px; background: rgba(0,196,180,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .stage-icon svg { width: 18px; height: 18px; color: var(--teal); }
  .stage-num { font-weight: 700; font-size: 11px; letter-spacing: 0.1em; color: var(--teal); }
  .stage-title { font-weight: 700; font-size: 17px; letter-spacing: -0.01em; color: var(--slate); }
  .stage-desc { font-weight: 400; font-size: 13.5px; line-height: 1.6; color: var(--muted-slate); }

  .ob-textarea {
    width: 100%; padding: 18px 20px; border-radius: 16px;
    background: var(--white); border: 1.5px solid var(--frost-blue);
    font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 400;
    color: var(--slate); line-height: 1.6; resize: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    outline: none;
  }
  .ob-textarea:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(0,196,180,0.12); }
  .ob-textarea::placeholder { color: var(--muted-slate); }
  .ob-char-count { font-size: 13px; color: var(--muted-slate); text-align: right; margin-top: -16px; }
  .ob-input {
    width: 100%; padding: 14px 20px; border-radius: 14px;
    background: var(--white); border: 1.5px solid var(--frost-blue);
    font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 600;
    color: var(--slate); outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .ob-input:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(0,196,180,0.12); }
  .ob-input::placeholder { color: var(--muted-slate); font-weight: 400; }
  .ob-label { font-size: 13px; font-weight: 600; color: var(--muted-slate); letter-spacing: 0.04em; }

  .ob-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 16px;
    color: var(--white); background: var(--slate); border: none; border-radius: 14px;
    padding: 16px 28px; cursor: pointer; align-self: flex-start;
    transition: background 0.18s ease, transform 0.15s ease;
    box-shadow: 0 8px 20px -10px rgba(28,43,74,0.28);
  }
  .ob-btn:hover { background: #16233d; transform: translateY(-1px); }
  .ob-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .ob-btn .arrow { transition: transform 0.2s ease; }
  .ob-btn:not(:disabled):hover .arrow { transform: translateX(3px); }

  .ob-generating {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 24px; padding: 60px 0; text-align: center;
  }
  .ob-spinner {
    width: 48px; height: 48px; border: 3px solid var(--frost-blue);
    border-top-color: var(--teal); border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .ob-gen-title { font-weight: 700; font-size: 20px; color: var(--slate); letter-spacing: -0.02em; }
  .ob-gen-sub { font-size: 15px; color: var(--muted-slate); line-height: 1.6; max-width: 36ch; }

  @media (max-width: 640px) {
    .ob-nav { width: calc(100% - 32px); padding: 9px 9px 9px 18px; }
    .ob-wordmark { font-size: 18px; }
    .ob-main { padding: 100px 20px 48px; }
    .stage-grid { grid-template-columns: 1fr; }
    .ob-heading { font-size: 26px; }
  }
`

const STAGES = [
  {
    id: 'idea',
    num: '01',
    title: "It's just an idea",
    desc: 'Direction and aesthetic only — nothing designed yet.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5C17.6 10.3 18 9.2 18 8A6 6 0 1 0 6 8c0 1.2.4 2.3 1.5 3.5C8.3 12.3 8.8 13 9 14"/>
        <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="21" x2="14" y2="21"/>
      </svg>
    ),
  },
  {
    id: 'design',
    num: '02',
    title: 'I have a design',
    desc: 'Artwork ready. Moving to mockups and audience.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
      </svg>
    ),
  },
  {
    id: 'mockup',
    num: '03',
    title: 'I have a mockup',
    desc: 'Product visualized. Focus on store and marketing.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
      </svg>
    ),
  },
  {
    id: 'sell',
    num: '04',
    title: "I'm ready to sell",
    desc: 'Everything set. Build the full launch strategy.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
  },
  {
    id: 'scaling',
    num: '05',
    title: "I'm already selling and want to grow",
    desc: 'Brand is running. Focus on growth, data, and scaling.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
  },
]

const AGE_OPTIONS = ['Under 16', '16–18', '18–24', '25–30', '30+', 'All ages']
const GEO_OPTIONS = ['My city', 'My country', 'Worldwide', 'Specific region']
const SKILL_OPTIONS = [
  { label: 'Starting from zero', sub: "I don't know where to begin — and that's fine." },
  { label: 'Got the basics', sub: 'Done some research, know the concepts, not sure what to do next.' },
  { label: 'Made some moves', sub: "I've tried things before but haven't launched anything real yet." },
  { label: 'Done this before', sub: "I've sold or had a brand running. I know how it works." },
  { label: 'I know what I\'m doing', sub: 'Just here for the tools, the structure, and a co-partner to move faster.' },
]

function OnboardingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [subStep, setSubStep] = useState(1)
  const [selectedStage, setSelectedStage] = useState<string>(searchParams.get('start') ?? '')

  // Step 2 answers
  const [brandName, setBrandName] = useState('')
  const [targetAges, setTargetAges] = useState<string[]>([])
  const [targetGeo, setTargetGeo] = useState('')
  const [skillLevel, setSkillLevel] = useState('')
  const [brandVibe, setBrandVibe] = useState('')

  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')

  // Total dots: 1 (stage) + 4 sub-steps
  const totalDots = 5
  const currentDot = step === 1 ? 1 : 1 + subStep

  function toggleAge(age: string) {
    setTargetAges(prev => prev.includes(age) ? prev.filter(a => a !== age) : [...prev, age])
  }

  async function handleGenerate() {
    setGenerating(true)
    setGenError('')

    const description = [
      brandName.trim() ? `Brand name: ${brandName.trim()}` : null,
      targetAges.length > 0 ? `Target age group: ${targetAges.join(', ')}` : null,
      targetGeo ? `Geographic focus: ${targetGeo}` : null,
      skillLevel ? `Founder experience: ${skillLevel}` : null,
      brandVibe.trim() ? `Brand aesthetic and vibe: ${brandVibe.trim()}` : null,
    ].filter(Boolean).join('\n')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const res = await fetch('/api/onboarding/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: selectedStage, description }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `Generate failed (${res.status})`)
      }
      const data = await res.json()

      const title = brandName.trim() || 'My Brand'
      const { data: inserted, error: insertErr } = await supabase.from('brands').insert({
        user_id: user.id,
        title,
        stage: selectedStage,
        description,
        audience_report: data.audienceReport,
        roadmap: data.roadmap,
        marketing_plan: data.marketingPlan,
      }).select('id').single()

      if (insertErr) throw new Error(`Save failed: ${insertErr.message}`)
      router.push(`/app?brand=${inserted.id}`)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Something went wrong')
      setGenerating(false)
    }
  }

  const backBtn = (target: () => void) => (
    <button className="ob-btn" style={{background:'transparent',color:'var(--slate)',border:'1.5px solid var(--frost-blue)',boxShadow:'none'}} onClick={target}>
      ← Back
    </button>
  )

  return (
    <>
      <style>{pageStyles}</style>
      <div className="ob-page">
        <nav className="ob-nav">
          <a href="/" className="ob-wordmark">sartile<span>.com</span></a>
          <div className="ob-progress-wrap">
            {Array.from({ length: totalDots }, (_, i) => i + 1).map(n => (
              <div key={n} className={`ob-progress-dot ${currentDot > n ? 'done' : currentDot === n ? 'active' : ''}`} />
            ))}
          </div>
        </nav>

        <main className="ob-main">
          {generating ? (
            <div className="ob-generating">
              <div className="ob-spinner" />
              <div className="ob-gen-title">Building your roadmap...</div>
              <div className="ob-gen-sub">sarti is reading your brand and building a plan specifically for you. This takes about 15 seconds.</div>
            </div>
          ) : step === 1 ? (
            <div className="ob-step">
              <div>
                <p className="ob-eyebrow">Step 1 of 5</p>
                <h1 className="ob-heading">Where is your brand right now?</h1>
                <p className="ob-sub" style={{marginTop: '12px'}}>Pick the stage that best describes where you're at. sartile skips what you've already done.</p>
              </div>
              <div className="stage-grid">
                {STAGES.map(stage => (
                  <div
                    key={stage.id}
                    className={`stage-card ${selectedStage === stage.id ? 'selected' : ''}`}
                    onClick={() => setSelectedStage(stage.id)}
                  >
                    <div className="stage-icon">{stage.icon}</div>
                    <span className="stage-num">{stage.num}</span>
                    <div className="stage-title">{stage.title}</div>
                    <div className="stage-desc">{stage.desc}</div>
                  </div>
                ))}
              </div>
              <button className="ob-btn" disabled={!selectedStage} onClick={() => { setStep(2); setSubStep(1) }}>
                Continue <span className="arrow">→</span>
              </button>
            </div>

          ) : subStep === 1 ? (
            <div className="ob-step">
              <div>
                <p className="ob-eyebrow">Step 2 of 5</p>
                <h1 className="ob-heading">What's your brand called?</h1>
                <p className="ob-sub" style={{marginTop: '12px'}}>No name yet? Leave it blank — that's what sarti is here for.</p>
              </div>
              <input
                className="ob-input"
                type="text"
                placeholder="e.g. VLTGE, Nocture, Ashfield..."
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                maxLength={60}
                autoFocus
              />
              <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
                {backBtn(() => setStep(1))}
                <button className="ob-btn" onClick={() => setSubStep(2)}>
                  Continue <span className="arrow">→</span>
                </button>
              </div>
            </div>

          ) : subStep === 2 ? (
            <div className="ob-step">
              <div>
                <p className="ob-eyebrow">Step 3 of 5</p>
                <h1 className="ob-heading">Who are you building this for?</h1>
                <p className="ob-sub" style={{marginTop: '12px'}}>The more specific you are, the better sarti can tailor everything to your actual customer.</p>
              </div>
              <div>
                <p className="ob-section-label">Age group — pick all that apply</p>
                <div className="ob-chips">
                  {AGE_OPTIONS.map(age => (
                    <button key={age} className={`ob-chip${targetAges.includes(age) ? ' selected' : ''}`} onClick={() => toggleAge(age)}>
                      {age}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="ob-section-label">Where are they based?</p>
                <div className="ob-chips">
                  {GEO_OPTIONS.map(geo => (
                    <button key={geo} className={`ob-chip${targetGeo === geo ? ' selected' : ''}`} onClick={() => setTargetGeo(geo === targetGeo ? '' : geo)}>
                      {geo}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
                {backBtn(() => setSubStep(1))}
                <button className="ob-btn" disabled={targetAges.length === 0 && !targetGeo} onClick={() => setSubStep(3)}>
                  Continue <span className="arrow">→</span>
                </button>
              </div>
            </div>

          ) : subStep === 3 ? (
            <div className="ob-step">
              <div>
                <p className="ob-eyebrow">Step 4 of 5</p>
                <h1 className="ob-heading">How deep are you in this?</h1>
                <p className="ob-sub" style={{marginTop: '12px'}}>No wrong answer. sarti adjusts everything — the language, the roadmap, how much it explains — based on where you're at.</p>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {SKILL_OPTIONS.map(opt => (
                  <div
                    key={opt.label}
                    className={`ob-skill-card${skillLevel === opt.label ? ' selected' : ''}`}
                    onClick={() => setSkillLevel(opt.label)}
                  >
                    <div className="ob-skill-dot" />
                    <div>
                      <div className="ob-skill-label">{opt.label}</div>
                      <div className="ob-skill-sub">{opt.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
                {backBtn(() => setSubStep(2))}
                <button className="ob-btn" disabled={!skillLevel} onClick={() => setSubStep(4)}>
                  Continue <span className="arrow">→</span>
                </button>
              </div>
            </div>

          ) : (
            <div className="ob-step">
              <div>
                <p className="ob-eyebrow">Step 5 of 5</p>
                <h1 className="ob-heading">Describe the vibe.</h1>
                <p className="ob-sub" style={{marginTop: '12px'}}>Aesthetic, energy, references, what it feels like — whatever gives sarti a real picture of what you're building. One sentence is enough.</p>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                <textarea
                  className="ob-textarea"
                  rows={5}
                  placeholder="e.g. Gorpcore streetwear — technical outdoor gear that actually looks good off the trail. Arc'teryx meets Palace. Clean, functional, built for guys who care about what they wear."
                  value={brandVibe}
                  onChange={e => setBrandVibe(e.target.value)}
                  maxLength={600}
                  autoFocus
                />
                <div className="ob-char-count">{brandVibe.length}/600</div>
              </div>
              {genError && (
                <div style={{padding:'12px 16px',background:'rgba(220,38,38,0.06)',border:'1.5px solid rgba(220,38,38,0.2)',borderRadius:'12px',fontSize:'13px',color:'#DC2626',fontWeight:500}}>
                  {genError}
                </div>
              )}
              <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
                {backBtn(() => setSubStep(3))}
                <button className="ob-btn" onClick={handleGenerate}>
                  Build my roadmap <span className="arrow">→</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  )
}
