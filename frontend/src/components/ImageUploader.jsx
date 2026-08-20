import { useState } from 'react';
import { formatToIST } from '../utils/dateTime';
import { api } from '../services/api';

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
    if (!status) return 'bg-slate-100 text-slate-800';
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
    const [results, setResults] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (event) => {
        const selected = Array.from(event.target.files || []);
        setFiles(selected);
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        const newUrls = selected.map(f => URL.createObjectURL(f));
        setPreviewUrls(newUrls);
    };

    const submit = async (event) => {
        event.preventDefault();
        if (files.length === 0) {
            setMessage('Choose at least one image first.');
            return;
        }

        setIsUploading(true);
        setMessage(`Processing ${files.length} image(s)...`);
        setResults([]);
        
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
                    setMessage(`Error processing ${currentFile.name}: ${data?.message || 'Upload failed'}`);
                    continue;
                }
                
                data.previewUrl = previewUrls[i];
                finalResults.push(data);
                successCount++;
            }
            
            setResults(finalResults);
            if (successCount > 0) {
                setMessage(`Successfully processed ${successCount} out of ${files.length} image(s).`);
                onUpload?.();
            } else if (files.length > 0) {
                setMessage(`Unable to process image(s). Please try valid JPEG/PNG files.`);
            }
        } catch (error) {
            setMessage(error.message || 'Unable to process image.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-800 text-lg">Wildlife Image Analysis</h3>
                <input
                    className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    multiple
                    onChange={handleFileChange}
                />
                <input
                    className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="Location / Habitat (e.g. Serengeti National Park)"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                />
                <button
                    className="mt-4 w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 transition px-4 py-3 font-semibold text-white shadow disabled:opacity-75 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={isUploading}
                >
                    {isUploading ? "Processing Images..." : "Run AI Detection & Species Recognition"}
                </button>
                {message && <p className="mt-3 text-sm font-medium text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">{message}</p>}
            </form>

            {results.length > 0 && (
                <div className="space-y-6 mt-6">
                    {results.map((res, idx) => (
                        <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                            <h4 className="font-semibold text-slate-800">Result {idx + 1}: Classification & Taxonomy</h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">1. Original</span>
                                    {(res.original_image || res.previewUrl) ? (
                                        <img src={res.original_image || res.previewUrl} alt="Uploaded Original" className="w-full h-[300px] object-contain bg-slate-50 rounded-xl border border-slate-200" />
                                    ) : (
                                        <div className="w-full h-[300px] bg-slate-50 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 text-sm font-medium">No Image Available</div>
                                    )}
                                </div>
                                
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">2. Detection</span>
                                    {(res.detected_image || res.annotated_image || res.annotated_image_path) ? (
                                        <img src={res.detected_image || res.annotated_image || res.annotated_image_path} alt="Annotated Detection" className="w-full h-[300px] object-contain bg-slate-50 rounded-xl border border-slate-200" />
                                    ) : (
                                        <div className="w-full h-[300px] bg-slate-50 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 text-sm font-medium">No Detection Available</div>
                                    )}
                                </div>
                                
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">3. Bounding Box</span>
                                    {(res.bounding_box_crop || res.crop_image || res.crop_image_path) ? (
                                        <img src={res.bounding_box_crop || res.crop_image || res.crop_image_path} alt="Bounding Box Crop" className="w-full h-[300px] object-contain bg-slate-50 rounded-xl border border-slate-200" />
                                    ) : (
                                        <div className="w-full h-[300px] bg-slate-50 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 text-sm font-medium">No Detection Available</div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-sm border border-slate-100">
                                <div>
                                    <span className="text-xs text-slate-400 block font-medium">Common Name</span>
                                    <span className="font-bold text-emerald-900 text-base">{res.species}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 block font-medium">Scientific Name</span>
                                    <span className="font-semibold text-slate-700 italic">{res.scientific_name || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 block font-medium">Family / Genus</span>
                                    <span className="font-medium text-slate-700">{res.family || 'N/A'} / {res.genus || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 block font-medium">Conservation Status</span>
                                    <span className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-bold rounded-full border ${getStatusBadgeClass(res.status)}`}>
                                        {res.iucn_status || res.status || 'Observed'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 block font-medium">Habitat</span>
                                    <span className="font-medium text-slate-700">{res.habitat || 'Savanna / Forest'}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 block font-medium">Diet & Lifespan</span>
                                    <span className="font-medium text-slate-700">{res.diet || 'Omnivore'} • {res.average_lifespan || '10-20 Yrs'}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 block font-medium">Detection Date & Time (IST)</span>
                                    <span className="font-medium text-slate-700">
                                        {formatToIST(res.created_at || (res.detection_date && res.detection_time ? `${res.detection_date}T${res.detection_time}Z` : (res.detection_date || null)))}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 block font-medium">Location</span>
                                    <span className="font-medium text-slate-700">{res.location || 'Unknown'}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 block font-medium">Confidence Score</span>
                                    <span className="font-bold text-slate-800">{formatConfidence(res.confidence)}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 block font-medium">Inference Speed</span>
                                    <span className="font-semibold text-slate-800">{res.prediction_time}s</span>
                                </div>
                            </div>

                            {res.bounding_box && (
                                <div className="text-xs bg-slate-900 text-emerald-400 font-mono p-3 rounded-xl overflow-x-auto">
                                    <span className="text-slate-400 block mb-1">// Bounding Box Coordinates (x1, y1, x2, y2)</span>
                                    {Array.isArray(res.bounding_box) ? JSON.stringify(res.bounding_box) : res.bounding_box}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
