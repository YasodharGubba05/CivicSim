import { useAuth } from '../contexts/AuthContext';
import { BarChart3, Zap, Clock, ArrowRight, TrendingUp, Users, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePolicyStore } from '../store/policyStore';

const HEADER: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#52525b', marginBottom: 12 } as any;

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { simulationResults, simulationsCount } = usePolicyStore();
  const last = simulationResults[simulationResults.length - 1] ?? null;

  const stats = [
    { label: 'Simulations', value: simulationsCount || '—', sub: simulationsCount ? 'this session' : 'no runs yet' },
    { label: 'Final GDP',   value: last ? `$${(last.gdp/1000).toFixed(0)}k` : '—', sub: last ? `year ${last.year}` : 'run a simulation' },
    { label: 'Unemployment', value: last ? `${(last.unemploymentRate*100).toFixed(1)}%` : '—', sub: last ? 'final year' : 'run a simulation' },
    { label: 'Gini Index',  value: last ? last.giniIndex.toFixed(3) : '—', sub: last ? 'inequality' : 'run a simulation' },
  ];

  const actions = [
    { icon: Zap,      title: 'Run Simulation',   desc: 'Configure policies and model outcomes', to: '/configurator' },
    { icon: BarChart3, title: 'View Reports',    desc: 'Explore charts and export data',        to: '/reports' },
    { icon: Clock,    title: 'History',           desc: 'Review and manage past runs',           to: '/history' },
  ];

  return (
    <div className="page-enter" style={{ maxWidth: 860, margin: '0 auto', padding: '44px 32px' }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: '#10b981', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>Dashboard</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.025em', margin: 0 }}>
          {user?.displayName?.split(' ')[0] ? `Welcome back, ${user.displayName.split(' ')[0]}` : 'Welcome back'}
        </h1>
        <p style={{ fontSize: 14, color: '#71717a', marginTop: 6 }}>
          Configure economic policies, run simulations, and discover insights.
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#27272a', marginBottom: 28 }} />

      {/* Stats */}
      <div style={{ marginBottom: 36 }}>
        <p style={HEADER}>Overview</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {stats.map((s, i) => (
            <div key={i} className="stat">
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#52525b', marginBottom: 8 }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#fafafa', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', marginBottom: 2 }}>{s.value}</p>
              <p style={{ fontSize: 11.5, color: '#3f3f46' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginBottom: 36 }}>
        <p style={HEADER}>Actions</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {actions.map((a) => (
            <button
              key={a.title}
              onClick={() => navigate(a.to)}
              className="card"
              style={{ padding: '18px 20px', textAlign: 'left', cursor: 'pointer', border: '1px solid #27272a', transition: 'border-color 0.15s, background 0.15s', display: 'block', background: '#111113' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#3f3f46'; (e.currentTarget as HTMLElement).style.background = '#141417'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#27272a'; (e.currentTarget as HTMLElement).style.background = '#111113'; }}
            >
              <div style={{ width: 30, height: 30, borderRadius: 7, background: '#18181b', border: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <a.icon style={{ width: 14, height: 14, color: '#a1a1aa' }} />
              </div>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: '#fafafa', marginBottom: 4 }}>{a.title}</p>
              <p style={{ fontSize: 12.5, color: '#71717a', lineHeight: 1.5, marginBottom: 14 }}>{a.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, color: '#10b981' }}>
                Open <ArrowRight style={{ width: 11, height: 11 }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Last Run */}
      {last && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={HEADER}>Last simulation</p>
            <button onClick={() => navigate('/reports')} style={{ fontSize: 12, color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
              Full report <ArrowRight style={{ width: 11, height: 11 }} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Years',        value: simulationResults.length, color: '#a1a1aa' },
              { label: 'GDP',          value: `$${(last.gdp/1000).toFixed(0)}k`, color: '#34d399' },
              { label: 'Unemployment', value: `${(last.unemploymentRate*100).toFixed(1)}%`, color: '#f87171' },
              { label: 'Gini',         value: last.giniIndex.toFixed(3), color: '#fbbf24' },
            ].map((m) => (
              <div key={m.label} className="stat" style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#52525b', marginBottom: 6 }}>{m.label}</p>
                <p style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div style={{ padding: '20px 22px', background: '#111113', border: '1px solid #27272a', borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: '#18181b', border: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
          <Activity style={{ width: 14, height: 14, color: '#10b981' }} />
        </div>
        <div>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: '#fafafa', marginBottom: 4 }}>Agent-based Monte Carlo simulation</p>
          <p style={{ fontSize: 12.5, color: '#71717a', lineHeight: 1.65 }}>
            Simulates 1,000 AI citizens and 50 businesses across 10 Monte Carlo runs. Configure income tax, corporate tax, minimum wage, and UBI — then see GDP, unemployment, and Gini coefficient projections with confidence intervals.
          </p>
        </div>
      </div>
    </div>
  );
}
