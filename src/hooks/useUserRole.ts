import { useAuth, AppRole } from '@/contexts/AuthContext';

interface UseUserRoleReturn {
  role: AppRole | null;
  displayName: string | null;
  isCoordinator: boolean;
  isAdmission: boolean;
  isViewer: boolean;
  canCreatePatients: boolean;
  canEditPatients: boolean;
  canEditBasicInfo: boolean;
  canEditClinicalInfo: boolean;
  canManageNotes: boolean;
  canManageOrders: boolean;
  canExportData: boolean;
  canConfigureShift: boolean;
  isLoading: boolean;
}

/**
 * Hook that provides role-based permission checks
 * 
 * Permissions by role:
 * - coordinator: Full access to everything
 * - admission: Create patients, edit basic info (name, DOB, M#, chief complaint)
 * - viewer: Read-only access
 */
export const useUserRole = (): UseUserRoleReturn => {
  const { role, displayName, isLoading } = useAuth();

  const isCoordinator = role === 'coordinator';
  const isAdmission = role === 'admission';
  const isViewer = role === 'viewer';

  return {
    role,
    displayName,
    isCoordinator,
    isAdmission,
    isViewer,
    
    // Permission checks
    canCreatePatients: isCoordinator || isAdmission,
    canEditPatients: isCoordinator || isAdmission,
    canEditBasicInfo: isCoordinator || isAdmission, // name, DOB, M#, chief complaint
    canEditClinicalInfo: isCoordinator, // triage, process state, doctor, nurse
    canManageNotes: isCoordinator,
    canManageOrders: isCoordinator,
    canExportData: isCoordinator,
    canConfigureShift: isCoordinator,
    
    isLoading,
  };
};

export default useUserRole;
