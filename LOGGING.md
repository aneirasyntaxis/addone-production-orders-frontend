# 🔍 Sistema de Logging

## Descripción
Este proyecto tiene un sistema completo de logging que registra todas las operaciones importantes de la aplicación.

## Dónde ver los logs

### 1. Consola del Navegador (Web)
Cuando ejecutas `npm run web`, todos los logs aparecen en:
- **Chrome DevTools**: Presiona `F12` → pestaña "Console"
- **Firefox**: Presiona `F12` → pestaña "Console"

### 2. Terminal Metro Bundler
Al ejecutar `npm start` o `npm run web`, el terminal de Metro Bundler muestra:
- Errores de compilación
- Warnings de React
- Algunos logs de la aplicación

### 3. React Native Debugger (Mobile)
Para desarrollo móvil:
- Abre el menú de desarrollo (shake device o `Cmd+D` / `Ctrl+M`)
- Selecciona "Debug JS Remotely"
- Se abrirá una ventana del navegador con la consola

## Tipos de logs

### 🔍 DEBUG (solo en desarrollo)
```typescript
logger.debug('Mensaje de debug', { data: 'valor' });
```
Solo aparece en modo desarrollo (`__DEV__`)

### ℹ️ INFO
```typescript
logger.info('Operación completada', { count: 10 });
```
Información general sobre operaciones

### ⚠️ WARN
```typescript
logger.warn('Advertencia', { retry: 1 });
```
Advertencias que no detienen la aplicación

### ❌ ERROR
```typescript
logger.error('Error crítico', error);
```
Errores que afectan la funcionalidad

## Logs automáticos implementados

### API Requests
```
🔍 [2025-11-13T10:30:00Z] [WEB] [DEBUG] API REQUEST: GET /api/production-orders
{
  "method": "GET",
  "url": "/api/production-orders"
}
```

### API Responses
```
🔍 [2025-11-13T10:30:01Z] [WEB] [DEBUG] API RESPONSE: GET /api/production-orders - Status: 200
{
  "status": 200,
  "data": [...]
}
```

### API Errors
```
❌ [2025-11-13T10:30:02Z] [WEB] [ERROR] API ERROR: GET /api/production-orders
{
  "status": 500,
  "message": "Internal Server Error",
  "response": {...}
}
```

### Authentication
```
ℹ️ [2025-11-13T10:29:00Z] [WEB] [INFO] Loading session...
ℹ️ [2025-11-13T10:29:01Z] [WEB] [INFO] Session loaded successfully
{
  "userId": 1,
  "username": "admin",
  "company": "Company ABC"
}
```

### Queries (React Query)
```
ℹ️ [2025-11-13T10:30:00Z] [WEB] [INFO] Fetching production orders...
ℹ️ [2025-11-13T10:30:01Z] [WEB] [INFO] Production orders fetched successfully
{
  "count": 18
}
```

### Errores Globales
```
🔥 UNHANDLED REJECTION: Error: Network Error
❌ [2025-11-13T10:31:00Z] [WEB] [ERROR] Unhandled Promise Rejection
```

## Ejemplo de error completo en consola

Cuando ocurre un error de API, verás:

```
❌ [2025-11-13T10:30:00Z] [WEB] [ERROR] API ERROR: GET /api/production-orders
{
  "method": "GET",
  "url": "/api/production-orders",
  "error": "Network Error",
  "status": undefined
}

❌ Network Error: {
  "message": "Network Error",
  "url": "/api/production-orders",
  "code": "ERR_NETWORK"
}

❌ [2025-11-13T10:30:00Z] [WEB] [ERROR] Failed to fetch production orders
Error: No se pudo conectar con el servidor...
    at ApiClient.handleError (api-client.ts:45)
    ...
```

## Filtrar logs en la consola del navegador

### Solo errores:
```javascript
// En la consola del navegador
console.clear(); // Limpiar
// Luego filtra por "❌" o "ERROR"
```

### Solo requests de API:
```javascript
// Filtra por "API REQUEST" o "API RESPONSE"
```

### Exportar historial de logs (programático)
```typescript
import { logger } from './src/core/logging/logger';

// Ver todos los logs
console.log(logger.getHistory());

// Solo errores
console.log(logger.getHistory(LogLevel.ERROR));

// Exportar como texto
console.log(logger.exportLogs());
```

## Configuración

### Desactivar logs de debug en producción
Los logs DEBUG ya están desactivados automáticamente cuando `__DEV__` es `false`.

### Cambiar tamaño del historial
En `logger.ts`:
```typescript
private maxHistorySize = 100; // Cambiar este valor
```

## Troubleshooting

### "No veo ningún log"
1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña "Console"
3. Asegúrate de que no hay filtros activos
4. Recarga la aplicación

### "Solo veo warnings de React"
Los logs de la aplicación tienen prefijos:
- 🔍 DEBUG
- ℹ️ INFO
- ⚠️ WARN
- ❌ ERROR

Busca estos emojis en la consola.

### "Los logs están muy verbosos"
Puedes filtrar en DevTools:
- Escribe "ERROR" para ver solo errores
- Escribe "API" para ver solo llamadas de API
- Usa los filtros de nivel: Error, Warning, Info, Debug

## Mejores prácticas

1. **Siempre abre DevTools** antes de probar la aplicación
2. **Limpia la consola** (`Ctrl+L` o botón Clear) antes de cada prueba
3. **Revisa el stack trace completo** cuando hay errores
4. **Busca "API ERROR"** cuando haya problemas de conexión
5. **Verifica la pestaña Network** para detalles de las peticiones HTTP
