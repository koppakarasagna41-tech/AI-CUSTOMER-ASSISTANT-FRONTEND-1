import api from './api';
import { normalizeApiError } from './apiHelpers';

export async function getIntentSummary() {
    try {
        const response = await api.get('/intent/summary');
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

export async function listIntentLogs(params = {}) {
    try {
        const response = await api.get('/intent/logs', { params });
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

export async function getConversationIntents(conversationId) {
    try {
        const response = await api.get(`/intent/logs/conversation/${conversationId}`);
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

const intentService = { getIntentSummary, listIntentLogs, getConversationIntents };

export default intentService;