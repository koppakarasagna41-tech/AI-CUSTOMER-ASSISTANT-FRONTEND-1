/**
 * userService.js
 *
 * API calls for user profile management.
 */

import api from './api';

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Fetch the current user's profile. */
export async function getProfile() {
  await delay(300);
  return JSON.parse(localStorage.getItem('auth_user') || 'null');
  // return api.get('/users/me');
}

/** Update profile fields (name, avatar, etc.). */
export async function updateProfile(data) {
  await delay(600);
  const current = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const updated = { ...current, ...data };
  localStorage.setItem('auth_user', JSON.stringify(updated));
  return updated;
  // return api.patch('/users/me', data);
}

/** Change password. */
export async function changePassword({ currentPassword, newPassword }) {
  await delay(700);
  if (!currentPassword || !newPassword) {
    throw { status: 400, message: 'Both fields are required.' };
  }
  return { success: true };
  // return api.post('/users/me/change-password', { currentPassword, newPassword });
}

const userService = { getProfile, updateProfile, changePassword };
export default userService;
