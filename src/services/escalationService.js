import api from './api';
import { normalizeApiError } from './apiHelpers';

export async function listEscalations(params = {}) {
    try {
        const response = await api.get('/escalation', { params });
        return {
            items: response?.data ?? [],
            total: response?.meta?.total_items ?? 0,
            page: response?.meta?.page ?? params.page ?? 1,
            pageSize: response?.meta?.page_size ?? params.page_size ?? 20,
        };
    } catch (error) {
        normalizeApiError(error);
    }
}

export async function getEscalationSummary() {
    try {
        const response = await api.get('/escalation/summary');
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

export async function getEscalation(escalationId) {
    try {
        const response = await api.get(`/escalation/${escalationId}`);
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

export async function assignEscalation(escalationId, payload) {
    try {
        const response = await api.patch(`/escalation/${escalationId}/assign`, payload);
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

export async function resolveEscalation(escalationId, payload) {
    try {
        const response = await api.patch(`/escalation/${escalationId}/resolve`, payload);
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

const escalationService = {
    listEscalations,
    getEscalationSummary,
    getEscalation,
    assignEscalation,
    resolveEscalation,
};

export default escalationService;