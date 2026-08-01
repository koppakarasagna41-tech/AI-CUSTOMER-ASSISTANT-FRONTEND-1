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

const usersService = { listUsers, getUser };

export default usersService;