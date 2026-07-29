/**
 * knowledgeService.js
 *
 * API wrappers for Knowledge Base ingestion, search, and management.
 */

import api from './api';
import { normalizeApiError } from './apiHelpers';

/**
 * @typedef {object} KnowledgeUploadOptions
 * @property {string} [category]
 * @property {string} [description]
 * @property {string[]} [tags]
 */

/**
 * @typedef {object} KnowledgeListParams
 * @property {number} [page]
 * @property {number} [page_size]
 * @property {string} [category]
 * @property {string} [status]
 * @property {string} [doc_type]
 * @property {string} [search]
 */

/**
 * Upload a document file to the knowledge base.
 * @param {File} file
 * @param {KnowledgeUploadOptions} [options]
 */
export async function uploadDocument(file, options = {}) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        if (options.category) formData.append('category', options.category);
        if (options.description) formData.append('description', options.description);
        if (options.tags?.length) {
            formData.append('tags', options.tags.join(','));
        }

        const response = await api.post('/knowledge/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Upload a URL for knowledge base ingestion.
 * @param {{url:string, category?:string, description?:string, tags?:string[]}} payload
 */
export async function uploadDocumentUrl(payload) {
    try {
        const payloadWithDefaults = {
            category: 'general',
            description: null,
            tags: [],
            ...payload,
        };
        const response = await api.post('/knowledge/upload/url', payloadWithDefaults);
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * List knowledge documents.
 * @param {KnowledgeListParams} [params]
 */
export async function listDocuments(params = {}) {
    try {
        const response = await api.get('/knowledge', { params });
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
 * Retrieve knowledge base categories.
 */
export async function getCategories() {
    try {
        const response = await api.get('/knowledge/categories');
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Search knowledge documents by keyword.
 * @param {string} query
 * @param {{page?: number, page_size?: number, category?: string}} [params]
 */
export async function searchDocuments(query, params = {}) {
    try {
        const response = await api.get('/knowledge/search', {
            params: {
                q: query,
                ...params,
            },
        });
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
 * Get a single knowledge document.
 * @param {string} documentId
 */
export async function getDocument(documentId) {
    try {
        const response = await api.get(`/knowledge/${documentId}`);
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Update knowledge document metadata.
 * @param {string} documentId
 * @param {{title?:string, description?:string, category?:string, tags?:string[]}} payload
 */
export async function updateDocument(documentId, payload) {
    try {
        const response = await api.put(`/knowledge/${documentId}`, payload);
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Delete a knowledge document.
 * @param {string} documentId
 */
export async function deleteDocument(documentId) {
    try {
        const response = await api.delete(`/knowledge/${documentId}`);
        return response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Fetch chunks for a document.
 * @param {string} documentId
 * @param {{page?:number,page_size?:number}} [params]
 */
export async function getDocumentChunks(documentId, params = {}) {
    try {
        const response = await api.get(`/knowledge/${documentId}/chunks`, { params });
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

const knowledgeService = {
    uploadDocument,
    uploadDocumentUrl,
    listDocuments,
    getCategories,
    searchDocuments,
    getDocument,
    updateDocument,
    deleteDocument,
    getDocumentChunks,
};

export default knowledgeService;
