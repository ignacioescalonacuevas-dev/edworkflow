import { useState } from 'react';
import { Building2, Phone, ClipboardCheck, IdCard, Bug, AlertTriangle, FileText, Check, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdmissionData, SPECIALTIES, PatientStatus } from '@/types/patient';
import { cn } from '@/lib/utils';

interface AdmissionFormProps {
  admission?: AdmissionData;
  onStartAdmission: () => void;
  onUpdateAdmission: (data: Partial<AdmissionData>) => void;
  onCompleteAdmission: () => void;
  patientStatus: PatientStatus;
}

export function AdmissionForm({
  admission,
  onStartAdmission,
  onUpdateAdmission,
  onCompleteAdmission,
  patientStatus,
}: AdmissionFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isReadyToComplete = admission && 
    admission.specialty &&
    admission.consultantName &&
    admission.registrarCalled &&
    admission.adminComplete &&
    admission.idBraceletVerified &&
    admission.mrsaSwabs &&
    admission.fallsAssessment;

  const checklistItems = [
    {
      key: 'adminComplete' as const,
      label: 'Administrative Admission',
      description: 'Paperwork and documentation ready',
      icon: ClipboardCheck,
    },
    {
      key: 'idBraceletVerified' as const,
      label: 'ID Bracelet',
      description: 'Verified and placed',
      icon: IdCard,
    },
    {
      key: 'mrsaSwabs' as const,
      label: 'MRSA Swabs',
      description: 'Taken and verified',
      icon: Bug,
    },
    {
      key: 'fallsAssessment' as const,
      label: 'ED Falls Assessment',
      description: 'Fall risk evaluation completed',
      icon: AlertTriangle,
    },
  ];

  // Hide admission form for discharged/transferred patients
  if (patientStatus === 'discharged' || patientStatus === 'transferred') {
    return null;
  }

  // Show "Start Admission" button if no admission started yet
  if (!admission) {
    return (
      <Button
        onClick={onStartAdmission}
        className="w-full h-14 text-lg gap-2 bg-status-admission hover:bg-status-admission/90"
      >
        <Building2 className="h-5 w-5" />
        Start Admission
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={admission?.completedAt ? 'outline' : 'default'}
          className={cn(
            'w-full h-14 text-lg gap-2',
            !admission?.completedAt && 'bg-status-admission hover:bg-status-admission/90',
            admission?.completedAt && 'border-status-complete text-status-complete'
          )}
        >
          <Building2 className="h-5 w-5" />
          {admission?.completedAt ? 'Admission Completed' : 'Continue Admission'}
          {!admission?.completedAt && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-foreground/20 rounded-full">
              In progress
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-6 w-6 text-status-admission" />
            Admission Process
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* A. Medical Coordination */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">A</span>
              Medical Coordination
            </h3>
            <div className="space-y-4 pl-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Destination Specialty</Label>
                  <Select
                    value={admission?.specialty || ''}
                    onValueChange={(value) => onUpdateAdmission({ specialty: value })}
                    disabled={!!admission?.completedAt}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select specialty..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {SPECIALTIES.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Consultant Name
                  </Label>
                  <Input
                    placeholder="E.g.: Dr. Smith"
                    value={admission?.consultantName || ''}
                    onChange={(e) => onUpdateAdmission({ consultantName: e.target.value })}
                    disabled={!!admission?.completedAt}
                    className="bg-input border-border"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Registrar Call Made</p>
                    <p className="text-sm text-muted-foreground">Contact with specialty confirmed</p>
                  </div>
                </div>
                <Switch
                  checked={admission?.registrarCalled || false}
                  onCheckedChange={(checked) => onUpdateAdmission({ registrarCalled: checked })}
                  disabled={!!admission?.completedAt}
                />
              </div>
            </div>
          </section>

          {/* B. Safety Checklist */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">B</span>
              Safety & Administrative Checklist
            </h3>
            <div className="space-y-2 pl-8">
              {checklistItems.map((item) => {
                const Icon = item.icon;
                const isChecked = admission?.[item.key] || false;
                return (
                  <div
                    key={item.key}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg transition-colors',
                      isChecked ? 'bg-status-complete/20' : 'bg-secondary/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn('h-5 w-5', isChecked ? 'text-status-complete' : 'text-muted-foreground')} />
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={isChecked}
                      onCheckedChange={(checked) => onUpdateAdmission({ [item.key]: checked })}
                      disabled={!!admission?.completedAt}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* C. Nursing Handover */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">C</span>
              Nursing Handover Plan
            </h3>
            <div className="pl-8">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Handover Instructions
                </Label>
                <Textarea
                  placeholder="E.g.: Pending antibiotics, fasting, special monitoring, allergies..."
                  value={admission?.handoverNotes || ''}
                  onChange={(e) => onUpdateAdmission({ handoverNotes: e.target.value })}
                  disabled={!!admission?.completedAt}
                  className="min-h-[120px] bg-input border-border"
                />
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          {!admission?.completedAt && (
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                onClick={() => {
                  onCompleteAdmission();
                  setIsOpen(false);
                }}
                disabled={!isReadyToComplete}
                className="flex-1 h-12 gap-2 bg-status-complete hover:bg-status-complete/90"
              >
                <Check className="h-5 w-5" />
                Complete Admission
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="h-12"
              >
                Save & Close
              </Button>
            </div>
          )}

          {!isReadyToComplete && !admission?.completedAt && (
            <p className="text-sm text-status-pending text-center">
              Complete all required fields to finalize admission
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
