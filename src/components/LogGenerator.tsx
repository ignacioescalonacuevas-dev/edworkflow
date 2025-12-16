import { format } from 'date-fns';
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
    
    lines.push(`=== PATIENT RECORD ===`);
    lines.push(`Patient: ${patient.name}`);
    lines.push(`Location: ${patient.box}`);
    lines.push(`Doctor: ${patient.doctor || 'Not assigned'}`);
    lines.push(`Date: ${format(new Date(), "MM/dd/yyyy")}`);
    lines.push('');
    lines.push('--- EVENT TIMELINE ---');
    
    // Sort events by timestamp
    const sortedEvents = [...patient.events].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    sortedEvents.forEach((event) => {
      const time = format(new Date(event.timestamp), 'HH:mm');
      lines.push(`[${time}] ${event.description}`);
    });

    lines.push('');
    lines.push('--- ORDERS ---');
    
    patient.orders.forEach((order) => {
      const orderedTime = format(new Date(order.orderedAt), 'HH:mm');
      let statusText = `Ordered: ${orderedTime}`;
      
      if (order.doneAt) {
        const doneTime = format(new Date(order.doneAt), 'HH:mm');
        statusText += ` | Done: ${doneTime}`;
      }
      if (order.reportedAt) {
        const reportedTime = format(new Date(order.reportedAt), 'HH:mm');
        statusText += ` | Reported: ${reportedTime}`;
      }
      
      lines.push(`• ${order.description} (${order.type.toUpperCase()})`);
      lines.push(`  ${statusText}`);
    });

    if (patient.admission) {
      lines.push('');
      lines.push('--- ADMISSION ---');
      lines.push(`Specialty: ${patient.admission.specialty}`);
      lines.push(`Registrar contacted: ${patient.admission.registrarCalled ? 'Yes' : 'No'}`);
      lines.push('Safety Checklist:');
      lines.push(`  • Administrative admission: ${patient.admission.adminComplete ? '✓' : '✗'}`);
      lines.push(`  • ID Bracelet: ${patient.admission.idBraceletVerified ? '✓' : '✗'}`);
      lines.push(`  • MRSA Swabs: ${patient.admission.mrsaSwabs ? '✓' : '✗'}`);
      lines.push(`  • Falls Assessment: ${patient.admission.fallsAssessment ? '✓' : '✗'}`);
      
      if (patient.admission.handoverNotes) {
        lines.push(`Handover notes: ${patient.admission.handoverNotes}`);
      }
      
      if (patient.admission.completedAt) {
        const completedTime = format(new Date(patient.admission.completedAt), 'HH:mm');
        lines.push(`Admission completed: ${completedTime}`);
      }
    }

    if (patient.dischargedAt) {
      lines.push('');
      lines.push('--- DISCHARGE ---');
      lines.push(`Discharge time: ${format(new Date(patient.dischargedAt), 'HH:mm')}`);
    }

    lines.push('');
    lines.push('=== END OF RECORD ===');

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
          Generate Log
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Patient Record
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
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
