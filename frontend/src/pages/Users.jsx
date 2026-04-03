import { useState, useEffect } from 'react'
import { userAPI } from '../api'
import { useToast } from '../context/ToastContext'

const DEMO = [
  { id:'u001', name:'Alice Johnson', email:'alice@example.com', role:'admin',  status:'Active',   joined:'Jan 12, 2025' },
  { id:'u002', name:'Bob Smith',     email:'bob@example.com',   role:'user',   status:'Active',   joined:'Feb 3, 2025' },
  { id:'u003', name:'Carol White',   email:'carol@example.com', role:'user',   status:'Active',   joined:'Feb 20, 2025' },
  { id:'u004', name:'David Lee',     email:'david@example.com', role:'user',   status:'Inactive', joined:'Mar 5, 2025' },
  { id:'u005', name:'Eva Martinez',  email:'eva@example.com',   role:'admin',  status:'Active',   joined:'Mar 15, 2025' },
]

export default function Users() {
  const [users, setUsers] = useState(DEMO)
  const showToast = useToast()

  useEffect(() => {
    userAPI.list().then(r => setUsers(r.data.users)).catch(() => {})
  }, [])

  const remove = (u) => {
    setUsers(prev => prev.filter(x => x.id !== u.id))
    showToast(`🗑️ ${u.name} removed`)
  }

  return (
    <div style={{ animation: 'fadeIn .2s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button onClick={() => showToast('✅ User form coming soon!')} style={btnStyle}>+ Add User</button>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--card2)' }}>
            <tr>
              {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', fontSize: 12, fontWeight: 600,
                  color: 'var(--muted2)', textAlign: 'left',
                  textTransform: 'uppercase', letterSpacing: '.6px',
                  borderBottom: '1px solid var(--border)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.025)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                style={{ borderBottom: i < users.length - 1 ? '1px solid rgba(42,45,62,.5)' : 'none' }}
              >
                <td style={td}>
                  <span style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#4f8ef7,#a855f7)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, marginRight: 8, verticalAlign: 'middle',
                  }}>{u.name[0]}</span>
                  {u.name}
                </td>
                <td style={td}>{u.email}</td>
                <td style={td}>
                  <span style={{
                    fontSize: 11, padding: '2px 9px', borderRadius: 6, fontWeight: 600,
                    ...(u.role === 'admin'
                      ? { background: 'rgba(168,85,247,.18)', color: 'var(--purple)' }
                      : { background: 'rgba(79,142,247,.15)', color: 'var(--blue)' })
                  }}>{u.role}</span>
                </td>
                <td style={td}>
                  <span style={{
                    fontSize: 11, padding: '3px 9px', borderRadius: 6, fontWeight: 600,
                    ...(u.status === 'Active'
                      ? { background: 'rgba(62,207,142,.15)', color: 'var(--green)' }
                      : { background: 'rgba(234,179,8,.15)', color: 'var(--yellow)' })
                  }}>{u.status}</span>
                </td>
                <td style={td}>{u.joined}</td>
                <td style={td}>
                  <ActionBtn color="blue" onClick={() => showToast(`✏️ Editing ${u.name}`)}>Edit</ActionBtn>
                  <ActionBtn color="red" onClick={() => remove(u)} style={{ marginLeft: 4 }}>Delete</ActionBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const td = { padding: '13px 16px', fontSize: 13 }
const btnStyle = {
  background: 'var(--blue)', border: 'none', borderRadius: 10,
  padding: '9px 18px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
}

function ActionBtn({ color, onClick, children, style = {} }) {
  const colors = { blue: ['rgba(79,142,247,.15)', 'rgba(79,142,247,.3)', 'var(--blue)'],
                   red:  ['rgba(239,68,68,.1)',    'rgba(239,68,68,.2)',   'var(--red)'] }
  const [bg, border, txt] = colors[color]
  return (
    <button onClick={onClick} style={{
      background: bg, border: `1px solid ${border}`, color: txt,
      borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', ...style,
    }}>{children}</button>
  )
}
