

# Plan: Asignar Rol de Coordinator a Usuario

## Problema

La tabla `user_roles` está vacía. El trigger `handle_new_user` no creó el rol cuando te registraste, por lo que el sistema te asigna `viewer` por defecto.

## Datos del Usuario

| Campo | Valor |
|-------|-------|
| Email | ignacioescalonacuevas@gmail.com |
| User ID | f1698e42-feff-4981-b7a4-e71bd1d9a806 |
| Rol actual | viewer (por defecto) |
| Rol deseado | coordinator |

## Cambio Requerido

Ejecutar migración SQL para insertar el rol de coordinator:

```sql
INSERT INTO public.user_roles (user_id, role, display_name)
VALUES ('f1698e42-feff-4981-b7a4-e71bd1d9a806', 'coordinator', 'Ignacio Escalona')
ON CONFLICT (user_id) DO UPDATE SET 
  role = 'coordinator',
  display_name = 'Ignacio Escalona';
```

## Pasos Después de la Migración

1. Refrescar la página o cerrar sesión y volver a entrar
2. El `AuthContext` cargará tu nuevo rol desde `user_roles`
3. Verás los botones protegidos por `RoleGate`:
   - Reset data (↺)
   - New Patient (+)
   - Shift Settings (⚙️)
   - End Shift

## Resultado Esperado

- Tu rol será `coordinator` con display name "Ignacio Escalona"
- Tendrás acceso completo a todas las funciones del sistema
- El botón de configuración de turno (engranaje) estará visible y funcional

