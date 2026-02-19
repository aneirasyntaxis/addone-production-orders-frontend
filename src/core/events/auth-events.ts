// Core - Auth Events
// Simple event emitter for authentication events

type AuthEventType = 'unauthorized' | 'token-expired';
type AuthEventListener = () => void;

class AuthEventEmitter {
  private listeners: Map<AuthEventType, Set<AuthEventListener>> = new Map();

  on(event: AuthEventType, listener: AuthEventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off(event: AuthEventType, listener: AuthEventListener) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(listener);
    }
  }

  emit(event: AuthEventType) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((listener) => listener());
    }
  }
}

export const authEvents = new AuthEventEmitter();
