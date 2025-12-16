import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Copy, Check, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Patient } from '@/types/patient';
import { useState } from 'react';

interface LogGeneratorProps {
  patient: Patient;
}

export function LogGenerator({ patient }: LogGeneratorProps) {
  const [copied, setCopied] = useState(false);

  const generateLog = () => {
    const lines: string[] = [];
    
    lines.push(`=== REGISTRO DE PACIENTE ===`);
    lines.push(`Paciente: ${patient.name}`);
    lines.push(`Box: ${patient.box}`);
    lines.push(`Médico: ${patient.doctor}`);
    lines.push(`Fecha: ${format(new Date(), "dd/MM/yyyy", { locale: es })}`);
    lines.push('');
    lines.push('--- CRONOLOGÍA DE EVENTOS ---');
    
    // Sort events by timestamp
    const sortedEvents = [...patient.events].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    sortedEvents.forEach((event) => {
      const time = format(new Date(event.timestamp), 'HH:mm', { locale: es });
      lines.push(`[${time}] ${event.description}`);
    });

    lines.push('');
    lines.push('--- ÓRDENES ---');
    
    patient.orders.forEach((order) => {
      const orderedTime = format(new Date(order.orderedAt), 'HH:mm', { locale: es });
      let statusText = `Ordenado: ${orderedTime}`;
      
      if (order.doneAt) {
        const doneTime = format(new Date(order.doneAt), 'HH:mm', { locale: es });
        statusText += ` | Realizado: ${doneTime}`;
      }
      if (order.reportedAt) {
        const reportedTime = format(new Date(order.reportedAt), 'HH:mm', { locale: es });
        statusText += ` | Reportado: ${reportedTime}`;
      }
      
      lines.push(`• ${order.description} (${order.type.toUpperCase()})`);
      lines.push(`  ${statusText}`);
    });

    if (patient.admission) {
      lines.push('');
      lines.push('--- ADMISIÓN ---');
      lines.push(`Especialidad: ${patient.admission.specialty}`);
      lines.push(`Registrar contactado: ${patient.admission.registrarCalled ? 'Sí' : 'No'}`);
      lines.push('Checklist de seguridad:');
      lines.push(`  • Admisión administrativa: ${patient.admission.adminComplete ? '✓' : '✗'}`);
      lines.push(`  • Brazalete ID: ${patient.admission.idBraceletVerified ? '✓' : '✗'}`);
      lines.push(`  • MRSA Swabs: ${patient.admission.mrsaSwabs ? '✓' : '✗'}`);
      lines.push(`  • Falls Assessment: ${patient.admission.fallsAssessment ? '✓' : '✗'}`);
      
      if (patient.admission.handoverNotes) {
        lines.push(`Notas de traspaso: ${patient.admission.handoverNotes}`);
      }
      
      if (patient.admission.completedAt) {
        const completedTime = format(new Date(patient.admission.completedAt), 'HH:mm', { locale: es });
        lines.push(`Admisión completada: ${completedTime}`);
      }
    }

    if (patient.dischargedAt) {
      lines.push('');
      lines.push('--- ALTA ---');
      lines.push(`Hora de alta: ${format(new Date(patient.dischargedAt), 'HH:mm', { locale: es })}`);
    }

    lines.push('');
    lines.push('=== FIN DEL REGISTRO ===');

    return lines.join('\n');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateLog());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-border">
          <FileText className="h-4 w-4" />
          Generar Log
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Registro del Paciente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            value={generateLog()}
            readOnly
            className="min-h-[400px] font-mono text-sm bg-input border-border"
          />
          
          <Button onClick={handleCopy} className="w-full gap-2">
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar al Portapapeles
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
