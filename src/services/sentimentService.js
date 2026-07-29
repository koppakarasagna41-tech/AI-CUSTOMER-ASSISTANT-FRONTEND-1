/**
 * sentimentService.js
 *
 * API wrappers for sentiment analysis and log retrieval.
 */

import api from './api';
import { normalizeApiError } from './apiHelpers';

/**
 * @typedef {object} SentimentAnalyzePayload
 * @property {string} text
 * @property {string} [conversation_id]
 * @property {string} [message_id]
 * @property {string} [source]
 */

/**
 * @typedef {object} SentimentBatchPayload
 * @property {string[]} texts
 * @property {string} [conversation_id]
 */

/**
 * @typedef {object} SentimentLogListParams
 * @property {number} [page]
 * @property {number} [page_size]
 * @property {string} [sentiment]
 * @property {string} [conversation_id]
 * @property {boolean} [is_fallback]
 */

/**
 * Analyze sentiment for a single text.
 * @param {SentimentAnalyzePayload} payload
 */
export async function analyzeText(payload) {
    try {
        const response = await api.post('/sentiment/analyze', payload);
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Analyze sentiment for multiple texts.
 * @param {SentimentBatchPayload} payload
 */
export async function analyzeBatch(payload) {
    try {
        const response = await api.post('/sentiment/analyze/batch', payload);
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Analyze the sentiment of a full conversation.
 * @param {string} conversationId
 */
export async function analyzeConversationSentiment(conversationId) {
    try {
        const response = await api.post(`/sentiment/conversation/${conversationId}`);
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Retrieve stored sentiment records for a conversation.
 * @param {string} conversationId
 */
export async function getConversationSentiment(conversationId) {
    try {
        const response = await api.get(`/sentiment/conversation/${conversationId}`);
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * List saved sentiment logs.
 * @param {SentimentLogListParams} [params]
 */
export async function listSentimentLogs(params = {}) {
    try {
        const response = await api.get('/sentiment/logs', { params });
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
 * Retrieve a sentiment log by its identifier.
 * @param {string} sentimentId
 */
export async function getSentimentLog(sentimentId) {
    try {
        const response = await api.get(`/sentiment/logs/${sentimentId}`);
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Get aggregated sentiment summary counts.
 */
export async function getSentimentSummary() {
    try {
        const response = await api.get('/sentiment/summary');
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Get supported sentiment labels and metadata.
 */
export async function getSentimentLabels() {
    try {
        const response = await api.get('/sentiment/labels');
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

const sentimentService = {
    analyzeText,
    analyzeBatch,
    analyzeConversationSentiment,
    getConversationSentiment,
    listSentimentLogs,
    getSentimentLog,
    getSentimentSummary,
    getSentimentLabels,
};

export default sentimentService;
