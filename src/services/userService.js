/**
 * userService.js
 *
 * API calls for user profile management.
 */

import api from './api';
import { STORAGE_KEYS } from '@/utils/constants';

/** Fetch the current user's profile. */
export async function getProfile() {
  const response = await api.get('/auth/me');
  const user = response?.data ?? response;
  return user ? { ...user, name: user.full_name || user.name || user.email } : null;
}

/** Update profile fields (name, avatar, etc.). */
export async function updateProfile(data) {
  const payload = {
    full_name: data.name ?? data.full_name,
    email: data.email,
  };
  const response = await api.patch('/auth/me', payload);
  const user = response?.data ?? response;
  return user ? { ...user, name: user.full_name || user.name || user.email } : null;
}

/** Change password. */
export async function changePassword({ currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) {
    throw { status: 400, message: 'Both fields are required.' };
  }
  return api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword });
}

const userService = { getProfile, updateProfile, changePassword };
export default userService;
