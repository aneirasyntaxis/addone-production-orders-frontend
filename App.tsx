// Main App File
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/presentation/context/AuthContext';
import { AppNavigator } from './src/presentation/navigation/AppNavigator';
import { logger } from './src/core/logging/logger';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  useEffect(() => {
    logger.info('🚀 App started');
    
    // Setup global error handlers
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('Unhandled Promise Rejection', event.reason);
      console.error('🔥 UNHANDLED REJECTION:', event.reason);
    };

    const handleError = (event: ErrorEvent) => {
      logger.error('Global Error', event.error);
      console.error('🔥 GLOBAL ERROR:', event.error);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      window.addEventListener('error', handleError);
    }

    return () => {
      logger.info('App unmounting');
      if (typeof window !== 'undefined') {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        window.removeEventListener('error', handleError);
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
