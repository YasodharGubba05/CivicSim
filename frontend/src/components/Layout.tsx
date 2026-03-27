import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, SlidersHorizontal, FileText, Clock, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard,   label: 'Dashboard' },
  { to: '/configurator', icon: SlidersHorizontal, label: 'Configurator' },
  { to: '/reports',      icon: FileText,           label: 'Reports' },
  { to: '/history',      icon: Clock,              label: 'History' },
  { to: '/settings',     icon: Settings,           label: 'Settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const initials = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#09090b' }}>
      {/* Sidebar */}
      <aside style={{
        width: 216, flexShrink: 0, display: 'flex', flexDirection: 'column',
        height: '100vh', position: 'sticky', top: 0,
        borderRight: '1px solid #27272a', background: '#111113',
      }}>
        {/* Brand */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #1f1f23', display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 24, height: 24, borderRadius: 5, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" fill="white" opacity="0.9"/>
              <rect x="9" y="1" width="6" height="6" rx="1" fill="white" opacity="0.5"/>
              <rect x="1" y="9" width="6" height="6" rx="1" fill="white" opacity="0.5"/>
              <rect x="9" y="9" width="6" height="6" rx="1" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#fafafa', letterSpacing: '-0.01em' }}>CivicSim</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#3f3f46', padding: '4px 10px 8px' }}>Platform</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Icon style={{ width: 15, height: 15, flexShrink: 0 }} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '8px 8px 10px', borderTop: '1px solid #1f1f23' }}>
          <button
            onClick={() => navigate('/settings')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#18181b')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12.5, fontWeight: 500, color: '#e4e4e7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                {user?.displayName || 'User'}
              </p>
              <p style={{ fontSize: 11, color: '#52525b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                {user?.email}
              </p>
            </div>
          </button>

          <button
            onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#52525b', fontSize: 13, fontWeight: 450, transition: 'all 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#52525b'; }}
          >
            <LogOut style={{ width: 14, height: 14 }} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowAuto: 'auto', minWidth: 0, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
