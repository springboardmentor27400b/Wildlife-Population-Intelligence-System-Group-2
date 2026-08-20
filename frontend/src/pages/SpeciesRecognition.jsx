import { useEffect, useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import DetectionTable from '../components/DetectionTable';
import AIPageLayout from '../components/AIPageLayout';
import { api } from '../services/api';

export default function SpeciesRecognition() {
    const [history, setHistory] = useState([]);

    const load = async () => {
        try {
            const response = await api.get('/ai/image/history');
            setHistory(response.data || []);
        } catch (e) {
            console.error('Failed to load image history:', e);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <AIPageLayout
            title="Species Recognition"
            description="AI-powered wildlife image recognition using YOLOv8 object detection and species classification."
        >
            {/* Image Uploader Container */}
            <ImageUploader onUpload={() => load()} />

            {/* Detection History */}
            <DetectionTable rows={history.map((item) => ({ 
                id: item.id, 
                thumbnail: item.thumbnail || item.crop_image_path || item.annotated_image_path || item.image_path,
                detection_type: 'Image',
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
