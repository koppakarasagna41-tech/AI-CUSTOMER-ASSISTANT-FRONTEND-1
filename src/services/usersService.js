import api from './api';
import { normalizeApiError } from './apiHelpers';

export async function listUsers(params = {}) {
    try {
        const response = await api.get('/users', { params });
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

export async function getUser(userId) {
    try {
        const response = await api.get(`/users/${userId}`);
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

export async function createAgent(payload = {}) {
    try {
        const response = await api.post('/users', {
            full_name: payload.fullName,
            email: payload.email,
            password: payload.password,
            role: 'agent',
        });
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

export async function updateUser(userId, payload = {}) {
    try {
        const response = await api.patch(`/users/${userId}`, {
            full_name: payload.fullName,
            is_active: payload.isActive,
        });
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

export async function resetPassword(userId, password) {
    try {
        const response = await api.post(`/users/${userId}/reset-password`, { password });
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

export async function deleteUser(userId) {
    try {
        const response = await api.delete(`/users/${userId}`);
        return response?.data ?? response;
    } catch (error) {
        normalizeApiError(error);
    }
}

const usersService = { listUsers, getUser, createAgent, updateUser, resetPassword, deleteUser };

export default usersService;