// Main App File
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, Text, Alert } from 'react-native';
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

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary caught error', { error, errorInfo });
    console.error('🔥 APP CRASH:', error);
    Alert.alert(
      'Error',
      `La app encontró un error: ${error.message}\n\nAPI: ${process.env.EXPO_PUBLIC_API_BASE_URL || 'No configurada'}`
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Error en la aplicación
          </Text>
          <Text style={{ textAlign: 'center', color: '#666' }}>
            {this.state.error?.message || 'Error desconocido'}
          </Text>
          <Text style={{ marginTop: 20, fontSize: 12, color: '#999' }}>
            API: {process.env.EXPO_PUBLIC_API_BASE_URL || 'No configurada'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    logger.info('🚀 App started');
    logger.info(`API URL: ${process.env.EXPO_PUBLIC_API_BASE_URL}`);
    console.log('🌐 API URL:', process.env.EXPO_PUBLIC_API_BASE_URL);
    
    // NOTA: window.addEventListener no está disponible en React Native
    // Los error handlers globales se manejan con ErrorBoundary
    
    return () => {
      logger.info('App unmounting');
    };
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
