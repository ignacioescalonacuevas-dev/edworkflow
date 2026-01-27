import { useState } from 'react';
import { AdmissionData } from '@/types/patient';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePatientStore } from '@/store/patientStore';

interface AdmissionBadgeProps {
  patientId: string;
  admission: AdmissionData;
  className?: string;
  readOnly?: boolean;
}

function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.replace('Dr. ', '').replace('Dr ', '').split(' ');
  return parts.map(p => p[0]).join('').toUpperCase().substring(0, 2);
}

export function AdmissionBadge({ patientId, admission, className, readOnly }: AdmissionBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { updateAdmission } = usePatientStore();
  
  // Priorizar consultantName (donde escribe el formulario)
  const consultant = admission.consultantName || admission.consultant;
  
  if (!consultant && !admission.bedNumber) return null;
  
  const badge = (
    <div className={cn(
      "flex items-center gap-1 bg-cyan-500/90 text-white text-[9px] px-1.5 py-0.5 rounded font-medium shadow-sm",
      !readOnly && "cursor-pointer hover:bg-cyan-600",
      className
    )}>
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
  );

  if (readOnly) {
    return <div className="absolute top-5 right-1 z-10">{badge}</div>;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="absolute top-5 right-1 z-10" onClick={(e) => e.stopPropagation()}>
          {badge}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 space-y-3" align="end" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-2">
          <Label className="text-xs">Consultant</Label>
          <Input
            placeholder="Dr. Smith"
            value={admission.consultantName || ''}
            onChange={(e) => updateAdmission(patientId, { 
              consultantName: e.target.value,
              consultant: e.target.value 
            })}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Bed Number</Label>
          <Input
            placeholder="5N-23"
            value={admission.bedNumber || ''}
            onChange={(e) => updateAdmission(patientId, { bedNumber: e.target.value })}
            className="h-8 text-sm"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Handover Complete</Label>
          <Switch
            checked={admission.handoverComplete || false}
            onCheckedChange={(checked) => updateAdmission(patientId, { handoverComplete: checked })}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
