import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Sparkles, RotateCcw } from 'lucide-react'
import { agentApi } from '@/api'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const SUGGESTIONS = [
  'What medicines are running low?',
  'Which medicines expire in the next 30 days?',
  'What should I order this week?',
  'What is the total value of my inventory?',
  'Show me controlled substances in stock',
  'Which category has the most medicines?',
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={clsx('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div className={clsx(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-gradient-to-br from-brand-400 to-brand-600' : 'bg-brand-500/20'
      )}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-brand-500" />}
      </div>
      <div className={clsx(
        'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
        isUser
          ? 'bg-brand-500 text-white rounded-tr-sm'
          : 'rounded-tl-sm'
      )}
        style={!isUser ? { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' } : {}}
      >
        {msg.content.split('\n').map((line, i) => (
          <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
        ))}
      </div>
    </div>
  )
}

export default function CopilotPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Hello! I\'m MediMind, your intelligent pharmacy assistant.\n\nI can help you with inventory queries, purchase recommendations, expiry tracking, compliance questions, and much more.\n\nWhat would you like to know?' }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef(null)
  const { user }              = useAuthStore()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const newMessages = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const history = newMessages.slice(-8).map(m => ({ role: m.role, content: m.content }))
      const { data } = await agentApi.chat(msg, history)
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      toast.error('Copilot unavailable. Check your Groq API key.')
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ I encountered an error. Please check the backend connection and Groq API keys.' }])
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setMessages([{ role: 'assistant', content: '🔄 Conversation reset. How can I help you?' }])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[900px] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <h1 className="section-title text-lg">AI Copilot</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Powered by LLaMA 3 70B via Groq</p>
          </div>
        </div>
        <button onClick={reset} className="btn-secondary flex items-center gap-2 text-sm">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 card p-4 overflow-y-auto space-y-4">
        {messages.map((m, i) => <Message key={i} msg={m} />)}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-brand-500" />
            </div>
            <div className="card px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="flex-shrink-0 text-xs px-3 py-2 rounded-xl border border-[var(--border)] hover:border-brand-500 hover:text-brand-500 transition-all"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3 mt-3">
        <input
          className="input-base flex-1"
          placeholder="Ask anything about your inventory…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={loading}
        />
        <button
          onClick={() => send()}
          className="btn-primary px-4 flex items-center gap-2"
          disabled={loading || !input.trim()}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
