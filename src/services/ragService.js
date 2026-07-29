/**
 * ragService.js
 *
 * API wrappers for RAG query, ask, and conversation history.
 */

import api from './api';
import { normalizeApiError } from './apiHelpers';

/**
 * @typedef {object} RagQueryPayload
 * @property {string} question
 * @property {string} [conversation_id]
 * @property {number} [top_k]
 */

/**
 * @typedef {object} RagAskPayload
 * @property {string} question
 * @property {number} [top_k]
 */

/**
 * Send a RAG query and persist the conversation state.
 * @param {RagQueryPayload} payload
 */
export async function queryRag(payload) {
    try {
        const response = await api.post('/rag/query', payload);
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Send a single-shot RAG question without persistence.
 * @param {RagAskPayload} payload
 */
export async function askRag(payload) {
    try {
        const response = await api.post('/rag/ask', payload);
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Get paginated RAG conversation history.
 * @param {string} conversationId
 * @param {{page?:number,page_size?:number}} [params]
 */
export async function getRagHistory(conversationId, params = {}) {
    try {
        const response = await api.get(`/rag/history/${conversationId}`, { params });
        return {
            items: response?.data ?? [],
            total: response?.meta?.total_items ?? 0,
            page: response?.meta?.page ?? params.page ?? 1,
            pageSize: response?.meta?.page_size ?? params.page_size ?? 50,
        };
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Delete a RAG conversation's history.
 * @param {string} conversationId
 */
export async function deleteRagHistory(conversationId) {
    try {
        const response = await api.delete(`/rag/history/${conversationId}`);
        return response;
    } catch (error) {
        normalizeApiError(error);
    }
}

const ragService = {
    queryRag,
    askRag,
    getRagHistory,
    deleteRagHistory,
};

export default ragService;
