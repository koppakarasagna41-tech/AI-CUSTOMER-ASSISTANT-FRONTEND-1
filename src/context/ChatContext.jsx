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
  useRef,
} from 'react';
import { generateId } from '@/utils/helpers';
import chatService from '@/services/chatService';

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
export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const typingTimeout = useRef(null);

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
      if (state.conversationId && state.conversationId.startsWith('conv_')) {
        response = await chatService.sendMessage({ conversationId: state.conversationId, content: cleanedContent });
      } else {
        response = await chatService.startChat({ message: cleanedContent, title: cleanedContent.slice(0, 60) });
      }

      const payload = response?.data ?? response;
      const conversationId = payload?.conversation_id || payload?.ai_response?.conversation_id;
      if (conversationId) {
        dispatch({ type: 'SET_CONVERSATION_ID', payload: conversationId });
      }
      const aiMessage = {
        id: generateId(),
        role: 'assistant',
        content: payload?.ai_response?.content || payload?.message || 'I could not respond right now.',
        timestamp: payload?.ai_response?.created_at || new Date().toISOString(),
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
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
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
