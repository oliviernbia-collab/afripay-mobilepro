import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getAccessToken, saveTokens, clearTokens, setOnAuthFailure } from '../api/client';
import { getMe, loginMerchant as apiLoginMerchant, registerMerchant as apiRegisterMerchant } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [merchant, setMerchant] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const logout = useCallback(async () => {
    await clearTokens();
    setMerchant(null);
  }, []);

  const refreshMerchant = useCallback(async () => {
    try {
      const me = await getMe();
      if (me.type !== 'marchand') {
        // Wrong account type logged in for this app — force logout.
        await logout();
        return null;
      }
      setMerchant(me.merchant);
      return me.merchant;
    } catch (e) {
      return null;
    }
  }, [logout]);

  useEffect(() => {
    setOnAuthFailure(() => {
      setMerchant(null);
    });

    (async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          await refreshMerchant();
        }
      } finally {
        setInitializing(false);
      }
    })();
  }, [refreshMerchant]);

  const login = useCallback(async ({ telephone, motDePasse }) => {
    const result = await apiLoginMerchant({ telephone, motDePasse });
    await saveTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    setMerchant(result.merchant);
    return result.merchant;
  }, []);

  const register = useCallback(async (payload) => {
    const result = await apiRegisterMerchant(payload);
    await saveTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    setMerchant(result.merchant);
    return result.merchant;
  }, []);

  const value = {
    merchant,
    setMerchant,
    initializing,
    isAuthenticated: !!merchant,
    isKybValidated: merchant?.statut_kyb === 'validé',
    login,
    register,
    logout,
    refreshMerchant,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
