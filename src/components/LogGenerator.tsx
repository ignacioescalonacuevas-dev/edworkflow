import { format } from 'date-fns';
import { Copy, Check, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Patient, PATIENT_STATUSES, BED_STATUSES } from '@/types/patient';
import { useState } from 'react';

interface LogGeneratorProps {
  patient: Patient;
}

export function LogGenerator({ patient }: LogGeneratorProps) {
  const [copied, setCopied] = useState(false);

  const generateLog = () => {
    const lines: string[] = [];
    
    const statusLabel = PATIENT_STATUSES.find(s => s.value === patient.status)?.label || patient.status;
    
    // Header
    lines.push(`=== PATIENT RECORD ===`);
    lines.push(`Patient: ${patient.name}`);
    lines.push(`Location: ${patient.box}`);
    lines.push(`Doctor: ${patient.doctor || 'Not assigned'}`);
    lines.push(`Status: ${statusLabel}`);
    lines.push(`Date: ${format(new Date(), "MM/dd/yyyy")}`);
    lines.push('');
    lines.push('=== CHRONOLOGICAL TIMELINE ===');
    
    // Build unified timeline with all events
    interface TimelineEntry {
      timestamp: Date;
      description: string;
    }
    
    const timeline: TimelineEntry[] = [];
    
    // Add patient events
    patient.events.forEach((event) => {
      timeline.push({
        timestamp: new Date(event.timestamp),
        description: event.description
      });
    });
    
    // Add order events (ordered, done, reported)
    patient.orders.forEach((order) => {
      const typeLabel = order.type.toUpperCase();
      
      timeline.push({
        timestamp: new Date(order.orderedAt),
        description: `ORDER: ${order.description} requested (${typeLabel})`
      });
      
      if (order.doneAt) {
        timeline.push({
          timestamp: new Date(order.doneAt),
          description: `ORDER DONE: ${order.description} (${typeLabel})`
        });
      }
      
      if (order.reportedAt) {
        timeline.push({
          timestamp: new Date(order.reportedAt),
          description: `ORDER REPORTED: ${order.description} - Results available (${typeLabel})`
        });
      }
    });
    
    // Add admission events
    if (patient.admission) {
      timeline.push({
        timestamp: new Date(patient.admission.startedAt),
        description: `ADMISSION STARTED - Specialty: ${patient.admission.specialty || 'Not specified'}`
      });
      
      if (patient.admission.completedAt) {
        const bedInfo = patient.admission.bedNumber ? ` - Bed: ${patient.admission.bedNumber}` : '';
        timeline.push({
          timestamp: new Date(patient.admission.completedAt),
          description: `ADMISSION COMPLETED${bedInfo}`
        });
      }
    }
    
    // Add discharge/transfer event
    if (patient.dischargedAt) {
      let description = 'Patient discharged';
      if (patient.status === 'transferred' && patient.transferredTo) {
        description = `Patient transferred to ${patient.transferredTo}`;
      } else if (patient.admission?.completedAt) {
        description = `Patient admitted to ${patient.admission.bedNumber || 'ward'}`;
      }
      timeline.push({
        timestamp: new Date(patient.dischargedAt),
        description
      });
    }
    
    // Sort timeline chronologically
    timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Format and add timeline entries
    timeline.forEach((entry) => {
      const time = format(entry.timestamp, 'HH:mm');
      lines.push(`[${time}] ${entry.description}`);
    });

    // Admission summary section (if applicable)
    if (patient.admission) {
      lines.push('');
      lines.push('=== ADMISSION SUMMARY ===');
      lines.push(`Specialty: ${patient.admission.specialty || 'Not specified'}`);
      lines.push(`Consultant: ${patient.admission.consultantName || 'Not specified'}`);
      const bedStatusLabel = BED_STATUSES.find(s => s.value === patient.admission?.bedStatus)?.label || patient.admission.bedStatus;
      lines.push(`Bed: ${patient.admission.bedNumber || 'Not assigned'} (${bedStatusLabel})`);
      
      const checklist = [
        patient.admission.adminComplete ? '✓ Admin' : '✗ Admin',
        patient.admission.idBraceletVerified ? '✓ ID Band' : '✗ ID Band',
        patient.admission.mrsaSwabs ? '✓ MRSA' : '✗ MRSA',
        patient.admission.fallsAssessment ? '✓ Falls' : '✗ Falls'
      ].join(' | ');
      lines.push(`Safety Checklist: ${checklist}`);
      
      if (patient.admission.handoverNotes) {
        lines.push(`Handover Notes: ${patient.admission.handoverNotes}`);
      }
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
