/**
 * historyService.js
 *
 * API wrappers for conversation history and message search endpoints.
 */

import api from './api';
import { normalizeApiError } from './apiHelpers';

/**
 * @typedef {object} HistoryListParams
 * @property {number} [page]
 * @property {number} [page_size]
 * @property {string} [search]
 * @property {string} [status]
 * @property {string} [sentiment]
 * @property {boolean} [has_tickets]
 * @property {string} [date_from]
 * @property {string} [date_to]
 * @property {string} [sort_by]
 * @property {string} [sort_order]
 */

/**
 * List conversation history summaries.
 * @param {HistoryListParams} [params]
 */
export async function listHistory(params = {}) {
    try {
        const response = await api.get('/history', { params });
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

/**
 * Search messages across conversation history.
 * @param {string} query
 * @param {{page?: number, page_size?: number, role?: string}} [params]
 */
export async function searchHistory(query, params = {}) {
    try {
        const response = await api.get('/history/search', { params: { q: query, ...params } });
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

/**
 * Retrieve enriched history for a conversation.
 * @param {string} conversationId
 * @param {{msg_page?: number, msg_page_size?: number}} [params]
 */
export async function getHistory(conversationId, params = {}) {
    try {
        const response = await api.get(`/history/${conversationId}`, { params });
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Delete a conversation history record.
 * @param {string} conversationId
 */
export async function deleteHistory(conversationId) {
    try {
        const response = await api.delete(`/history/${conversationId}`);
        return response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Delete only the messages belonging to a conversation.
 * @param {string} conversationId
 */
export async function deleteHistoryMessages(conversationId) {
    try {
        const response = await api.delete(`/history/${conversationId}/messages`);
        return response;
    } catch (error) {
        normalizeApiError(error);
    }
}

const historyService = {
    listHistory,
    searchHistory,
    getHistory,
    deleteHistory,
    deleteHistoryMessages,
};

export default historyService;
