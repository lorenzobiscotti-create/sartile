'use client'

export default function AskSartiBtn({ prompt, onAsk }: { prompt: string; onAsk: (msg: string) => void }) {
  return (
    <button className="ask-sarti-btn" onClick={() => onAsk(prompt)}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
      Ask sarti
    </button>
  )
}
