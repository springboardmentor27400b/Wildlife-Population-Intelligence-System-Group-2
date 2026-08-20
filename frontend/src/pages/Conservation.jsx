import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Conservation() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [filterPriority, setFilterPriority] = useState('All');
  
  const [form, setForm] = useState({ species: '', habitat: '', trigger: '' });

  useEffect(() => {
    fetchRecs();
  }, []);

  const fetchRecs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/conservation/recommendations');
      setRecommendations(res.data);
    } catch (err) {
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      setGenerating(true);
      await api.post('/conservation/generate', form);
      await fetchRecs();
      setForm({ species: '', habitat: '', trigger: '' });
    } catch (err) {
      setError(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const filteredRecs = filterPriority === 'All' ? recommendations : recommendations.filter(r => r.priority === filterPriority);

  if (loading && recommendations.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse bg-slate-200 rounded h-12 w-1/3 mb-6"></div>
        <div className="animate-pulse bg-slate-200 rounded-2xl h-32 w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-slate-200 rounded-2xl h-48 w-full"></div>)}
        </div>
      </div>
    );
  }

  const priorityColors = {
    'Critical': 'bg-red-100 text-red-700 border-red-200',
    'High': 'bg-orange-100 text-orange-700 border-orange-200',
    'Medium': 'bg-amber-100 text-amber-700 border-amber-200',
    'Low': 'bg-sky-100 text-sky-700 border-sky-200'
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Clean Page Title */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Conservation Recommendations
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Automated priority recommendations for habitat protection, anti-poaching, and species monitoring.
        </p>
      </div>

      {error && <div className="bg-red-100 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

      {/* Generator Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 bg-gradient-to-br from-emerald-50/50 via-white to-white">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Generate AI Recommendation Plan</h2>
        <form onSubmit={handleGenerate} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Species</label>
            <input required type="text" className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" value={form.species} onChange={e => setForm({...form, species: e.target.value})} placeholder="e.g. African Elephant" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Habitat Zone</label>
            <input required type="text" className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" value={form.habitat} onChange={e => setForm({...form, habitat: e.target.value})} placeholder="e.g. Savanna North" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Trigger Event</label>
            <select required className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" value={form.trigger} onChange={e => setForm({...form, trigger: e.target.value})}>
              <option value="">Select Trigger...</option>
              <option value="Population Drop">Population Drop (-5%)</option>
              <option value="Habitat Degradation">Habitat Degradation</option>
              <option value="Poaching Alert">Poaching Threat Alert</option>
              <option value="Climate Shift">Climate & Water Stress</option>
            </select>
          </div>
          <button disabled={generating} type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-6 rounded-xl text-xs transition-colors min-w-[140px] shadow-sm">
            {generating ? 'Generating...' : 'Generate Action Plan'}
          </button>
        </form>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">Active Action Plans ({filteredRecs.length})</h2>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {['All', 'Critical', 'High', 'Medium', 'Low'].map(p => (
            <button key={p} onClick={() => setFilterPriority(p)} className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${filterPriority === p ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRecs.map((rec, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${priorityColors[rec.priority] || priorityColors['Medium']}`}>
                  {rec.priority} Priority
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{rec.category}</span>
              </div>
              
              <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{rec.title}</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-3">{rec.recommendation}</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs">
              <div>
                <span className="font-bold text-slate-700">Threat: </span>
                <span className="text-slate-600">{rec.main_threat || rec.reason}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Expected Impact: </span>
                <span className="text-emerald-700 font-medium">{rec.expected_impact}</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap gap-1.5">
                {rec.species && <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">{rec.species}</span>}
                {rec.habitat && <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">{rec.habitat}</span>}
              </div>
              <span className="font-bold text-slate-800">${(rec.estimated_cost || 50000).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Conservation Projects Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 overflow-hidden">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Conservation Project Management Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Project Title</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Assigned Team</th>
                <th className="px-4 py-3 text-center">Estimated Cost</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecs.map((r, i) => (
                <tr key={i} className="even:bg-slate-50/40 hover:bg-slate-100/70 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900">{r.title}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${priorityColors[r.priority] || priorityColors['Medium']}`}>
                      {r.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">{r.assigned_team || 'Alpha Patrol'}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-slate-800">${(r.estimated_cost || 50000).toLocaleString()}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {r.completion_status || 'In Progress'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-600">{r.deadline || '2026-12-31'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
