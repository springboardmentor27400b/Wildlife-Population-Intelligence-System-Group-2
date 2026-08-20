export default function ReportDownloadButton() {
    const download = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/ai/report/pdf', {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'wildlife-report.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <button className="rounded-xl bg-amber-600 px-4 py-3 font-semibold text-white" type="button" onClick={download}>Download PDF report</button>
    );
}
