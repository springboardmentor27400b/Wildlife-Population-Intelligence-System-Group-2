import api from './api';

class WildlifeDashboardService {
    async getExecutiveSummary() {
        const response = await api.get('/wildlife-dashboard/executive-summary');
        return response.data;
    }

    async getObservationIntelligence() {
        const response = await api.get('/wildlife-dashboard/observation-intelligence');
        return response.data;
    }

    async getPopulationIntelligence() {
        const response = await api.get('/wildlife-dashboard/population-intelligence');
        return response.data;
    }

    async getBiodiversityIntelligence() {
        const response = await api.get('/wildlife-dashboard/biodiversity-intelligence');
        return response.data;
    }

    async getHabitatIntelligence() {
        const response = await api.get('/wildlife-dashboard/habitat-intelligence');
        return response.data;
    }

    async getOverview() {
        const response = await api.get('/wildlife-dashboard/overview');
        return response.data;
    }

    async getSpecies() {
        const response = await api.get('/wildlife-dashboard/species');
        return response.data;
    }

    async getSites() {
        const response = await api.get('/wildlife-dashboard/sites');
        return response.data;
    }

    async getAlerts() {
        const response = await api.get('/wildlife-dashboard/alerts');
        return response.data;
    }

    async exportReport(format) {
        const response = await api.get(`/wildlife-dashboard/export/${format}`, {
            responseType: format === 'json' ? 'json' : 'blob'
        });
        
        if (format !== 'json') {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `executive_dashboard.${format}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        return response.data;
    }
}

export default new WildlifeDashboardService();
