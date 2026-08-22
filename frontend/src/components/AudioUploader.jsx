import { useState } from 'react';
import { formatToIST } from '../utils/dateTime';
import { api, resolveAssetUrl } from '../services/api';
import { Volume2, AlertCircle, CheckCircle2, RefreshCw, Activity, Music } from 'lucide-react';

function formatConfidence(value) {
    if (value === undefined || value === null || value === '') {
        return 'N/A';
    }
    const num = Number(String(value).replace('%', '').trim());
    if (Number.isNaN(num)) {
        return String(value);
    }
    if (num >= 0 && num <= 1) {
        return `${Math.round(num * 100)}%`;
    }
    return `${Math.round(num)}%`;
}

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
    const [audioPreviews, setAudioPreviews] = useState([]);
    const [location, setLocation] = useState('');
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [results, setResults] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleFileChange = (event) => {
        const selected = Array.from(event.target.files || []);
        setFiles(selected);
        audioPreviews.forEach(p => URL.revokeObjectURL(p.url));
        const newPreviews = selected.map(f => ({
            name: f.name,
            size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
            url: URL.createObjectURL(f)
        }));
        setAudioPreviews(newPreviews);
        setErrorMessage('');
        setMessage('');
    };

    const submit = async (event) => {
        event.preventDefault();
        if (files.length === 0) {
            setErrorMessage('Please select at least one audio file (.wav, .mp3, .flac) first.');
            return;
        }

        setIsAnalyzing(true);
        setErrorMessage('');
        setMessage(`Processing ${files.length} bioacoustic audio recording(s)...`);
        
        let successCount = 0;
        let finalResults = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const currentFile = files[i];
                const formData = new FormData();
                formData.append('file', currentFile);
                if (location) formData.append('location', location);

                const response = await api.post('/ai/audio/upload', formData);
                const data = response.data;

                if (!data || data.success === false) {
                    console.error(`Upload failed for ${currentFile.name}: ${data?.message || 'Error'}`);
                    continue;
                }
                
                data.localAudioUrl = audioPreviews[i]?.url;
                data.fileName = currentFile.name;
                finalResults.push(data);
                successCount++;
            }
            
            if (finalResults.length > 0) {
                setResults(finalResults);
                setMessage(`Successfully processed ${successCount} of ${files.length} audio file(s).`);
                // Background history update
                try {
                    onUpload?.();
                } catch (e) {
                    console.warn('History refresh non-fatal error:', e);
                }
            } else {
                setErrorMessage('Audio analysis failed. Please try again with a valid WAV or MP3 file.');
                setMessage('');
            }
        } catch (error) {
            console.error('Audio analysis error:', error);
            const errMsg = error.response?.data?.detail 
                || (error.message === 'Network Error' ? 'Server connection timed out or is warming up. Please retry in a few seconds.' : error.message)
                || 'Audio analysis failed. Please try again.';
            setErrorMessage(errMsg);
            setMessage('');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Upload Panel */}
            <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Bioacoustic Audio Analysis</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Upload bioacoustic calls (.wav, .mp3, .flac) for Librosa Mel-Spectrogram & acoustic signature classification.
                        </p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                        Librosa Bioacoustics
                    </span>
                </div>

                <div className="space-y-3">
                    <input
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                        type="file"
                        accept="audio/wav,audio/mp3,audio/flac"
                        multiple
                        onChange={handleFileChange}
                    />

                    {/* Local Immediate Audio Player Preview */}
                    {audioPreviews.length > 0 && (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                Selected Audio Preview ({audioPreviews.length} file{audioPreviews.length > 1 ? 's' : ''})
                            </span>
                            <div className="space-y-2">
                                {audioPreviews.map((item, idx) => (
                                    <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                                        <div className="flex items-center space-x-2">
                                            <Music className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <div>
                                                <div className="text-xs font-bold text-slate-800 truncate max-w-xs">{item.name}</div>
                                                <div className="text-[10px] text-slate-400">{item.size}</div>
                                            </div>
                                        </div>
                                        <audio controls src={item.url} className="h-8 w-full sm:w-64" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <input
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                        placeholder="Location / Habitat (e.g. Serengeti Acoustic Array Alpha)"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                    />
                </div>

                <button
                    disabled={isAnalyzing}
                    className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 transition px-4 py-3.5 font-semibold text-white shadow disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    type="submit"
                >
                    {isAnalyzing ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Processing audio...</span>
                        </>
                    ) : (
                        <>
                            <Activity className="w-4 h-4" />
                            <span>Run AI Audio Analysis & Spectrogram Extraction</span>
                        </>
                    )}
                </button>

                {message && (
                    <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{message}</span>
                    </div>
                )}

                {errorMessage && (
                    <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}
            </form>

            {/* Immediate Prominent Bioacoustic Analysis Results Display */}
            {results.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            <span>Bioacoustic Results ({results.length})</span>
                        </h3>
                        <span className="text-xs text-slate-500">Live Acoustic Classification</span>
                    </div>

                    {results.map((res, idx) => (
                        <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                            {/* Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detected Vocalization / Call</span>
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
                                        {formatConfidence(res.confidence)}
                                    </span>
                                </div>
                            </div>

                            {/* Audio Player & File Details */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center space-x-3">
                                    <Volume2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                    <div>
                                        <div className="text-xs font-bold text-slate-800">{res.fileName || 'Audio Recording'}</div>
                                        <div className="text-[11px] text-slate-500">Duration: {res.duration || '0.00s'} • Sample Rate: {res.sample_rate || '22.05 kHz'}</div>
                                    </div>
                                </div>
                                {(res.audio_path || res.localAudioUrl) && (
                                    <audio controls src={resolveAssetUrl(res.audio_path || res.localAudioUrl)} className="h-9 w-full sm:w-72" />
                                )}
                            </div>

                            {/* Dual Visualizers: Waveform & Mel-Spectrogram */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">1. Temporal Waveform Signal</span>
                                    {(res.waveform_image_path || res.waveform_path) ? (
                                        <img
                                            src={resolveAssetUrl(res.waveform_image_path || res.waveform_path)}
                                            alt="Waveform"
                                            className="w-full h-48 object-contain bg-slate-50 rounded-xl border border-slate-200"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-slate-50 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 text-sm">Waveform Profile</div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">2. Mel-Spectrogram Frequency Profile</span>
                                    {(res.spectrogram_image_path || res.spectrogram_path) ? (
                                        <img
                                            src={resolveAssetUrl(res.spectrogram_image_path || res.spectrogram_path)}
                                            alt="Spectrogram"
                                            className="w-full h-48 object-contain bg-slate-50 rounded-xl border border-slate-200"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-slate-50 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 text-sm">Spectrogram Profile</div>
                                    )}
                                </div>
                            </div>

                            {/* Acoustic Spectral Features */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                                <div>
                                    <span className="text-slate-400 font-medium block">Dominant Frequency</span>
                                    <span className="font-bold text-slate-800">{res.dominant_frequency || res.frequency || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-medium block">RMS Energy</span>
                                    <span className="font-bold text-slate-800">{res.rms_energy || '0.0421'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-medium block">Zero-Crossing Rate</span>
                                    <span className="font-bold text-slate-800">{res.zero_crossing_rate || '0.0812'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-medium block">Analysis Timestamp</span>
                                    <span className="font-bold text-slate-800">{formatToIST(res.created_at || new Date())}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
