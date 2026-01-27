import { useState } from 'react';
import { AdmissionData } from '@/types/patient';
import { usePatientStore } from '@/store/patientStore';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ConsultantNameDisplayProps {
  patientId: string;
  consultantName?: string;
  admission?: AdmissionData;
  readOnly?: boolean;
}

export function ConsultantNameDisplay({ patientId, consultantName, admission, readOnly }: ConsultantNameDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { updateAdmission } = usePatientStore();
  
  const display = (
    <span className={cn(
      "text-[10px] text-cyan-400 font-medium truncate max-w-[100px]",
      !readOnly && "cursor-pointer hover:text-cyan-300"
    )}>
      {consultantName ? `▸ ${consultantName}` : '[+ Consultant]'}
    </span>
  );
  
  if (readOnly) return display;
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        {display}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 space-y-3" align="start" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-2">
          <Label className="text-xs">Consultant</Label>
          <Input
            placeholder="Dr. Smith"
            value={admission?.consultantName || ''}
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
            value={admission?.bedNumber || ''}
            onChange={(e) => updateAdmission(patientId, { bedNumber: e.target.value })}
            className="h-8 text-sm"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Handover Complete</Label>
          <Switch
            checked={admission?.handoverComplete || false}
            onCheckedChange={(checked) => updateAdmission(patientId, { handoverComplete: checked })}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
