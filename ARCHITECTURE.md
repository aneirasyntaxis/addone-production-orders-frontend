# Arquitectura del Proyecto

## 🏗️ Clean Architecture

Este proyecto sigue los principios de Clean Architecture, organizando el código en capas con responsabilidades bien definidas.

### Flujo de Dependencias

```
Presentation → Domain ← Data
```

Las dependencias siempre apuntan hacia el **dominio** (núcleo de la aplicación).

## 📂 Estructura Detallada

### 1. **Core** (`src/core/`)
Contiene configuraciones centrales y utilidades compartidas.

```
core/
├── constants/
│   └── app.constants.ts    # Constantes globales (URLs, keys, rutas)
└── errors/
    └── error-handler.ts    # Manejo centralizado de errores
```

**Propósito**: Configuración y utilidades que no pertenecen a ninguna capa específica.

---

### 2. **Domain** (`src/domain/`)
**Capa más importante**. Contiene la lógica de negocio pura, independiente de frameworks.

```
domain/
├── entities/
│   ├── company.entity.ts       # Modelo de Compañía
│   └── user.entity.ts          # Modelos de Usuario y Sesión
├── repositories/
│   ├── company.repository.interface.ts    # Contrato del repositorio
│   └── auth.repository.interface.ts       # Contrato de autenticación
└── usecases/
    ├── get-all-companies.usecase.ts       # Caso de uso: Obtener compañías
    ├── login.usecase.ts                   # Caso de uso: Login
    ├── get-session.usecase.ts             # Caso de uso: Obtener sesión
    └── logout.usecase.ts                  # Caso de uso: Logout
```

**Principios**:
- **Entidades**: Modelos de dominio puros (sin lógica de UI o BD)
- **Repositorios**: Interfaces (contratos), NO implementaciones
- **Use Cases**: Un caso de uso = una acción del usuario
- **Sin dependencias externas**: No imports de React, Axios, etc.

---

### 3. **Data** (`src/data/`)
Implementa los contratos definidos en el dominio. Se conecta con APIs y almacenamiento.

```
data/
├── api/
│   ├── api-client.ts           # Cliente HTTP (Axios)
│   ├── company.api.ts          # Endpoints de compañías
│   └── auth.api.ts             # Endpoints de autenticación
├── dtos/
│   ├── company.dto.ts          # DTOs de compañías
│   └── auth.dto.ts             # DTOs de autenticación
├── mappers/
│   ├── company.mapper.ts       # DTO → Entity
│   └── auth.mapper.ts          # DTO → Entity
├── repositories/
│   ├── company.repository.ts   # Implementación del repositorio
│   └── auth.repository.ts      # Implementación de autenticación
└── storage/
    └── storage.service.ts      # AsyncStorage wrapper
```

**Responsabilidades**:
- **API**: Comunicación HTTP con el backend
- **DTOs**: Objetos que vienen/van del servidor
- **Mappers**: Transforman DTOs en Entidades del dominio
- **Repositories**: Implementan las interfaces del dominio
- **Storage**: Persistencia local

---

### 4. **Presentation** (`src/presentation/`)
Capa de interfaz de usuario. Contiene componentes React, pantallas, navegación.

```
presentation/
├── components/
│   ├── Button.tsx              # Botón reutilizable
│   ├── Input.tsx               # Input con validación
│   ├── Picker.tsx              # Selector modal
│   ├── Card.tsx                # Card con sombra
│   └── Loading.tsx             # Indicador de carga
├── context/
│   └── AuthContext.tsx         # Contexto de autenticación
├── hooks/
│   ├── useCompanies.ts         # Hook para obtener compañías
│   └── useLogin.ts             # Hook para login
├── navigation/
│   ├── AppNavigator.tsx        # Configuración de navegación
│   └── types.ts                # Tipos de navegación
├── screens/
│   ├── LoginScreen.tsx         # Pantalla de login
│   └── HomeScreen.tsx          # Pantalla principal
└── theme/
    └── theme.ts                # Colores, espaciados, fuentes
```

**Características**:
- **Componentes**: Reutilizables, atómicos
- **Hooks**: Encapsulan lógica de UI + casos de uso
- **Context**: Estado global de la aplicación
- **Screens**: Pantallas completas
- **Navigation**: React Navigation stack

---

## 🔄 Flujo de Datos - Ejemplo de Login

### 1. **Usuario presiona "Iniciar Sesión"**
```typescript
// LoginScreen.tsx
const handleLogin = () => {
  login({ username, password, companyDB });
};
```

### 2. **Hook ejecuta el Use Case**
```typescript
// useLogin.ts
const loginUseCase = new LoginUseCase(authRepository);
useMutation({
  mutationFn: (credentials) => loginUseCase.execute(credentials)
});
```

### 3. **Use Case llama al Repository**
```typescript
// login.usecase.ts
async execute(credentials: LoginCredentials): Promise<AuthSession> {
  const session = await this.authRepository.login(credentials);
  await this.authRepository.saveSession(session);
  return session;
}
```

### 4. **Repository llama a la API**
```typescript
// auth.repository.ts
async login(credentials: LoginCredentials): Promise<AuthSession> {
  const dto = await authApi.login(credentials);
  return AuthMapper.toDomain(dto);
}
```

### 5. **API Client hace la petición HTTP**
```typescript
// auth.api.ts
async login(credentials: UserLoginDto): Promise<UserLoginResponseDto> {
  const response = await apiClient.post('/api/users/login', credentials);
  return response.data;
}
```

### 6. **Mapper convierte DTO a Entity**
```typescript
// auth.mapper.ts
static toDomain(dto: UserLoginResponseDto): AuthSession {
  return {
    user: { userId: dto.userId, username: dto.username, ... },
    sapToken: { sessionId: dto.sapToken.sessionId, ... }
  };
}
```

### 7. **Repository guarda en Storage**
```typescript
// auth.repository.ts
await storageService.setItem(STORAGE_KEYS.USER_DATA, session);
```

### 8. **Contexto actualiza el estado**
```typescript
// LoginScreen.tsx
onSuccess: (session) => {
  setSession(session);  // AuthContext
}
```

### 9. **Navegación automática**
```typescript
// AppNavigator.tsx
{!isAuthenticated ? (
  <Stack.Screen name="Login" component={LoginScreen} />
) : (
  <Stack.Screen name="Home" component={HomeScreen} />
)}
```

---

## 🎯 Ventajas de esta Arquitectura

### ✅ Testabilidad
Cada capa se puede testear independientemente:
- **Use Cases**: Test unitarios sin UI ni BD
- **Repositories**: Mockear APIs fácilmente
- **Components**: Test de UI sin lógica de negocio

### ✅ Mantenibilidad
- Cambiar la UI no afecta la lógica de negocio
- Cambiar el backend solo requiere actualizar DTOs y APIs
- Agregar nuevas features es simple y predecible

### ✅ Escalabilidad
- Agregar nuevos casos de uso es directo
- Nuevas pantallas reutilizan componentes existentes
- Fácil agregar nuevos repositorios (ej: BD local)

### ✅ Separación de Responsabilidades
Cada archivo tiene **una única razón para cambiar**:
- Entity cambia solo si el negocio cambia
- Repository cambia solo si cambia la fuente de datos
- Screen cambia solo si cambia el diseño

---

## 🔐 Principios SOLID Aplicados

### Single Responsibility
Cada clase/función tiene una única responsabilidad:
- `LoginUseCase`: Solo maneja el login
- `AuthRepository`: Solo maneja autenticación
- `LoginScreen`: Solo muestra UI de login

### Open/Closed
Abierto para extensión, cerrado para modificación:
- Nuevos casos de uso sin modificar existentes
- Nuevos repositorios sin cambiar interfaces

### Liskov Substitution
Los repositories implementan interfaces:
```typescript
interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
}
```
Cualquier implementación es intercambiable.

### Interface Segregation
Interfaces pequeñas y específicas:
- `IAuthRepository`: Solo métodos de auth
- `ICompanyRepository`: Solo métodos de companies

### Dependency Inversion
Dependencias apuntan a abstracciones:
- Use Cases dependen de **interfaces**, no implementaciones
- Repositories se inyectan, no se instancian internamente

---

## 📝 Convenciones de Naming

### Archivos
- **Entities**: `*.entity.ts`
- **DTOs**: `*.dto.ts`
- **Use Cases**: `*.usecase.ts`
- **Repositories**: `*.repository.ts` (implementación)
- **Repositories Interfaces**: `*.repository.interface.ts`
- **Components**: PascalCase (ej: `Button.tsx`)
- **Screens**: `*Screen.tsx`

### Clases/Interfaces
- **Entities**: `User`, `Company`
- **DTOs**: `UserLoginDto`, `CompanyDto`
- **Use Cases**: `LoginUseCase`, `GetAllCompaniesUseCase`
- **Repositories**: `AuthRepository`, `CompanyRepository`
- **Interfaces**: `IAuthRepository`, `ICompanyRepository`

### Funciones/Variables
- **camelCase**: `getUserById`, `isLoading`
- **Hooks**: `useLogin`, `useCompanies`
- **Handlers**: `handleLogin`, `handleSubmit`

---

## 🚀 Extensibilidad

### Agregar una nueva feature (ejemplo: Orders)

1. **Domain**: Crear entidad, interface, use case
```typescript
// domain/entities/order.entity.ts
export interface Order { ... }

// domain/repositories/order.repository.interface.ts
export interface IOrderRepository { ... }

// domain/usecases/get-orders.usecase.ts
export class GetOrdersUseCase { ... }
```

2. **Data**: Implementar API, DTO, mapper, repository
```typescript
// data/dtos/order.dto.ts
export interface OrderDto { ... }

// data/api/order.api.ts
export class OrderApi { ... }

// data/repositories/order.repository.ts
export class OrderRepository implements IOrderRepository { ... }
```

3. **Presentation**: Crear screen, hook, componentes
```typescript
// presentation/hooks/useOrders.ts
export const useOrders = () => { ... }

// presentation/screens/OrdersScreen.tsx
export const OrdersScreen = () => { ... }
```

---

## 📚 Referencias

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Domain-Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design)
