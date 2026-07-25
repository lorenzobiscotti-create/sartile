'use client'

import React, { useState } from 'react'
import type { Brand } from '@/types/brand'
import AskSartiBtn from './AskSartiBtn'

type Competitor = string | { name: string; url?: string; instagram?: string; why?: string }

type AudienceReport = {
  summary?: string
  ageRange?: string
  platforms?: string[]
  contentStyle?: string
  priceSensitivity?: string
  competitors?: Competitor[]
  positioning?: string
}

function competitorName(c: Competitor) {
  return typeof c === 'string' ? c : c.name
}
function competitorUrl(c: Competitor) {
  if (typeof c === 'string') return null
  return c.url ?? null
}
function competitorInstagram(c: Competitor) {
  if (typeof c === 'string') return null
  return c.instagram ?? null
}
function competitorWhy(c: Competitor) {
  if (typeof c === 'string') return null
  return c.why ?? null
}

export default function AudiencePanel({ brand, onAskSarti }: { brand: Brand; onAskSarti: (msg: string) => void }) {
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<AudienceReport | null>(
    brand.audience_report as AudienceReport | null
  )

  async function generate() {
    if (report) {
      setRevealed(true)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/onboarding/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: brand.stage, description: brand.description }),
      })
      const data = await res.json()
      if (data.audienceReport) setReport(data.audienceReport as AudienceReport)
    } catch { /* silent */ } finally {
      setLoading(false)
      setRevealed(true)
    }
  }

  if (!revealed) {
    return (
      <div className="panel-view">
        <div className="panel-header">
          <div>
            <h1 className="panel-title">Your Audience</h1>
            <p className="panel-sub">Who's buying, when to post, and what makes them tick.</p>
          </div>
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 24, padding: '72px 24px', textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'rgba(0,196,180,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.025em', color: 'var(--slate)', marginBottom: 10 }}>
              Who is your audience?
            </div>
            <p style={{ fontSize: 15, color: 'var(--muted-slate)', lineHeight: 1.65, maxWidth: '38ch', margin: '0 auto' }}>
              sarti will analyse your brand description and build a breakdown — who they are, what platforms they live on, what content resonates, and who else is competing for them.
            </p>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15,
              color: 'var(--white)', background: 'var(--slate)', border: 'none',
              borderRadius: 14, padding: '14px 26px', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'background 0.18s ease, transform 0.15s ease',
              boxShadow: '0 8px 20px -10px rgba(28,43,74,0.28)',
            }}
          >
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Generating...
              </>
            ) : (
              <>
                Generate Audience Breakdown
                <span style={{ transition: 'transform 0.2s ease' }}>→</span>
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  const platforms = report?.platforms ?? []
  const competitors = report?.competitors ?? []

  return (
    <div className="panel-view">
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Your Audience</h1>
          <p className="panel-sub">Who's buying, when to post, and what makes them tick.</p>
        </div>
      </div>

      {report?.summary && (
        <div className="panel-section">
          <div className="panel-section-title">Who they are</div>
          <p style={{ fontSize: 15, color: 'var(--muted-slate)', lineHeight: 1.7 }}>{report.summary}</p>
          {report.positioning && (
            <p style={{ fontSize: 14, color: 'var(--slate)', fontWeight: 600, marginTop: 12, padding: '12px 16px', background: 'rgba(0,196,180,0.07)', borderRadius: 10, borderLeft: '3px solid var(--teal)' }}>
              {report.positioning}
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {report?.ageRange && (
          <div className="panel-section" style={{ margin: 0 }}>
            <div className="panel-section-title">Age range</div>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--slate)', marginTop: 8 }}>{report.ageRange}</div>
          </div>
        )}
        {report?.priceSensitivity && (
          <div className="panel-section" style={{ margin: 0 }}>
            <div className="panel-section-title">Price sensitivity</div>
            <div style={{ fontSize: 14, color: 'var(--muted-slate)', lineHeight: 1.6, marginTop: 8 }}>{report.priceSensitivity}</div>
          </div>
        )}
      </div>

      {platforms.length > 0 && (
        <div className="panel-section">
          <div className="panel-section-title">Where they live</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
            {platforms.map(p => (
              <span key={p} style={{
                fontWeight: 600, fontSize: 14, color: 'var(--teal)',
                background: 'rgba(0,196,180,0.08)', border: '1px solid rgba(0,196,180,0.3)',
                borderRadius: 999, padding: '8px 16px',
              }}>{p}</span>
            ))}
          </div>
          <AskSartiBtn prompt={`Based on my audience being on ${platforms.join(' and ')}, what content should I be posting and how often?`} onAsk={onAskSarti} />
        </div>
      )}

      {report?.contentStyle && (
        <div className="panel-section">
          <div className="panel-section-title">Content approach</div>
          <p style={{ fontSize: 15, color: 'var(--muted-slate)', lineHeight: 1.7 }}>{report.contentStyle}</p>
          <AskSartiBtn prompt="Give me 5 specific content ideas tailored to my brand and audience right now." onAsk={onAskSarti} />
        </div>
      )}

      {competitors.length > 0 && (
        <div className="panel-section">
          <div className="panel-section-title">Competing for the same audience</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {competitors.map((c, i) => (
              <div key={i} style={{
                padding: '14px 16px', background: 'var(--frost)',
                border: '1px solid var(--frost-blue)', borderRadius: 12,
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--slate)' }}>{competitorName(c)}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {competitorUrl(c) && (
                      <a href={competitorUrl(c)!} target="_blank" rel="noopener noreferrer" style={{
                        fontWeight: 600, fontSize: 12, color: 'var(--muted-slate)',
                        background: 'var(--white)', border: '1px solid var(--frost-blue)',
                        borderRadius: 8, padding: '4px 10px', textDecoration: 'none',
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        transition: 'color 0.15s ease, border-color 0.15s ease',
                      }}>
                        Website ↗
                      </a>
                    )}
                    {competitorInstagram(c) && (
                      <a href={competitorInstagram(c)!} target="_blank" rel="noopener noreferrer" style={{
                        fontWeight: 600, fontSize: 12, color: 'var(--teal)',
                        background: 'rgba(0,196,180,0.07)', border: '1px solid rgba(0,196,180,0.25)',
                        borderRadius: 8, padding: '4px 10px', textDecoration: 'none',
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}>
                        Instagram ↗
                      </a>
                    )}
                  </div>
                </div>
                {competitorWhy(c) && (
                  <p style={{ fontSize: 13, color: 'var(--muted-slate)', lineHeight: 1.55, margin: 0 }}>{competitorWhy(c)}</p>
                )}
              </div>
            ))}
          </div>
          <AskSartiBtn prompt={`What can I learn from ${competitorName(competitors[0])} and how do I differentiate my brand against them?`} onAsk={onAskSarti} />
        </div>
      )}

      <div className="panel-section">
        <div className="coming-soon-card">
          <span className="coming-soon-label">Coming soon</span>
          <div className="coming-soon-title">Posting time heatmap</div>
          <p className="coming-soon-desc">Connect Instagram and TikTok and sarti will show you exactly when your specific audience is online — down to the day and time slot.</p>
          <AskSartiBtn prompt="Based on my brand and audience, when should I be posting and on which platforms?" onAsk={onAskSarti} />
        </div>
      </div>
    </div>
  )
}
