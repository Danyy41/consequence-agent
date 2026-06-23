import { useState } from 'react'

// ── Scenarios the player picks from ──────────────────────────────────────────
const SCENARIOS = [
  {
    id: 'siege',
    emoji: '⚔️',
    title: 'Castle Siege',
    description: 'Your castle is surrounded by 3,000 enemy troops. You have 400 defenders and food for 12 days.',
  },
  {
    id: 'startup',
    emoji: '🚀',
    title: 'Startup Crisis',
    description: 'Your startup has 30 days of runway left. Investors want results. Your best engineer just quit.',
  },
  {
    id: 'pandemic',
    emoji: '🦠',
    title: 'Outbreak',
    description: 'A new virus has appeared in 3 cities. You are the crisis director. The public doesn\'t know yet.',
  },
  {
    id: 'negotiation',
    emoji: '🤝',
    title: 'Hostage Negotiation',
    description: 'An armed suspect has taken 6 hostages in a bank. You are the lead negotiator on the phone.',
  },
]

// ── Call the Claude API and get back structured JSON ─────────────────────────
async function analyzeDecision(scenario, action, history) {
  const pastDecisions = history.length > 0
    ? `\nPrevious decisions:\n${history.map((h, i) => `${i + 1}. "${h.action}" → ${h.what_happens}`).join('\n')}`
    : ''

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `You are a strategic consequence engine for a simulation game.

Scenario: ${scenario.title}
Situation: ${scenario.description}${pastDecisions}

The player's decision: "${action}"

Reply ONLY with a JSON object — no markdown, no explanation, just JSON:
{
  "what_happens": "What happens immediately as a direct result (2 sentences, vivid and specific)",
  "good": "One positive consequence of this decision",
  "bad": "One negative consequence or risk",
  "later": "What this leads to in the long run (1 sentence)",
  "risk": "low" or "medium" or "high",
  "next_moves": ["short suggestion 1", "short suggestion 2", "short suggestion 3"]
}`
      }]
    })
  })

  if (!response.ok) throw new Error(`API error: ${response.status}`)
  const data = await response.json()
  const text = data.content[0].text.replace(/```json|```/g, '').trim()
  return JSON.parse(text)
}

// ── Styles as a plain object so everything is in one file ────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: '#0d0d14',
    color: '#e2e2f0',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '2rem 1rem',
  },
  center: { maxWidth: 680, margin: '0 auto' },
  h1: { fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '0.4rem' },
  subtitle: { color: '#7777a0', fontSize: '0.9rem', marginBottom: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '2rem' },
  card: (active) => ({
    background: active ? '#1e1e30' : '#13131e',
    border: `1px solid ${active ? '#6c63ff' : '#2a2a3a'}`,
    borderRadius: 12,
    padding: '1rem',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'border-color 0.15s',
    width: '100%',
  }),
  cardEmoji: { fontSize: '1.5rem', marginBottom: '0.4rem' },
  cardTitle: { fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.95rem' },
  cardDesc: { fontSize: '0.8rem', color: '#8888aa', lineHeight: 1.5 },
  situationBox: {
    background: '#13131e',
    border: '1px solid #2a2a3a',
    borderRadius: 10,
    padding: '1rem',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    color: '#aaaacc',
    lineHeight: 1.6,
  },
  inputRow: { display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' },
  input: {
    flex: 1,
    background: '#13131e',
    border: '1px solid #3a3a55',
    borderRadius: 8,
    padding: '0.75rem 1rem',
    color: '#e2e2f0',
    fontSize: '0.9rem',
    outline: 'none',
  },
  btn: (disabled) => ({
    background: disabled ? '#2a2a3a' : '#6c63ff',
    color: disabled ? '#555' : 'white',
    border: 'none',
    borderRadius: 8,
    padding: '0 1.25rem',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    whiteSpace: 'nowrap',
  }),
  chips: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  chip: {
    background: '#1a1a2e',
    border: '1px solid #2a2a3a',
    borderRadius: 20,
    padding: '0.3rem 0.75rem',
    fontSize: '0.78rem',
    color: '#9999bb',
    cursor: 'pointer',
  },
  result: {
    background: '#13131e',
    border: '1px solid #2a2a3a',
    borderRadius: 12,
    padding: '1.25rem',
    marginBottom: '1rem',
    animation: 'fadein 0.3s ease',
  },
  resultTitle: { fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.95rem' },
  what: { fontSize: '0.9rem', color: '#ccccee', lineHeight: 1.65, marginBottom: '1rem' },
  row: { display: 'flex', gap: '0.75rem', marginBottom: '1rem' },
  pill: (color, bg) => ({
    flex: 1,
    background: bg,
    borderRadius: 8,
    padding: '0.6rem 0.75rem',
    fontSize: '0.8rem',
    color,
    lineHeight: 1.5,
  }),
  later: { fontSize: '0.82rem', color: '#8888aa', borderTop: '1px solid #1e1e30', paddingTop: '0.75rem', lineHeight: 1.55 },
  riskBadge: (risk) => ({
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 20,
    fontSize: '0.75rem',
    fontWeight: 600,
    background: risk === 'high' ? '#3a1010' : risk === 'medium' ? '#2e1e00' : '#0e2a1a',
    color: risk === 'high' ? '#e85c5c' : risk === 'medium' ? '#e8a840' : '#4caf7d',
    marginBottom: '0.75rem',
  }),
  historyItem: {
    borderLeft: '2px solid #2a2a3a',
    paddingLeft: '0.75rem',
    marginBottom: '0.75rem',
    fontSize: '0.8rem',
  },
  histAction: { color: '#9999bb', fontStyle: 'italic', marginBottom: '2px' },
  histResult: { color: '#666688' },
  loading: { textAlign: 'center', padding: '2rem', color: '#6666aa', fontSize: '0.9rem' },
  error: { background: '#2a1010', border: '1px solid #5a2020', borderRadius: 8, padding: '0.75rem 1rem', color: '#e85c5c', fontSize: '0.85rem', marginBottom: '1rem' },
  backBtn: { background: 'none', border: 'none', color: '#6666aa', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 },
  sectionLabel: { fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#555577', marginBottom: '0.5rem' },
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [scenario, setScenario] = useState(null)
  const [action, setAction] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  // Pick a scenario → go to game screen
  function pickScenario(s) {
    setScenario(s)
    setResult(null)
    setHistory([])
    setAction('')
    setError(null)
  }

  // Submit a decision to the AI
  async function handleSubmit(text) {
    const trimmed = (text || action).trim()
    if (!trimmed || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const analysis = await analyzeDecision(scenario, trimmed, history)
      setResult({ action: trimmed, ...analysis })
      setHistory(prev => [...prev, { action: trimmed, what_happens: analysis.what_happens }])
      setAction('')
    } catch (e) {
      setError(e.message + ' — make sure VITE_API_KEY is set in your .env file')
    } finally {
      setLoading(false)
    }
  }

  // ── Scenario picker screen ──
  if (!scenario) {
    return (
      <div style={S.page}>
        <style>{`@keyframes fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={S.center}>
          <h1 style={S.h1}>Consequence Agent</h1>
          <p style={S.subtitle}>Pick a scenario. Make decisions. See what happens.</p>
          <div style={S.grid}>
            {SCENARIOS.map(s => (
              <button key={s.id} style={S.card(false)} onClick={() => pickScenario(s)}>
                <div style={S.cardEmoji}>{s.emoji}</div>
                <div style={S.cardTitle}>{s.title}</div>
                <div style={S.cardDesc}>{s.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Game screen ──
  return (
    <div style={S.page}>
      <style>{`@keyframes fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={S.center}>

        <button style={S.backBtn} onClick={() => setScenario(null)}>← back to scenarios</button>

        <h1 style={{ ...S.h1, fontSize: '1.2rem' }}>{scenario.emoji} {scenario.title}</h1>
        <div style={S.situationBox}>{scenario.description}</div>

        {/* Action input */}
        <div style={S.inputRow}>
          <input
            style={S.input}
            placeholder="What do you do? Type any action..."
            value={action}
            onChange={e => setAction(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            disabled={loading}
          />
          <button style={S.btn(!action.trim() || loading)} onClick={() => handleSubmit()} disabled={!action.trim() || loading}>
            {loading ? '...' : 'Decide →'}
          </button>
        </div>

        {/* Suggested actions */}
        {result?.next_moves && (
          <div style={S.chips}>
            {result.next_moves.map((m, i) => (
              <button key={i} style={S.chip} onClick={() => handleSubmit(m)} disabled={loading}>
                {m}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && <div style={S.error}>{error}</div>}

        {/* Loading */}
        {loading && <div style={S.loading}>Analyzing consequences...</div>}

        {/* Result */}
        {result && !loading && (
          <div style={S.result}>
            <div style={S.riskBadge(result.risk)}>{result.risk} risk</div>
            <div style={S.resultTitle}>You decided: "{result.action}"</div>
            <div style={S.what}>{result.what_happens}</div>
            <div style={S.row}>
              <div style={S.pill('#4caf7d', '#0e2a1a')}>✓ {result.good}</div>
              <div style={S.pill('#e85c5c', '#2a1010')}>✗ {result.bad}</div>
            </div>
            <div style={S.later}>Long term: {result.later}</div>
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={S.sectionLabel}>Your decisions so far</div>
            {[...history].reverse().slice(1).map((h, i) => (
              <div key={i} style={S.historyItem}>
                <div style={S.histAction}>"{h.action}"</div>
                <div style={S.histResult}>{h.what_happens.slice(0, 80)}...</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
