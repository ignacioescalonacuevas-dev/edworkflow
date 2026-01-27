import { useState } from 'react';
import { StaffStats, formatDuration } from '@/hooks/useAnalytics';
import { ChevronDown, ChevronRight, User, Stethoscope } from 'lucide-react';
import { TRIAGE_CONFIG, TriageLevel, PROCESS_STATES } from '@/types/patient';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StaffWorkloadProps {
  physicianStats: StaffStats[];
  nurseStats: StaffStats[];
}

const TRIAGE_COLORS: Record<TriageLevel, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#22c55e',
  5: '#3b82f6',
};

function StaffSection({ 
  title, 
  icon: Icon, 
  stats 
}: { 
  title: string; 
  icon: typeof User; 
  stats: StaffStats[] 
}) {
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null);

  if (stats.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No {title.toLowerCase()} data
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      
      <div className="space-y-1">
        {stats.map(staff => {
          const isExpanded = expandedStaff === staff.name;
          const studiesText = Object.entries(staff.studies)
            .map(([study, count]) => `${count} ${study}`)
            .join(', ') || '-';
          
          return (
            <Collapsible
              key={staff.name}
              open={isExpanded}
              onOpenChange={() => setExpandedStaff(isExpanded ? null : staff.name)}
            >
              <CollapsibleTrigger className="w-full">
                <div className={cn(
                  "flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors",
                  isExpanded && "bg-muted/50"
                )}>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  
                  <span className="font-medium flex-1 text-left">{staff.name}</span>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="w-16 text-right">
                      <span className="font-semibold text-foreground">{staff.patientCount}</span> pts
                    </span>
                    <span className="w-16 text-right">
                      <span className="text-green-500">{staff.admissions}</span> admit
                    </span>
                    <span className="w-16 text-right">
                      <span className="text-blue-500">{staff.discharges}</span> d/c
                    </span>
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="ml-6 mt-1 mb-2 rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-8 text-xs">Triage</TableHead>
                        <TableHead className="h-8 text-xs">Patient</TableHead>
                        <TableHead className="h-8 text-xs">Complaint</TableHead>
                        <TableHead className="h-8 text-xs">Status</TableHead>
                        <TableHead className="h-8 text-xs text-right">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staff.patients.map(patient => {
                        const processLabel = PROCESS_STATES.find(
                          s => s.value === patient.processState
                        )?.label || patient.processState;
                        
                        return (
                          <TableRow key={patient.id} className="hover:bg-muted/30">
                            <TableCell className="py-1.5">
                              <div 
                                className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                                style={{
                                  backgroundColor: TRIAGE_COLORS[patient.triageLevel],
                                  color: patient.triageLevel === 3 ? 'black' : 'white'
                                }}
                              >
                                {patient.triageLevel}
                              </div>
                            </TableCell>
                            <TableCell className="py-1.5 text-xs font-medium">
                              {patient.name}
                            </TableCell>
                            <TableCell className="py-1.5 text-xs text-muted-foreground max-w-[150px] truncate">
                              {patient.chiefComplaint || '-'}
                            </TableCell>
                            <TableCell className="py-1.5">
                              <span className="text-xs px-1.5 py-0.5 rounded bg-muted">
                                {processLabel}
                              </span>
                            </TableCell>
                            <TableCell className="py-1.5 text-xs text-right text-muted-foreground">
                              {formatDuration(patient.duration)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}

export function StaffWorkload({ physicianStats, nurseStats }: StaffWorkloadProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-6">
      <h3 className="text-sm font-medium text-muted-foreground">Staff Workload</h3>
      
      <StaffSection 
        title="Physicians" 
        icon={Stethoscope} 
        stats={physicianStats} 
      />
      
      <StaffSection 
        title="Nurses" 
        icon={User} 
        stats={nurseStats} 
      />
    </div>
  );
}
