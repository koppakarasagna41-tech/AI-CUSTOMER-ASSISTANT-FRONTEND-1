/**
 * ticketService.js
 *
 * API wrappers for ticket creation, classification, listing, and stats.
 */

import api from './api';
import { normalizeApiError } from './apiHelpers';

/**
 * @typedef {object} TicketCreatePayload
 * @property {string} subject
 * @property {string} description
 * @property {string} [category]
 * @property {string} [priority]
 * @property {string} [conversation_id]
 * @property {string} [user_id]
 */

/**
 * @typedef {object} TicketUpdatePayload
 * @property {string} [subject]
 * @property {string} [description]
 * @property {string} [category]
 * @property {string} [priority]
 * @property {string[]} [tags]
 */

/**
 * @typedef {object} TicketListParams
 * @property {number} [page]
 * @property {number} [page_size]
 * @property {string} [status]
 * @property {string} [category]
 * @property {string} [priority]
 * @property {string} [search]
 */

/**
 * Create a support ticket.
 * @param {TicketCreatePayload} payload
 */
export async function createTicket(payload) {
    try {
        const response = await api.post('/tickets', payload);
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * List tickets with optional filters.
 * @param {TicketListParams} [params]
 */
export async function listTickets(params = {}) {
    try {
        const response = await api.get('/tickets', { params });
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
 * Retrieve a ticket by its MongoDB _id or ticket_id.
 * @param {string} id
 */
export async function getTicket(id) {
    try {
        const response = await api.get(`/tickets/${id}`);
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Delete a ticket.
 * @param {string} id
 */
export async function deleteTicket(id) {
    try {
        const response = await api.delete(`/tickets/${id}`);
        return response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Update ticket metadata.
 * @param {string} id
 * @param {TicketUpdatePayload} payload
 */
export async function updateTicket(id, payload) {
    try {
        const response = await api.patch(`/tickets/${id}`, payload);
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Re-classify an existing ticket using Gemini.
 * @param {string} id
 */
export async function classifyTicket(id) {
    try {
        const response = await api.post(`/tickets/${id}/classify`, {});
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Get aggregated ticket statistics.
 */
export async function getTicketStats() {
    try {
        const response = await api.get('/tickets/stats');
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

/**
 * Get all supported ticket categories.
 */
export async function getTicketCategories() {
    try {
        const response = await api.get('/tickets/categories');
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

const ticketService = {
    createTicket,
    listTickets,
    getTicket,
    updateTicket,
    deleteTicket,
    classifyTicket,
    getTicketStats,
    getTicketCategories,
};

export default ticketService;
