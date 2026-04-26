import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'

const MOCK_ORDERS = [
  { id: 'LB001', items: 'Shirts × 3, Jeans × 2', status: 'Washing', updated: '10:30 AM' },
  { id: 'LB002', items: 'Bedsheet × 1, Towels × 4', status: 'Ready', updated: '9:15 AM' },
  { id: 'LB003', items: 'Kurtas × 5', status: 'Delivered', updated: 'Yesterday' },
  { id: 'LB004', items: 'Sarees × 2', status: 'Washing', updated: '11:00 AM' },
]

const STATUS_CONFIG = {
  Washing:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', dot: '#f59e0b' },
  Ready:     { color: '#10b981', bg: 'rgba(16,185,129,0.15)', dot: '#10b981' },
  Delivered: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', dot: '#94a3b8' },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut(auth)
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen p-4 md:p-8"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a1628 100%)' }}>

      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M18.5 3H6C4.9 3 4 3.9 4 5v2c0 .55.22 1.05.59 1.41L10 14v5h4v-5l5.41-5.59C19.78 8.05 20 7.55 20 7V5c0-1.1-.9-2-1.5-2zM18 7H6V5h12v2z"/>
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight" style={{ color: '#f1f5f9' }}>Laundry Buddy</h1>
            <p className="text-xs" style={{ color: '#64748b' }}>Dashboard</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
          Logout
        </button>
      </div>

      <div className="max-w-3xl mx-auto space-y-5">

        {/* User card */}
        <div className="p-5 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', color: 'white' }}>
              {user?.phoneNumber?.slice(-2) || '??'}
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#64748b' }}>Signed in as</p>
              <p className="font-semibold" style={{ color: '#f1f5f9', fontFamily: "'Space Mono', monospace" }}>
                {user?.phoneNumber || 'Unknown'}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs" style={{ color: '#4ade80' }}>Active</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        {[
          { label: 'Active Orders', value: MOCK_ORDERS.filter(o => o.status !== 'Delivered').length, color: '#3b82f6' },
          { label: 'Ready for Pickup', value: MOCK_ORDERS.filter(o => o.status === 'Ready').length, color: '#10b981' },
          { label: 'Delivered', value: MOCK_ORDERS.filter(o => o.status === 'Delivered').length, color: '#94a3b8' },
        ].reduce((rows, stat, i, arr) => {
          // Render inline
          return rows
        }, null) || null}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active Orders', value: MOCK_ORDERS.filter(o => o.status !== 'Delivered').length, color: '#3b82f6' },
            { label: 'Ready for Pickup', value: MOCK_ORDERS.filter(o => o.status === 'Ready').length, color: '#10b981' },
            { label: 'Delivered', value: MOCK_ORDERS.filter(o => o.status === 'Delivered').length, color: '#94a3b8' },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-2xl text-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs" style={{ color: '#64748b' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Orders list */}
        <div className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="px-5 py-4"
            style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="font-semibold" style={{ color: '#f1f5f9' }}>Your Orders</h2>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)' }}>
            {MOCK_ORDERS.map((order, i) => {
              const cfg = STATUS_CONFIG[order.status]
              return (
                <div key={order.id}
                  className="px-5 py-4 flex items-center justify-between"
                  style={{ borderBottom: i < MOCK_ORDERS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold" style={{ color: '#f1f5f9', fontFamily: "'Space Mono', monospace" }}>
                        #{order.id}
                      </span>
                      <span className="text-xs" style={{ color: '#64748b' }}>· {order.updated}</span>
                    </div>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>{order.items}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: cfg.bg }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                    <span className="text-xs font-medium" style={{ color: cfg.color }}>{order.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}