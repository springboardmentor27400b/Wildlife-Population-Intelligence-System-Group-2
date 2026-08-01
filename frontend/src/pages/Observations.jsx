import { useEffect, useState, useMemo } from 'react';
import {
    Search,
    RefreshCw,
    Plus,
    Eye,
    Trash2,
    CheckCircle2,
    X,
    Loader2
} from 'lucide-react';
import { api } from '../services/api';

export default function ObservationsPage() {
    const [observations, setObservations] = useState([]);
    const [sites, setSites] = useState([]);
    const [speciesList, setSpeciesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecies, setSelectedSpecies] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedDate, setSelectedDate] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    // View & Add Modal state
    const [viewItem, setViewItem] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [form, setForm] = useState({ species_id: '', site_id: '', observation_date: '', count: 1 });
    const [actionMsg, setActionMsg] = useState('');

    const loadData = async () => {
        setRefreshing(true);
        try {
            const [obsRes, sitesRes, specRes] = await Promise.all([
                api.get('/observations', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
                api.get('/monitoring-site', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).catch(() => ({ data: [] })),
                api.get('/species', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).catch(() => ({ data: [] })),
            ]);
            setObservations(obsRes.data || []);
            setSites(sitesRes.data || []);
            setSpeciesList(specRes.data || []);
        } catch (err) {
            console.error('Failed to load observations', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Delete Observation handler
    const handleDelete = async (id) => {
        if (!window.confirm(`Are you sure you want to delete observation #${id}?`)) return;
        try {
            await api.delete(`/observations/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setActionMsg(`Observation #${id} deleted successfully.`);
            loadData();
        } catch (err) {
            setActionMsg(err.response?.data?.detail || 'Failed to delete observation.');
        }
    };

    // Submit Add Observation
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/observations', {
                species_id: Number(form.species_id),
                site_id: Number(form.site_id),
                observation_date: form.observation_date,
                count: Number(form.count),
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setShowAddModal(false);
            setForm({ species_id: '', site_id: '', observation_date: '', count: 1 });
            setActionMsg('New observation recorded.');
            loadData();
        } catch (err) {
            setActionMsg(err.response?.data?.detail || 'Failed to create observation.');
        }
    };

    // Multi-field search & filtering
    const filteredRows = useMemo(() => {
        return observations.filter((row) => {
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !query ||
                (row.species_name && row.species_name.toLowerCase().includes(query)) ||
                (row.site_name && row.site_name.toLowerCase().includes(query)) ||
                (row.observer_name && row.observer_name.toLowerCase().includes(query)) ||
                (row.scientific_name && row.scientific_name.toLowerCase().includes(query));

            const matchesSpecies = selectedSpecies === 'ALL' || row.species_name === selectedSpecies;
            const matchesStatus = selectedStatus === 'ALL' || row.status === selectedStatus;
            const matchesDate = !selectedDate || row.observation_date === selectedDate;

            return matchesSearch && matchesSpecies && matchesStatus && matchesDate;
        });
    }, [observations, searchQuery, selectedSpecies, selectedStatus, selectedDate]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
    const paginatedRows = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredRows.slice(start, start + pageSize);
    }, [filteredRows, currentPage, pageSize]);

    // Unique species and status options for filters
    const uniqueSpecies = useMemo(() => Array.from(new Set(observations.map((o) => o.species_name).filter(Boolean))), [observations]);
    const uniqueStatuses = useMemo(() => Array.from(new Set(observations.map((o) => o.status).filter(Boolean))), [observations]);

    return (
        <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header Title Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                        Observations
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500">
                        Field observation records, species sightings, and sampling telemetry from your monitoring network.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        type="button"
                        onClick={loadData}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-900/20 hover:bg-emerald-500 transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Observation</span>
                    </button>
                </div>
            </div>

            {actionMsg && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-medium text-emerald-800">
                    <span>{actionMsg}</span>
                    <button type="button" onClick={() => setActionMsg('')} className="text-emerald-600 hover:text-emerald-900">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Search & Filters Controls Bar */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                {/* Search Box */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search species, site, observer..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                </div>

                {/* Species Filter */}
                <div>
                    <select
                        value={selectedSpecies}
                        onChange={(e) => {
                            setSelectedSpecies(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    >
                        <option value="ALL">All Species</option>
                        {uniqueSpecies.map((sp) => (
                            <option key={sp} value={sp}>{sp}</option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div>
                    <select
                        value={selectedStatus}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    >
                        <option value="ALL">All Statuses</option>
                        {uniqueStatuses.map((st) => (
                            <option key={st} value={st}>{st}</option>
                        ))}
                    </select>
                </div>

                {/* Date Filter */}
                <div>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                </div>
            </div>

            {/* Observation Table Container */}
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur border-b border-slate-200/80 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="px-4 py-3.5">ID</th>
                                <th className="px-4 py-3.5">Species</th>
                                <th className="px-4 py-3.5">Scientific Name</th>
                                <th className="px-4 py-3.5">Site</th>
                                <th className="px-4 py-3.5">Latitude</th>
                                <th className="px-4 py-3.5">Longitude</th>
                                <th className="px-4 py-3.5">Date</th>
                                <th className="px-4 py-3.5">Observer</th>
                                <th className="px-4 py-3.5 text-center">Count</th>
                                <th className="px-4 py-3.5 text-center">Confidence</th>
                                <th className="px-4 py-3.5">Status</th>
                                <th className="px-4 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={12} className="px-4 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                                            <span>Loading observations from database...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedRows.length > 0 ? (
                                paginatedRows.map((item) => (
                                    <tr key={item.id} className="even:bg-slate-50/40 odd:bg-white hover:bg-slate-100/70 transition-colors">
                                        <td className="px-4 py-3.5 font-bold text-slate-900">#{item.id}</td>
                                        <td className="px-4 py-3.5 font-semibold text-slate-800">{item.species_name}</td>
                                        <td className="px-4 py-3.5 italic text-slate-600">{item.scientific_name || 'Unknown'}</td>
                                        <td className="px-4 py-3.5 text-slate-700 font-medium">{item.site_name}</td>
                                        <td className="px-4 py-3.5 text-slate-500 font-mono">{item.latitude !== null ? item.latitude : '—'}</td>
                                        <td className="px-4 py-3.5 text-slate-500 font-mono">{item.longitude !== null ? item.longitude : '—'}</td>
                                        <td className="px-4 py-3.5 text-slate-700">{item.observation_date}</td>
                                        <td className="px-4 py-3.5 text-slate-700">{item.observer_name || 'Field Researcher'}</td>
                                        <td className="px-4 py-3.5 text-center font-bold text-emerald-700">{item.count}</td>
                                        <td className="px-4 py-3.5 text-center font-medium text-slate-700">
                                            {item.confidence ? `${(item.confidence * 100).toFixed(0)}%` : '95%'}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                                                <CheckCircle2 className="h-3 w-3" /> {item.status || 'Verified'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setViewItem(item)}
                                                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                                                    title="Delete Observation"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={12} className="px-4 py-8 text-center text-slate-400">
                                        No observation records found matching query filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/60 px-4 py-3 text-xs text-slate-600">
                        <div>
                            Showing <span className="font-semibold text-slate-800">{paginatedRows.length}</span> of <span className="font-semibold text-slate-800">{filteredRows.length}</span> records
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-colors"
                            >
                                Previous
                            </button>
                            <span className="font-medium text-slate-700">Page {currentPage} of {totalPages}</span>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Modal */}
            {viewItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 border border-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-900">Observation #{viewItem.id} Details</h3>
                            <button type="button" onClick={() => setViewItem(null)} className="rounded-lg p-1 text-slate-400 hover:text-slate-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="rounded-xl bg-slate-50 p-3">
                                <span className="text-slate-500 font-medium">Species:</span>
                                <p className="font-bold text-slate-900 text-sm mt-0.5">{viewItem.species_name}</p>
                                <p className="italic text-slate-600">{viewItem.scientific_name}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                                <span className="text-slate-500 font-medium">Site:</span>
                                <p className="font-bold text-slate-900 text-sm mt-0.5">{viewItem.site_name}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                                <span className="text-slate-500 font-medium">Date Recorded:</span>
                                <p className="font-semibold text-slate-800 mt-0.5">{viewItem.observation_date}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                                <span className="text-slate-500 font-medium">Animal Count:</span>
                                <p className="font-bold text-emerald-700 text-sm mt-0.5">{viewItem.count} Individuals</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                                <span className="text-slate-500 font-medium">Coordinates:</span>
                                <p className="font-mono text-slate-700 mt-0.5">{viewItem.latitude}, {viewItem.longitude}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                                <span className="text-slate-500 font-medium">Observer:</span>
                                <p className="font-semibold text-slate-800 mt-0.5">{viewItem.observer_name || 'Field Researcher'}</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setViewItem(null)}
                                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Observation Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 border border-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-900">Record Field Observation</h3>
                            <button type="button" onClick={() => setShowAddModal(false)} className="rounded-lg p-1 text-slate-400 hover:text-slate-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 mb-1 block">Monitoring Site</label>
                                <select
                                    required
                                    value={form.site_id}
                                    onChange={(e) => setForm({ ...form, site_id: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                >
                                    <option value="">Select site</option>
                                    {sites.map((s) => (
                                        <option key={s.id} value={s.id}>{s.site_name} ({s.habitat})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 mb-1 block">Species</label>
                                <select
                                    required
                                    value={form.species_id}
                                    onChange={(e) => setForm({ ...form, species_id: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                >
                                    <option value="">Select species</option>
                                    {speciesList.map((sp) => (
                                        <option key={sp.id} value={sp.id}>{sp.common_name} ({sp.scientific_name})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 mb-1 block">Observation Date</label>
                                <input
                                    required
                                    type="date"
                                    value={form.observation_date}
                                    onChange={(e) => setForm({ ...form, observation_date: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 mb-1 block">Animal Count</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={form.count}
                                    onChange={(e) => setForm({ ...form, count: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                                >
                                    Save Observation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
