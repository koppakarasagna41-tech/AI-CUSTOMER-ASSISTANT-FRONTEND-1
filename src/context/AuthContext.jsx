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
import { STORAGE_KEYS, USER_ROLE } from '@/utils/constants';
import authService from '@/services/authService';
import userService from '@/services/userService';

// ── Initial state ──────────────────────────────────────────────────
const initialState = {
  user: null,   // { id, name, email, avatar, role }
  token: null,  // JWT string
  isAdmin: false,
  isAuthenticated: false,
  isLoading: true,   // true while hydrating from localStorage
};

// ── Reducer ──────────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAdmin: action.payload.user?.role === USER_ROLE.ADMIN,
        isAuthenticated: !!action.payload.token,
        isLoading: false,
      };

    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAdmin: action.payload.user?.role === USER_ROLE.ADMIN,
        isAuthenticated: true,
        isLoading: false,
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
        isAdmin: action.payload.role
          ? action.payload.role === USER_ROLE.ADMIN
          : state.isAdmin,
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

  // Hydrate auth state from localStorage on mount and refresh the current user profile.
  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const storedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTH_USER) || 'null');

        if (!token) {
          if (mounted) {
            dispatch({ type: 'HYDRATE', payload: { token: null, user: null } });
          }
          return;
        }

        dispatch({ type: 'HYDRATE', payload: { token, user: storedUser } });

        try {
          const currentUser = await userService.getProfile();
          if (mounted) {
            localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(currentUser));
            dispatch({ type: 'LOGIN', payload: { user: currentUser, token } });
          }
        } catch {
          if (mounted) {
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
            dispatch({ type: 'LOGOUT' });
          }
        }
      } catch {
        if (mounted) {
          dispatch({ type: 'HYDRATE', payload: { token: null, user: null } });
        }
      }
    }

    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  // ── Actions ─────────────────────────────────────────────────

  /**
   * Call after a successful API login response.
   * Persists token + user to localStorage.
   */
  const login = useCallback((user, token, refreshToken = null) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN, refreshToken);
    }
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: { user, token } });
  }, []);

  /**
   * Clears all auth state and localStorage.
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore backend errors and clear the client session
    } finally {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  /**
   * Patch the stored user object (e.g. after profile update).
   */
  const updateUser = useCallback((patch) => {
    const updated = { ...state.user, ...patch };
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updated));
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
