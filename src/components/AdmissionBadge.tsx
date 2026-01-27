import { AdmissionData } from '@/types/patient';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdmissionBadgeProps {
  admission: AdmissionData;
  className?: string;
}

function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.replace('Dr. ', '').replace('Dr ', '').split(' ');
  return parts.map(p => p[0]).join('').toUpperCase().substring(0, 2);
}

export function AdmissionBadge({ admission, className }: AdmissionBadgeProps) {
  const consultant = admission.consultant || admission.consultantName;
  
  if (!consultant && !admission.bedNumber) return null;
  
  return (
    <div className={cn(
      "absolute top-5 right-1 bg-cyan-500/90 text-white text-[9px] px-1.5 py-0.5 rounded font-medium shadow-sm z-10",
      className
    )}>
      <div className="flex items-center gap-1">
        {consultant && (
          <span title={consultant}>
            {getInitials(consultant)}
          </span>
        )}
        {consultant && admission.bedNumber && (
          <span className="text-cyan-200">|</span>
        )}
        {admission.bedNumber && (
          <span className="font-bold">{admission.bedNumber}</span>
        )}
        {admission.handoverComplete && (
          <Check className="h-2.5 w-2.5 text-green-300 ml-0.5" />
        )}
      </div>
    </div>
  );
}
