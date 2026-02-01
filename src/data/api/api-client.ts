// Data - API Client
import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from '../../core/constants/app.constants';
import { AppError } from '../../core/errors/error-handler';
import { logger } from '../../core/logging/logger';

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
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const fullUrl = `${config.baseURL || ''}${config.url}`;
        logger.logApiRequest(
          config.method?.toUpperCase() || 'UNKNOWN',
          fullUrl, // Logueamos la URL completa
          config.data
        );
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
      (error: AxiosError) => {
        const appError = this.handleError(error);
        logger.logApiError(
          error.config?.method?.toUpperCase() || 'UNKNOWN',
          error.config?.url || '',
          appError
        );
        return Promise.reject(appError);
      }
    );
  }

  private handleError(error: AxiosError): AppError {
    if (error.response) {
      const data = error.response.data as any;
      const message = data?.message || data?.errors?.[0] || 'Error en la solicitud';
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

  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }
}

export const apiClient = new ApiClient();
