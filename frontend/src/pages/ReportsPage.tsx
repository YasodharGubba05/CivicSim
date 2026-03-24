import { useState } from 'react';
import { usePolicyStore } from '../store/policyStore';
import { FileText, Download, Copy, Check, ClipboardList, Activity, TrendingUp, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function ReportsPage() {
  const { simulationResults, simulationsCount, incomeTaxRate, corporateTaxRate, minimumWage, universalBasicIncome, subsidyPolicies } = usePolicyStore();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const lastYear = simulationResults.length > 0 ? simulationResults[simulationResults.length - 1] : null;
  const hasResults = simulationResults.length > 0;

  const policies = {
    'Income Tax Rate': `${(incomeTaxRate * 100).toFixed(0)}%`,
    'Corporate Tax Rate': `${(corporateTaxRate * 100).toFixed(0)}%`,
    'Minimum Wage': `$${minimumWage}/hr`,
    'Universal Basic Income': `$${universalBasicIncome.toLocaleString()}/yr`,
    'Subsidy Level': `$${subsidyPolicies.toLocaleString()}`,
  };

  const copyMarkdown = () => {
    const md = `# Economic Policy Simulation Report
**Generated:** ${new Date().toLocaleString()}
**Simulations Run:** ${simulationsCount}

## Policy Parameters
${Object.entries(policies).map(([k, v]) => `- **${k}**: ${v}`).join('\n')}

${hasResults && lastYear ? `## Final Year Results (Year ${lastYear.year})
- **GDP**: $${lastYear.gdp.toLocaleString(undefined, { maximumFractionDigits: 0 })}
- **Unemployment**: ${(lastYear.unemploymentRate * 100).toFixed(1)}%
- **Median Income**: $${lastYear.medianIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
- **Gini Index**: ${lastYear.giniIndex.toFixed(3)}` : '## Results\nNo simulation data yet. Run a simulation from the Configurator page.'}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify({ policies, results: simulationResults, generated: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civicsim-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto page-enter">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
          <p className="text-slate-400">Export and share your policy simulation results.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={copyMarkdown}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-300 text-sm font-medium rounded-xl transition-all">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Markdown'}
          </button>
          <button onClick={downloadJson}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all">
            <Download className="w-4 h-4" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Stat summary - only if results exist */}
      {hasResults && lastYear && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Final GDP', val: `$${lastYear.gdp.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'blue' },
            { label: 'Unemployment', val: `${(lastYear.unemploymentRate * 100).toFixed(1)}%`, icon: Users, color: 'red' },
            { label: 'Median Income', val: `$${lastYear.medianIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: Activity, color: 'emerald' },
            { label: 'Simulations Run', val: simulationsCount.toString(), icon: FileText, color: 'violet' },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900 border border-white/5 rounded-2xl p-5">
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">{s.label}</p>
              <p className="text-2xl font-bold text-white">{s.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* GDP mini chart */}
      {hasResults && (
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">GDP Trajectory</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulationResults}>
                <defs>
                  <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#475569" tick={{ fontSize: 11 }} />
                <YAxis stroke="#475569" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="gdp" stroke="#3b82f6" strokeWidth={2} fill="url(#reportGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Report Card */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Economic Policy Simulation Report</h2>
            <p className="text-slate-500 text-xs">Generated: {new Date().toLocaleString()}</p>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-slate-400 text-xs uppercase tracking-widest mb-4">Policy Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {Object.entries(policies).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/5">
                <span className="text-slate-400 text-sm">{key}</span>
                <span className="text-white font-semibold text-sm">{val}</span>
              </div>
            ))}
          </div>

          {!hasResults && (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-3">
              <ClipboardList className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-400 text-sm font-medium mb-1">Simulation Results Pending</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Go to the{' '}
                  <button onClick={() => navigate('/configurator')} className="text-blue-400 underline">Configurator</button>
                  , run a simulation, then come back to export full results.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
