import { useState, useEffect } from 'react';
import { Building2, Phone, ClipboardCheck, IdCard, Bug, AlertTriangle, FileText, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AdmissionData, SPECIALTIES } from '@/types/patient';
import { cn } from '@/lib/utils';

interface AdmissionFormProps {
  admission?: AdmissionData;
  onStartAdmission: () => void;
  onUpdateAdmission: (data: Partial<AdmissionData>) => void;
  onCompleteAdmission: () => void;
  patientStatus: 'active' | 'admission' | 'discharged';
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
    admission.registrarCalled &&
    admission.adminComplete &&
    admission.idBraceletVerified &&
    admission.mrsaSwabs &&
    admission.fallsAssessment;

  const checklistItems = [
    {
      key: 'adminComplete' as const,
      label: 'Admisión Administrativa',
      description: 'Papeles y documentación listos',
      icon: ClipboardCheck,
    },
    {
      key: 'idBraceletVerified' as const,
      label: 'Brazalete de Identificación',
      description: 'Verificado y colocado',
      icon: IdCard,
    },
    {
      key: 'mrsaSwabs' as const,
      label: 'MRSA Swabs',
      description: 'Tomados y verificados',
      icon: Bug,
    },
    {
      key: 'fallsAssessment' as const,
      label: 'ED Falls Assessment',
      description: 'Evaluación de riesgo de caídas completada',
      icon: AlertTriangle,
    },
  ];

  if (patientStatus === 'discharged') {
    return null;
  }

  if (patientStatus === 'active' && !admission) {
    return (
      <Button
        onClick={onStartAdmission}
        className="w-full h-14 text-lg gap-2 bg-status-admission hover:bg-status-admission/90"
      >
        <Building2 className="h-5 w-5" />
        Cursar Ingreso / Admission
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
          {admission?.completedAt ? 'Admisión Completada' : 'Continuar Admisión'}
          {!admission?.completedAt && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-foreground/20 rounded-full">
              En proceso
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-6 w-6 text-status-admission" />
            Proceso de Admisión
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* A. Medical Coordination */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">A</span>
              Coordinación Médica
            </h3>
            <div className="space-y-4 pl-8">
              <div className="space-y-2">
                <Label>Especialidad de Destino</Label>
                <Select
                  value={admission?.specialty || ''}
                  onValueChange={(value) => onUpdateAdmission({ specialty: value })}
                  disabled={!!admission?.completedAt}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Seleccionar especialidad..." />
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

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Llamada al Registrar realizada</p>
                    <p className="text-sm text-muted-foreground">Contacto con especialidad confirmado</p>
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
              Checklist de Seguridad y Administrativo
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
              Plan de Enfermería (Handover)
            </h3>
            <div className="pl-8">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Instrucciones de Traspaso
                </Label>
                <Textarea
                  placeholder="Ej: Antibióticos pendientes, ayuno, monitoreo especial, alergias..."
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
                Completar Admisión
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="h-12"
              >
                Guardar y Cerrar
              </Button>
            </div>
          )}

          {!isReadyToComplete && !admission?.completedAt && (
            <p className="text-sm text-status-pending text-center">
              Complete todos los campos obligatorios para finalizar la admisión
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
