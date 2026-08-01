import { Activity, Camera, Mic } from 'lucide-react';

export default function DetectionTimeline({ data }) {
    if (!data || data.length === 0) return <div className="text-gray-500 py-4 text-center">No activity recorded</div>;

    return (
        <div className="space-y-6">
            {data.map((item, idx) => (
                <div key={idx} className="relative pl-6">
                    {/* Vertical line connecting timeline items */}
                    {idx !== data.length - 1 && (
                        <div className="absolute left-2.5 top-8 h-full w-[2px] bg-gray-100"></div>
                    )}
                    
                    <div className="flex items-start gap-4">
                        <div className={`relative z-10 mt-1 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white ${item.type === 'audio' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {item.type === 'audio' ? <Mic className="h-3 w-3" /> : <Camera className="h-3 w-3" />}
                        </div>
                        <div className="flex-1 rounded-xl bg-gray-50 p-4">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-900">{item.species} detected</h4>
                                <span className="text-xs font-medium text-gray-500">{item.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>AI Confidence:</span>
                                <span className="font-medium text-gray-900">{(item.confidence * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
