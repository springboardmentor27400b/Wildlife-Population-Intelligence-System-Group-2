import { useEffect, useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import DetectionTable from '../components/DetectionTable';
import AIPageLayout from '../components/AIPageLayout';

export default function SpeciesRecognition() {
    const [history, setHistory] = useState([]);

    const load = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/ai/image/history', { headers: { Authorization: `Bearer ${token}` } });
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
