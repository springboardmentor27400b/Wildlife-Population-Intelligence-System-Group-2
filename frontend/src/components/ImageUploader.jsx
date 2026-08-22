import { useState } from 'react';
import { formatToIST } from '../utils/dateTime';
import { api, resolveAssetUrl } from '../services/api';
import { Image as ImageIcon, AlertCircle, CheckCircle2, RefreshCw, Eye, Tag } from 'lucide-react';

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

export default function ImageUploader({ onUpload }) {
    const [files, setFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [location, setLocation] = useState('');
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [results, setResults] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (event) => {
        const selected = Array.from(event.target.files || []);
        setFiles(selected);
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        const newUrls = selected.map(f => URL.createObjectURL(f));
        setPreviewUrls(newUrls);
        setErrorMessage('');
        setMessage('');
    };

    const submit = async (event) => {
        event.preventDefault();
        if (files.length === 0) {
            setErrorMessage('Please select at least one image (.jpg, .jpeg, .png) first.');
            return;
        }

        setIsUploading(true);
        setErrorMessage('');
        setMessage(`Processing ${files.length} image(s)...`);
        
        let successCount = 0;
        let finalResults = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const currentFile = files[i];
                const formData = new FormData();
                formData.append('file', currentFile);
                if (location) formData.append('location', location);

                const response = await api.post('/ai/image/upload', formData);
                const data = response.data;

                if (!data || data.success === false) {
                    console.error(`Upload failed for ${currentFile.name}: ${data?.message || 'Error'}`);
                    continue;
                }
                
                data.previewUrl = previewUrls[i];
                finalResults.push(data);
                successCount++;
            }
            
            if (finalResults.length > 0) {
                setResults(finalResults);
                setMessage(`Successfully processed ${successCount} of ${files.length} image(s).`);
                // Trigger background history table reload without blocking
                try {
                    onUpload?.();
                } catch (e) {
                    console.warn('History refresh non-fatal error:', e);
                }
            } else {
                setErrorMessage('Image analysis failed. Please try again with a valid JPEG/PNG file.');
                setMessage('');
            }
        } catch (error) {
            console.error('Image analysis error:', error);
            const errMsg = error.response?.data?.detail 
                || (error.message === 'Network Error' ? 'Server connection timed out or is warming up. Please retry in a few seconds.' : error.message)
                || 'Image analysis failed. Please try again.';
            setErrorMessage(errMsg);
            setMessage('');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Panel */}
            <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Wildlife Image Analysis</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Upload camera-trap imagery (.jpg, .jpeg, .png) for real-time YOLOv8 species detection & IUCN taxonomy classification.
                        </p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                        YOLOv8 Vision
                    </span>
                </div>

                <div className="space-y-3">
                    <input
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        multiple
                        onChange={handleFileChange}
                    />

                    {/* Local Immediate Thumbnail Preview before Upload */}
                    {previewUrls.length > 0 && (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                Selected Image Preview ({previewUrls.length} file{previewUrls.length > 1 ? 's' : ''})
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {previewUrls.map((url, idx) => (
                                    <div key={idx} className="group relative rounded-lg overflow-hidden border border-slate-200 bg-white shadow-xs aspect-square">
                                        <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-x-0 bottom-0 bg-slate-900/70 p-1 text-[10px] text-white truncate text-center">
                                            {files[idx]?.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <input
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                        placeholder="Location / Habitat (e.g. Serengeti National Park, Sector 4)"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                    />
                </div>

                <button
                    className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 transition px-4 py-3.5 font-semibold text-white shadow disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    type="submit"
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Processing image...</span>
                        </>
                    ) : (
                        <>
                            <Eye className="w-4 h-4" />
                            <span>Run AI Detection & Species Recognition</span>
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

            {/* Immediate Prominent Analysis Results Display */}
            {results.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            <span>Analysis Results ({results.length})</span>
                        </h3>
                        <span className="text-xs text-slate-500">Live AI Classification</span>
                    </div>

                    {results.map((res, idx) => (
                        <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                            {/* Card Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detected Species</span>
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

                            {/* Image Tri-View (Original, YOLO Detection, Crop) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">1. Original Upload</span>
                                    {(res.original_image || res.previewUrl) ? (
                                        <img
                                            src={resolveAssetUrl(res.original_image || res.previewUrl)}
                                            alt="Original"
                                            className="w-full h-56 object-contain bg-slate-50 rounded-xl border border-slate-200"
                                        />
                                    ) : (
                                        <div className="w-full h-56 bg-slate-50 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 text-sm">No Image</div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">2. YOLO Bounding Box Detection</span>
                                    {(res.detected_image || res.annotated_image || res.annotated_image_path) ? (
                                        <img
                                            src={resolveAssetUrl(res.detected_image || res.annotated_image || res.annotated_image_path)}
                                            alt="Annotated"
                                            className="w-full h-56 object-contain bg-slate-50 rounded-xl border border-slate-200"
                                        />
                                    ) : (
                                        <div className="w-full h-56 bg-slate-50 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 text-sm">Full Image Context</div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">3. Subject Crop</span>
                                    {(res.bounding_box_crop || res.crop_image || res.crop_image_path) ? (
                                        <img
                                            src={resolveAssetUrl(res.bounding_box_crop || res.crop_image || res.crop_image_path)}
                                            alt="Crop"
                                            className="w-full h-56 object-contain bg-slate-50 rounded-xl border border-slate-200"
                                        />
                                    ) : (
                                        <div className="w-full h-56 bg-slate-50 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 text-sm">Isolated Subject</div>
                                    )}
                                </div>
                            </div>

                            {/* Taxonomy & Metadata Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                                <div>
                                    <span className="text-slate-400 font-medium block">Family / Genus</span>
                                    <span className="font-bold text-slate-800">{res.family || 'Unknown'} / {res.genus || 'Unknown'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-medium block">Habitat</span>
                                    <span className="font-bold text-slate-800">{res.habitat || 'Savanna & Forest'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-medium block">Diet</span>
                                    <span className="font-bold text-slate-800">{res.diet || 'Herbivore / Carnivore'}</span>
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
