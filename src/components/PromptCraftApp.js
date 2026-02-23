'use client'

import { useState } from 'react'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: 1, email: 'demo@promptcraft.ai', password: 'demo123', name: 'Alex Chen', plan: 'pro', tokensUsed: 12400, tokensLimit: 100000 },
  { id: 2, email: 'free@promptcraft.ai', password: 'free123', name: 'Sam Rivers', plan: 'free', tokensUsed: 890, tokensLimit: 5000 },
]

const MOCK_HISTORY = [
  { id: 1, idea: 'Write a blog post about AI trends', goal: 'Educate', tone: 'Professional', format: 'Article', length: 'Long', createdAt: '2024-01-15', tokens: 340 },
  { id: 2, idea: 'Create a marketing email for SaaS product', goal: 'Convert', tone: 'Persuasive', format: 'Email', length: 'Medium', createdAt: '2024-01-14', tokens: 280 },
  { id: 3, idea: 'Summarize a research paper on quantum computing', goal: 'Summarize', tone: 'Academic', format: 'Bullet Points', length: 'Short', createdAt: '2024-01-13', tokens: 195 },
]

const ADMIN_STATS = {
  totalUsers: 4821,
  proUsers: 1203,
  totalPrompts: 89234,
  monthlyRevenue: 18450,
  topGoals: [
    { goal: 'Write', count: 34120 },
    { goal: 'Analyze', count: 22340 },
    { goal: 'Create', count: 18920 },
    { goal: 'Summarize', count: 13854 },
  ],
  signupsPerDay: [120, 145, 130, 167, 189, 201, 178, 156, 190, 215, 198, 230, 245, 221],
}

// ─── Local Prompt Generator (fallback) ───────────────────────────────────────
function generateLocalPrompts(idea, goal, tone, format, length) {
  const wordMap = { Short: '200-300 words', Medium: '400-600 words', Long: '800-1200 words', 'Very Long': '1500+ words' }
  const lengthDesc = wordMap[length] || 'appropriate length'

  const basic = `${tone === 'Professional' ? 'Write professionally' : `Write in a ${tone.toLowerCase()} tone`} about: ${idea}. Format as ${format}. Keep it ${length.toLowerCase()}.`

  const advanced = `## Task
${goal}: ${idea}

## Requirements
- **Tone**: ${tone}
- **Format**: ${format}
- **Length**: ${lengthDesc}
- **Audience**: Professional, knowledgeable readers
- **Style**: Clear, structured, and engaging

## Instructions
1. Begin with a compelling introduction
2. Develop key points with supporting evidence
3. Maintain consistent ${tone.toLowerCase()} tone throughout
4. Conclude with actionable insights or summary
5. Format output as ${format}

Deliver high-quality content that immediately provides value.`

  const expert = `# Expert Prompt — ${goal} Specialist

## Role Assignment
You are a seasoned ${goal} specialist with 15+ years of expertise in crafting high-impact ${format.toLowerCase()} content. You have deep knowledge of audience psychology, content strategy, and persuasion techniques.

## Primary Objective
${goal}: ${idea}

## Output Specifications
- **Format**: ${format}
- **Tone & Voice**: ${tone} — maintain this consistently throughout
- **Length**: ${lengthDesc}
- **Quality Standard**: Publication-ready, zero filler content

## Structural Constraints
1. **Hook**: Open with a pattern-interrupt statement or compelling statistic
2. **Body**: Use the Problem → Agitate → Solve framework
3. **Evidence**: Support claims with data, examples, or analogies
4. **CTA/Conclusion**: End with clear next steps or a memorable takeaway

## Style Rules
- Active voice preferred (>80% of sentences)
- Avoid jargon unless audience expects it
- Use transitional phrases for flow
- Vary sentence length for rhythm (short punches + flowing elaboration)

## Compatibility Notes
✓ Optimized for GPT-4, Claude 3, Gemini Ultra
✓ Temperature recommendation: 0.7 for creative, 0.3 for factual
✓ Max tokens: Adjust based on ${length} setting

## Example Output Structure
[Opening Hook]
[Core Content — 3-5 main points]
[Supporting Details + Examples]
[Conclusion + Call to Action]

Begin immediately without preamble. Deliver expert-level output.`

  return { basic, advanced, expert }
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  Wand: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}><path d="M15 4V2" /><path d="M15 16v-2" /><path d="M8 9h2" /><path d="M20 9h2" /><path d="m17.8 11.8 1.4 1.4" /><path d="M15 9h.01" /><path d="m13.2 7.2 1.4-1.4" /><path d="M12 20l7-7" /><path d="M2 22l10-10" /></svg>,
  Copy: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>,
  Save: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" /><path d="M7 3v4a1 1 0 0 0 1 1h7" /></svg>,
  History: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>,
  Key: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}><circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6" /><path d="m15.5 7.5 3 3L22 7l-3-3" /></svg>,
  Chart: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}><line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" /></svg>,
  Sun: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>,
  Moon: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>,
  Logout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>,
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}><polyline points="20 6 9 17 4 12" /></svg>,
  Zap: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg>,
  Shield: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>,
  Google: () => <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%' }}><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>,
  Crown: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" /><path d="M5 21h14" /></svg>,
}

// ─── Themes ───────────────────────────────────────────────────────────────────
const themes = {
  dark: {
    bg: '#0a0a0f',
    bgNav: 'rgba(10,10,15,0.85)',
    surface: '#111118',
    surfaceHover: '#1a1a24',
    border: '#1e1e2e',
    text: '#e8e8f0',
    textMuted: '#5a5a7a',
    accent: '#b4ff6a',
  },
  light: {
    bg: '#f7f7f9',
    bgNav: 'rgba(247,247,249,0.85)',
    surface: '#ffffff',
    surfaceHover: '#f0f0f5',
    border: '#e4e4ec',
    text: '#0a0a0f',
    textMuted: '#7a7a9a',
    accent: '#4f46e5',
  },
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function PromptCraftApp() {
  const [darkMode, setDarkMode] = useState(true)
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('landing')
  const [history, setHistory] = useState(MOCK_HISTORY)
  const [notification, setNotification] = useState(null)
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' })
  const [authError, setAuthError] = useState('')

  // Dashboard state
  const [ideaInput, setIdeaInput] = useState('')
  const [goal, setGoal] = useState('Write')
  const [tone, setTone] = useState('Professional')
  const [format, setFormat] = useState('Article')
  const [length, setLength] = useState('Medium')
  const [prompts, setPrompts] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Production Key', key: 'pc_live_sk_9xK2mP3nQr7vL4wE8tY1', created: '2024-01-10', lastUsed: '2024-01-15', requests: 4821 },
  ])

  const t = darkMode ? themes.dark : themes.light

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    const found = MOCK_USERS.find((u) => u.email === authForm.email && u.password === authForm.password)
    if (found) {
      setUser(found)
      setPage('dashboard')
      setAuthError('')
    } else {
      setAuthError('Invalid email or password.')
    }
  }

  const handleRegister = (e) => {
    e.preventDefault()
    const newUser = { id: 99, email: authForm.email, name: authForm.name, plan: 'free', tokensUsed: 0, tokensLimit: 5000 }
    setUser(newUser)
    setPage('dashboard')
  }

  const handleGoogleLogin = () => {
    setUser(MOCK_USERS[0])
    setPage('dashboard')
    notify('Signed in with Google!')
  }

  const handleGenerate = async () => {
    if (!ideaInput.trim()) return
    if (!user) { setPage('login'); return }
    if (user.plan === 'free' && user.tokensUsed >= user.tokensLimit) { setPage('pricing'); return }

    setGenerating(true)
    setPrompts(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: ideaInput, goal, tone, format, length }),
      })
      const data = await response.json()

      if (data.fallback) {
        await new Promise((r) => setTimeout(r, 800))
        setPrompts(generateLocalPrompts(ideaInput, goal, tone, format, length))
      } else {
        setPrompts(data)
      }
    } catch {
      await new Promise((r) => setTimeout(r, 800))
      setPrompts(generateLocalPrompts(ideaInput, goal, tone, format, length))
    }

    setGenerating(false)
  }

  const handleSave = () => {
    if (!prompts) return
    const entry = {
      id: Date.now(),
      idea: ideaInput,
      goal,
      tone,
      format,
      length,
      createdAt: new Date().toISOString().split('T')[0],
      tokens: Math.floor(Math.random() * 200 + 150),
    }
    setHistory((h) => [entry, ...h])
    notify('Prompt saved to history!')
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).catch(() => {})
    notify('Copied to clipboard!')
  }

  const generateApiKey = () => {
    const newKey = {
      id: Date.now(),
      name: `Key ${apiKeys.length + 1}`,
      key: `pc_live_sk_${Math.random().toString(36).substr(2, 20)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      requests: 0,
    }
    setApiKeys((k) => [...k, newKey])
    notify('New API key generated!')
  }

  const currentPrompt = prompts?.[activeTab] || ''

  const sharedStyles = `
    .btn-primary { background: ${t.accent}; color: #000; border: none; cursor: pointer; font-family: 'DM Mono', monospace; font-weight: 500; transition: all 0.2s; }
    .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-secondary { background: transparent; border: 1px solid ${t.border}; color: ${t.text}; cursor: pointer; font-family: 'DM Mono', monospace; transition: all 0.2s; }
    .btn-secondary:hover { border-color: ${t.accent}; color: ${t.accent}; }
    input:focus, textarea:focus, select:focus { outline: none; border-color: ${t.accent} !important; }
    .shimmer { background: linear-gradient(90deg, ${t.surface} 25%, ${t.surfaceHover} 50%, ${t.surface} 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .grid-bg { background-image: linear-gradient(${t.border}33 1px, transparent 1px), linear-gradient(90deg, ${t.border}33 1px, transparent 1px); background-size: 40px 40px; }
    .hover-lift:hover { box-shadow: 0 8px 24px ${t.accent}22; }
    ::selection { background: ${t.accent}44; }
  `

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: "'DM Mono', 'Fira Code', monospace", transition: 'all 0.3s ease' }}>
      <style>{sharedStyles}</style>

      {/* Notification */}
      {notification && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, background: notification.type === 'error' ? '#ef4444' : t.accent, color: '#000', padding: '10px 18px', borderRadius: 8, fontWeight: 500, fontSize: 13, animation: 'fadeIn 0.3s ease' }}>
          {notification.msg}
        </div>
      )}

      {/* NAV */}
      {page !== 'landing' && (
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 56, borderBottom: `1px solid ${t.border}`, background: t.bgNav, position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <button onClick={() => setPage(user ? 'dashboard' : 'landing')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: t.text }}>
              <div style={{ width: 28, height: 28, background: t.accent, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 16, height: 16, color: '#000' }}><Icons.Wand /></div>
              </div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: t.text }}>PromptCraft</span>
            </button>
            {user && (
              <div style={{ display: 'flex', gap: 4 }}>
                {[['dashboard', 'Generate'], ['history', 'History'], ['apikeys', 'API Keys']].map(([p, label]) => (
                  <button key={p} onClick={() => setPage(p)} className="btn-secondary" style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, borderColor: page === p ? t.accent : 'transparent', color: page === p ? t.accent : t.textMuted }}>
                    {label}
                  </button>
                ))}
                {user?.email === 'demo@promptcraft.ai' && (
                  <button onClick={() => setPage('admin')} className="btn-secondary" style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, borderColor: page === 'admin' ? '#ff6b6b' : 'transparent', color: page === 'admin' ? '#ff6b6b' : t.textMuted }}>
                    Admin
                  </button>
                )}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setDarkMode((d) => !d)} style={{ width: 32, height: 32, background: 'none', border: `1px solid ${t.border}`, borderRadius: 6, cursor: 'pointer', color: t.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 7 }}>
              {darkMode ? <Icons.Sun /> : <Icons.Moon />}
            </button>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {user.plan === 'free' && (
                  <button onClick={() => setPage('pricing')} className="btn-primary" style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12 }}>⚡ Upgrade</button>
                )}
                {user.plan === 'pro' && (
                  <span style={{ background: `${t.accent}22`, color: t.accent, border: `1px solid ${t.accent}44`, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>✦ PRO</span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => { setUser(null); setPage('landing') }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${t.accent}33`, border: `1px solid ${t.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: t.accent }}>
                    {user.name?.[0]}
                  </div>
                  <div style={{ width: 14, height: 14, color: t.textMuted }}><Icons.Logout /></div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setPage('login')} className="btn-secondary" style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12 }}>Log in</button>
                <button onClick={() => setPage('register')} className="btn-primary" style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12 }}>Sign up</button>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* ── LANDING ── */}
      {page === 'landing' && <LandingPage t={t} darkMode={darkMode} setDarkMode={setDarkMode} setPage={setPage} />}

      {/* ── AUTH ── */}
      {(page === 'login' || page === 'register') && (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }} className="grid-bg">
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 50%, ${t.accent}08, transparent 70%)` }} />
          <div className="fade-in" style={{ width: '100%', maxWidth: 400, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 32, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{ width: 32, height: 32, background: t.accent, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 18, height: 18, color: '#000' }}><Icons.Wand /></div>
              </div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18 }}>PromptCraft AI</span>
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, marginBottom: 6 }}>
              {page === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={{ color: t.textMuted, fontSize: 13, marginBottom: 24 }}>
              {page === 'login' ? 'Try: demo@promptcraft.ai / demo123' : 'Start crafting better prompts today'}
            </p>
            <button onClick={handleGoogleLogin} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '10px', background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, cursor: 'pointer', fontSize: 13, color: t.text, marginBottom: 20, fontFamily: 'DM Mono, monospace', transition: 'all 0.2s' }}>
              <div style={{ width: 18, height: 18 }}><Icons.Google /></div> Continue with Google
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: t.border }} />
              <span style={{ color: t.textMuted, fontSize: 11 }}>or email</span>
              <div style={{ flex: 1, height: 1, background: t.border }} />
            </div>
            {authError && <div style={{ background: '#ef444422', border: '1px solid #ef4444', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#ef4444', marginBottom: 16 }}>{authError}</div>}
            <form onSubmit={page === 'login' ? handleLogin : handleRegister}>
              {page === 'register' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: t.textMuted, display: 'block', marginBottom: 6 }}>FULL NAME</label>
                  <input type="text" value={authForm.name} onChange={(e) => setAuthForm((f) => ({ ...f, name: e.target.value }))} required placeholder="Your name" style={{ width: '100%', padding: '9px 12px', background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 13 }} />
                </div>
              )}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: t.textMuted, display: 'block', marginBottom: 6 }}>EMAIL</label>
                <input type="email" value={authForm.email} onChange={(e) => setAuthForm((f) => ({ ...f, email: e.target.value }))} required placeholder="you@example.com" style={{ width: '100%', padding: '9px 12px', background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 13 }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, color: t.textMuted, display: 'block', marginBottom: 6 }}>PASSWORD</label>
                <input type="password" value={authForm.password} onChange={(e) => setAuthForm((f) => ({ ...f, password: e.target.value }))} required placeholder="••••••••" style={{ width: '100%', padding: '9px 12px', background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 13 }} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '11px', borderRadius: 8, fontSize: 14 }}>
                {page === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: t.textMuted }}>
              {page === 'login' ? 'No account? ' : 'Already have one? '}
              <button onClick={() => setPage(page === 'login' ? 'register' : 'login')} style={{ background: 'none', border: 'none', color: t.accent, cursor: 'pointer', fontSize: 12, fontFamily: 'DM Mono, monospace' }}>
                {page === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* ── DASHBOARD ── */}
      {page === 'dashboard' && user && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: '14px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: t.textMuted }}>TOKEN USAGE — {user.plan.toUpperCase()}</span>
                <span style={{ fontSize: 11, color: t.textMuted }}>{user.tokensUsed.toLocaleString()} / {user.tokensLimit.toLocaleString()}</span>
              </div>
              <div style={{ height: 4, background: t.bg, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(user.tokensUsed / user.tokensLimit) * 100}%`, background: user.tokensUsed / user.tokensLimit > 0.8 ? '#ef4444' : t.accent, borderRadius: 2, transition: 'width 1s ease' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
            {/* Input Form */}
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 20, height: 20, color: t.accent }}><Icons.Wand /></div>
                Craft Prompt
              </h2>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: t.textMuted, display: 'block', marginBottom: 8 }}>YOUR IDEA OR GOAL</label>
                <textarea value={ideaInput} onChange={(e) => setIdeaInput(e.target.value)} rows={4} placeholder="e.g. Write a compelling product description for an AI writing tool..." style={{ width: '100%', padding: '10px 14px', background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, color: t.text, fontSize: 13, resize: 'vertical', lineHeight: 1.6 }} />
              </div>
              {[
                ['GOAL', 'goal', setGoal, goal, ['Write', 'Analyze', 'Create', 'Summarize', 'Explain', 'Persuade', 'Code', 'Research']],
                ['TONE', 'tone', setTone, tone, ['Professional', 'Casual', 'Persuasive', 'Academic', 'Creative', 'Technical', 'Friendly']],
                ['FORMAT', 'format', setFormat, format, ['Article', 'Email', 'Bullet Points', 'Report', 'Story', 'Code', 'Script', 'Social Post']],
                ['LENGTH', 'length', setLength, length, ['Short', 'Medium', 'Long', 'Very Long']],
              ].map(([label, key, setter, value, options]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: t.textMuted, display: 'block', marginBottom: 8 }}>{label}</label>
                  <select value={value} onChange={(e) => setter(e.target.value)} style={{ width: '100%', padding: '9px 14px', background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 13, appearance: 'none', cursor: 'pointer' }}>
                    {options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <button onClick={handleGenerate} disabled={generating} className="btn-primary hover-lift" style={{ width: '100%', padding: '12px', borderRadius: 10, fontSize: 14, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: generating ? 0.8 : 1 }}>
                {generating ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Generating...
                  </>
                ) : (
                  <><div style={{ width: 16, height: 16 }}><Icons.Zap /></div> Generate Prompts</>
                )}
              </button>
            </div>

            {/* Output */}
            <div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: 4 }}>
                {[['basic', '🌱 Basic', 'Quick tasks'], ['advanced', '⚡ Advanced', 'Structured'], ['expert', '🏆 Expert', 'Full constraints']].map(([key, label, desc]) => (
                  <button key={key} onClick={() => setActiveTab(key)} style={{ flex: 1, padding: '8px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', background: activeTab === key ? t.accent : 'transparent', color: activeTab === key ? '#000' : t.textMuted, fontFamily: 'DM Mono, monospace', fontSize: 12, fontWeight: activeTab === key ? 600 : 400, transition: 'all 0.2s' }}>
                    <div>{label}</div>
                    <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{desc}</div>
                  </button>
                ))}
              </div>
              <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, overflow: 'hidden', minHeight: 400 }}>
                {!prompts && !generating && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, color: t.textMuted, gap: 12 }}>
                    <div style={{ width: 48, height: 48, color: t.border }}><Icons.Wand /></div>
                    <p style={{ fontSize: 13 }}>Enter your idea and click Generate</p>
                  </div>
                )}
                {generating && (
                  <div style={{ padding: 24 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="shimmer" style={{ height: 16, borderRadius: 4, marginBottom: 12, width: `${85 - i * 8}%` }} />
                    ))}
                  </div>
                )}
                {prompts && !generating && (
                  <div className="fade-in">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${t.border}` }}>
                      <span style={{ fontSize: 11, color: t.textMuted }}>{activeTab.toUpperCase()} VERSION — {currentPrompt.split(/\s+/).length} words</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={handleSave} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 6, fontSize: 12 }}>
                          <div style={{ width: 13, height: 13 }}><Icons.Save /></div> Save
                        </button>
                        <button onClick={() => handleCopy(currentPrompt)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 6, fontSize: 12 }}>
                          <div style={{ width: 13, height: 13 }}><Icons.Copy /></div> Copy
                        </button>
                      </div>
                    </div>
                    <pre style={{ padding: 24, fontSize: 13, lineHeight: 1.8, color: t.text, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'DM Mono, monospace', margin: 0, maxHeight: 500, overflowY: 'auto' }}>
                      {currentPrompt}
                    </pre>
                    <div style={{ padding: '14px 20px', borderTop: `1px solid ${t.border}`, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, color: t.textMuted }}>COMPATIBLE WITH:</span>
                      {['GPT-4o', 'Claude 3.5', 'Gemini Ultra', 'Llama 3'].map((m) => (
                        <span key={m} style={{ background: `${t.accent}15`, color: t.accent, border: `1px solid ${t.accent}33`, borderRadius: 20, padding: '2px 10px', fontSize: 11 }}>{m}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY ── */}
      {page === 'history' && user && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 24, height: 24, color: t.accent }}><Icons.History /></div>
            Prompt History
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map((item) => (
              <div key={item.id} className="hover-lift" style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, marginBottom: 8, color: t.text, lineHeight: 1.4 }}>{item.idea}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {[item.goal, item.tone, item.format, item.length].map((tag) => (
                        <span key={tag} style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 20, padding: '2px 10px', fontSize: 11, color: t.textMuted }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                    <p style={{ fontSize: 11, color: t.textMuted }}>{item.createdAt}</p>
                    <p style={{ fontSize: 11, color: t.accent, marginTop: 4 }}>{item.tokens} tokens</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── API KEYS ── */}
      {page === 'apikeys' && user && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 24, height: 24, color: t.accent }}><Icons.Key /></div>
              API Keys
            </h2>
            <button onClick={generateApiKey} className="btn-primary" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13 }}>+ Generate Key</button>
          </div>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ padding: '12px 20px', borderBottom: `1px solid ${t.border}`, display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 80px', gap: 12 }}>
              {['Name', 'Key', 'Created', 'Last Used', 'Requests', 'Action'].map((h) => (
                <span key={h} style={{ fontSize: 10, color: t.textMuted, fontWeight: 600 }}>{h}</span>
              ))}
            </div>
            {apiKeys.map((k) => (
              <div key={k.id} style={{ padding: '14px 20px', borderBottom: `1px solid ${t.border}`, display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 80px', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 13 }}>{k.name}</span>
                <span style={{ fontSize: 11, color: t.textMuted }}>{k.key.substring(0, 22)}...</span>
                <span style={{ fontSize: 11, color: t.textMuted }}>{k.created}</span>
                <span style={{ fontSize: 11, color: t.textMuted }}>{k.lastUsed}</span>
                <span style={{ fontSize: 13 }}>{k.requests.toLocaleString()}</span>
                <button onClick={() => { navigator.clipboard.writeText(k.key); notify('Key copied!') }} style={{ background: `${t.accent}22`, color: t.accent, border: `1px solid ${t.accent}44`, borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}>
                  Copy
                </button>
              </div>
            ))}
          </div>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Quick Start</h3>
            <pre style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, padding: 16, fontSize: 12, color: t.text, overflow: 'auto', lineHeight: 1.7 }}>
              {`curl -X POST https://yourdomain.com/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "idea": "Write a product launch email",
    "goal": "Persuade",
    "tone": "Professional",
    "format": "Email",
    "length": "Medium"
  }'`}
            </pre>
          </div>
        </div>
      )}

      {/* ── ADMIN ── */}
      {page === 'admin' && user && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 24, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 24, height: 24, color: '#ff6b6b' }}><Icons.Shield /></div>
            Admin Dashboard
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total Users', value: ADMIN_STATS.totalUsers.toLocaleString(), sub: '+234 this week', color: t.accent },
              { label: 'Pro Subscribers', value: ADMIN_STATS.proUsers.toLocaleString(), sub: `${((ADMIN_STATS.proUsers / ADMIN_STATS.totalUsers) * 100).toFixed(1)}% conversion`, color: '#a78bfa' },
              { label: 'Prompts Generated', value: ADMIN_STATS.totalPrompts.toLocaleString(), sub: '+1,240 today', color: '#34d399' },
              { label: 'Monthly Revenue', value: `$${ADMIN_STATS.monthlyRevenue.toLocaleString()}`, sub: '+12% MoM', color: '#fbbf24' },
            ].map((stat) => (
              <div key={stat.label} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
                <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 8 }}>{stat.label.toUpperCase()}</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 26, color: stat.color }}>{stat.value}</p>
                <p style={{ fontSize: 11, color: t.textMuted, marginTop: 6 }}>{stat.sub}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 15, marginBottom: 20 }}>Daily Signups (14 days)</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
                {ADMIN_STATS.signupsPerDay.map((val, i) => {
                  const max = Math.max(...ADMIN_STATS.signupsPerDay)
                  return (
                    <div key={i} style={{ flex: 1, height: `${(val / max) * 100}px`, background: i === ADMIN_STATS.signupsPerDay.length - 1 ? t.accent : `${t.accent}55`, borderRadius: '3px 3px 0 0', minHeight: 4 }} />
                  )
                })}
              </div>
            </div>
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 15, marginBottom: 20 }}>Top Goals</h3>
              {ADMIN_STATS.topGoals.map((g, i) => {
                const max = ADMIN_STATS.topGoals[0].count
                return (
                  <div key={g.goal} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12 }}>{g.goal}</span>
                      <span style={{ fontSize: 12, color: t.textMuted }}>{g.count.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 4, background: t.bg, borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${(g.count / max) * 100}%`, background: [t.accent, '#a78bfa', '#34d399', '#fbbf24'][i], borderRadius: 2 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── PRICING ── */}
      {page === 'pricing' && (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: t.accent, letterSpacing: '0.15em', marginBottom: 12 }}>PRICING</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, marginBottom: 12 }}>Simple, transparent pricing</h2>
          <p style={{ color: t.textMuted, marginBottom: 48, fontSize: 14 }}>Start free, upgrade when you're ready</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              { name: 'Free', price: '$0', period: 'forever', features: ['5,000 tokens/month', 'Basic & Advanced prompts', '10 saved prompts', 'Standard rate limits'], cta: user ? 'Current Plan' : 'Get Started', highlight: false },
              { name: 'Pro', price: '$19', period: '/month', features: ['100,000 tokens/month', 'All 3 prompt versions', 'Unlimited saved prompts', 'API access', 'Priority generation', 'Analytics dashboard', 'Custom templates'], cta: 'Upgrade to Pro', highlight: true },
            ].map((plan) => (
              <div key={plan.name} className="hover-lift" style={{ background: plan.highlight ? `${t.accent}10` : t.surface, border: `2px solid ${plan.highlight ? t.accent : t.border}`, borderRadius: 16, padding: 32, position: 'relative' }}>
                {plan.highlight && <div style={{ position: 'absolute', top: 16, right: 16, background: t.accent, color: '#000', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>POPULAR</div>}
                <div style={{ width: 36, height: 36, color: plan.highlight ? t.accent : t.textMuted, margin: '0 auto 16px' }}><Icons.Crown /></div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{plan.name}</h3>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, color: plan.highlight ? t.accent : t.text }}>{plan.price}</span>
                  <span style={{ color: t.textMuted, fontSize: 14 }}>{plan.period}</span>
                </div>
                <div style={{ textAlign: 'left', marginBottom: 24 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 16, height: 16, color: plan.highlight ? t.accent : t.textMuted, flexShrink: 0 }}><Icons.Check /></div>
                      <span style={{ fontSize: 13 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => { if (!user) setPage('register'); else { notify('Subscription updated! (demo mode)'); setPage('dashboard') } }} style={{ width: '100%', padding: '11px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontFamily: 'DM Mono, monospace', fontWeight: 500, transition: 'all 0.2s', border: plan.highlight ? 'none' : `1px solid ${t.border}`, background: plan.highlight ? t.accent : 'transparent', color: plan.highlight ? '#000' : t.text }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
function LandingPage({ t, darkMode, setDarkMode, setPage }) {
  const [demoIdea, setDemoIdea] = useState('')
  const [demoOutput, setDemoOutput] = useState(null)
  const [demoLoading, setDemoLoading] = useState(false)

  const runDemo = async () => {
    if (!demoIdea.trim()) return
    setDemoLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setDemoOutput(generateLocalPrompts(demoIdea, 'Write', 'Professional', 'Article', 'Medium'))
    setDemoLoading(false)
  }

  return (
    <div>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .float { animation: float 6s ease-in-out infinite; }
      `}</style>

      {/* Hero Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: t.accent, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 18, height: 18, color: '#000' }}><Icons.Wand /></div>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: t.text }}>PromptCraft AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => setPage('pricing')} style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', fontSize: 14, fontFamily: 'DM Mono, monospace' }}>Pricing</button>
          <button onClick={() => setDarkMode((d) => !d)} style={{ width: 32, height: 32, background: 'none', border: `1px solid ${t.border}`, borderRadius: 6, cursor: 'pointer', color: t.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 7 }}>
            {darkMode ? <Icons.Sun /> : <Icons.Moon />}
          </button>
          <button onClick={() => setPage('login')} style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: 8, padding: '7px 16px', cursor: 'pointer', color: t.text, fontSize: 13, fontFamily: 'DM Mono, monospace' }}>Log in</button>
          <button onClick={() => setPage('register')} style={{ background: t.accent, border: 'none', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', color: '#000', fontSize: 13, fontFamily: 'DM Mono, monospace', fontWeight: 600 }}>Start free →</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${t.border}44 1px, transparent 1px), linear-gradient(90deg, ${t.border}44 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, ${t.accent}12, transparent 60%)` }} />
        <div className="float" style={{ position: 'absolute', top: '18%', left: '8%', background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 11, color: t.textMuted, opacity: 0.7, animationDelay: '0s' }}>
          <span style={{ color: t.accent }}>✦</span> Role assigned
        </div>
        <div className="float" style={{ position: 'absolute', top: '25%', right: '9%', background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 11, color: t.textMuted, opacity: 0.7, animationDelay: '2s' }}>
          <span style={{ color: '#34d399' }}>✓</span> GPT-4 ready
        </div>
        <div className="float" style={{ position: 'absolute', bottom: '30%', left: '6%', background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 11, color: t.textMuted, opacity: 0.6, animationDelay: '4s' }}>
          <span style={{ color: '#fbbf24' }}>⚡</span> 3x versions
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${t.accent}15`, border: `1px solid ${t.accent}33`, borderRadius: 20, padding: '5px 14px', marginBottom: 24, fontSize: 12, color: t.accent }}>
            <div style={{ width: 14, height: 14 }}><Icons.Zap /></div>
            Powered by Claude API
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' }}>
            Turn any idea into a<br />
            <span style={{ color: t.accent }}>perfect AI prompt</span>
          </h1>
          <p style={{ color: t.textMuted, fontSize: 18, lineHeight: 1.6, marginBottom: 36, maxWidth: 520, margin: '0 auto 36px' }}>
            Stop guessing how to talk to AI. PromptCraft generates optimized, structured prompts in 3 levels — Basic, Advanced, and Expert.
          </p>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20, textAlign: 'left', marginBottom: 16, maxWidth: 600, margin: '0 auto 16px' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <input value={demoIdea} onChange={(e) => setDemoIdea(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runDemo()} placeholder="Try: write a LinkedIn post about AI productivity..." style={{ flex: 1, padding: '10px 14px', background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 13, fontFamily: 'DM Mono, monospace' }} />
              <button onClick={runDemo} disabled={demoLoading} style={{ background: t.accent, border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', color: '#000', fontSize: 13, fontFamily: 'DM Mono, monospace', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {demoLoading ? '...' : 'Generate →'}
              </button>
            </div>
            {demoLoading && <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textMuted, fontSize: 12 }}>Crafting your prompts...</div>}
            {demoOutput && !demoLoading && (
              <div style={{ maxHeight: 160, overflow: 'hidden', position: 'relative' }}>
                <div style={{ padding: 10, background: t.bg, borderRadius: 8, fontFamily: 'DM Mono, monospace', color: t.text, fontSize: 12 }}>
                  {demoOutput.basic}
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: `linear-gradient(transparent, ${t.surface})`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8 }}>
                  <button onClick={() => setPage('register')} style={{ background: t.accent, border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', color: '#000', fontSize: 12, fontFamily: 'DM Mono, monospace', fontWeight: 600 }}>Sign up to see all 3 versions →</button>
                </div>
              </div>
            )}
          </div>
          <p style={{ fontSize: 12, color: t.textMuted }}>Free forever · No credit card required · Works with GPT-4, Claude, Gemini</p>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
        <p style={{ textAlign: 'center', fontSize: 12, color: t.accent, letterSpacing: '0.15em', marginBottom: 16 }}>FEATURES</p>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 32, textAlign: 'center', marginBottom: 48 }}>Everything you need to prompt smarter</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { icon: <Icons.Wand />, title: '3-Level Prompt Engine', desc: 'Every idea gets transformed into Basic, Advanced, and Expert prompts — each optimized for different use cases.' },
            { icon: <Icons.Shield />, title: 'Model Agnostic', desc: 'All prompts work with GPT-4, Claude 3, Gemini Ultra, and any major LLM.' },
            { icon: <Icons.Key />, title: 'API Access', desc: 'Integrate PromptCraft into your own apps via our REST API with Node.js and Python SDKs.' },
            { icon: <Icons.History />, title: 'Prompt History', desc: 'Every prompt is saved. Search, reuse, and build on your past work.' },
            { icon: <Icons.Chart />, title: 'Analytics', desc: 'Track your token usage, most-used templates, and prompt performance.' },
            { icon: <Icons.Crown />, title: 'Template Library', desc: 'Curated expert templates for writing, coding, analysis, marketing, and more.' },
          ].map((f) => (
            <div key={f.title} className="hover-lift" style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 24, transition: 'all 0.2s' }}>
              <div style={{ width: 32, height: 32, color: t.accent, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: t.textMuted, fontSize: 13, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '80px 24px', borderTop: `1px solid ${t.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 50%, ${t.accent}08, transparent 60%)` }} />
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, marginBottom: 16, position: 'relative' }}>Ready to craft better prompts?</h2>
        <p style={{ color: t.textMuted, marginBottom: 32, position: 'relative' }}>Join 4,800+ users generating smarter prompts every day.</p>
        <button onClick={() => setPage('register')} style={{ background: t.accent, border: 'none', borderRadius: 10, padding: '14px 32px', cursor: 'pointer', color: '#000', fontSize: 15, fontFamily: 'Syne, sans-serif', fontWeight: 700, position: 'relative' }}>
          Start free today →
        </button>
      </div>

      <footer style={{ borderTop: `1px solid ${t.border}`, padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>PromptCraft AI</span>
        <span style={{ fontSize: 12, color: t.textMuted }}>© 2025 PromptCraft AI · Built with Claude API</span>
      </footer>
    </div>
  )
}
