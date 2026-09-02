import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MainDashboard from './pages/MainDashboard';
import SpeciesRecognition from './pages/SpeciesRecognition';
import AudioRecognition from './pages/AudioRecognition';
import Biodiversity from './pages/Biodiversity';
import Reports from './pages/Reports';
import DatasetPage from './pages/DatasetPage';
import PopulationIntelligence from './pages/PopulationIntelligence';
import HabitatIntelligence from './pages/HabitatIntelligence';
import Conservation from './pages/Conservation';
import EcosystemAnalytics from './pages/EcosystemAnalytics';
import IntelligenceDashboard from './pages/IntelligenceDashboard';
import AIWorkspace from './pages/AIWorkspace';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import GISMap from './pages/GISMap';
import Predictions from './pages/Predictions';
import SystemHealth from './pages/SystemHealth';
import ObservationsPage from './pages/Observations';
import NotFoundPage from './pages/NotFoundPage';
import { ToastProvider } from './components/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/SidebarNav';
import { api } from './services/api';

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');
    const isValidToken = token && token !== 'null' && token !== 'undefined' && token.trim() !== '';
    return isValidToken ? children : <Navigate to="/login" replace />;
}

function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/login', form);
            localStorage.setItem('token', response.data.access_token);
            setMessage('Login successful');
            navigate('/');
        } catch (error) {
            let errorMsg = 'Backend server connection error. Please ensure the backend API service is running and accessible.';
            if (error.response?.data?.detail) {
                errorMsg = error.response.data.detail;
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.message && !error.message.includes('500')) {
                errorMsg = `Connection failed: ${error.message}`;
            }
            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_55%,_#e2e8f0)] p-6">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-200">
                <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">Protected monitoring workspace</div>
                <h1 className="mt-4 text-2xl font-semibold">Welcome back</h1>
                <p className="mt-2 text-slate-600">Access wildlife monitoring workflows, records, and media uploads.</p>
                <form className="mt-6 space-y-4" onSubmit={submit}>
                    <input className="w-full rounded-xl border border-slate-200 p-3 outline-none" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <input className="w-full rounded-xl border border-slate-200 p-3 outline-none" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    <button className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
                </form>
                <p className="mt-4 text-sm text-slate-600">No account yet? <Link className="font-semibold text-emerald-700" to="/register">Register</Link></p>
                {message && <p className="mt-4 text-sm text-emerald-700">{message}</p>}
            </div>
        </div>
    );
}

function RegisterPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'wildlife_researcher' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/register', form);
            localStorage.setItem('token', response.data.access_token);
            setMessage('Registration successful');
            navigate('/');
        } catch (error) {
            setMessage(error.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#f8fafc_55%,_#e2e8f0)] p-6">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-200">
                <h1 className="text-2xl font-semibold">Create account</h1>
                <p className="mt-2 text-slate-600">Join the monitoring network and start capturing evidence.</p>
                <form className="mt-6 space-y-4" onSubmit={submit}>
                    <input className="w-full rounded-xl border border-slate-200 p-3" placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                    <input className="w-full rounded-xl border border-slate-200 p-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <input className="w-full rounded-xl border border-slate-200 p-3" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    <select className="w-full rounded-xl border border-slate-200 p-3" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                        <option value="wildlife_researcher">Wildlife Researcher</option>
                        <option value="forest_officer">Forest Officer</option>
                        <option value="conservation_officer">Conservation Officer</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white disabled:opacity-60" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Register'}</button>
                </form>
                {message && <p className="mt-4 text-sm text-emerald-700">{message}</p>}
            </div>
        </div>
    );
}

function DashboardPage() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get('/dashboard')
            .then((response) => setStats(response.data.summary))
            .catch(() => setStats(null));
    }, []);

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-emerald-700 to-emerald-900 p-8 text-white shadow-xl">
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-100">Live conservation overview</p>
                <h2 className="mt-3 text-3xl font-semibold">Track protected species, surveys, and evidence in one place.</h2>
                <p className="mt-3 max-w-2xl text-emerald-50">Use this workspace to capture field observations, review sampling sites, and upload image and audio evidence for each survey.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats ? Object.entries(stats).map(([key, value]) => (
                    <div key={key} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <div className="text-sm uppercase tracking-wide text-slate-500">{key.replace('_', ' ')}</div>
                        <div className="mt-2 text-3xl font-semibold text-slate-800">{value}</div>
                    </div>
                )) : <div className="md:col-span-2 xl:col-span-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">Loading dashboard…</div>}
            </div>
        </div>
    );
}

function SitesPage() {
    const [sites, setSites] = useState([]);
    const [form, setForm] = useState({ site_name: '', latitude: '', longitude: '', habitat: '', country: '' });
    const [message, setMessage] = useState('');

    const load = async () => {
        const response = await api.get('/monitoring-site', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setSites(response.data);
    };

    const submit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/monitoring-site', form, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setMessage('Monitoring site created');
            setForm({ site_name: '', latitude: '', longitude: '', habitat: '', country: '' });
            load();
        } catch (error) {
            setMessage(error.response?.data?.detail || 'Failed to create site');
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-xl font-semibold">Create monitoring site</h2>
                <form className="mt-4 space-y-3" onSubmit={submit}>
                    <input className="w-full rounded-xl border border-slate-200 p-3" placeholder="Site Name" value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} />
                    <input className="w-full rounded-xl border border-slate-200 p-3" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
                    <input className="w-full rounded-xl border border-slate-200 p-3" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
                    <input className="w-full rounded-xl border border-slate-200 p-3" placeholder="Habitat" value={form.habitat} onChange={(e) => setForm({ ...form, habitat: e.target.value })} />
                    <input className="w-full rounded-xl border border-slate-200 p-3" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                    <button className="rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white" type="submit">Save site</button>
                </form>
                {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-xl font-semibold">Monitoring sites</h2>
                <div className="mt-4 space-y-3">{sites.map((site) => <div key={site.id} className="rounded-xl border border-slate-200 p-3">{site.site_name} • {site.country} • {site.habitat}</div>)}</div>
            </div>
        </div>
    );
}

function SurveysPage() {
    const [surveys, setSurveys] = useState([]);
    const [sites, setSites] = useState([]);
    const [form, setForm] = useState({ site_id: '', survey_date: '', device: '', remarks: '' });
    const [message, setMessage] = useState('');
    const [uploadSurveyId, setUploadSurveyId] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState('');

    const load = async () => {
        const response = await api.get('/survey', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setSurveys(response.data);
    };

    const loadSites = async () => {
        const response = await api.get('/monitoring-site', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setSites(response.data);
    };

    const submit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/survey', { ...form, site_id: Number(form.site_id) }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setMessage('Survey created');
            setForm({ site_id: '', survey_date: '', device: '', remarks: '' });
            load();
        } catch (error) {
            setMessage(error.response?.data?.detail || 'Failed to create survey');
        }
    };

    const uploadMedia = async (kind) => {
        const file = kind === 'image' ? imageFile : audioFile;
        if (!file || !uploadSurveyId) {
            setUploadMessage('Choose a survey and media file first.');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        try {
            await api.post(`/upload/${kind}?survey_id=${uploadSurveyId}`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setUploadMessage(`${kind === 'image' ? 'Image' : 'Audio'} uploaded successfully.`);
            setImageFile(null);
            setAudioFile(null);
        } catch (error) {
            setUploadMessage(error.response?.data?.detail || 'Upload failed');
        }
    };

    useEffect(() => {
        load();
        loadSites();
    }, []);

    return (
        <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-xl font-semibold">Create survey</h2>
                <form className="mt-4 space-y-3" onSubmit={submit}>
                    <select className="w-full rounded-xl border border-slate-200 p-3" value={form.site_id} onChange={(e) => setForm({ ...form, site_id: e.target.value })}>
                        <option value="">Select a monitoring site</option>
                        {sites.map((site) => <option key={site.id} value={site.id}>{site.site_name}</option>)}
                    </select>
                    <input className="w-full rounded-xl border border-slate-200 p-3" type="date" value={form.survey_date} onChange={(e) => setForm({ ...form, survey_date: e.target.value })} />
                    <input className="w-full rounded-xl border border-slate-200 p-3" placeholder="Device" value={form.device} onChange={(e) => setForm({ ...form, device: e.target.value })} />
                    <textarea className="w-full rounded-xl border border-slate-200 p-3" placeholder="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
                    <button className="rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white" type="submit">Save survey</button>
                </form>
                {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}
            </div>
            <div className="space-y-6">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <h2 className="text-xl font-semibold">Upload media</h2>
                    <div className="mt-4 space-y-3">
                        <select className="w-full rounded-xl border border-slate-200 p-3" value={uploadSurveyId} onChange={(e) => setUploadSurveyId(e.target.value)}>
                            <option value="">Select survey</option>
                            {surveys.map((survey) => <option key={survey.id} value={survey.id}>Survey #{survey.id}</option>)}
                        </select>
                        <input className="w-full rounded-xl border border-slate-200 p-3" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                        <button className="w-full rounded-xl bg-amber-600 px-4 py-3 font-semibold text-white" type="button" onClick={() => uploadMedia('image')}>Upload image</button>
                        <input className="w-full rounded-xl border border-slate-200 p-3" type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
                        <button className="w-full rounded-xl bg-sky-700 px-4 py-3 font-semibold text-white" type="button" onClick={() => uploadMedia('audio')}>Upload audio</button>
                        {uploadMessage && <p className="text-sm text-emerald-700">{uploadMessage}</p>}
                    </div>
                </div>
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <h2 className="text-xl font-semibold">Recent surveys</h2>
                    <div className="mt-4 space-y-3">{surveys.map((survey) => <div key={survey.id} className="rounded-xl border border-slate-200 p-3">Survey #{survey.id} • {survey.device || 'Camera Trap'} • {survey.remarks || 'Field observation'}</div>)}</div>
                </div>
            </div>
        </div>
    );
}

function SpeciesPage() {
    const [species, setSpecies] = useState([]);

    useEffect(() => {
        api.get('/species', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then((response) => setSpecies(response.data))
            .catch(() => setSpecies([]));
    }, []);

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold">Species catalog</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
                {species.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                        <div className="font-semibold text-slate-800">{item.common_name}</div>
                        <div className="text-sm text-slate-600">{item.scientific_name}</div>
                        <div className="mt-2 text-xs uppercase tracking-wide text-emerald-700">{item.category} • {item.iucn_status}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProfilePage() {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        api.get('/profile', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then((response) => setProfile(response.data))
            .catch(() => setProfile(null));
    }, []);

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold">Profile</h2>
            {profile ? (
                <div className="mt-4 space-y-2">
                    <p className="font-semibold text-slate-800">{profile.full_name}</p>
                    <p>{profile.email}</p>
                    <p className="text-sm text-slate-600">{profile.role}</p>
                </div>
            ) : (
                <p>Loading profile…</p>
            )}
        </div>
    );
}

function SampleDataPage() {
    const [stats, setStats] = useState(null);
    const [species, setSpecies] = useState([]);
    const [observations, setObservations] = useState([]);

    useEffect(() => {
        api.get('/dashboard').then((response) => setStats(response.data.summary)).catch(() => setStats(null));
        api.get('/species').then((response) => setSpecies(response.data)).catch(() => setSpecies([]));
        api.get('/observations').then((response) => setObservations(response.data)).catch(() => setObservations([]));
    }, []);

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-xl font-semibold">Seeded sample data</h2>
                <p className="mt-2 text-slate-600">This page shows the currently seeded records retrieved from the API.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {stats ? Object.entries(stats).map(([key, value]) => (
                    <div key={key} className="rounded-2xl bg-emerald-50 p-5 text-slate-800 shadow-sm ring-1 ring-slate-200">
                        <div className="text-xs uppercase tracking-wide text-emerald-700">{key.replace('_', ' ')}</div>
                        <div className="mt-3 text-3xl font-semibold">{value}</div>
                    </div>
                )) : (
                    <div className="md:col-span-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">Loading summary…</div>
                )}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <h3 className="text-lg font-semibold">Species sample</h3>
                    <div className="mt-4 space-y-3">
                        {species.length === 0 ? (
                            <p className="text-slate-500">Loading species…</p>
                        ) : species.map((item) => (
                            <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                                <div className="font-semibold text-slate-800">{item.common_name}</div>
                                <div className="text-sm text-slate-600">{item.scientific_name}</div>
                                <div className="mt-2 text-xs uppercase tracking-wide text-emerald-700">{item.category} • {item.iucn_status}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <h3 className="text-lg font-semibold">Observation sample</h3>
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Species</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Site</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Count</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {observations.length === 0 ? (
                                    <tr><td colSpan="4" className="px-4 py-5 text-slate-500">Loading observations…</td></tr>
                                ) : observations.map((item) => (
                                    <tr key={item.id} className="even:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-700">{item.species_name}</td>
                                        <td className="px-4 py-3 text-slate-700">{item.site_name}</td>
                                        <td className="px-4 py-3 text-slate-700">{item.observation_date}</td>
                                        <td className="px-4 py-3 text-slate-700">{item.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Page({ element }) {
    return (
        <ProtectedRoute>
            <Layout>
                {element}
            </Layout>
        </ProtectedRoute>
    );
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<Page element={<MainDashboard />} />} />
            <Route path="/sites" element={<Page element={<SitesPage />} />} />
            <Route path="/surveys" element={<Page element={<SurveysPage />} />} />
            <Route path="/observations" element={<Page element={<ObservationsPage />} />} />
            <Route path="/reports" element={<Page element={<Reports />} />} />
            <Route path="/datasets" element={<Page element={<DatasetPage />} />} />
            <Route path="/dataset" element={<Page element={<DatasetPage />} />} />
            <Route path="/sample-data" element={<Page element={<SampleDataPage />} />} />
            <Route path="/profile" element={<Page element={<ProfilePage />} />} />
            <Route path="/ai" element={<Page element={<IntelligenceDashboard />} />} />
            <Route path="/intelligence" element={<Page element={<IntelligenceDashboard />} />} />
            <Route path="/executive-dashboard" element={<Page element={<ExecutiveDashboard />} />} />
            <Route path="/gis" element={<Page element={<GISMap />} />} />
            <Route path="/predictions" element={<Page element={<Predictions />} />} />
            <Route path="/system-health" element={<Page element={<SystemHealth />} />} />
            <Route path="/species" element={<Page element={<SpeciesRecognition />} />} />
            <Route path="/audio" element={<Page element={<AudioRecognition />} />} />
            <Route path="/biodiversity" element={<Page element={<Biodiversity />} />} />
            <Route path="/population" element={<Page element={<PopulationIntelligence />} />} />
            <Route path="/habitat" element={<Page element={<HabitatIntelligence />} />} />
            <Route path="/conservation" element={<Page element={<Conservation />} />} />
            <Route path="/ecosystem" element={<Page element={<EcosystemAnalytics />} />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
