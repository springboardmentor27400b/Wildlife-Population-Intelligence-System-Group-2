import { useEffect, useState } from 'react';
import AudioUploader from '../components/AudioUploader';
import DetectionTable from '../components/DetectionTable';
import AIPageLayout from '../components/AIPageLayout';
import { api } from '../services/api';

export default function AudioRecognition() {
    const [history, setHistory] = useState([]);

    const load = async () => {
        try {
            const response = await api.get('/ai/audio/history');
            setHistory(response.data || []);
        } catch (e) {
            console.error('Failed to load audio history:', e);
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
