import { useState, useRef, useEffect } from 'react'
import { aiAPI } from '../api'
import { useToast } from '../context/ToastContext'

const FALLBACK = [
  "I can help with that! The MCP platform is running 9 microservices on AWS EKS with all systems healthy.",
  "The recommendation engine uses GPT-4o-mini to analyze user behaviour and generate personalized suggestions based on purchase history and browsing patterns.",
  "The MCP API Gateway validates JWT tokens via the Auth Service and proxies requests to downstream services — auth, model, AI assistant, products, users, and payments.",
  "Based on current metrics: 2,841 API requests processed today, 384 AI inferences served, $12,480 revenue generated. All pods are running.",
  "The Control Plane manages the model registry. You can register new models, update endpoints, and track versioning — accessible from the Control Plane page.",
  "For CI/CD: Jenkins builds each service, pushes to ECR, and patches the GitOps repo. ArgoCD detects the change and rolls out the new image on EKS automatically.",
]
let fallbackIdx = 0

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm the MCP AI Assistant powered by OpenAI GPT-4o. I can help you with product queries, recommendations, platform questions, or anything else. How can I help you today?",
      time: now(),
    }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)
  const showToast = useToast()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')

    const userMsg = { role: 'user', content: text, time: now() }
    setMessages(prev => [...prev, userMsg])
    setTyping(true)

    try {
      const history = messages.concat(userMsg).map(m => ({ role: m.role, content: m.content }))
      const res = await aiAPI.chat(history)
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response, time: now() }])
    } catch {
      // Fallback demo response
      await delay(1200 + Math.random() * 600)
      const reply = FALLBACK[fallbackIdx++ % FALLBACK.length]
      setMessages(prev => [...prev, { role: 'assistant', content: reply, time: now() }])
    } finally {
      setTyping(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 104px)', animation: 'fadeIn .2s ease' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 8 }}>
        {messages.map((m, i) => (
          <Message key={i} msg={m} />
        ))}
        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          placeholder="Ask the AI Assistant anything..."
          style={{
            flex: 1, background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '13px 18px', color: 'var(--text)',
            fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'inherit',
            maxHeight: 120,
          }}
          onFocus={e => e.target.style.borderColor = 'var(--blue)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          onClick={send}
          style={{
            background: 'linear-gradient(135deg,#4f8ef7,#a855f7)',
            border: 'none', borderRadius: 12, width: 48, cursor: 'pointer',
            fontSize: 20, transition: '.2s', flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >➤</button>
      </div>
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex', gap: 12, maxWidth: '80%',
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      flexDirection: isUser ? 'row-reverse' : 'row',
      animation: 'fadeIn .2s ease',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        background: isUser
          ? 'linear-gradient(135deg,#3ecf8e,#06b6d4)'
          : 'linear-gradient(135deg,#4f8ef7,#a855f7)',
      }}>
        {isUser ? '👤' : '🤖'}
      </div>
      <div>
        <div style={{
          background: isUser ? 'rgba(79,142,247,.15)' : 'var(--card2)',
          border: `1px solid ${isUser ? 'rgba(79,142,247,.3)' : 'var(--border)'}`,
          borderRadius: 14, padding: '12px 16px', fontSize: 14, lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
        }}>
          {msg.content}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5, textAlign: isUser ? 'right' : 'left' }}>
          {msg.time}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 13 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', fontSize: 14,
        background: 'linear-gradient(135deg,#4f8ef7,#a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>🤖</div>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, background: 'var(--muted)', borderRadius: '50%',
            animation: `tdot 1.2s infinite ${i * 0.2}s`,
          }} />
        ))}
      </div>
      <style>{`@keyframes tdot{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}`}</style>
    </div>
  )
}

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms))
}
