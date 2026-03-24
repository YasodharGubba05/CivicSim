import { useAuth } from '../contexts/AuthContext';
import { Activity, BarChart3, Zap, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePolicyStore } from '../store/policyStore';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { simulationResults, simulationsCount } = usePolicyStore();

  const lastYear = simulationResults.length > 0 ? simulationResults[simulationResults.length - 1] : null;
  const hasData = simulationsCount > 0;

  const statCards = [
    { label: 'Simulations Run', value: hasData ? simulationsCount.toString() : '—', color: 'blue' },
    { label: 'Last Run GDP', value: lastYear ? `$${lastYear.gdp.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—', color: 'emerald' },
    { label: 'Last Unemployment', value: lastYear ? `${(lastYear.unemploymentRate * 100).toFixed(1)}%` : '—', color: 'violet' },
    { label: 'Last Gini Index', value: lastYear ? lastYear.giniIndex.toFixed(3) : '—', color: 'amber' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto page-enter">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.displayName?.split(' ')[0] || 'Analyst'} 👋
        </h1>
        <p className="text-slate-400">
          Build policy scenarios, run Monte Carlo simulations, and discover evidence-based insights.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-slate-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors"
          >
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: Zap,
            title: 'Run a Simulation',
            desc: 'Configure policies and run a Monte Carlo economic simulation.',
            action: () => navigate('/configurator'),
            color: 'blue',
          },
          {
            icon: BarChart3,
            title: 'View Reports',
            desc: 'Review past simulation results and export findings.',
            action: () => navigate('/reports'),
            color: 'emerald',
          },
          {
            icon: Clock,
            title: 'View History',
            desc: 'Browse all past simulation runs stored in your account.',
            action: () => navigate('/history'),
            color: 'violet',
          },
        ].map((card) => (
          <button
            key={card.title}
            onClick={card.action}
            className="group bg-slate-900 border border-white/5 rounded-2xl p-6 text-left hover:border-blue-500/30 hover:bg-slate-800/50 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl bg-${card.color}-600/20 flex items-center justify-center mb-4`}>
              <card.icon className={`w-5 h-5 text-${card.color}-400`} />
            </div>
            <h3 className="text-white font-semibold mb-1">{card.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">{card.desc}</p>
            <div className="flex items-center gap-1 text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Get started <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        ))}
      </div>

      {/* Recent Activity (placeholder when no data) */}
      {hasData && simulationResults.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">Last Simulation Summary</h2>
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Years Simulated</p>
                <p className="text-lg font-bold text-white">{simulationResults.length}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Final GDP</p>
                <p className="text-lg font-bold text-blue-400">${lastYear ? (lastYear.gdp / 1000).toFixed(0) + 'k' : '—'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Unemployment</p>
                <p className="text-lg font-bold text-red-400">{lastYear ? (lastYear.unemploymentRate * 100).toFixed(1) + '%' : '—'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Gini Index</p>
                <p className="text-lg font-bold text-violet-400">{lastYear ? lastYear.giniIndex.toFixed(3) : '—'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="mt-8 bg-gradient-to-r from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-2xl p-6 flex items-start gap-4">
        <Activity className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-white font-semibold mb-1">Powered by Agent-Based Monte Carlo Simulation</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            CivicSim simulates thousands of AI citizens and businesses responding to your policy settings
            over 10 years — computing GDP growth, unemployment rates, Gini coefficients, and more with
            probabilistic confidence intervals.
          </p>
        </div>
      </div>
    </div>
  );
}
