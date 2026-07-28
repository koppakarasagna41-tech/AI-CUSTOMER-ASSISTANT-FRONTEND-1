/**
 * chatService.js
 *
 * API calls related to chat / conversations.
 */

import api from './api';

/** Fetch all conversations for the authenticated user. */
export async function getConversations(params = {}) {
  const response = await api.get('/conversations', { params });
  const data = response?.data ?? [];
  return {
    data,
    total: response?.meta?.total_items ?? data.length,
  };
}

/** Fetch a single conversation by ID including its messages. */
export async function getConversation(id) {
  const response = await api.get(`/conversations/${id}`);
  return response?.data ?? response;
}

/** Start a new chat conversation via the AI endpoint. */
export async function startChat({ message, title }) {
  return api.post('/chat', { message, title });
}

/** Send a follow-up message in an existing conversation. */
export async function sendMessage({ conversationId, content }) {
  return api.post(`/chat/${conversationId}`, { message: content });
}

/** Fetch chat history for a conversation. */
export async function getChatHistory(conversationId, params = {}) {
  return api.get(`/chat/${conversationId}/history`, { params });
}

/** Delete a conversation. */
export async function deleteConversation(id) {
  return api.delete(`/conversations/${id}`);
}

/** Mark a conversation as resolved. */
export async function resolveConversation(id) {
  return api.patch(`/conversations/${id}`, { status: 'resolved' });
}

const chatService = {
  getConversations,
  getConversation,
  startChat,
  sendMessage,
  getChatHistory,
  deleteConversation,
  resolveConversation,
};
export default chatService;
