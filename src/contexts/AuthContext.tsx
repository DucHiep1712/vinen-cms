import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { isLoggedIn, getCurrentUser, logout } from '../services/authApi';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean; // Added loading state
  logout: () => void;
  setUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

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
      setIsLoading(false); // Set loading to false after check
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  const handleSetUser = (newUser: any) => {
    setUser(newUser);
    setIsAuthenticated(!!newUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading, // Provided in context
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