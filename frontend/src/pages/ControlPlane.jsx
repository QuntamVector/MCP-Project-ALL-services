import Card from '../components/Card'

const INFO = [
  { label: 'Status',             value: 'Running',                   color: 'var(--green)' },
  { label: 'Version',            value: '1.0.0' },
  { label: 'Registered Models',  value: '3' },
  { label: 'Namespace',          value: 'mcp-platform' },
  { label: 'Cluster',            value: 'mcp-platform-dev · EKS 1.29' },
  { label: 'Region',             value: 'us-east-1' },
]

const METRICS = [
  { label: 'CPU',             value: 42,  color: 'var(--blue)',   display: '42%' },
  { label: 'Memory',          value: 61,  color: 'var(--purple)', display: '61%' },
  { label: 'Pod Count',       value: 28,  color: 'var(--green)',  display: '14 / 50' },
  { label: 'Storage',         value: 35,  color: 'var(--orange)', display: '35%' },
]

const PODS = [
  { name: 'mcp-api-gateway-7d8f-xkp2q', service: 'API Gateway',  status: 'Running', restarts: 0, age: '2d', node: 'node-general-1' },
  { name: 'mcp-api-gateway-7d8f-v9wlm', service: 'API Gateway',  status: 'Running', restarts: 0, age: '2d', node: 'node-general-2' },
  { name: 'auth-service-5b9c-jk3nt',    service: 'Auth',          status: 'Running', restarts: 1, age: '2d', node: 'node-general-1' },
  { name: 'model-service-6f4d-m2rts',   service: 'Model Service', status: 'Running', restarts: 0, age: '2d', node: 'node-ai-1' },
  { name: 'model-service-6f4d-nw7pz',   service: 'Model Service', status: 'Running', restarts: 0, age: '2d', node: 'node-ai-2' },
  { name: 'ai-assistant-3c7e-qp8kx',    service: 'AI Assistant',  status: 'Running', restarts: 0, age: '1d', node: 'node-ai-1' },
  { name: 'redis-8b2a-lx4vw',           service: 'Redis',         status: 'Running', restarts: 0, age: '5d', node: 'node-general-2' },
  { name: 'postgresql-0',               service: 'PostgreSQL',    status: 'Running', restarts: 0, age: '5d', node: 'node-general-3' },
]

export default function ControlPlane() {
  return (
    <div style={{ animation: 'fadeIn .2s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Status */}
        <Card title="⚙️ Control Plane Status">
          {INFO.map(({ label, value, color }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 0', borderBottom: '1px solid rgba(42,45,62,.4)',
            }}>
              <span style={{ fontSize: 13 }}>{label}</span>
              <strong style={{ fontSize: 13, color: color || 'var(--text)' }}>{value}</strong>
            </div>
          ))}
        </Card>

        {/* Resources */}
        <Card title="📈 Resource Usage">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 8 }}>
            {METRICS.map(m => (
              <div key={m.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span>{m.label}</span>
                  <span style={{ color: m.color, fontWeight: 600 }}>{m.display}</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,.08)', borderRadius: 3 }}>
                  <div style={{ width: `${m.value}%`, height: '100%', background: m.color, borderRadius: 3, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Pods table */}
      <Card title="🐳 Running Pods">
        <div style={{ marginTop: 12, overflow: 'hidden', borderRadius: 10, border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--card2)' }}>
              <tr>
                {['Pod Name', 'Service', 'Status', 'Restarts', 'Age', 'Node'].map(h => (
                  <th key={h} style={{
                    padding: '11px 14px', fontSize: 11, fontWeight: 600, color: 'var(--muted2)',
                    textAlign: 'left', textTransform: 'uppercase', letterSpacing: '.6px',
                    borderBottom: '1px solid var(--border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PODS.map((p, i) => (
                <tr key={p.name}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.025)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ borderBottom: i < PODS.length - 1 ? '1px solid rgba(42,45,62,.5)' : 'none' }}
                >
                  <td style={td}><code style={{ fontSize: 11, color: 'var(--cyan)' }}>{p.name}</code></td>
                  <td style={td}>{p.service}</td>
                  <td style={td}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600, background: 'rgba(62,207,142,.15)', color: 'var(--green)' }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={td}>{p.restarts}</td>
                  <td style={td}>{p.age}</td>
                  <td style={td}>{p.node}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

const td = { padding: '12px 14px', fontSize: 13 }
