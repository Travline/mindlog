// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'jwt_token';

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadToken() {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (storedToken) setToken(storedToken);
      } catch (e) {
        console.error('Error al cargar el token', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadToken();
  }, []);

  const signIn = async (newToken: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, signIn, signOut }
    }>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);