// Data - API Client
import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from '../../core/constants/app.constants';
import { AppError } from '../../core/errors/error-handler';
import { logger } from '../../core/logging/logger';
import { storageService } from '../storage/storage.service';
import { authEvents } from '../../core/events/auth-events';

const TOKEN_KEY = 'auth_token';

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    logger.info(`🔌 Initializing ApiClient with Base URL: ${baseURL}`);
    this.client = axios.create({
      baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add JWT token to headers
    this.client.interceptors.request.use(
      async (config) => {
        const fullUrl = `${config.baseURL || ''}${config.url}`;
        logger.logApiRequest(
          config.method?.toUpperCase() || 'UNKNOWN',
          fullUrl,
          config.data
        );

        // Add JWT token to Authorization header if available
        const token = await storageService.getItem<string>(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          logger.info('JWT token added to request', { hasToken: true });
        } else {
          logger.warn('No JWT token found in storage');
        }

        return config;
      },
      (error) => {
        logger.error('Request interceptor error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.logApiResponse(
          response.config.method?.toUpperCase() || 'UNKNOWN',
          response.config.url || '',
          response.status,
          response.data
        );
        return response;
      },
      async (error: AxiosError) => {
        const appError = this.handleError(error);
        logger.logApiError(
          error.config?.method?.toUpperCase() || 'UNKNOWN',
          error.config?.url || '',
          appError
        );

        // Handle 401 Unauthorized - clear token and trigger logout
        if (error.response?.status === 401) {
          logger.warn('Received 401 Unauthorized - clearing authentication');
          await this.clearAuthToken();
          // Emit event to notify AuthContext
          authEvents.emit('unauthorized');
        }

        return Promise.reject(appError);
      }
    );
  }

  private handleError(error: AxiosError): AppError {
    if (error.response) {
      const data = error.response.data as any;
      const message = data?.message || data?.errors?.[0] || 'Error en la solicitud';
      
      // Si es 401, el token expiró o es inválido
      if (error.response.status === 401) {
        logger.warn('Unauthorized request - token may be expired or invalid');
        // El AuthContext manejará esto con un interceptor
      }
      
      return new AppError(message, 'API_ERROR', error.response.status);
    }

    if (error.request) {
      return new AppError(
        error.message || 'No se pudo conectar con el servidor. Verifica tu conexión.',
        error.code || 'NETWORK_ERROR'
      );
    }

    return new AppError(error.message || 'Error desconocido', 'UNKNOWN_ERROR');
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  // Token management methods
  async setAuthToken(token: string) {
    await storageService.setItem(TOKEN_KEY, token);
    logger.info('JWT token stored in AsyncStorage', { tokenLength: token.length });
  }

  async clearAuthToken() {
    await storageService.removeItem(TOKEN_KEY);
    logger.info('JWT token cleared from AsyncStorage');
  }

  async getAuthToken(): Promise<string | null> {
    const token = await storageService.getItem<string>(TOKEN_KEY);
    logger.info('JWT token retrieved from AsyncStorage', { hasToken: !!token });
    return token;
  }
}

export const apiClient = new ApiClient();
