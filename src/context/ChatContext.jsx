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

// ── Placeholder AI responses ─────────────────────────────────
const AI_RESPONSES = [
  "Thanks for reaching out! I'd be happy to help you with that. Could you provide a bit more detail so I can assist you better?",
  "Great question! Based on what you've shared, here's what I recommend: make sure to check your account settings first, then try refreshing the page.",
  "I understand your concern. This is a common issue that our team is aware of. Here are the steps to resolve it: 1) Clear your cache, 2) Log out and back in, 3) Contact support if the issue persists.",
  "I've looked into this for you. It seems like everything is working on our end. Could you try from a different browser or device?",
  "Absolutely! Our premium plan includes unlimited access, priority support, and advanced analytics. Would you like me to walk you through the upgrade process?",
  "I'm sorry to hear you're experiencing this issue. Let me escalate this to our technical team. In the meantime, here's a workaround that might help…",
  "That's a great point! We actually released an update last week that addresses exactly this. Make sure you're on the latest version.",
];

function getRandomAIResponse() {
  return AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
}

// ── State shape ──────────────────────────────────────────────
const initialState = {
  messages:        [],   // [{ id, role:'user'|'assistant', content, timestamp, status }]
  isTyping:        false,
  conversationId:  generateId(),
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

    // 1. Add user message immediately
    const userMessage = {
      id:        generateId(),
      role:      'user',
      content:   content.trim(),
      timestamp: new Date().toISOString(),
      status:    'sent',
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

    // 2. Show typing indicator
    dispatch({ type: 'SET_TYPING', payload: true });

    // 3. Simulate AI response delay (replace with real API call)
    typingTimeout.current = setTimeout(() => {
      const aiMessage = {
        id:        generateId(),
        role:      'assistant',
        content:   getRandomAIResponse(),
        timestamp: new Date().toISOString(),
        status:    'delivered',
      };
      dispatch({ type: 'SET_TYPING',    payload: false });
      dispatch({ type: 'ADD_MESSAGE',   payload: aiMessage });
    }, 1200 + Math.random() * 800);
  }, []);

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
