import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { isLoggedIn, getCurrentUser, logout } from '../services/authApi';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  logout: () => void;
  setUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = () => {
      if (isLoggedIn()) {
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Invalid session, clear it
          logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleSetUser = (newUser: any) => {
    setUser(newUser);
    setIsAuthenticated(!!newUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      logout: handleLogout,
      setUser: handleSetUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 