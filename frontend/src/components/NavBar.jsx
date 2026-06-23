import { NavLink } from 'react-router-dom'

export default function NavBar() {
  const linkStyle = (active) => ({
    color: active ? 'white' : '#475569',
    fontWeight: active ? '600' : '500',
    fontSize: '13px',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
    border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
    transition: 'all 0.15s'
  })

  return (
    <nav style={{
      background: 'rgba(4,4,15,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(99,102,241,0.15)',
      padding: '0 32px',
      height: '62px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <span style={{ fontSize: '24px' }}>🪐</span>
        <div>
          <div style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>AstroDetect AI</div>
          <div style={{ color: '#4f5b8a', fontSize: '10px', letterSpacing: '0.05em' }}>BAH 2026 · ISRO · Challenge 07</div>
        </div>
      </NavLink>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {[
          { to: '/', label: '🔭 Detect' },
          { to: '/stats', label: '📊 Model Stats' },
          { to: '/history', label: '🕓 History' },
          { to: '/about', label: 'ℹ️ About' },
        ].map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            style={({ isActive }) => linkStyle(isActive)}>
            {label}
          </NavLink>
        ))}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'rgba(16,185,129,0.08)',
        border: '1px solid rgba(16,185,129,0.2)',
        color: '#34d399', fontSize: '12px', fontWeight: '600',
        padding: '5px 12px', borderRadius: '999px'
      }}>
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#34d399' }} />
        API Live
      </div>
    </nav>
  )
}