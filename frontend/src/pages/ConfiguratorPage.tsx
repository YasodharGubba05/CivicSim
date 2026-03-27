import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { usePolicyStore, PRESETS, type ConfidenceBandPoint, type EconomicMetrics } from '../store/policyStore';
import {
  Zap, RotateCcw, TrendingUp, Users, DollarSign, Activity,
  Sparkles, BookmarkPlus, BookmarkX, ChevronDown, ChevronUp, ArrowUp, ArrowDown,
  Menu, X,
} from 'lucide-react';
import { apiFetch, API } from '../lib/apiClient';

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(v: number, tab: 'gdp' | 'unemployment' | 'income') {
  if (tab === 'gdp') return `$${(v / 1000).toFixed(0)}k`;
  if (tab === 'unemployment') return `${(v * 100).toFixed(1)}%`;
  return `$${v.toFixed(0)}`;
}

function DiffBadge({ current, baseline, higherIsBetter = true }: { current: number; baseline: number; higherIsBetter?: boolean }) {
  if (baseline === 0) return null;
  const delta = ((current - baseline) / Math.abs(baseline)) * 100;
  const positive = higherIsBetter ? delta > 0 : delta < 0;
  const color = positive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10';
  const Icon = delta > 0 ? ArrowUp : ArrowDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-md ml-2 ${color}`}>
      <Icon className="w-2.5 h-2.5" />{Math.abs(delta).toFixed(1)}%
    </span>
  );
}

// ── Slider Field ─────────────────────────────────────────────────────────

function SliderField({ label, value, min, max, step, format, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-sm font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
      />
      <div className="flex justify-between text-xs text-slate-600 mt-1">
        <span>{format(min)}</span><span>{format(max)}</span>
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────

function StatCard({ title, current, baseline, format, icon: Icon, color, higherIsBetter }: {
  title: string; current: number; baseline?: number;
  format: (v: number) => string; icon: any; color: string; higherIsBetter?: boolean;
}) {
  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-500 text-xs uppercase tracking-widest">{title}</p>
        <Icon className={`w-4 h-4 text-${color}-400`} />
      </div>
      <div className="flex items-baseline flex-wrap gap-1">
        <p className="text-2xl font-bold text-white">{format(current)}</p>
        {baseline !== undefined && (
          <DiffBadge current={current} baseline={baseline} higherIsBetter={higherIsBetter} />
        )}
      </div>
      {baseline !== undefined && (
        <p className="text-xs text-slate-600 mt-1">Baseline: {format(baseline)}</p>
      )}
    </div>
  );
}

// ── Chart with confidence band ────────────────────────────────────────────

function SimChart({
  results, confidenceBand, baselineResults, activeTab, onTabChange,
}: {
  results: EconomicMetrics[];
  confidenceBand: ConfidenceBandPoint[];
  baselineResults: EconomicMetrics[];
  activeTab: 'gdp' | 'unemployment' | 'income';
  onTabChange: (t: 'gdp' | 'unemployment' | 'income') => void;
}) {
  const tabConfig = {
    gdp:          { color: '#3b82f6', meanKey: 'gdpMean',          minKey: 'gdpMin',          maxKey: 'gdpMax',          label: 'GDP' },
    unemployment: { color: '#ef4444', meanKey: 'unemploymentMean', minKey: 'unemploymentMin', maxKey: 'unemploymentMax', label: 'Unemployment %' },
    income:       { color: '#10b981', meanKey: 'incomeMean',       minKey: 'incomeMin',       maxKey: 'incomeMax',       label: 'Median Income' },
  };
  const tc = tabConfig[activeTab];

  // Merge mean results with band data for the chart
  const chartData = confidenceBand.map((b, i) => ({
    year: b.year,
    [tc.meanKey]: (results[i] as any)?.[activeTab === 'gdp' ? 'gdp' : activeTab === 'unemployment' ? 'unemploymentRate' : 'medianIncome'],
    [tc.minKey]:  (b as any)[tc.minKey],
    [tc.maxKey]:  (b as any)[tc.maxKey],
    baseline:     baselineResults[i] ? (baselineResults[i] as any)[activeTab === 'gdp' ? 'gdp' : activeTab === 'unemployment' ? 'unemploymentRate' : 'medianIncome'] : undefined,
  }));

  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold">Economic Trends</h3>
          {confidenceBand.length > 0 && (
            <p className="text-slate-500 text-xs mt-0.5">Shaded band = 10-run Monte Carlo range</p>
          )}
        </div>
        <div className="flex gap-2">
          {(['gdp', 'unemployment', 'income'] as const).map((tab) => (
            <button key={tab} onClick={() => onTabChange(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>
              {tabConfig[tab].label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={tc.color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={tc.color} stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="meanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={tc.color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={tc.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis dataKey="year" stroke="#475569" tickMargin={10} tick={{ fontSize: 12 }} />
            <YAxis stroke="#475569" tickFormatter={(v) => fmt(v, activeTab)} tick={{ fontSize: 12 }} width={60} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(v: any, name: any) => {
                const n = name as string;
                const labels: Record<string, string> = {
                  [tc.maxKey]: 'Max (CI)', [tc.minKey]: 'Min (CI)',
                  [tc.meanKey]: 'Mean', baseline: 'Baseline',
                };
                return [fmt(v, activeTab), labels[n] ?? n];
              }}
            />
            {/* Confidence band */}
            <Area type="monotone" dataKey={tc.maxKey} stroke="none" fill="url(#bandGrad)" strokeWidth={0} dot={false} legendType="none" />
            <Area type="monotone" dataKey={tc.minKey} stroke="none" fill="white" fillOpacity={0.04} strokeWidth={0} dot={false} legendType="none" />
            {/* Mean line */}
            <Area type="monotone" dataKey={tc.meanKey} stroke={tc.color} strokeWidth={2.5} fill="url(#meanGrad)" dot={false} activeDot={{ r: 5 }} />
            {/* Baseline overlay */}
            {baselineResults.length > 0 && (
              <Area type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 4" fill="none" dot={false} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {baselineResults.length > 0 && (
        <div className="mt-3 flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 rounded-full inline-block" style={{ background: tc.color }} /> Current</span>
          <span className="flex items-center gap-1.5"><span className="w-6 border-t border-dashed border-slate-400 inline-block" /> Baseline</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-3 rounded-sm inline-block opacity-30" style={{ background: tc.color }} /> Confidence band</span>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function ConfiguratorPage() {
  const {
    incomeTaxRate, corporateTaxRate, minimumWage, universalBasicIncome, subsidyPolicies,
    setPolicy, reset, setResults: persistResults, applyPreset,
    baselineResults, baselinePolicies,
    saveBaseline, clearBaseline,
  } = usePolicyStore();

  const [results, setResults] = useState<EconomicMetrics[] | null>(null);
  const [band, setBand] = useState<ConfidenceBandPoint[]>([]);
  const [insight, setInsight] = useState<string | null>(null);
  const [optimizedPolicy, setOptimizedPolicy] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [simName, setSimName] = useState('');
  const [optimizeGoal, setOptimizeGoal] = useState<'maximizeGdp' | 'minimizeUnemployment' | 'minimizeInequality'>('maximizeGdp');
  const [activeTab, setActiveTab] = useState<'gdp' | 'unemployment' | 'income'>('gdp');
  const [showPresets, setShowPresets] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    setInsight(null);
    setOptimizedPolicy(null);
    try {
      const res = await apiFetch(`${API}/simulation/run`, {
        method: 'POST',
        body: JSON.stringify({ name: simName || undefined, incomeTaxRate, corporateTaxRate, minimumWage, universalBasicIncome, subsidyPolicies }),
      });
      const data = await res.json();
      if (data.success && data.results) {
        setResults(data.results);
        setBand(data.confidenceBand ?? []);
        persistResults(data.results, data.id ?? 'local_' + Date.now(), data.confidenceBand ?? []);

        // Auto-fetch insights
        const insightRes = await apiFetch(`${API}/insights/generate`, {
          method: 'POST',
          body: JSON.stringify({ metrics: data.results }),
        });
        const insightData = await insightRes.json();
        if (insightData.success) setInsight(insightData.insight);
      }
    } catch {
      setErrorMessage('Could not connect to the backend. Make sure it is running on port 3000.');
    } finally {
      setLoading(false);
    }
  };

  const runOptimize = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API}/optimization/run`, {
        method: 'POST',
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
      setErrorMessage('Optimization failed. Please check the backend connection.');
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
  const baselineLastYear = baselineResults.length > 0 ? baselineResults[baselineResults.length - 1] : null;
  const hasBaseline = baselineResults.length > 0;

  return (
    <div className="flex h-screen relative">
      {/* ── Mobile Hamburger ── */}
      <button
        onClick={() => setSidebarOpen((o) => !o)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-colors"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* ── Mobile Overlay ── */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Left Panel ──────────────────────────────────────────────────── */}
      <div className={`
        w-80 bg-slate-900 border-r border-white/5 flex flex-col overflow-y-auto flex-shrink-0
        fixed md:relative top-0 left-0 h-full z-40
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white mb-1">Policy Configuration</h2>
          <p className="text-slate-500 text-xs">Adjust parameters and run a Monte Carlo simulation</p>
        </div>

        <div className="flex-1 p-6 space-y-7">
          {/* ── Preset Library ── */}
          <div>
            <button onClick={() => setShowPresets((p) => !p)}
              className="flex items-center justify-between w-full text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">
              <span>Scenario Presets</span>
              {showPresets ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showPresets && (
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <button key={key} onClick={() => applyPreset(preset.policies)}
                    className="flex items-center gap-3 p-3 bg-slate-800/60 hover:bg-slate-700/60 border border-white/5 hover:border-blue-500/30 rounded-xl text-left transition-all group">
                    <span className="text-xl">{preset.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-slate-200 text-sm font-medium group-hover:text-white">{preset.label}</p>
                      <p className="text-slate-500 text-xs truncate">{preset.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Tax ── */}
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-4">Taxation</p>
            <div className="space-y-6">
              <SliderField label="Income Tax Rate" value={incomeTaxRate} min={0} max={0.8} step={0.01}
                format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => setPolicy('incomeTaxRate', v)} />
              <SliderField label="Corporate Tax Rate" value={corporateTaxRate} min={0} max={0.5} step={0.01}
                format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => setPolicy('corporateTaxRate', v)} />
            </div>
          </div>

          {/* ── Welfare ── */}
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

          {/* ── AI Optimizer ── */}
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-4">Policy Optimizer</p>
            <select value={optimizeGoal} onChange={(e) => setOptimizeGoal(e.target.value as any)}
              className="w-full bg-slate-800 border border-white/10 text-slate-300 text-sm rounded-xl px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
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

        {/* ── Actions ── */}
        <div className="p-6 border-t border-white/5 space-y-3">
          {/* Run Name Input */}
          <div>
            <input
              type="text"
              value={simName}
              onChange={(e) => setSimName(e.target.value)}
              placeholder="Simulation name (optional)"
              className="w-full bg-slate-800 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-600"
            />
          </div>
          <button onClick={runSimulation} disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
            <Zap className="w-4 h-4" />
            {loading ? 'Simulating…' : 'Run Simulation'}
          </button>
          {results && !hasBaseline && (
            <button onClick={saveBaseline}
              className="w-full py-2.5 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/20 text-emerald-400 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2">
              <BookmarkPlus className="w-4 h-4" /> Save as Baseline
            </button>
          )}
          {hasBaseline && (
            <button onClick={clearBaseline}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-500 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2">
              <BookmarkX className="w-4 h-4" /> Clear Baseline
            </button>
          )}
          <button onClick={reset} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2">
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-8 md:ml-0 page-enter">
        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between">
            <p className="text-red-400 text-sm">{errorMessage}</p>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-300 ml-4">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {!results ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-blue-600/10 flex items-center justify-center mb-6">
              <Activity className="w-10 h-10 text-blue-400 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Configure & Simulate</h3>
            <p className="text-slate-500 max-w-sm text-center leading-relaxed">
              Pick a <strong className="text-slate-400">preset</strong> or adjust sliders, then click{' '}
              <strong className="text-slate-400">Run Simulation</strong> to model economic consequences over 10 years with Monte Carlo uncertainty bands.
            </p>
          </div>
        ) : (
          <div className="space-y-6 max-w-5xl">
            {/* Header + baseline notice */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Simulation Results</h2>
                <p className="text-slate-500 text-sm">10-year Monte Carlo projection · 10 simulation runs</p>
              </div>
              {hasBaseline && baselinePolicies && (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg">
                    <BookmarkPlus className="w-3 h-3" /> Comparing vs. Baseline
                  </span>
                </div>
              )}
            </div>

            {/* Stat Cards */}
            {lastYear && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Final GDP" current={lastYear.gdp} baseline={baselineLastYear?.gdp}
                  format={(v) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  icon={DollarSign} color="blue" higherIsBetter />
                <StatCard title="Unemployment" current={lastYear.unemploymentRate} baseline={baselineLastYear?.unemploymentRate}
                  format={(v) => `${(v * 100).toFixed(1)}%`}
                  icon={Users} color="red" higherIsBetter={false} />
                <StatCard title="Median Income" current={lastYear.medianIncome} baseline={baselineLastYear?.medianIncome}
                  format={(v) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  icon={TrendingUp} color="emerald" higherIsBetter />
                <StatCard title="Gini Index" current={lastYear.giniIndex} baseline={baselineLastYear?.giniIndex}
                  format={(v) => v.toFixed(3)}
                  icon={Activity} color="violet" higherIsBetter={false} />
              </div>
            )}

            {/* Chart */}
            <SimChart
              results={results}
              confidenceBand={band}
              baselineResults={baselineResults}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Baseline policy compare */}
            {hasBaseline && baselinePolicies && (
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 text-sm">Policy Comparison</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {([
                    ['Income Tax', `${(baselinePolicies.incomeTaxRate * 100).toFixed(0)}%`, `${(incomeTaxRate * 100).toFixed(0)}%`],
                    ['Corp Tax', `${(baselinePolicies.corporateTaxRate * 100).toFixed(0)}%`, `${(corporateTaxRate * 100).toFixed(0)}%`],
                    ['Min Wage', `$${baselinePolicies.minimumWage}/hr`, `$${minimumWage}/hr`],
                    ['UBI', `$${baselinePolicies.universalBasicIncome.toLocaleString()}/yr`, `$${universalBasicIncome.toLocaleString()}/yr`],
                  ] as [string, string, string][]).map(([label, base, curr]) => (
                    <div key={label} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-white/5">
                      <span className="text-slate-400">{label}</span>
                      <div className="flex gap-3">
                        <span className="text-slate-500 line-through">{base}</span>
                        <span className="text-white font-medium">{curr}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
