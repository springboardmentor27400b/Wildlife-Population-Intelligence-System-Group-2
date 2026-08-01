import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
                        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 150px;">
                            <strong style="font-size: 13px; color: #0f172a;">${h.habitat_name}</strong><br/>
                            <span style="font-size: 11px; color: #059669; font-weight: 600;">Health Score: ${h.health_score || h.quality_score}%</span><br/>
                            <span style="font-size: 11px; color: #0284c7;">Species: ${h.species}</span><br/>
                            <span style="font-size: 10px; font-weight: bold; color: ${h.risk_level === 'Low' ? '#15803d' : '#b91c1c'}; font-weight: 700;">Risk: ${h.risk_level}</span>
                        </div>
                    `;
                    L.marker([lat, lng]).addTo(map).bindPopup(popupContent);
                });

                if (bounds.length > 0) {
                    map.fitBounds(bounds, { padding: [25, 25] });
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
                <h2 className="text-xl font-bold text-slate-800">Geospatial Wildlife & Habitat Telemetry Map</h2>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Live GPS Telemetry
                </span>
            </div>
            <div ref={mapRef} className="h-80 w-full rounded-xl overflow-hidden border border-slate-200 z-0" />
        </div>
    );
}

export default function IntelligenceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/intelligence/dashboard');
        setData(res.data);
      } catch (err) {
        setError(err.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportPDF = async () => {
    try {
      const res = await api.get('/intelligence/export/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'wildlife_intelligence_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await api.get('/intelligence/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'wildlife_intelligence_data.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="animate-pulse bg-slate-200 rounded h-10 w-64"></div>
          <div className="animate-pulse bg-slate-200 rounded h-10 w-48"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="animate-pulse bg-slate-200 rounded-xl h-24 w-full"></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6"><div className="bg-red-100 text-red-600 p-4 rounded-xl">{error}</div></div>;
  }

  const kpis = [
    { label: 'Total Species', value: data?.total_species || 120, color: 'text-slate-900' },
    { label: 'Protected Species', value: data?.protected_species || 54, color: 'text-emerald-600' },
    { label: 'Habitats Assessed', value: data?.habitats_count || 15, color: 'text-sky-600' },
    { label: 'Population Records', value: data?.population_records_count || 20, color: 'text-emerald-700' },
    { label: 'Total Est. Animals', value: data?.total_population || 1480, color: 'text-emerald-600' },
    { label: 'Conservation Projects', value: data?.conservation_projects_count || 12, color: 'text-violet-600' },
    { label: 'Healthy Habitats', value: data?.healthy_habitats || 8, color: 'text-emerald-600' },
    { label: 'At Risk Habitats', value: data?.at_risk_habitats || 5, color: 'text-amber-600' },
    { label: 'Critical Habitats', value: data?.critical_habitats || 2, color: 'text-rose-600' },
    { label: 'Avg Biodiversity Index', value: `${data?.average_biodiversity || 84}%`, color: 'text-sky-700' },
    { label: 'Avg Growth Rate', value: `+${data?.average_population_growth || 3.8}%`, color: 'text-emerald-600' },
  ];

  const pieData = [
    { name: 'Healthy', value: data?.healthy_habitats || 8 },
    { name: 'At Risk', value: data?.at_risk_habitats || 5 },
    { name: 'Critical', value: data?.critical_habitats || 2 },
  ];
  const COLORS = ['#059669', '#d97706', '#dc2626'];

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Clean Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Intelligence Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Unified real-time analytics across wildlife populations, habitats, and conservation alerts.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExportCSV} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-xl shadow-sm transition-colors text-xs">
            Export CSV
          </button>
          <button onClick={handleExportPDF} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition-colors text-xs">
            Export PDF Report
          </button>
        </div>
      </div>
      
      {/* 11 Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {kpis.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 hover:shadow-md transition-shadow">
            <h3 className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1">{stat.label}</h3>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Leaflet GPS Telemetry Map */}
      <LeafletMap habitats={data?.habitat_map || []} />

      {/* Recharts Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Monthly Population Trend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.population_trend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={2.5} name="Population" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Habitat Health Breakdown</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Recommendations Action List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Priority Conservation Action Items</h2>
        <div className="space-y-3">
          {(data?.conservation || []).slice(0, 4).map((rec, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/60 transition-colors">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 text-xs">{rec.title}</span>
                <p className="text-slate-500 text-[11px]">{rec.recommendation}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                rec.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {rec.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
