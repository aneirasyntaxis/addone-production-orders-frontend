# 🚀 Guía de Inicio Rápido

## Setup Inicial (5 minutos)

### 1. Instalar dependencias
```bash
cd addone-production-orders-frontend
npm install
```

### 2. Configurar Backend URL
Crea el archivo `.env`:
```bash
cp .env.example .env
```

Edita `.env` y cambia la IP por la IP de tu máquina (no uses localhost):
```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.XXX:5000
```

**¿Cómo encontrar tu IP?**
- Windows: `ipconfig` (busca IPv4)
- Mac/Linux: `ifconfig` (busca inet)

### 3. Iniciar la aplicación
```bash
npm start
```

Se abrirá Expo Dev Tools en `http://localhost:19002`

---

## 📱 Ejecutar en Dispositivo

### Opción 1: Expo Go (Recomendado para inicio)
1. Descarga **Expo Go** desde App Store o Google Play
2. Escanea el QR code que aparece en la terminal
3. ¡Listo! La app se abrirá automáticamente

### Opción 2: Emulador Android
```bash
npm run android
```
**Requisitos**: Android Studio instalado y emulador configurado

### Opción 3: Simulador iOS (solo macOS)
```bash
npm run ios
```
**Requisitos**: Xcode instalado

---

## 🧪 Probar el Login

### Datos de prueba
Usa las credenciales configuradas en tu backend:

**Compañía**: Selecciona del dropdown (se carga desde `/api/companies`)
**Usuario**: El username de tu BD
**Contraseña**: El password de tu BD

### ¿Qué debería pasar?
1. ✅ Se carga el selector de compañías
2. ✅ Al hacer login correcto, muestra toast de éxito
3. ✅ Navega automáticamente a Home
4. ❌ Si credenciales incorrectas, muestra error

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
- ✅ Verifica que el backend esté corriendo (`http://tu-ip:5000`)
- ✅ Confirma que la IP en `.env` sea correcta (NO localhost)
- ✅ Verifica que estén en la misma red WiFi

### "No companies loaded"
- ✅ Verifica que `/api/companies` retorne datos
- ✅ Revisa la consola de Expo para ver el error exacto

### App se cierra al abrir
- ✅ Revisa los logs en Expo Dev Tools
- ✅ Asegúrate de que todas las dependencias estén instaladas
- ✅ Intenta limpiar cache: `expo start -c`

### Errores de TypeScript
```bash
# Limpiar y reinstalar
rm -rf node_modules
npm install
```

---

## 📝 Comandos Útiles

```bash
# Iniciar con cache limpio
expo start -c

# Ver logs en tiempo real
# En Expo Dev Tools: presiona 'j' para abrir debugger

# Recargar la app
# En el dispositivo: shake → Reload
# En Expo Dev Tools: presiona 'r'

# Ver errores de compilación
npm run lint

# Formatear código
npm run format
```

---

## 🎨 Modificar Diseño

### Cambiar colores
Edita `src/presentation/theme/theme.ts`:
```typescript
export const theme = {
  colors: {
    primary: '#6366f1',  // ← Cambia este
    // ...
  }
}
```

### Cambiar logo
En `src/presentation/screens/LoginScreen.tsx`:
```typescript
<Text style={styles.logoText}>🏭</Text>  // ← Cambia el emoji
```

---

## 📊 Estructura del Proyecto

```
src/
├── core/              # Configuración
├── domain/            # Lógica de negocio
├── data/              # APIs y almacenamiento
└── presentation/      # UI (componentes, pantallas)
```

Ver `ARCHITECTURE.md` para más detalles.

---

## ✅ Checklist de Verificación

Antes de desarrollar, confirma que:

- [ ] Backend corriendo en `http://tu-ip:5000`
- [ ] `.env` configurado con IP correcta
- [ ] Dependencias instaladas (`node_modules/` existe)
- [ ] Expo Dev Server iniciado (`npm start`)
- [ ] App abrió correctamente en Expo Go
- [ ] Login funciona con credenciales válidas

---

## 🆘 Necesitas Ayuda?

1. **Revisa los logs**: Expo Dev Tools muestra errores detallados
2. **Verifica el README.md**: Documentación completa
3. **Revisa ARCHITECTURE.md**: Entender la estructura
4. **Console.log es tu amigo**: Agrega logs para debug

---

## 🎯 Próximos Pasos

Una vez que el login funcione:

1. **Explorar el código**
   - `src/presentation/screens/LoginScreen.tsx` - UI del login
   - `src/domain/usecases/login.usecase.ts` - Lógica del login
   - `src/data/api/auth.api.ts` - Llamada al backend

2. **Agregar nueva pantalla**
   - Ver ejemplo en `HomeScreen.tsx`
   - Agregar ruta en `AppNavigator.tsx`

3. **Crear nuevos componentes**
   - Reutilizar componentes de `src/presentation/components/`

---

¡Listo para desarrollar! 🚀
