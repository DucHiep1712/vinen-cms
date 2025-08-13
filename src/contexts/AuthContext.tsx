import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { isLoggedIn, getCurrentUser, logout } from '../services/authApi';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  setUser: (user: any) => void;
  sessionTimeRemaining: number | null; // Time remaining in milliseconds
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null);
  
  const isLoggingOut = useRef(false); // Prevent multiple simultaneous logouts

  // Check session validity and update remaining time
  const checkSessionValidity = () => {
    console.log('Checking session validity...');
    if (isLoggedIn()) {
      const currentUser = getCurrentUser();
      console.log('Current user from localStorage:', currentUser);
      if (currentUser && currentUser.expiresAt) {
        const expiresAt = new Date(currentUser.expiresAt);
        const now = new Date();
        const timeRemaining = expiresAt.getTime() - now.getTime();
        console.log('Session expires at:', expiresAt.toLocaleString());
        console.log('Time remaining:', timeRemaining, 'ms');
        
        if (timeRemaining > 0) {
          setSessionTimeRemaining(timeRemaining);
          console.log('Session is valid, setting time remaining:', timeRemaining);
          return true;
        } else {
          // Session expired
          console.log('Session has expired, calling handleSessionExpired');
          handleSessionExpired();
          return false;
        }
      } else {
        // Invalid session data
        console.log('Invalid session data, calling handleSessionExpired');
        handleSessionExpired();
        return false;
      }
    } else {
      // No session
      console.log('No session found in localStorage');
      setSessionTimeRemaining(null);
      return false;
    }
  };

  // Handle expired session
  const handleSessionExpired = () => {
    // Prevent multiple simultaneous logouts
    if (isLoggingOut.current) {
      console.log('Logout already in progress, skipping...');
      return;
    }
    
    isLoggingOut.current = true;
    console.log('Starting logout process...');
    
    logout();
    setUser(null);
    setIsAuthenticated(false);
    setSessionTimeRemaining(null);
    
    // Show notification using toast
    if (typeof window !== 'undefined') {
      import('react-hot-toast').then(({ toast }) => {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', {
          duration: 5000,
          position: 'top-center',
        });
      });
    }
    
    // Reset logout flag after a delay
    setTimeout(() => {
      isLoggingOut.current = false;
      console.log('Logout process completed, flag reset');
    }, 1000);
  };

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = () => {
      if (checkSessionValidity()) {
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          handleSessionExpired();
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Watch for session expiration and auto-logout
  useEffect(() => {
    if (sessionTimeRemaining !== null && sessionTimeRemaining <= 0) {
      // Session has expired, force logout
      handleSessionExpired();
    }
  }, [sessionTimeRemaining]);

  // Countdown timer that updates every second
  useEffect(() => {
    if (sessionTimeRemaining && sessionTimeRemaining > 0) {
      const countdownInterval = setInterval(() => {
        setSessionTimeRemaining(prev => {
          if (prev && prev > 0) {
            const newTime = prev - 1000;
            console.log('Countdown update:', newTime, 'ms');
            return newTime;
          }
          return prev;
        });
      }, 1000);
      
      return () => clearInterval(countdownInterval);
    }
  }, [sessionTimeRemaining]);

  // Frequent session validation check (every second)
  useEffect(() => {
    if (isAuthenticated && sessionTimeRemaining !== null) {
      const validationInterval = setInterval(() => {
        // Check if session is still valid from localStorage
        if (!isLoggedIn() && !isLoggingOut.current) {
          console.log('Session validation failed, logging out...');
          handleSessionExpired();
        }
      }, 1000);
      
      return () => clearInterval(validationInterval);
    }
  }, [isAuthenticated, sessionTimeRemaining]);

  const handleLogout = () => {
    // Prevent multiple simultaneous logouts
    if (isLoggingOut.current) {
      console.log('Logout already in progress, skipping manual logout...');
      return;
    }
    
    isLoggingOut.current = true;
    console.log('Starting manual logout process...');
    
    logout();
    setUser(null);
    setIsAuthenticated(false);
    setSessionTimeRemaining(null);
    setIsLoading(false);
    
    // Reset logout flag after a delay
    setTimeout(() => {
      isLoggingOut.current = false;
      console.log('Manual logout process completed, flag reset');
    }, 1000);
  };

  const handleSetUser = (newUser: any) => {
    console.log('handleSetUser called with:', newUser);
    setUser(newUser);
    setIsAuthenticated(!!newUser);
    console.log('Setting isAuthenticated to:', !!newUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      logout: handleLogout,
      setUser: handleSetUser,
      sessionTimeRemaining,
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