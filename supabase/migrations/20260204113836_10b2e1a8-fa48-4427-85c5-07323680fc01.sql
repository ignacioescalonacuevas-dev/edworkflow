-- =============================================================================
-- ED WORKFLOW SECURITY SCHEMA
-- Roles, User Roles, Patients, Sticker Notes, Orders, Audit Log
-- =============================================================================

-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('coordinator', 'admission', 'viewer');

-- 2. Create user_roles table (separate from auth.users for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Security definer functions to avoid RLS recursion
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
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.get_user_role(_user_id) = 'coordinator', false)
$$;

CREATE OR REPLACE FUNCTION public.is_admission_or_above(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.get_user_role(_user_id) IN ('coordinator', 'admission'), false)
$$;

-- 5. RLS policies for user_roles
-- Users can read their own role
CREATE POLICY "Users can read own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Coordinators can read all roles
CREATE POLICY "Coordinators can read all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.is_coordinator(auth.uid()));

-- Only coordinators can manage roles
CREATE POLICY "Coordinators can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_coordinator(auth.uid()))
  WITH CHECK (public.is_coordinator(auth.uid()));

-- 6. Create patients table
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

-- 7. Enable RLS on patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- 8. RLS policies for patients
-- All authenticated can view
CREATE POLICY "All authenticated can view patients"
  ON public.patients FOR SELECT
  TO authenticated
  USING (true);

-- Coordinators can do everything
CREATE POLICY "Coordinators can manage patients"
  ON public.patients FOR ALL
  TO authenticated
  USING (public.is_coordinator(auth.uid()))
  WITH CHECK (public.is_coordinator(auth.uid()));

-- Admission can insert patients
CREATE POLICY "Admission can create patients"
  ON public.patients FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admission_or_above(auth.uid()));

-- Admission can update patients
CREATE POLICY "Admission can update patients"
  ON public.patients FOR UPDATE
  TO authenticated
  USING (public.is_admission_or_above(auth.uid()))
  WITH CHECK (public.is_admission_or_above(auth.uid()));

-- 9. Create sticker_notes table
CREATE TABLE public.sticker_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  text TEXT NOT NULL,
  slot INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sticker_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated can view sticker_notes"
  ON public.sticker_notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Coordinators can manage sticker_notes"
  ON public.sticker_notes FOR ALL
  TO authenticated
  USING (public.is_coordinator(auth.uid()))
  WITH CHECK (public.is_coordinator(auth.uid()));

-- 10. Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated can view orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Coordinators can manage orders"
  ON public.orders FOR ALL
  TO authenticated
  USING (public.is_coordinator(auth.uid()))
  WITH CHECK (public.is_coordinator(auth.uid()));

-- 11. Create patient_events table (patient-level audit)
CREATE TABLE public.patient_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.patient_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated can view patient_events"
  ON public.patient_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert patient_events"
  ON public.patient_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 12. Create audit_log table (system-wide audit)
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only coordinators can view audit logs
CREATE POLICY "Coordinators can view audit_log"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (public.is_coordinator(auth.uid()));

-- All authenticated can insert audit logs (for their own actions)
CREATE POLICY "Authenticated can insert audit_log"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 13. Create shift_history table
CREATE TABLE public.shift_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_date DATE NOT NULL UNIQUE,
  summary JSONB NOT NULL,
  saved_by UUID REFERENCES auth.users(id),
  saved_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shift_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated can view shift_history"
  ON public.shift_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Coordinators can manage shift_history"
  ON public.shift_history FOR ALL
  TO authenticated
  USING (public.is_coordinator(auth.uid()))
  WITH CHECK (public.is_coordinator(auth.uid()));

-- 14. Trigger for updated_at on patients
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 15. Enable realtime for patients table
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;