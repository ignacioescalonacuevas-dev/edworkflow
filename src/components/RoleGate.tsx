import { useAuth, AppRole } from '@/contexts/AuthContext';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
  fallback?: React.ReactNode;
}

/**
 * RoleGate - Conditionally renders children based on user role
 * 
 * Usage examples:
 * 
 * // Hide completely for non-coordinators:
 * <RoleGate allowedRoles={['coordinator']}>
 *   <DeleteButton />
 * </RoleGate>
 * 
 * // Show disabled version for viewers:
 * <RoleGate allowedRoles={['coordinator', 'admission']} fallback={<DisabledButton />}>
 *   <EditButton />
 * </RoleGate>
 */
const RoleGate: React.FC<RoleGateProps> = ({ children, allowedRoles, fallback = null }) => {
  const { role, isLoading } = useAuth();

  // Don't render anything while loading
  if (isLoading) {
    return null;
  }

  // Check if user's role is in the allowed list
  if (role && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  // Return fallback if provided, otherwise null
  return <>{fallback}</>;
};

export default RoleGate;

/**
 * Hook to check if current user has one of the specified roles
 */
export const useHasRole = (allowedRoles: AppRole[]): boolean => {
  const { role, isLoading } = useAuth();
  
  if (isLoading || !role) {
    return false;
  }
  
  return allowedRoles.includes(role);
};

/**
 * Hook to check if user can edit (coordinator or admission)
 */
export const useCanEdit = (): boolean => {
  return useHasRole(['coordinator', 'admission']);
};

/**
 * Hook to check if user is coordinator
 */
export const useIsCoordinator = (): boolean => {
  return useHasRole(['coordinator']);
};
