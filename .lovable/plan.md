
# Plan: Translate UI Text to English

## Summary

Translate all Spanish text in the authentication pages and BoardHeader to English for consistency across the application.

---

## Files to Modify

### 1. `src/pages/Login.tsx`

| Spanish Text | English Translation |
|--------------|---------------------|
| `Error de autenticación` | `Authentication Error` |
| `Credenciales inválidas. Verifica tu email y contraseña.` | `Invalid credentials. Please check your email and password.` |
| `Bienvenido` | `Welcome` |
| `Has iniciado sesión correctamente.` | `You have successfully signed in.` |
| `Ingresa tus credenciales para acceder al sistema` | `Enter your credentials to access the system` |
| `usuario@hospital.com` | `user@hospital.com` |
| `Contraseña` | `Password` |
| `Iniciando sesión...` | `Signing in...` |
| `Iniciar Sesión` | `Sign In` |
| `¿Olvidaste tu contraseña?` | `Forgot your password?` |
| `Contacta a IT` | `Contact IT` |
| `¿No tienes cuenta?` | `Don't have an account?` |
| `Registrar usuario de prueba` | `Register test user` |
| `Conexión segura • Datos encriptados` | `Secure connection • Encrypted data` |

### 2. `src/pages/Register.tsx`

| Spanish Text | English Translation |
|--------------|---------------------|
| `Error de registro` | `Registration Error` |
| `Usuario creado` | `User Created` |
| `Revisa tu email para confirmar tu cuenta.` | `Check your email to confirm your account.` |
| `Registro de Usuario` | `User Registration` |
| `Crea un usuario de prueba para el sistema` | `Create a test user for the system` |
| `Nombre a mostrar` | `Display Name` |
| `Ej: CNM1 María` | `e.g., CNM1 Mary` |
| `usuario@hospital.com` | `user@hospital.com` |
| `Contraseña` | `Password` |
| `Mínimo 6 caracteres` | `Minimum 6 characters` |
| `Rol` | `Role` |
| `Selecciona un rol` | `Select a role` |
| `Coordinador (CNM1) - Acceso completo` | `Coordinator (CNM1) - Full access` |
| `Admisión - Crear/editar pacientes` | `Admission - Create/edit patients` |
| `Visor - Solo lectura` | `Viewer - Read only` |
| `Creando usuario...` | `Creating user...` |
| `Crear Usuario` | `Create User` |
| `Volver al Login` | `Back to Login` |
| `Nota:` | `Note:` |
| `Esta página es solo para crear usuarios de prueba. En producción, los usuarios se gestionarían a través de Active Directory.` | `This page is only for creating test users. In production, users would be managed through Active Directory.` |

### 3. `src/components/BoardHeader.tsx`

| Spanish Text | English Translation |
|--------------|---------------------|
| `roleLabels.coordinator: 'Coordinador'` | `'Coordinator'` |
| `roleLabels.admission: 'Admisión'` | `'Admission'` |
| `roleLabels.viewer: 'Visor'` | `'Viewer'` |
| `'Usuario'` (fallback) | `'User'` |
| `toast.success('Sesión cerrada')` | `'Signed out'` |
| `title="Cerrar sesión"` | `title="Sign out"` |

---

## Technical Section

### Changes Summary

Three files need text updates:

1. **Login.tsx** - 14 text strings to translate
2. **Register.tsx** - 18 text strings to translate  
3. **BoardHeader.tsx** - 6 text strings to translate

### Implementation

Simple string replacements in each file. No structural changes needed.

---

## Result

All user-facing text in the authentication flow and main header will be in English, maintaining consistency with the rest of the application.
