import api from './api';
import { normalizeApiError } from './apiHelpers';

export async function listReports() {
    try {
        const response = await api.get('/reports/available');
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

export async function exportReport(reportType, params = {}) {
    try {
        const response = await api.get(`/reports/${reportType}`, {
            params,
            responseType: params.format === 'csv' ? 'blob' : 'blob',
        });
        return response;
    } catch (error) {
        normalizeApiError(error);
    }
}

const reportsService = { listReports, exportReport };

export default reportsService;