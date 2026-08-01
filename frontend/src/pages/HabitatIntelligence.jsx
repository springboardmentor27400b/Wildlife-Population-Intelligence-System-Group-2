import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function LeafletMap({ habitats }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        const loadMap = () => {
            if (!mapRef.current || mapInstance.current) return;
            const L = window.L;
            if (!L) return;

            const map = L.map(mapRef.current).setView([-2.5, 34.5], 4);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);
            mapInstance.current = map;

            if (habitats && habitats.length > 0) {
                const bounds = [];
                habitats.forEach(h => {
                    const lat = h.latitude || -2.33;
                    const lng = h.longitude || 34.83;
                    bounds.push([lat, lng]);

                    const popupContent = `
                        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 160px;">
                            <strong style="font-size: 14px; color: #0f172a;">${h.habitat_name}</strong><br/>
                            <span style="font-size: 12px; color: #475569;">Region: ${h.region || h.location || 'Sanctuary'}</span><br/>
                            <span style="font-size: 12px; color: #059669; font-weight: 600;">Monitored Species: ${h.species_count || 12}</span><br/>
                            <span style="font-size: 12px; color: #0284c7; font-weight: 600;">Quality Score: ${h.quality_score}%</span><br/>
                            <div style="margin-top: 4px;">
                                <span style="font-size: 10px; text-transform: uppercase; padding: 2px 6px; border-radius: 9999px; background-color: ${h.risk_level === 'Low' ? '#dcfce7' : h.risk_level === 'Medium' ? '#fef3c7' : '#fee2e2'}; color: ${h.risk_level === 'Low' ? '#15803d' : h.risk_level === 'Medium' ? '#b45309' : '#b91c1c'}; font-weight: 700;">
                                    ${h.risk_level} Risk
                                </span>
                            </div>
                        </div>
                    `;
                    L.marker([lat, lng]).addTo(map).bindPopup(popupContent);
                });

                if (bounds.length > 0) {
                    map.fitBounds(bounds, { padding: [30, 30] });
                }
            }
        };

        if (!window.L) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);

            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => loadMap();
            document.head.appendChild(script);
        } else {
            loadMap();
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [habitats]);

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Habitat Location & Risk Telemetry Map</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Interactive OpenStreetMap markers displaying real-time GPS locations and habitat metrics.</p>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Live GPS Telemetry
                </span>
            </div>
            <div ref={mapRef} className="h-96 w-full rounded-xl overflow-hidden border border-slate-200 z-0" />
        </div>
    );
}

export default function HabitatIntelligence() {
  const [summary, setSummary] = useState(null);
  const [riskData, setRiskData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryRes, riskRes] = await Promise.all([
          api.get('/habitat/summary'),
          api.get('/habitat/risk')
        ]);
        setSummary(summaryRes.data);
        setRiskData(riskRes.data);
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-slate-200 rounded-2xl h-32 w-full"></div>)}
        </div>
        <div className="animate-pulse bg-slate-200 rounded-2xl h-96 w-full"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6"><div className="bg-red-100 text-red-600 p-4 rounded-xl">{error}</div></div>;
  }

  const PIE_COLORS = { 'Low': '#059669', 'Medium': '#d97706', 'High': '#ea580c', 'Critical': '#dc2626' };
  
  const riskDistribution = [
    { name: 'Low', value: summary?.healthy_count || 0 },
    { name: 'Medium', value: summary?.habitats?.filter(h => h.risk_level === 'Medium').length || 0 },
    { name: 'High', value: summary?.at_risk_count || 0 },
    { name: 'Critical', value: summary?.critical_count || 0 }
  ];

  const habitatsList = summary?.habitats || summary?.analyses || [];

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Clean Page Title */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Habitat Intelligence
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Assess ecosystem suitability, environmental indicators, and risk categories for monitoring zones.
        </p>
      </div>
      
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Habitats', value: summary?.total_habitats || habitatsList.length, color: 'text-slate-800' },
          { label: 'Healthy', value: summary?.healthy_count, color: 'text-emerald-600' },
          { label: 'At Risk', value: summary?.at_risk_count, color: 'text-amber-600' },
          { label: 'Critical', value: summary?.critical_count, color: 'text-red-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value || 0}</p>
          </div>
        ))}
      </div>

      {/* Leaflet GPS Telemetry Map */}
      <LeafletMap habitats={habitatsList} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Risk Level Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || '#059669'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Habitat Quality Scores</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitatsList}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="habitat_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quality_score" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Habitat Environmental Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 overflow-hidden">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Habitat Environmental Telemetry Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Habitat Name</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3 text-center">Quality Score</th>
                <th className="px-4 py-3 text-center">Water Availability</th>
                <th className="px-4 py-3 text-center">Vegetation Density</th>
                <th className="px-4 py-3 text-center">Temperature</th>
                <th className="px-4 py-3 text-center">Human Disturbance</th>
                <th className="px-4 py-3">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {habitatsList.map((h, i) => (
                <tr key={i} className="even:bg-slate-50/40 hover:bg-slate-100/70 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900">{h.habitat_name}</td>
                  <td className="px-4 py-3.5 text-slate-600">{h.region || h.location}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-emerald-700">{h.quality_score}%</td>
                  <td className="px-4 py-3.5 text-center text-slate-700">{h.water_availability}%</td>
                  <td className="px-4 py-3.5 text-center text-slate-700">{h.vegetation_density}%</td>
                  <td className="px-4 py-3.5 text-center text-slate-700">{h.temperature}°C</td>
                  <td className="px-4 py-3.5 text-center text-slate-700">{h.human_disturbance}%</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      h.risk_level === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                      h.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      h.risk_level === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {h.risk_level} Risk
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
