
# Fix Role Assignment Bug + Enable Demo Testing

## Summary

Fix the registration bug where new users are always shown as "viewer" (because their role isn't saved), then create a test coordinator user for you to demo to your manager.

---

## The Problem

When you register, this happens:

```text
1. User signs up → auth.users row created ✓
2. Code tries to insert into user_roles → BLOCKED by RLS ✗
3. No role saved → App defaults to "viewer"
```

The RLS policy says "only coordinators can insert roles" but there are no coordinators yet!

---

## The Solution

Create a database trigger that runs with elevated privileges to automatically create roles:

```text
User Registers → auth.users row created → TRIGGER auto-creates user_roles entry
```

The trigger uses `SECURITY DEFINER` which means it runs with the database owner's permissions, bypassing RLS.

---

## Implementation Steps

### Step 1: Add Database Trigger

Create a new migration that:
- Adds a trigger function `handle_new_user()`
- Attaches it to `auth.users` INSERT events
- Reads the role from user metadata (passed during signup)

### Step 2: Update Registration to Pass Role in Metadata

Modify `AuthContext.tsx` to pass the selected role in the signup metadata, so the trigger can read it.

### Step 3: Remove Client-Side Role Insert

Remove the manual insert into `user_roles` from `AuthContext.tsx` since the trigger handles it now.

### Step 4: Create Your Test User

After the fix, you can create a new coordinator account to test.

---

## Files to Change

| File | Change |
|------|--------|
| New migration | Add trigger for auto-creating user roles from signup metadata |
| `src/contexts/AuthContext.tsx` | Pass role and display_name in user_meta_data during signup, remove manual insert |

---

## Technical Section

### Database Migration

```sql
-- Function to handle new user signup
-- Runs with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role app_role;
BEGIN
  -- Get role from user metadata, default to viewer if not specified
  _role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'viewer'
  );
  
  -- Insert the user role
  INSERT INTO public.user_roles (user_id, role, display_name)
  VALUES (
    NEW.id,
    _role,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Role already exists, skip
    RETURN NEW;
END;
$$;

-- Trigger that fires after a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### AuthContext Changes

```typescript
// In signUp function, pass role and display_name in metadata
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: window.location.origin,
    data: {
      role: role,           // Trigger reads this
      display_name: displayName,  // Trigger reads this
    },
  },
});

// Remove the manual insert into user_roles - trigger handles it now
```

---

## Testing Flow

After implementation:

1. Go to `/register`
2. Create a new user with "Coordinator" role
3. Check email and confirm (enable auto-confirm for testing this time)
4. Log in
5. You should see "Coordinator" displayed, not "Viewer"
6. All coordinator features should work

---

## Result

- New users automatically get their selected role saved
- No more "viewer" default bug
- You can create a test coordinator to demo to your manager
- Ready for Phase 2: allowed_staff list for trial
