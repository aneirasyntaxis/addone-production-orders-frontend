// Presentation - Auth Context
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthSession } from '../../domain/entities/user.entity';
import { GetSessionUseCase } from '../../domain/usecases/get-session.usecase';
import { LogoutUseCase } from '../../domain/usecases/logout.usecase';
import { authRepository } from '../../data/repositories/auth.repository';
import { logger } from '../../core/logging/logger';
import { authEvents } from '../../core/events/auth-events';

interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getSessionUseCase = new GetSessionUseCase(authRepository);
const logoutUseCase = new LogoutUseCase(authRepository);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      logger.info('Loading session...');
      const savedSession = await getSessionUseCase.execute();
      if (savedSession) {
        logger.info('Session loaded successfully', {
          userId: savedSession.user.userId,
          username: savedSession.user.username,
          companyDB: savedSession.sapToken.companyDB,
        });
      } else {
        logger.info('No session found');
      }
      setSessionState(savedSession);
    } catch (error) {
      logger.error('Error loading session', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setSession = async (newSession: AuthSession) => {
    logger.info('Setting new session', { userId: newSession.user.userId });
    
    // Save session to repository (AsyncStorage)
    await authRepository.saveSession(newSession);
    
    // Save JWT token if present
    if (newSession.token) {
      const apiClient = (await import('../../data/api/api-client')).apiClient;
      await apiClient.setAuthToken(newSession.token);
      logger.info('JWT token saved', { expiresAt: newSession.tokenExpiresAt });
    }
    
    // Update state after saving
    setSessionState(newSession);
  };

  const logout = async () => {
    try {
      logger.info('Logging out...');
      await logoutUseCase.execute();
      
      // Clear JWT token
      const apiClient = (await import('../../data/api/api-client')).apiClient;
      await apiClient.clearAuthToken();
      
      setSessionState(null);
      logger.info('Logout successful');
    } catch (error) {
      logger.error('Error during logout', error);
      throw error;
    }
  };

  // Check token expiration every minute
  React.useEffect(() => {
    if (!session || !session.tokenExpiresAt) return;

    const checkTokenExpiration = () => {
      const now = new Date().getTime();
      const expiresAt = new Date(session.tokenExpiresAt!).getTime();
      
      if (now >= expiresAt) {
        logger.warn('JWT token expired, logging out');
        logout();
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [session]);

  // Listen for unauthorized events from API client
  React.useEffect(() => {
    const handleUnauthorized = () => {
      logger.warn('Unauthorized event received - forcing logout');
      logout();
    };

    authEvents.on('unauthorized', handleUnauthorized);

    return () => {
      authEvents.off('unauthorized', handleUnauthorized);
    };
  }, []);

  const value: AuthContextType = {
    session,
    isLoading,
    isAuthenticated: session !== null,
    setSession,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
