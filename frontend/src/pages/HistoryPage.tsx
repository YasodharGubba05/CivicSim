import { useState, useEffect } from 'react';
import { Clock, ChevronRight, TrendingUp, Users, Activity, BarChart3 } from 'lucide-react';

const API = 'http://localhost:3000';

interface HistoryRun {
  id: string;
  createdAt: string;
  policies?: {
    incomeTaxRate: number;
    corporateTaxRate: number;
    minimumWage: number;
    subsidyPolicies: number;
    universalBasicIncome: number;
  };
  meanMetrics?: Array<{
    year: number;
    gdp: number;
    unemploymentRate: number;
    medianIncome: number;
    giniIndex: number;
  }>;
}

export default function HistoryPage() {
  const [runs, setRuns] = useState<HistoryRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/simulation/history`);
      const data = await res.json();
      if (data.success) setRuns(data.runs);
    } catch {
      // Backend may not be running or Firestore not configured
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto page-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Simulation History</h1>
        <p className="text-slate-400">Review past simulation runs and their results.</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="shimmer h-20 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && runs.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center mb-6">
            <Clock className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No simulation history yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Run a simulation from the Configurator and your results will appear here.
            Make sure the backend is running and Firestore is configured.
          </p>
        </div>
      )}

      {/* Run List */}
      {!loading && runs.length > 0 && (
        <div className="space-y-3">
          {runs.map((run) => {
            const lastYear = run.meanMetrics?.[run.meanMetrics.length - 1];
            const isExpanded = expandedId === run.id;

            return (
              <div
                key={run.id}
                className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-blue-500/20"
              >
                {/* Row Header */}
                <button
                  onClick={() => toggle(run.id)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      Simulation Run
                    </p>
                    <p className="text-slate-500 text-xs">
                      {new Date(run.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  {lastYear && (
                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-slate-600">GDP</p>
                        <p className="text-sm font-semibold text-white">${(lastYear.gdp / 1000).toFixed(0)}k</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-slate-600">Unemp.</p>
                        <p className="text-sm font-semibold text-white">{(lastYear.unemploymentRate * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  )}

                  <ChevronRight
                    className={`w-4 h-4 text-slate-500 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                    {/* Policy Config */}
                    {run.policies && (
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">Policy Configuration</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            ['Income Tax', `${(run.policies.incomeTaxRate * 100).toFixed(0)}%`],
                            ['Corp Tax', `${(run.policies.corporateTaxRate * 100).toFixed(0)}%`],
                            ['Min Wage', `$${run.policies.minimumWage}/hr`],
                            ['UBI', `$${run.policies.universalBasicIncome.toLocaleString()}/yr`],
                            ['Subsidy', `$${run.policies.subsidyPolicies.toLocaleString()}`],
                          ].map(([k, v]) => (
                            <div key={k} className="bg-slate-800/50 rounded-lg px-3 py-2 border border-white/5">
                              <p className="text-[10px] uppercase text-slate-500">{k}</p>
                              <p className="text-sm font-medium text-white">{v}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Final Year Results */}
                    {lastYear && (
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">Final Year Results (Year {lastYear.year})</p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          {[
                            { label: 'GDP', value: `$${lastYear.gdp.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'blue' },
                            { label: 'Unemployment', value: `${(lastYear.unemploymentRate * 100).toFixed(1)}%`, icon: Users, color: 'red' },
                            { label: 'Median Income', value: `$${lastYear.medianIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: Activity, color: 'emerald' },
                            { label: 'Gini Index', value: lastYear.giniIndex.toFixed(3), icon: BarChart3, color: 'violet' },
                          ].map((s) => (
                            <div key={s.label} className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
                              <p className="text-lg font-bold text-white">{s.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
