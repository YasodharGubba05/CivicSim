import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { usePolicyStore } from '../store/policyStore';
import { Zap, RotateCcw, TrendingUp, Users, DollarSign, Activity, Sparkles } from 'lucide-react';

const API = 'http://localhost:3000';

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}

function SliderField({ label, value, min, max, step, format, onChange }: SliderFieldProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-sm font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
      />
      <div className="flex justify-between text-xs text-slate-600 mt-1">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

export default function ConfiguratorPage() {
  const {
    incomeTaxRate, corporateTaxRate, minimumWage, universalBasicIncome, subsidyPolicies,
    setPolicy, reset, setResults: persistResults,
  } = usePolicyStore();

  const [results, setResults] = useState<any[] | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [optimizedPolicy, setOptimizedPolicy] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [optimizeGoal, setOptimizeGoal] = useState<'maximizeGdp' | 'minimizeUnemployment' | 'minimizeInequality'>('maximizeGdp');
  const [activeTab, setActiveTab] = useState<'gdp' | 'unemployment' | 'income'>('gdp');

  const runSimulation = async () => {
    setLoading(true);
    setInsight(null);
    setOptimizedPolicy(null);
    try {
      const res = await fetch(`${API}/simulation/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incomeTaxRate, corporateTaxRate, minimumWage, universalBasicIncome, subsidyPolicies }),
      });
      const data = await res.json();
      if (data.success && data.results) {
        setResults(data.results);
        persistResults(data.results, data.id ?? 'local_' + Date.now());

        // Auto-fetch insights
        const insightRes = await fetch(`${API}/insights/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metrics: data.results }),
        });
        const insightData = await insightRes.json();
        if (insightData.success) setInsight(insightData.insight);
      }
    } catch {
      alert('Could not connect to the backend. Make sure it is running on port 3000.');
    } finally {
      setLoading(false);
    }
  };

  const runOptimize = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/optimization/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: optimizeGoal,
          baseIncomeTaxRate: incomeTaxRate,
          baseCorporateTaxRate: corporateTaxRate,
          baseMinimumWage: minimumWage,
          baseUniversalBasicIncome: universalBasicIncome,
        }),
      });
      const data = await res.json();
      if (data.success) setOptimizedPolicy(data.optimizedPolicy);
    } catch {
      alert('Optimization failed.');
    } finally {
      setLoading(false);
    }
  };

  const applyOptimized = () => {
    if (!optimizedPolicy) return;
    setPolicy('incomeTaxRate', optimizedPolicy.incomeTaxRate);
    setPolicy('corporateTaxRate', optimizedPolicy.corporateTaxRate);
    setPolicy('minimumWage', optimizedPolicy.minimumWage);
    setOptimizedPolicy(null);
  };

  const lastYear = results ? results[results.length - 1] : null;

  const chartConfig = {
    gdp: { key: 'gdp', color: '#3b82f6', label: 'GDP', formatter: (v: number) => `$${(v / 1000).toFixed(0)}k` },
    unemployment: { key: 'unemploymentRate', color: '#ef4444', label: 'Unemployment %', formatter: (v: number) => `${(v * 100).toFixed(1)}%` },
    income: { key: 'medianIncome', color: '#10b981', label: 'Median Income', formatter: (v: number) => `$${v.toFixed(0)}` },
  };

  const cc = chartConfig[activeTab];

  return (
    <div className="flex h-screen">
      {/* Left Panel — Policy Config */}
      <div className="w-80 bg-slate-900 border-r border-white/5 flex flex-col overflow-y-auto flex-shrink-0">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white mb-1">Policy Configuration</h2>
          <p className="text-slate-500 text-xs">Adjust parameters and run a Monte Carlo simulation</p>
        </div>

        <div className="flex-1 p-6 space-y-8">
          {/* Tax */}
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-4">Taxation</p>
            <div className="space-y-6">
              <SliderField label="Income Tax Rate" value={incomeTaxRate} min={0} max={0.8} step={0.01}
                format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => setPolicy('incomeTaxRate', v)} />
              <SliderField label="Corporate Tax Rate" value={corporateTaxRate} min={0} max={0.5} step={0.01}
                format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => setPolicy('corporateTaxRate', v)} />
            </div>
          </div>

          {/* Welfare */}
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-4">Welfare & Wages</p>
            <div className="space-y-6">
              <SliderField label="Minimum Wage" value={minimumWage} min={0} max={50} step={1}
                format={(v) => `$${v}/hr`} onChange={(v) => setPolicy('minimumWage', v)} />
              <SliderField label="Universal Basic Income" value={universalBasicIncome} min={0} max={50000} step={500}
                format={(v) => `$${v.toLocaleString()}/yr`} onChange={(v) => setPolicy('universalBasicIncome', v)} />
              <SliderField label="Subsidy Level" value={subsidyPolicies} min={0} max={100000} step={1000}
                format={(v) => `$${v.toLocaleString()}`} onChange={(v) => setPolicy('subsidyPolicies', v)} />
            </div>
          </div>

          {/* Optimizer */}
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-4">Policy Optimizer</p>
            <select
              value={optimizeGoal}
              onChange={(e) => setOptimizeGoal(e.target.value as any)}
              className="w-full bg-slate-800 border border-white/10 text-slate-300 text-sm rounded-xl px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="maximizeGdp">Maximize GDP</option>
              <option value="minimizeUnemployment">Minimize Unemployment</option>
              <option value="minimizeInequality">Minimize Inequality</option>
            </select>
            <button onClick={runOptimize} disabled={loading}
              className="w-full py-2.5 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/20 text-violet-300 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              <Sparkles className="w-4 h-4" /> AI Optimize
            </button>
            {optimizedPolicy && (
              <div className="mt-3 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <p className="text-xs text-violet-400 font-semibold mb-2">Suggested Policy</p>
                <p className="text-xs text-slate-400">Income Tax: <span className="text-white">{(optimizedPolicy.incomeTaxRate * 100).toFixed(0)}%</span></p>
                <p className="text-xs text-slate-400">Corp Tax: <span className="text-white">{(optimizedPolicy.corporateTaxRate * 100).toFixed(0)}%</span></p>
                <button onClick={applyOptimized} className="mt-2 w-full py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-500 transition-colors">
                  Apply Suggestion
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/5 space-y-3">
          <button onClick={runSimulation} disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
            <Zap className="w-4 h-4" />
            {loading ? 'Simulating…' : 'Run Simulation'}
          </button>
          <button onClick={reset} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2">
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
        </div>
      </div>

      {/* Right Panel — Results */}
      <div className="flex-1 overflow-y-auto p-8">
        {!results ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-blue-600/10 flex items-center justify-center mb-6">
              <Activity className="w-10 h-10 text-blue-400 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Configure & Simulate</h3>
            <p className="text-slate-500 max-w-sm text-center leading-relaxed">
              Adjust the policy parameters on the left and click <strong className="text-slate-400">Run Simulation</strong> to model economic consequences over 10 years.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Simulation Results</h2>
              <p className="text-slate-500 text-sm">10-year Monte Carlo projection · 10 simulation runs</p>
            </div>

            {/* Stats */}
            {lastYear && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Final GDP', val: `$${lastYear.gdp.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, color: 'blue' },
                  { title: 'Unemployment', val: `${(lastYear.unemploymentRate * 100).toFixed(1)}%`, icon: Users, color: 'red' },
                  { title: 'Median Income', val: `$${lastYear.medianIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'emerald' },
                  { title: 'Gini Index', val: lastYear.giniIndex.toFixed(3), icon: Activity, color: 'violet' },
                ].map((s) => (
                  <div key={s.title} className="bg-slate-900 border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-slate-500 text-xs uppercase tracking-widest">{s.title}</p>
                      <s.icon className={`w-4 h-4 text-${s.color}-400`} />
                    </div>
                    <p className="text-2xl font-bold text-white">{s.val}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Chart */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold">Economic Trends</h3>
                <div className="flex gap-2">
                  {(['gdp', 'unemployment', 'income'] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>
                      {chartConfig[tab].label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results}>
                    <defs>
                      <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={cc.color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={cc.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="year" stroke="#475569" tickMargin={10} tick={{ fontSize: 12 }} />
                    <YAxis stroke="#475569" tickFormatter={cc.formatter} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                      labelStyle={{ color: '#94a3b8' }}
                      itemStyle={{ color: cc.color }}
                      formatter={(v) => cc.formatter(v as number)}
                    />
                    <Area type="monotone" dataKey={cc.key} stroke={cc.color} strokeWidth={2.5} fill="url(#colorGrad)" dot={false} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Insight */}
            {insight && (
              <div className="bg-gradient-to-br from-violet-900/20 to-slate-900 border border-violet-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <h3 className="text-white font-semibold text-sm">AI-Generated Insight</h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{insight}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
