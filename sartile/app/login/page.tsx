'use client'

import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const pageStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --frost: #F6F8FC; --slate: #1C2B4A; --teal: #00C4B4;
    --white: #FFFFFF; --frost-blue: #C8D8EC; --muted-slate: #7A8BA8;
  }
  body { font-family: 'Outfit', sans-serif; background: var(--frost); color: var(--slate); -webkit-font-smoothing: antialiased; }
  .auth-page {
    min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .auth-card {
    width: 100%; max-width: 420px;
    background: var(--white); border: 1px solid var(--frost-blue);
    border-radius: 28px; padding: 48px 40px;
    box-shadow: 0 24px 60px -30px rgba(28,43,74,0.12);
    display: flex; flex-direction: column; gap: 32px;
  }
  .auth-header { display: flex; flex-direction: column; gap: 10px; }
  .auth-wordmark { font-weight: 700; font-size: 24px; letter-spacing: -0.025em; color: var(--slate); text-decoration: none; }
  .auth-wordmark span { color: var(--teal); }
  .auth-title { font-weight: 800; font-size: 28px; letter-spacing: -0.025em; color: var(--slate); line-height: 1.1; }
  .auth-sub { font-weight: 400; font-size: 15px; line-height: 1.6; color: var(--muted-slate); }
  .auth-body { display: flex; flex-direction: column; gap: 14px; }
  .google-btn {
    display: flex; align-items: center; justify-content: center; gap: 12px;
    width: 100%; padding: 14px 20px; border-radius: 14px;
    background: var(--slate); color: var(--white);
    font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 15px;
    border: none; cursor: pointer;
    transition: background 0.18s ease, transform 0.15s ease;
    box-shadow: 0 8px 20px -10px rgba(28,43,74,0.28);
  }
  .google-btn:hover { background: #16233d; transform: translateY(-1px); }
  .google-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .google-icon { width: 20px; height: 20px; flex-shrink: 0; }
  .auth-divider { display: flex; align-items: center; gap: 12px; }
  .auth-divider-line { flex: 1; height: 1px; background: var(--frost-blue); }
  .auth-divider span { font-size: 13px; color: var(--muted-slate); font-weight: 400; white-space: nowrap; }
  .auth-footer { text-align: center; font-size: 14px; color: var(--muted-slate); }
  .auth-footer a { color: var(--teal); font-weight: 600; text-decoration: none; }
  .auth-footer a:hover { text-decoration: underline; }
  .auth-error {
    background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.2);
    border-radius: 10px; padding: 12px 16px;
    font-size: 14px; color: #dc2626; font-weight: 400;
  }
  @media (max-width: 480px) {
    .auth-card { padding: 36px 24px; border-radius: 24px; }
    .auth-title { font-size: 24px; }
  }
`

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  async function signInWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <>
      <style>{pageStyles}</style>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <a href="/" className="auth-wordmark">sartile<span>.com</span></a>
            <h1 className="auth-title">Welcome back.</h1>
            <p className="auth-sub">Log in to your account to keep building.</p>
          </div>

          {error && (
            <div className="auth-error">
              Something went wrong. Please try again.
            </div>
          )}

          <div className="auth-body">
            <button className="google-btn" onClick={signInWithGoogle}>
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="auth-footer">
            Don't have an account? <a href="/signup">Sign up free</a>
          </div>

          <div style={{ textAlign: 'center' }}>
            <a href="/" style={{ fontSize: 13, color: 'var(--muted-slate)', textDecoration: 'none', fontWeight: 500 }}>
              ← Do this later
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
