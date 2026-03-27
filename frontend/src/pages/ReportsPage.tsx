import { useState } from 'react';
import { usePolicyStore } from '../store/policyStore';
import { FileText, Download, Copy, Check, ClipboardList } from 'lucide-react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const S = {
  card:    { background: '#111113', border: '1px solid #27272a', borderRadius: 10 } as React.CSSProperties,
  label:   { fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#52525b' } as React.CSSProperties,
  value:   { fontSize: 22, fontWeight: 700, color: '#fafafa', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' } as React.CSSProperties,
};

export default function ReportsPage() {
  const { simulationResults, simulationsCount, incomeTaxRate, corporateTaxRate, minimumWage, universalBasicIncome, subsidyPolicies } = usePolicyStore();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const lastYear = simulationResults.length > 0 ? simulationResults[simulationResults.length - 1] : null;
  const hasResults = simulationResults.length > 0;

  const policies: Record<string, string> = {
    'Income Tax Rate':     `${(incomeTaxRate * 100).toFixed(0)}%`,
    'Corporate Tax Rate':  `${(corporateTaxRate * 100).toFixed(0)}%`,
    'Minimum Wage':        `$${minimumWage}/hr`,
    'UBI':                 `$${universalBasicIncome.toLocaleString()}/yr`,
    'Subsidy Level':       `$${subsidyPolicies.toLocaleString()}`,
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
- **Gini Index**: ${lastYear.giniIndex.toFixed(3)}` : '## Results\nNo simulation data yet.'}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify({ policies, results: simulationResults, generated: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `civicsim-report-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-enter" style={{ maxWidth: 860, margin: '0 auto', padding: '44px 32px' }}>

      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, color: '#10b981', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>Reports</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.025em', margin: 0 }}>Simulation Reports</h1>
          <p style={{ fontSize: 14, color: '#71717a', marginTop: 6 }}>Export and share your policy simulation results.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={copyMarkdown}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#18181b', border: '1px solid #27272a', borderRadius: 8, color: '#a1a1aa', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#3f3f46'; (e.currentTarget as HTMLElement).style.color = '#fafafa'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#27272a'; (e.currentTarget as HTMLElement).style.color = '#a1a1aa'; }}
          >
            {copied ? <Check style={{ width: 13, height: 13, color: '#10b981' }} /> : <Copy style={{ width: 13, height: 13 }} />}
            {copied ? 'Copied!' : 'Copy markdown'}
          </button>
          <button
            onClick={downloadJson}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#10b981', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'filter 0.15s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.filter = 'none')}
          >
            <Download style={{ width: 13, height: 13 }} /> Export JSON
          </button>
        </div>
      </div>

      <div style={{ height: 1, background: '#27272a', marginBottom: 28 }} />

      {/* Stats */}
      {hasResults && lastYear && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ ...S.label, marginBottom: 12 }}>Overview</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Final GDP',       val: `$${lastYear.gdp.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
              { label: 'Unemployment',    val: `${(lastYear.unemploymentRate * 100).toFixed(1)}%` },
              { label: 'Median Income',   val: `$${lastYear.medianIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
              { label: 'Simulations',     val: simulationsCount.toString() },
            ].map((s) => (
              <div key={s.label} style={{ ...S.card, padding: '18px 20px' }}>
                <p style={{ ...S.label, marginBottom: 8 }}>{s.label}</p>
                <p style={S.value}>{s.val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multi-metric Chart */}
      {hasResults && (
        <div style={{ ...S.card, padding: '20px 20px 16px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: '#fafafa' }}>Economic Overview</p>
            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {[
                { color: '#10b981', label: 'GDP' },
                { color: '#f59e0b', label: 'Unemployment %' },
                { color: '#a78bfa', label: 'Gini Index' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: 11, color: '#71717a' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={simulationResults} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gdpFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis
                  dataKey="year"
                  stroke="#3f3f46"
                  tick={{ fontSize: 10.5, fill: '#52525b' }}
                />
                {/* Left Y-axis: GDP */}
                <YAxis
                  yAxisId="gdp"
                  orientation="left"
                  stroke="#3f3f46"
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10.5, fill: '#52525b' }}
                  width={52}
                />
                {/* Right Y-axis: Rates */}
                <YAxis
                  yAxisId="rate"
                  orientation="right"
                  stroke="#3f3f46"
                  tickFormatter={(v) => v.toFixed(2)}
                  tick={{ fontSize: 10.5, fill: '#52525b' }}
                  width={42}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#a1a1aa', fontWeight: 600, marginBottom: 4 }}
                  formatter={(value, name) => {
                    const v = typeof value === 'number' ? value : parseFloat(String(value));
                    if (name === 'gdp') return [`$${(v / 1000).toFixed(1)}k`, 'GDP'];
                    if (name === 'unemploymentRate') return [`${(v * 100).toFixed(1)}%`, 'Unemployment'];
                    if (name === 'giniIndex') return [v.toFixed(3), 'Gini Index'];
                    return [value, name];
                  }}
                />
                <Area
                  yAxisId="gdp"
                  type="monotone"
                  dataKey="gdp"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  fill="url(#gdpFill)"
                  dot={false}
                  activeDot={{ r: 3, fill: '#10b981' }}
                />
                <Line
                  yAxisId="rate"
                  type="monotone"
                  dataKey="unemploymentRate"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, fill: '#f59e0b' }}
                />
                <Line
                  yAxisId="rate"
                  type="monotone"
                  dataKey="giniIndex"
                  stroke="#a78bfa"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, fill: '#a78bfa' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Report Card */}
      <div style={{ ...S.card, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1f1f23', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: '#18181b', border: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText style={{ width: 14, height: 14, color: '#10b981' }} />
          </div>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: '#fafafa' }}>Economic Policy Simulation Report</p>
            <p style={{ fontSize: 11, color: '#52525b' }}>Generated: {new Date().toLocaleString()}</p>
          </div>
        </div>

        <div style={{ padding: 20 }}>
          <p style={{ ...S.label, marginBottom: 12 }}>Policy Parameters</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {Object.entries(policies).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#18181b', border: '1px solid #27272a', borderRadius: 8 }}>
                <span style={{ fontSize: 13, color: '#71717a' }}>{key}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fafafa', fontVariantNumeric: 'tabular-nums' }}>{val}</span>
              </div>
            ))}
          </div>

          {!hasResults && (
            <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <ClipboardList style={{ width: 15, height: 15, color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#f59e0b', marginBottom: 3 }}>No simulation data yet</p>
                <p style={{ fontSize: 12.5, color: '#71717a' }}>
                  Go to the <button onClick={() => navigate('/configurator')} style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}>Configurator</button>, run a simulation, then come back to export results.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
