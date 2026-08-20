import { useState } from 'react';
import { api } from '../services/api';
import { Download, RefreshCw } from 'lucide-react';

export default function ReportDownloadButton() {
    const [loading, setLoading] = useState(false);

    const download = async () => {
        setLoading(true);
        try {
            const response = await api.get('/reports/export/pdf', { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'wildlife_intelligence_report.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Reports PDF error, trying fallback:', e);
            try {
                const response2 = await api.get('/ai/report/pdf', { responseType: 'blob' });
                const blob2 = new Blob([response2.data], { type: 'application/pdf' });
                const url2 = window.URL.createObjectURL(blob2);
                const link2 = document.createElement('a');
                link2.href = url2;
                link2.download = 'wildlife_monitoring_report.pdf';
                document.body.appendChild(link2);
                link2.click();
                document.body.removeChild(link2);
                window.URL.revokeObjectURL(url2);
            } catch (err2) {
                console.error('Fallback PDF error:', err2);
                alert('Unable to generate PDF report at this time. Please check your network connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            className="rounded-xl bg-amber-600 px-4 py-3 font-semibold text-white hover:bg-amber-700 transition shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75" 
            type="button" 
            onClick={download}
            disabled={loading}
        >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{loading ? 'Generating PDF...' : 'Download PDF Report'}</span>
        </button>
    );
}
