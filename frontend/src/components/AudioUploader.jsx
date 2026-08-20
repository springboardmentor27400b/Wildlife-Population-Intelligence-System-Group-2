import { useState } from 'react';

function getStatusBadgeClass(status) {
    if (!status) return 'bg-slate-100 text-slate-800 border-slate-200';
    const s = status.toLowerCase();
    if (s.includes('endangered') || s.includes('critical')) return 'bg-red-100 text-red-800 border-red-200';
    if (s.includes('vulnerable')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (s.includes('threatened')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
}

export default function AudioUploader({ onUpload }) {
    const [files, setFiles] = useState([]);
    const [location, setLocation] = useState('');
    const [message, setMessage] = useState('');
    const [results, setResults] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        if (files.length === 0) {
            setMessage('Choose at least one audio file (.wav, .mp3, .flac) first.');
            return;
        }

        setIsAnalyzing(true);
        setMessage(`Processing ${files.length} bioacoustic audio files & running AST neural classifier...`);
        setResults([]);
        
        let successCount = 0;
        let finalResults = [];

        try {
            const token = localStorage.getItem('token');
            for (let i = 0; i < files.length; i++) {
                const currentFile = files[i];
                const formData = new FormData();
                formData.append('file', currentFile);
                if (location) formData.append('location', location);

                const response = await fetch('/api/ai/audio/upload', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
                
                const data = await response.json();
                
                if (!response.ok || data.success === false) {
                    console.error(`Upload failed for ${currentFile.name}: ${data.message || 'Error'}`);
                    setMessage(`Error processing ${currentFile.name}: ${data.message || 'Upload failed'}`);
                    continue;
                }
                
                finalResults.push(data);
                successCount++;
            }
            
            setResults(finalResults);
            if (successCount > 0) {
                setMessage(`Successfully processed ${successCount} out of ${files.length} audio file(s).`);
                onUpload?.();
            } else if (files.length > 0) {
                setMessage(`Unable to process audio file(s). Please try valid WAV/MP3 files.`);
            }
        } catch (error) {
            setMessage(error.message || 'Unable to process audio.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Upload Panel */}
            <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-slate-800 text-lg">Bioacoustic Audio Analysis</h3>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                        Species Classification
                    </span>
                </div>
                <p className="text-xs text-slate-500">
                    Upload bird chirping, mammal calls, roar, howl, dog bark, cat meow, or audio recordings (.wav, .mp3, .flac &lt; 100MB).
                </p>
                
                <input
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                    type="file"
                    accept="audio/wav,audio/mp3,audio/flac"
                    multiple
                    onChange={(event) => setFiles(Array.from(event.target.files || []))}
                />

                <input
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                    placeholder="Location / Habitat (e.g. Serengeti Acoustic Array Alpha)"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                />

                <button
                    disabled={isAnalyzing}
                    className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 transition px-4 py-3.5 font-semibold text-white shadow disabled:opacity-75 disabled:cursor-not-allowed"
                    type="submit"
                >
                    {isAnalyzing ? 'Extracting Features & Computing Species...' : 'Run AI Audio Analysis & Spectrogram Feature Classification'}
                </button>

                {message && (
                    <div className="mt-3 text-sm font-medium text-emerald-800 bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping"></span>
                        {message}
                    </div>
                )}
            </form>

            {/* Analysis & Results Dashboard */}
            {results.length > 0 && (
                <div className="space-y-6">
                    {results.map((res, idx) => (
                        <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                            {/* Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                <div>
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detected Species</span>
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mt-0.5">
                                        {res.species}
                                        <span className={`text-xs px-3 py-1 font-bold rounded-full border ${getStatusBadgeClass(res.iucn_status || res.status)}`}>
                                            {res.iucn_status || res.status || 'Observed'}
                                        </span>
                                    </h2>
                                    <p className="text-sm font-medium text-slate-500 italic mt-0.5">{res.scientific_name}</p>
                                </div>
                                <div className="bg-slate-950 text-white px-5 py-3 rounded-2xl text-right min-w-[120px] shadow-sm">
                                    <span className="text-xs text-emerald-400 font-semibold block uppercase">Confidence</span>
                                    <span className="text-2xl font-black text-white">
                                        {typeof res.confidence === 'string' && res.confidence.includes('%') 
                                            ? res.confidence 
                                            : `${Math.round((parseFloat(res.confidence) || 0) * 100)}%`}
                                    </span>
                                </div>
                            </div>

                            {/* Audio Player & Signal Visualizers */}
                            <div className="space-y-4">
                                {res.audio_path && (
                                    <div className="bg-slate-900 p-4 rounded-2xl space-y-2 border border-slate-800">
                                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Original Bioacoustic Audio Player</span>
                                        <audio controls src={res.audio_path} className="w-full rounded-xl accent-emerald-500" />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {res.waveform_image_path && (
                                        <div className="space-y-1.5">
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Audio Waveform</span>
                                            <img src={res.waveform_image_path} alt="Waveform Plot" className="w-full h-48 object-cover rounded-2xl border border-slate-200 shadow-sm" />
                                        </div>
                                    )}
                                    {res.spectrogram_image_path && (
                                        <div className="space-y-1.5">
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Mel Spectrogram</span>
                                            <img src={res.spectrogram_image_path} alt="Mel Spectrogram Plot" className="w-full h-48 object-cover rounded-2xl border border-slate-200 shadow-sm" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Taxonomy & Metadata Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-2xl text-xs border border-slate-200/80">
                                <div>
                                    <span className="text-slate-400 block font-medium">Family</span>
                                    <span className="font-bold text-slate-800 text-sm">{res.family || 'Unknown'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-medium">Genus</span>
                                    <span className="font-bold text-slate-800 text-sm">{res.genus || 'Unknown'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-medium">Habitat</span>
                                    <span className="font-bold text-slate-800 text-sm">{res.habitat || 'Unknown'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-medium">Diet</span>
                                    <span className="font-bold text-slate-800 text-sm">{res.diet || 'Unknown'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-medium">Duration</span>
                                    <span className="font-bold text-slate-800 text-sm">{res.duration || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-medium">Sample Rate</span>
                                    <span className="font-bold text-slate-800 text-sm">{res.sample_rate || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-medium">Dominant Frequency</span>
                                    <span className="font-bold text-slate-800 text-sm">{res.dominant_frequency || res.frequency || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-medium">Inference Time</span>
                                    <span className="font-bold text-slate-800 text-sm">{res.prediction_time ? `${res.prediction_time}s` : 'N/A'}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-slate-400 block font-medium">Observation Date &amp; Time</span>
                                    <span className="font-bold text-slate-800 text-sm">{res.detection_date || 'N/A'} at {res.detection_time || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
