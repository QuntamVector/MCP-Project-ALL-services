import Card from '../components/Card'

const STATS = [
  { icon: '🔀', label: 'API Requests Today', value: '2,841', change: '+12%', up: true,  color: '#4f8ef7' },
  { icon: '🤖', label: 'AI Inferences',      value: '384',   change: '+8%',  up: true,  color: '#a855f7' },
  { icon: '💰', label: 'Revenue Today',       value: '$12,480', change: '+5%', up: true, color: '#3ecf8e' },
  { icon: '🚨', label: 'Active Alerts',       value: '1',     change: '-2',   up: false, color: '#ef4444' },
]

const ACTIVITY = [
  { color: '#3ecf8e', text: <span>User <strong>alice@example.com</strong> logged in</span>,          time: '2m ago' },
  { color: '#4f8ef7', text: <span>Model <strong>claude-sonnet</strong> served 42 requests</span>,    time: '5m ago' },
  { color: '#a855f7', text: <span>Payment <strong>#pay-7f3a</strong> completed · $99.99</span>,      time: '11m ago' },
  { color: '#f97316', text: <span>Product <strong>ML Toolkit</strong> stock updated to 48</span>,    time: '22m ago' },
  { color: '#06b6d4', text: <span>AI Assistant answered 15 queries in session</span>,                time: '34m ago' },
  { color: '#eab308', text: <span>HPA scaled <strong>mcp-api-gateway</strong> to 3 replicas</span>, time: '1h ago' },
]

const SERVICES = [
  { name: 'MCP API Gateway',  port: ':8000', up: true },
  { name: 'Auth Service',     port: ':8001', up: true },
  { name: 'Model Service',    port: ':8002', up: true },
  { name: 'AI Assistant',     port: ':8003', up: true },
  { name: 'Rec. Engine',      port: ':8004', up: true },
  { name: 'Product Service',  port: ':8005', up: true },
  { name: 'User Service',     port: ':8006', up: true },
  { name: 'Payment Service',  port: ':8007', up: true },
  { name: 'Control Plane',    port: ':8008', up: true },
]

export default function Dashboard() {
  return (
    <div style={{ animation: 'fadeIn .2s ease' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {STATS.map(s => (
          <div key={s.label} style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: 20,
            transition: '.2s', cursor: 'default',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--blue)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, fontSize: 18,
                background: `${s.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{s.icon}</div>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 6,
                background: s.up ? 'rgba(62,207,142,.12)' : 'rgba(239,68,68,.12)',
                color: s.up ? 'var(--green)' : 'var(--red)',
              }}>{s.change}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Activity */}
        <Card title="Recent Activity">
          {ACTIVITY.map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0', borderBottom: i < ACTIVITY.length - 1 ? '1px solid rgba(42,45,62,.6)' : 'none',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, flex: 1 }}>{a.text}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{a.time}</span>
            </div>
          ))}
        </Card>

        {/* Service Status */}
        <Card title="Service Status">
          {SERVICES.map(s => (
            <div key={s.name} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 0', borderBottom: '1px solid rgba(42,45,62,.4)',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.up ? 'var(--green)' : 'var(--red)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, flex: 1 }}>{s.name}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)', marginRight: 6 }}>{s.port}</span>
              <span>{s.up ? '🟢' : '🔴'}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
