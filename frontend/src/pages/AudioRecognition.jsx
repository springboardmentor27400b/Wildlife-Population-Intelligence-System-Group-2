import { useEffect, useState } from 'react';
import AudioUploader from '../components/AudioUploader';
import DetectionTable from '../components/DetectionTable';
import AIPageLayout from '../components/AIPageLayout';

export default function AudioRecognition() {
    const [history, setHistory] = useState([]);

    const load = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/ai/audio/history', { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok) {
            const data = await response.json();
            setHistory(data);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <AIPageLayout
            title="Audio Recognition"
            description="Bioacoustic species recognition and spectrogram feature analysis using Audio Spectrogram Transformer (AST)."
        >
            {/* Audio Uploader Component */}
            <AudioUploader onUpload={() => load()} />

            {/* Audio History Table */}
            <DetectionTable rows={history.map((item) => ({ 
                id: item.id,
                thumbnail: item.thumbnail || item.waveform_image_path,
                detection_type: 'Audio',
                species: item.species, 
                scientific_name: item.scientific_name,
                family: item.family,
                status: item.status,
                confidence: item.confidence, 
                created_at: item.created_at 
            }))} />
        </AIPageLayout>
    );
}
