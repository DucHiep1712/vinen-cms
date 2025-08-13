import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Clock } from 'lucide-react';

interface SessionTimeoutProps {
  className?: string;
}

export function SessionTimeout({ className = '' }: SessionTimeoutProps) {
  const { sessionTimeRemaining } = useAuth();

  // Format time remaining
  const formatTimeRemaining = (milliseconds: number): string => {
    if (milliseconds <= 0) return '0:00';
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!sessionTimeRemaining) return null;

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Thời gian phiên đăng nhập
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-center">
            {formatTimeRemaining(sessionTimeRemaining)}
          </div>
          <div className="text-xs text-muted-foreground text-center mt-1">
            Còn lại
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for using session timeout functionality
export function useSessionTimeout() {
  const { sessionTimeRemaining, logout } = useAuth();
  
  const isExpired = sessionTimeRemaining !== null && sessionTimeRemaining <= 0;
  
  return {
    sessionTimeRemaining,
    isExpired,
    logout,
    formatTimeRemaining: (milliseconds: number) => {
      if (milliseconds <= 0) return '0:00';
      const hours = Math.floor(milliseconds / (1000 * 60 * 60));
      const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };
} 