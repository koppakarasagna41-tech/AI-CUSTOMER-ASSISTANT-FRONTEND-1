/**
 * ChatContext.jsx
 *
 * Manages the active chat conversation state.
 * Provides:
 *  - messages list
 *  - sendMessage action (simulates AI response with placeholder data)
 *  - isTyping flag (AI typing indicator)
 *  - clearConversation
 *
 * When a real API is integrated, replace the `simulateAIResponse`
 * function with an actual call to chatService.sendMessage().
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from 'react';
import { generateId } from '@/utils/helpers';
import chatService from '@/services/chatService';
import historyService from '@/services/historyService';
import { queryRag } from '@/services/ragService';

// ── State shape ──────────────────────────────────────────────
const initialState = {
  messages: [],   // [{ id, role:'user'|'assistant', content, timestamp, status }]
  isTyping: false,
  conversationId: generateId(),
};

// ── Reducer ──────────────────────────────────────────────────
function chatReducer(state, action) {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };

    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };

    case 'CLEAR':
      return { ...initialState, conversationId: generateId() };

    case 'SET_CONVERSATION_ID':
      return { ...state, conversationId: action.payload };

    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };

    case 'UPDATE_MESSAGE_STATUS':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.id ? { ...m, status: action.payload.status } : m
        ),
      };

    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────
const ChatContext = createContext(null);

// ── Provider ─────────────────────────────────────────────────
export function ChatProvider({ children, initialConversationId = null }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  useEffect(() => {
    if (!initialConversationId) return;

    async function loadConversation() {
      try {
        dispatch({ type: 'SET_CONVERSATION_ID', payload: initialConversationId });
        dispatch({ type: 'SET_MESSAGES', payload: [] });
        dispatch({ type: 'SET_TYPING', payload: true });

        const history = await historyService.getHistory(initialConversationId);
        const messages = (history?.messages ?? []).map((message) => ({
          id: message.id || generateId(),
          role: message.role || 'assistant',
          content: message.content || '',
          timestamp: message.created_at || new Date().toISOString(),
          status: 'delivered',
        }));

        dispatch({ type: 'SET_MESSAGES', payload: messages });
      } catch {
        dispatch({ type: 'SET_MESSAGES', payload: [] });
      } finally {
        dispatch({ type: 'SET_TYPING', payload: false });
      }
    }

    loadConversation();
  }, [initialConversationId]);

  /**
   * Send a user message and simulate an AI response.
   * Replace the simulation block with a real API call when ready.
   */
  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    const cleanedContent = content.trim();
    const userMessage = {
      id: generateId(),
      role: 'user',
      content: cleanedContent,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_TYPING', payload: true });

    try {
      let response;
      let payload;
      let conversationId;

      if (state.conversationId && state.conversationId.startsWith('conv_')) {
        response = await queryRag({
          question: cleanedContent,
          conversation_id: state.conversationId,
          top_k: 5,
        });
        payload = response?.data ?? response;
        conversationId = payload?.conversation_id;
      } else {
        response = await queryRag({ question: cleanedContent, top_k: 5 });
        payload = response?.data ?? response;
        conversationId = payload?.conversation_id;
      }

      if (conversationId) {
        dispatch({ type: 'SET_CONVERSATION_ID', payload: conversationId });
      }

      const aiMessage = {
        id: generateId(),
        role: 'assistant',
        content: payload?.answer || payload?.message || 'I could not respond right now.',
        sources: payload?.sources || [],
        timestamp: new Date().toISOString(),
        status: 'delivered',
      };
      dispatch({ type: 'SET_TYPING', payload: false });
      dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
    } catch (error) {
      dispatch({ type: 'SET_TYPING', payload: false });
      const aiMessage = {
        id: generateId(),
        role: 'assistant',
        content: error?.message || 'The assistant could not respond right now.',
        timestamp: new Date().toISOString(),
        status: 'error',
      };
      dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
    }
  }, [state.conversationId]);

  const clearConversation = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const value = {
    ...state,
    sendMessage,
    clearConversation,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// ── Hook ─────────────────────────────────────────────────────
export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside <ChatProvider>');
  return ctx;
}

export default ChatContext;
