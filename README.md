# AddOne Production Orders - Mobile App

Aplicación móvil desarrollada en React Native (Expo) para el sistema de gestión de órdenes de producción.

## 🏗️ Arquitectura

El proyecto sigue los principios de **Clean Architecture**, separando las responsabilidades en capas:

```
src/
├── core/                 # Configuración central y utilidades
│   ├── constants/       # Constantes de la aplicación
│   └── errors/          # Manejo de errores
├── domain/              # Capa de dominio (Lógica de negocio)
│   ├── entities/        # Entidades del dominio
│   ├── repositories/    # Interfaces de repositorios
│   └── usecases/        # Casos de uso
├── data/                # Capa de datos (Implementaciones)
│   ├── api/            # Cliente API y endpoints
│   ├── dtos/           # Data Transfer Objects
│   ├── mappers/        # Mapeo DTO <-> Entity
│   ├── repositories/   # Implementación de repositorios
│   └── storage/        # Almacenamiento local
└── presentation/        # Capa de presentación (UI)
    ├── components/      # Componentes reutilizables
    ├── context/        # Contextos de React
    ├── hooks/          # Custom hooks
    ├── navigation/     # Configuración de navegación
    ├── screens/        # Pantallas de la app
    └── theme/          # Tema y estilos
```

## 🚀 Tecnologías

- **React Native** (Expo) - Framework principal
- **TypeScript** - Tipado estático
- **React Navigation** - Navegación entre pantallas
- **React Query** - Gestión de estado del servidor
- **Axios** - Cliente HTTP
- **AsyncStorage** - Almacenamiento local
- **React Native Toast Message** - Notificaciones

## 📋 Requisitos Previos

- Node.js >= 20.14.0
- npm o yarn
- Expo CLI
- Para iOS: macOS con Xcode
- Para Android: Android Studio

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
cd addone-production-orders-frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita el archivo `.env` con la URL de tu backend:
```env
EXPO_PUBLIC_API_BASE_URL=http://tu-ip:5000
```

⚠️ **Importante**: Para desarrollo con dispositivos físicos o emuladores, usa la IP local de tu máquina en lugar de `localhost`.

## 🏃‍♂️ Ejecución

### Modo desarrollo

```bash
# Iniciar Expo Dev Server
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS (solo macOS)
npm run ios

# Ejecutar en web
npm run web
```

### Usando Expo Go

1. Instala **Expo Go** en tu dispositivo móvil
2. Ejecuta `npm start`
3. Escanea el QR code con la app de Expo Go

## 📱 Características Implementadas

### ✅ Autenticación
- Pantalla de login
- Selector de compañía
- Validación de formularios
- Manejo de sesión con AsyncStorage
- Navegación protegida

### ✅ Gestión de Compañías
- Listado de compañías disponibles
- Integración con API del backend

## 🔐 Flujo de Autenticación

1. Usuario ingresa credenciales y selecciona compañía
2. Se valida el formulario localmente
3. Se envía petición al backend `/api/users/login`
4. Si es exitoso, se guarda la sesión en AsyncStorage
5. Se actualiza el contexto de autenticación
6. Se redirige automáticamente a Home

## 🎨 Componentes Reutilizables

- **Button**: Botón con estados de carga
- **Input**: Campo de texto con validación
- **Selector**: Selector modal personalizado
- **Card**: Contenedor con sombra
- **Loading**: Indicador de carga

## 📡 API Integration

### Endpoints implementados:

#### `GET /api/companies`
Obtiene todas las compañías disponibles
```typescript
Response: ApiResponse<CompanyDto[]>
```

#### `POST /api/users/login`
Autentica al usuario
```typescript
Request: {
  username: string;
  password: string;
  companyDB: string;
}
Response: ApiResponse<UserLoginResponseDto>
```

## 🔨 Scripts Disponibles

```bash
# Desarrollo
npm start          # Inicia Expo Dev Server
npm run android    # Ejecuta en Android
npm run ios        # Ejecuta en iOS
npm run web        # Ejecuta en navegador

# Code Quality
npm run lint       # Ejecuta ESLint
npm run format     # Formatea código con Prettier
```

## 📝 Convenciones de Código

- **TypeScript**: Tipado estricto en todos los archivos
- **Nombres de archivos**: PascalCase para componentes, camelCase para utilities
- **Imports**: Ordenados por tipo (React, librerías, locales)
- **Componentes**: Functional components con TypeScript
- **Styles**: StyleSheet de React Native, evitar inline styles

## 🐛 Debugging

### Logs
```typescript
// Usar console.log para debug en desarrollo
console.log('Debug info:', data);
```

### React Native Debugger
1. Instala React Native Debugger
2. Abre el debugger antes de iniciar la app
3. En el dispositivo: Shake > Debug

### Expo Dev Tools
- Accede a `http://localhost:19002` después de `npm start`
- Visualiza logs, performance, y más

## 🔐 Seguridad

- Las contraseñas NO se almacenan en AsyncStorage
- Solo se guarda el SessionID de SAP
- Las credenciales se envían por HTTPS en producción
- Validación de entrada en cliente y servidor

## 🚀 Próximos Pasos

- [ ] Implementar pantallas de órdenes de producción
- [ ] Agregar gestión de avances
- [ ] Implementar consumos
- [ ] Agregar manejo de errores offline
- [ ] Implementar refresh tokens
- [ ] Agregar tests unitarios
- [ ] Configurar CI/CD

## 📚 Recursos

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)

## 👨‍💻 Desarrollo

Este proyecto fue desarrollado siguiendo las mejores prácticas de:
- Clean Architecture
- SOLID Principles
- Separation of Concerns
- Dependency Injection

## 📄 Licencia

Proyecto privado - Todos los derechos reservados
