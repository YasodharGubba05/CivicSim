import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Users, DollarSign, TrendingUp, SlidersHorizontal } from 'lucide-react';
import { usePolicyStore } from './store/policyStore';

function App() {
  const [loading, setLoading] = useState(false);
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const { incomeTaxRate, corporateTaxRate, minimumWage, universalBasicIncome, setPolicy } = usePolicyStore();

  const runSimulation = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/simulation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            // Send policy params if the backend supported dynamic configs
            incomeTaxRate,
            corporateTaxRate,
            minimumWage,
            universalBasicIncome
        })
      });
      const data = await response.json();
      if (data.success && data.results) {
        setSimulationData(data.results);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Policy Builder */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Activity /> PolicySim
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center gap-2 mb-6 text-slate-800 font-semibold">
             <SlidersHorizontal className="w-5 h-5" />
             Policy Configuration
          </div>

          <div className="space-y-6">
            <div>
              <label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                Income Tax Rate <span>{(incomeTaxRate * 100).toFixed(0)}%</span>
              </label>
              <input 
                 type="range" min="0" max="0.8" step="0.05"
                 value={incomeTaxRate}
                 onChange={(e) => setPolicy('incomeTaxRate', parseFloat(e.target.value))}
                 className="w-full accent-blue-600"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                Corporate Tax Rate <span>{(corporateTaxRate * 100).toFixed(0)}%</span>
              </label>
              <input 
                 type="range" min="0" max="0.5" step="0.05"
                 value={corporateTaxRate}
                 onChange={(e) => setPolicy('corporateTaxRate', parseFloat(e.target.value))}
                 className="w-full accent-blue-600"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                Minimum Wage <span>${minimumWage}/hr</span>
              </label>
              <input 
                 type="range" min="0" max="50" step="1"
                 value={minimumWage}
                 onChange={(e) => setPolicy('minimumWage', parseFloat(e.target.value))}
                 className="w-full accent-blue-600"
              />
            </div>
            
            <div>
              <label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                Universal Basic Income <span>${universalBasicIncome.toLocaleString()}/yr</span>
              </label>
              <input 
                 type="range" min="0" max="50000" step="1000"
                 value={universalBasicIncome}
                 onChange={(e) => setPolicy('universalBasicIncome', parseFloat(e.target.value))}
                 className="w-full accent-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100">
           <button 
            onClick={runSimulation}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg shadow-sm transition-colors flex justify-center items-center gap-2"
          >
            {loading ? 'Running Simulation...' : 'Run Simulation'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Simulation Outcomes</h1>
            <p className="text-slate-500">Macroeconomic indicators over 10-year Monte Carlo run.</p>
        </div>

        {simulationData.length > 0 ? (
          <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { title: "Final GDP", val: "$" + simulationData[simulationData.length - 1].gdp.toLocaleString(undefined, { maximumFractionDigits: 0 }), icon: <DollarSign className="text-emerald-500" /> },
                  { title: "Final Unemployment", val: (simulationData[simulationData.length - 1].unemploymentRate * 100).toFixed(1) + "%", icon: <Users className="text-blue-500" /> },
                  { title: "Median Income", val: "$" + simulationData[simulationData.length - 1].medianIncome.toLocaleString(undefined, { maximumFractionDigits: 0 }), icon: <TrendingUp className="text-yellow-500" /> },
                  { title: "Gini Index", val: simulationData[simulationData.length - 1].giniIndex.toFixed(3), icon: <Activity className="text-purple-500" /> },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                     <div>
                       <p className="text-sm text-slate-500 font-medium mb-1">{stat.title}</p>
                       <p className="text-2xl font-bold text-slate-900">{stat.val}</p>
                     </div>
                     <div className="p-3 bg-slate-50 rounded-full">
                       {stat.icon}
                     </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* GDP Chart */}
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <h3 className="text-lg font-bold text-slate-800 mb-6">GDP Over Time</h3>
                   <div className="h-72">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={simulationData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="year" stroke="#64748b" tickMargin={10} />
                          <YAxis stroke="#64748b" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Line type="monotone" dataKey="gdp" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                     </ResponsiveContainer>
                   </div>
                 </div>

                 {/* Unemployment Chart */}
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <h3 className="text-lg font-bold text-slate-800 mb-6">Unemployment Rate %</h3>
                   <div className="h-72">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={simulationData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="year" stroke="#64748b" tickMargin={10} />
                          <YAxis stroke="#64748b" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Line type="monotone" dataKey="unemploymentRate" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
              </div>
          </div>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
             <Activity className="w-12 h-12 text-blue-300 mb-4 animate-pulse" />
             <h3 className="text-xl font-medium text-slate-700 mb-2">Awaiting Scenario Settings</h3>
             <p className="text-slate-500 max-w-sm text-center">Configure the policy variables in the sidebar to simulate the economic consequences.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
