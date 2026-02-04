
# Plan: Autenticación y Roles para ED Workflow

## Resumen

Implementaremos un sistema de autenticación **simple pero seguro** que puedas demostrar al CEO/IT, con la arquitectura preparada para conectarse a Active Directory después.

**Usuarios del sistema (aprox. 31 personas):**
- 6 CNM1/Coordinadores → rol `coordinator` (modificar todo)
- 5 Staff de Admisión → rol `admission` (crear pacientes)
- 8 Médicos + 12 Enfermeros → rol `viewer` (solo ver)

---

## Arquitectura de Seguridad

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARQUITECTURA DE SEGURIDAD                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌──────────────────┐    ┌──────────────────────┐   │
│  │   LOGIN PAGE    │───▶│  Supabase Auth   │◀──▶│   user_roles table   │   │
│  │                 │    │  (email/pass)    │    │  (role assignment)   │   │
│  │  Hospital ID +  │    │                  │    │                      │   │
│  │  Password       │    │  En producción:  │    │  coordinator: 6      │   │
│  │                 │    │  → Active Dir.   │    │  admission: 5        │   │
│  └─────────────────┘    └──────────────────┘    │  viewer: 20          │   │
│                                                  └──────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         ROW LEVEL SECURITY                           │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                       │   │
│  │  coordinator: SELECT, INSERT, UPDATE, DELETE en todas las tablas     │   │
│  │  admission:   SELECT todos + INSERT pacientes + UPDATE datos básicos │   │
│  │  viewer:      SELECT solamente (solo lectura)                        │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         AUDIT LOG                                    │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Cada acción queda registrada:                                       │   │
│  │  • Quién hizo qué                                                    │   │
│  │  • Cuándo                                                            │   │
│  │  • Qué paciente afectó                                               │   │
│  │  • Detalles del cambio                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla de Login

```text
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                        🏥 ED Workflow System                        │
│                                                                     │
│                    ┌─────────────────────────────┐                 │
│                    │ Hospital ID / Email         │                 │
│                    └─────────────────────────────┘                 │
│                    ┌─────────────────────────────┐                 │
│                    │ Password                ••••│                 │
│                    └─────────────────────────────┘                 │
│                                                                     │
│                    [        Sign In        ]                       │
│                                                                     │
│                    ─────────────────────────────                   │
│                                                                     │
│                    Forgot password? Contact IT                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Permisos por Rol (Detalle)

| Acción | Coordinator | Admission | Viewer |
|--------|-------------|-----------|--------|
| Ver board en tiempo real | ✅ | ✅ | ✅ |
| Ver detalles de paciente | ✅ | ✅ | ✅ |
| Crear nuevo paciente | ✅ | ✅ | ❌ |
| Editar datos básicos (nombre, DOB, M#, queja) | ✅ | ✅ | ❌ |
| Cambiar triage | ✅ | ❌ | ❌ |
| Cambiar process state | ✅ | ❌ | ❌ |
| Asignar médico/enfermero | ✅ | ❌ | ❌ |
| Agregar notas/stickers | ✅ | ❌ | ❌ |
| Gestionar órdenes | ✅ | ❌ | ❌ |
| Gestionar admisiones | ✅ | ❌ | ❌ |
| Ver analytics | ✅ | ✅ | ✅ |
| Exportar datos | ✅ | ❌ | ❌ |
| Configurar turno | ✅ | ❌ | ❌ |

---

## Sección Técnica

### Base de Datos (Migraciones Supabase)

**1. Tabla de roles de usuario:**

```sql
-- Enum de roles
CREATE TYPE public.app_role AS ENUM ('coordinator', 'admission', 'viewer');

-- Tabla de roles (separada de auth.users por seguridad)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  display_name TEXT,  -- "Nurse Mary" para mostrar en UI
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

**2. Función para verificar rol (evita recursión RLS):**

```sql
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_coordinator(_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role(_user_id) = 'coordinator'
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admission_or_above(_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role(_user_id) IN ('coordinator', 'admission')
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

**3. Tabla de pacientes (reemplaza localStorage):**

```sql
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  m_number TEXT NOT NULL,
  chief_complaint TEXT NOT NULL,
  triage_level INTEGER NOT NULL CHECK (triage_level BETWEEN 1 AND 5),
  process_state TEXT NOT NULL,
  assigned_box TEXT NOT NULL,
  current_location TEXT,
  doctor TEXT,
  nurse TEXT,
  arrival_time TIMESTAMPTZ NOT NULL,
  discharged_at TIMESTAMPTZ,
  transferred_to TEXT,
  shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**4. Políticas RLS para pacientes:**

```sql
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver
CREATE POLICY "All authenticated can view patients"
  ON public.patients FOR SELECT
  TO authenticated
  USING (true);

-- Coordinadores pueden hacer todo
CREATE POLICY "Coordinators can manage patients"
  ON public.patients FOR ALL
  TO authenticated
  USING (public.is_coordinator(auth.uid()))
  WITH CHECK (public.is_coordinator(auth.uid()));

-- Admission puede insertar
CREATE POLICY "Admission can create patients"
  ON public.patients FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admission_or_above(auth.uid()));

-- Admission puede actualizar campos básicos
CREATE POLICY "Admission can update basic fields"
  ON public.patients FOR UPDATE
  TO authenticated
  USING (public.is_admission_or_above(auth.uid()));
```

**5. Tabla de auditoría:**

```sql
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,  -- 'create_patient', 'update_patient', 'login', etc.
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `src/contexts/AuthContext.tsx` | Contexto de autenticación con estado del usuario y rol |
| `src/pages/Login.tsx` | Página de login con formulario |
| `src/hooks/useAuth.ts` | Hook para login, logout, estado |
| `src/hooks/useUserRole.ts` | Hook para obtener rol del usuario actual |
| `src/components/ProtectedRoute.tsx` | Wrapper que redirige a login si no autenticado |
| `src/components/RoleGate.tsx` | Componente que muestra/oculta según rol |
| `src/lib/supabase.ts` | Cliente de Supabase |
| `src/integrations/supabase/types.ts` | Tipos TypeScript para tablas |

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/App.tsx` | Envolver en AuthProvider, agregar ruta /login, proteger rutas |
| `src/components/BoardHeader.tsx` | Mostrar nombre de usuario + logout |
| `src/components/NewPatientForm.tsx` | Solo visible para admission/coordinator |
| `src/components/PatientCard.tsx` | Deshabilitar edición para viewers |
| `src/components/PatientDetail.tsx` | Controles condicionados por rol |
| `src/store/patientStore.ts` | Conectar a Supabase en lugar de localStorage |

### Componente RoleGate (Ejemplo de uso)

```tsx
// Uso en cualquier componente:
<RoleGate allowedRoles={['coordinator', 'admission']}>
  <NewPatientForm />
</RoleGate>

<RoleGate allowedRoles={['coordinator']}>
  <Button onClick={handleDelete}>Delete Patient</Button>
</RoleGate>

// Para deshabilitar en vez de ocultar:
<RoleGate allowedRoles={['coordinator']} fallback={<DisabledButton />}>
  <EditButton />
</RoleGate>
```

---

## Usuarios de Prueba para Demo

Para la demostración, crearemos 3 usuarios de prueba:

| Email | Contraseña | Rol | Nombre |
|-------|------------|-----|--------|
| coordinator@demo.hospital | Demo123! | coordinator | CNM1 Demo |
| admission@demo.hospital | Demo123! | admission | Admission Staff |
| viewer@demo.hospital | Demo123! | viewer | Dr. Demo |

Esto permite demostrar los 3 niveles de acceso sin necesidad de Active Directory.

---

## Migración a Producción (Para IT)

Cuando IT esté listo para producción:

1. **Base de datos**: Supabase puede ser self-hosted en servidores del hospital, o usar Supabase Cloud Enterprise (HIPAA compliant)

2. **Active Directory**: Supabase soporta SSO/SAML. IT solo necesita:
   - Proporcionar el Identity Provider URL
   - Configurar el mapeo de grupos AD → roles de la app
   - Ejemplo: Grupo AD "ED-Coordinators" → rol `coordinator`

3. **Intranet**: La app es 100% web, accesible desde cualquier navegador en la intranet

4. **Certificaciones disponibles**: SOC 2 Type II, HIPAA, GDPR (con Supabase Enterprise)

---

## Pasos de Implementación

1. **Conectar Lovable Cloud** (Supabase gestionado)
2. **Crear migraciones** para tablas y RLS
3. **Implementar AuthContext** y páginas de login
4. **Crear componente RoleGate** para control de UI
5. **Migrar patientStore** de localStorage a Supabase
6. **Crear usuarios de prueba** para demo
7. **Agregar auditoría** de acciones

---

## Resultado Final

- ✅ Login seguro con email/contraseña (demo) o Active Directory (producción)
- ✅ 3 roles con permisos específicos
- ✅ Datos en PostgreSQL con encriptación
- ✅ Row Level Security a nivel de base de datos
- ✅ Auditoría completa de accesos y cambios
- ✅ Código preparado para migrar a servidores del hospital
- ✅ Documentación lista para presentar a IT/CEO
