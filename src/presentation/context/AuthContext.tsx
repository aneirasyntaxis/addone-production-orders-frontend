// Presentation - Auth Context
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthSession } from '../../domain/entities/user.entity';
import { GetSessionUseCase } from '../../domain/usecases/get-session.usecase';
import { LogoutUseCase } from '../../domain/usecases/logout.usecase';
import { authRepository } from '../../data/repositories/auth.repository';
import { logger } from '../../core/logging/logger';

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
      console.error('❌ Error loading session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setSession = (newSession: AuthSession) => {
    logger.info('Setting new session', { userId: newSession.user.userId });
    setSessionState(newSession);
  };

  const logout = async () => {
    try {
      logger.info('Logging out...');
      await logoutUseCase.execute();
      setSessionState(null);
      logger.info('Logout successful');
    } catch (error) {
      logger.error('Error during logout', error);
      console.error('❌ Error during logout:', error);
      throw error;
    }
  };

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
