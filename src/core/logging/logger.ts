// Core - Logger Service
import { Platform } from 'react-native';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  data?: any;
  stack?: string;
}

class Logger {
  private isDevelopment = __DEV__;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 100;

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = this.getTimestamp();
    const platform = Platform.OS;
    let formatted = `[${timestamp}] [${platform.toUpperCase()}] [${level}] ${message}`;
    
    if (data) {
      formatted += `\n${JSON.stringify(data, null, 2)}`;
    }
    
    return formatted;
  }

  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  debug(message: string, data?: any): void {
    if (!this.isDevelopment) return;

    const formatted = this.formatMessage(LogLevel.DEBUG, message, data);
    console.log(`🔍 ${formatted}`);

    this.addToHistory({
      level: LogLevel.DEBUG,
      timestamp: this.getTimestamp(),
      message,
      data,
    });
  }

  info(message: string, data?: any): void {
    const formatted = this.formatMessage(LogLevel.INFO, message, data);
    console.log(`ℹ️ ${formatted}`);

    this.addToHistory({
      level: LogLevel.INFO,
      timestamp: this.getTimestamp(),
      message,
      data,
    });
  }

  warn(message: string, data?: any): void {
    const formatted = this.formatMessage(LogLevel.WARN, message, data);
    console.warn(`⚠️ ${formatted}`);

    this.addToHistory({
      level: LogLevel.WARN,
      timestamp: this.getTimestamp(),
      message,
      data,
    });
  }

  error(message: string, error?: any): void {
    const formatted = this.formatMessage(LogLevel.ERROR, message, error);
    
    // Log to console with full error details
    console.error(`❌ ${formatted}`);
    
    if (error?.stack) {
      console.error('Stack Trace:', error.stack);
    }

    this.addToHistory({
      level: LogLevel.ERROR,
      timestamp: this.getTimestamp(),
      message,
      data: error,
      stack: error?.stack,
    });
  }

  // API-specific logging
  logApiRequest(method: string, url: string, data?: any): void {
    this.debug(`API REQUEST: ${method} ${url}`, {
      method,
      url,
      data,
    });
  }

  logApiResponse(method: string, url: string, status: number, data?: any): void {
    this.debug(`API RESPONSE: ${method} ${url} - Status: ${status}`, {
      method,
      url,
      status,
      data,
    });
  }

  logApiError(method: string, url: string, error: any): void {
    this.error(`API ERROR: ${method} ${url}`, {
      method,
      url,
      error: error?.message || error,
      response: error?.response?.data,
      status: error?.response?.status,
      stack: error?.stack,
    });
  }

  // Get log history for debugging
  getHistory(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logHistory.filter((entry) => entry.level === level);
    }
    return this.logHistory;
  }

  // Clear log history
  clearHistory(): void {
    this.logHistory = [];
  }

  // Export logs as text (useful for debugging)
  exportLogs(): string {
    return this.logHistory
      .map((entry) => {
        let log = `[${entry.timestamp}] [${entry.level}] ${entry.message}`;
        if (entry.data) {
          log += `\nData: ${JSON.stringify(entry.data, null, 2)}`;
        }
        if (entry.stack) {
          log += `\nStack: ${entry.stack}`;
        }
        return log;
      })
      .join('\n\n---\n\n');
  }
}

export const logger = new Logger();
