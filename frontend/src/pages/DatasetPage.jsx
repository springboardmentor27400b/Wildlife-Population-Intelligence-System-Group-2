import { useEffect, useState } from 'react';

const metricLabels = {
    total_images: 'Total images', total_audio: 'Total audio', species_count: 'Species count',
    average_images_per_species: 'Avg. images / species', duplicate_count: 'Duplicate files',
};

export default function DatasetPage() {
    const [status, setStatus] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

    const load = async () => {
        try {
            const [statusResponse, statisticsResponse] = await Promise.all([
                fetch('/api/datasets/status', { headers: headers() }),
                fetch('/api/datasets/statistics', { headers: headers() }),
            ]);
            if (statusResponse.ok) setStatus(await statusResponse.json());
            if (statisticsResponse.ok) setStatistics(await statisticsResponse.json());
        } catch { setMessage('Unable to contact the dataset service.'); }
    };

    useEffect(() => { load(); }, []);

    const run = async (path, method = 'GET', success = 'Action completed.') => {
        setBusy(true); setMessage('');
        try {
            const response = await fetch(`/api/datasets${path}`, { method, headers: headers() });
            const body = await response.json();
            setMessage(response.ok ? success : body.detail || 'Action failed.');
            if (response.ok) await load();
        } catch { setMessage('The dataset action could not be completed.'); }
        finally { setBusy(false); }
    };

    const datasets = status?.datasets || {};
    return (
        <div className="space-y-6">
            <section className="rounded-3xl bg-gradient-to-br from-indigo-700 to-slate-900 p-8 text-white shadow-xl">
                <p className="text-sm uppercase tracking-[0.22em] text-indigo-200">Milestone 2</p>
                <h1 className="mt-2 text-3xl font-semibold">Dataset management</h1>
                <p className="mt-3 max-w-2xl text-indigo-100">Validate source datasets, generate training-ready media, and monitor data quality from one workspace.</p>
            </section>
            <div className="flex flex-wrap gap-3">
                <button disabled={busy} className="rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white disabled:opacity-60" onClick={() => run('/status', 'GET', 'Dataset verification complete.')}>Verify Dataset</button>
                <button disabled={busy} className="rounded-xl bg-sky-700 px-4 py-3 font-semibold text-white disabled:opacity-60" onClick={() => run('/preprocess', 'POST', 'Preprocessing complete.')}>Preprocess Dataset</button>
                <button disabled={busy} className="rounded-xl bg-amber-600 px-4 py-3 font-semibold text-white disabled:opacity-60" onClick={() => run('/statistics', 'GET', 'Statistics report generated.')}>Generate Statistics</button>
                <button disabled={busy} className="rounded-xl bg-violet-700 px-4 py-3 font-semibold text-white disabled:opacity-60" onClick={() => run('/split', 'POST', 'Balanced train/validation/test splits generated.')}>Generate Splits</button>
            </div>
            {message && <div role="status" className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{message}</div>}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {Object.entries(metricLabels).map(([key, label]) => <div key={key} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-800">{statistics?.[key] ?? '—'}</p>
                </div>)}
            </section>
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">Dataset status</h2>
                <div className="mt-4 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b text-slate-500"><tr><th className="pb-3">Dataset</th><th className="pb-3">Status</th><th className="pb-3">Images</th><th className="pb-3">Audio</th><th className="pb-3">Species</th><th className="pb-3">Official source</th></tr></thead>
                    <tbody>{Object.entries(datasets).map(([name, item]) => { const check = status?.verification?.[name]; return <tr key={name} className="border-b border-slate-100"><td className="py-3 font-medium capitalize text-slate-800">{name.replaceAll('_', ' ')}</td><td className="py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.exists ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{item.exists ? 'Found' : 'Missing'}</span></td><td className="py-3">{check?.image_count ?? 0}</td><td className="py-3">{check?.audio_count ?? 0}</td><td className="py-3">{check?.species_count ?? 0}</td><td className="py-3"><a className="text-indigo-700 hover:underline" href={item.official_download_page} target="_blank" rel="noreferrer">Download page</a></td></tr>; })}</tbody>
                </table></div>
                {!status && <p className="mt-4 text-sm text-slate-500">Loading dataset status…</p>}
            </section>
        </div>
    );
}
