/**
 * chatService.js
 *
 * API calls related to chat / conversations.
 * All methods return mock data today; replace with real `api.*` calls.
 */

import api from './api';
import { PLACEHOLDER_CONVERSATIONS } from '@/utils/placeholderData';

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Fetch all conversations for the authenticated user. */
export async function getConversations(params = {}) {
  await delay(600);
  return { data: PLACEHOLDER_CONVERSATIONS, total: PLACEHOLDER_CONVERSATIONS.length };
  // return api.get('/conversations', { params });
}

/** Fetch a single conversation by ID including its messages. */
export async function getConversation(id) {
  await delay(400);
  const conv = PLACEHOLDER_CONVERSATIONS.find((c) => c.id === id);
  if (!conv) throw { status: 404, message: 'Conversation not found.' };
  return conv;
  // return api.get(`/conversations/${id}`);
}

/** Send a message in the current conversation. */
export async function sendMessage({ conversationId, content }) {
  await delay(300);
  return {
    id:             'msg_' + Date.now(),
    conversationId,
    role:           'user',
    content,
    timestamp:      new Date().toISOString(),
  };
  // return api.post(`/conversations/${conversationId}/messages`, { content });
}

/** Delete a conversation. */
export async function deleteConversation(id) {
  await delay(400);
  return { success: true };
  // return api.delete(`/conversations/${id}`);
}

/** Mark a conversation as resolved. */
export async function resolveConversation(id) {
  await delay(300);
  return { id, status: 'resolved' };
  // return api.patch(`/conversations/${id}/resolve`);
}

const chatService = {
  getConversations,
  getConversation,
  sendMessage,
  deleteConversation,
  resolveConversation,
};
export default chatService;
