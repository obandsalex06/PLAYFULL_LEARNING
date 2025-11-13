# Playful Learning Mobile App 📱

Aplicación móvil de Playful Learning desarrollada con React Native y Expo.

## 🚀 Configuración

### Instalar dependencias
```bash
npm install
```

### Ejecutar la aplicación
```bash
npx expo start
```

Luego presiona:
- `a` para abrir en Android
- `i` para abrir en iOS
- `w` para abrir en web

## 📂 Estructura del Proyecto

```
app/
  ├── login.tsx              # Pantalla de inicio de sesión
  ├── _layout.tsx            # Layout principal con navegación protegida
  └── (tabs)/                # Pantallas principales (requieren autenticación)
      ├── index.tsx
      └── explore.tsx

context/
  └── AuthContext.tsx        # Manejo de autenticación y estado global

components/
  └── ui/                    # Componentes reutilizables
```

## 🔑 Autenticación

El sistema de autenticación está implementado con:
- **AsyncStorage**: Persistencia de tokens y datos de usuario
- **Context API**: Manejo de estado global
- **Protected Routes**: Navegación automática basada en estado de auth

### Flujo de autenticación:
1. Usuario ingresa credenciales en `/login`
2. Se valida con el backend (configurar URL en `app/login.tsx`)
3. Se guardan tokens y datos de usuario
4. Redirección automática a `/(tabs)` según rol

## ⚙️ Configuración de API

**IMPORTANTE**: Actualizar la URL del backend en `app/login.tsx`:

```typescript
const API_URL = 'http://TU_IP:3000/api/auth/login';
```

Para desarrollo local con dispositivo físico, usa tu IP local (no `localhost`).

## 🎨 Estilos

- **NativeWind v4**: Tailwind CSS para React Native
- Colores principales: Blue-700 (#1d4ed8) y Blue-500 (#3b82f6)
- Diseño adaptado del login web

## 📦 Dependencias Principales

- `expo-router`: Navegación basada en archivos
- `nativewind`: Tailwind CSS para React Native
- `@react-native-async-storage/async-storage`: Persistencia local
- `@expo/vector-icons`: Iconos

## 🐛 Notas de Desarrollo

1. **NativeWind**: Asegúrate de tener `global.css` importado en `_layout.tsx`
2. **TypeScript**: Tipos definidos para User, AuthTokens y AuthContext
3. **Testing**: Usar Expo Go para pruebas rápidas en dispositivos físicos

## 📝 TODO

- [ ] Implementar pantallas por rol (estudiante, docente, admin)
- [ ] Agregar recuperación de contraseña
- [ ] Implementar refresh token automático
- [ ] Agregar manejo de errores offline
- [ ] Implementar logout desde la app
- [ ] Añadir animaciones de transición

---

Desarrollado para **Playful Learning** 🎓
