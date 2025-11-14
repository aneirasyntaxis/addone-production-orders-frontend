// Presentation - Login Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Selector, SelectorOption } from '../components/Picker';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';
import { theme } from '../theme/theme';
import { useCompanies } from '../hooks/useCompanies';
import { useLogin } from '../hooks/useLogin';
import { useAuth } from '../context/AuthContext';
import { handleError } from '../../core/errors/error-handler';

export const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [companyDB, setCompanyDB] = useState('');
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    companyDB?: string;
  }>({});

  const { setSession } = useAuth();
  const { data: companies, isLoading: isLoadingCompanies } = useCompanies();
  const { mutate: login, isPending: isLoggingIn } = useLogin();

  const companyOptions: SelectorOption[] =
    companies?.map((company) => ({
      label: company.name,
      value: company.code,
    })) || [];

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!username.trim()) {
      newErrors.username = 'El usuario es requerido';
    }

    if (!password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    }

    if (!companyDB) {
      newErrors.companyDB = 'La compañía es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Error de validación',
        text2: 'Por favor completa todos los campos',
      });
      return;
    }

    login(
      {
        username: username.trim(),
        password: password.trim(),
        companyDB,
      },
      {
        onSuccess: (session) => {
          setSession(session);
          Toast.show({
            type: 'success',
            text1: 'Inicio de sesión exitoso',
            text2: 'Bienvenido al sistema',
          });
        },
        onError: (error) => {
          const errorMessage = handleError(error);
          Toast.show({
            type: 'error',
            text1: 'Error de autenticación',
            text2: errorMessage,
          });
        },
      }
    );
  };

  if (isLoadingCompanies) {
    return <Loading />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Logo/Icon */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>🏭</Text>
            </View>
            <Text style={styles.title}>Sistema de Fabricación</Text>
            <Text style={styles.subtitle}>Ingresa tus credenciales para continuar</Text>
          </View>

          {/* Login Form */}
          <Card style={styles.card}>
            <Selector
              label="Compañía"
              value={companyDB}
              options={companyOptions}
              onValueChange={(value) => {
                setCompanyDB(value);
                setErrors((prev) => ({ ...prev, companyDB: undefined }));
              }}
              placeholder="Selecciona una compañía"
              error={errors.companyDB}
            />

            <Input
              label="Usuario"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setErrors((prev) => ({ ...prev, username: undefined }));
              }}
              placeholder="Tu usuario"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.username}
            />

            <Input
              label="Contraseña"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="Tu contraseña"
              secureTextEntry
              error={errors.password}
            />

            <Button
              title="Iniciar Sesión"
              onPress={handleLogin}
              loading={isLoggingIn}
              style={styles.loginButton}
            />
          </Card>
        </View>
      </ScrollView>
      <Toast />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logo: {
    width: 64,
    height: 64,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButton: {
    marginTop: theme.spacing.md,
  },
});
