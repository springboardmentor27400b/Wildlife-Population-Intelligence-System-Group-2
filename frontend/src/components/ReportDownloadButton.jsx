import { api } from '../services/api';

export default function ReportDownloadButton() {
    const download = async () => {
        try {
            const response = await api.get('/ai/report/pdf', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = 'wildlife-report.pdf';
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error('PDF download error:', e);
        }
    };

    return (
        <button className="rounded-xl bg-amber-600 px-4 py-3 font-semibold text-white hover:bg-amber-700 transition shadow" type="button" onClick={download}>
            Download PDF Report
        </button>
    );
}
