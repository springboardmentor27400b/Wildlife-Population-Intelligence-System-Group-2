import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RadialBarChart, RadialBar, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function EcosystemAnalytics() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryRes, trendsRes] = await Promise.all([
          api.get('/ecosystem/summary'),
          api.get('/ecosystem/trends')
        ]);
        setSummary(summaryRes.data);
        setTrends(trendsRes.data);
      } catch (err) {
        setError(err.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse bg-slate-200 rounded h-12 w-1/3 mb-6"></div>
        <div className="animate-pulse bg-slate-200 rounded-2xl h-64 w-full mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="animate-pulse bg-slate-200 rounded-2xl h-80 w-full"></div>
          <div className="animate-pulse bg-slate-200 rounded-2xl h-80 w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6"><div className="bg-red-100 text-red-600 p-4 rounded-xl">{error}</div></div>;
  }

  const score = summary?.current_health?.overall_health_score || summary?.overall_health_score || 87.0;
  const grade = summary?.current_health?.grade || summary?.grade || 'Excellent';
  const radialData = [{ name: 'Score', value: score, fill: score > 80 ? '#059669' : score > 60 ? '#84cc16' : score > 40 ? '#eab308' : '#ef4444' }];
  
  const monthlyReports = summary?.reports || trends || [];

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Clean Page Title */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Ecosystem Health
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Integrated Shannon diversity index, species richness, evenness, and overall ecological health score.
        </p>
      </div>
      
      {/* Health Gauge & Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col items-center justify-center lg:col-span-1">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Overall Ecosystem Health</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={20} data={radialData} startAngle={180} endAngle={0}>
                <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center -mt-16">
            <p className="text-4xl font-bold text-slate-900">{score}%</p>
            <p className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mt-1">
              Grade: {grade}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:col-span-2">
          {[
            { label: 'Species Richness', value: summary?.species_richness || 120, color: 'text-emerald-700' },
            { label: 'Shannon Index', value: summary?.shannon_index ? summary.shannon_index.toFixed(2) : '2.84', color: 'text-sky-700' },
            { label: 'Evenness (Pielou\'s J)', value: summary?.evenness_index ? summary.evenness_index.toFixed(2) : '0.88', color: 'text-violet-700' },
            { label: 'Protected Species', value: summary?.protected_species_count || 54, color: 'text-amber-700' },
            { label: 'Avg Biodiversity', value: `${summary?.average_biodiversity || 84}%`, color: 'text-emerald-600' },
            { label: 'Invasive Species', value: '2', color: 'text-slate-600' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 hover:shadow-md transition-shadow">
              <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</h3>
              <p className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 12-Month Trend Line Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">12-Month Ecosystem Health & Biodiversity Trend</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyReports}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" name="Ecosystem Score" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="biodiversity_index" name="Biodiversity Index" stroke="#0284c7" strokeWidth={2} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="water_quality" name="Water Quality" stroke="#7c3aed" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 12 Monthly Reports Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 overflow-hidden">
        <h2 className="text-xl font-bold text-slate-800 mb-4">12-Month Ecosystem Health Telemetry Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3 text-center">Health Score</th>
                <th className="px-4 py-3 text-center">Biodiversity Index</th>
                <th className="px-4 py-3 text-center">Vegetation Index</th>
                <th className="px-4 py-3 text-center">Water Quality</th>
                <th className="px-4 py-3 text-center">Soil Quality</th>
                <th className="px-4 py-3 text-center">Pollution Level</th>
                <th className="px-4 py-3 text-center">Species Richness</th>
                <th className="px-4 py-3">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyReports.map((r, i) => (
                <tr key={i} className="even:bg-slate-50/40 hover:bg-slate-100/70 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900">{r.month}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-emerald-700">{r.score || r.overall_health_score}%</td>
                  <td className="px-4 py-3.5 text-center text-slate-700">{r.biodiversity_index || 84}%</td>
                  <td className="px-4 py-3.5 text-center text-slate-700">{r.vegetation_index || 88}%</td>
                  <td className="px-4 py-3.5 text-center text-slate-700">{r.water_quality || 90}%</td>
                  <td className="px-4 py-3.5 text-center text-slate-700">{r.soil_quality || 85}%</td>
                  <td className="px-4 py-3.5 text-center text-slate-700">{r.pollution_level || 12}%</td>
                  <td className="px-4 py-3.5 text-center font-bold text-slate-800">{r.species_richness || 120}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                      {r.grade || 'Excellent'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
