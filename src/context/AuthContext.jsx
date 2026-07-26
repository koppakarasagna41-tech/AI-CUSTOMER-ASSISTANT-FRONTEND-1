/**
 * AuthContext.jsx
 *
 * Manages authentication state across the entire app.
 * Persists the user token in localStorage so the session
 * survives page refreshes.
 *
 * Exports:
 *  - AuthProvider  — wraps the app tree
 *  - useAuth       — hook for consuming auth state/actions
 */

import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

// ── Initial state ────────────────────────────────────────────
const initialState = {
  user:          null,   // { id, name, email, avatar, role }
  token:         null,   // JWT string
  isAuthenticated: false,
  isLoading:     true,   // true while hydrating from localStorage
};

// ── Reducer ──────────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        user:            action.payload.user,
        token:           action.payload.token,
        isAuthenticated: !!action.payload.token,
        isLoading:       false,
      };

    case 'LOGIN':
      return {
        ...state,
        user:            action.payload.user,
        token:           action.payload.token,
        isAuthenticated: true,
        isLoading:       false,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Hydrate auth state from localStorage on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('auth_token');
      const user  = JSON.parse(localStorage.getItem('auth_user') || 'null');
      dispatch({ type: 'HYDRATE', payload: { token, user } });
    } catch {
      dispatch({ type: 'HYDRATE', payload: { token: null, user: null } });
    }
  }, []);

  // ── Actions ─────────────────────────────────────────────────

  /**
   * Call after a successful API login response.
   * Persists token + user to localStorage.
   */
  const login = useCallback((user, token) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user',  JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: { user, token } });
  }, []);

  /**
   * Clears all auth state and localStorage.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  /**
   * Patch the stored user object (e.g. after profile update).
   */
  const updateUser = useCallback((patch) => {
    const updated = { ...state.user, ...patch };
    localStorage.setItem('auth_user', JSON.stringify(updated));
    dispatch({ type: 'UPDATE_USER', payload: patch });
  }, [state.user]);

  const value = {
    ...state,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ─────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
