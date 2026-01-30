import { useState } from 'react';
import { format } from 'date-fns';
import { usePatientStore } from '@/store/patientStore';
import { useShiftHistoryStore } from '@/store/shiftHistoryStore';
import { useAnalytics, formatDuration } from '@/hooks/useAnalytics';
import { Patient } from '@/types/patient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  LogOut, 
  Building2, 
  Ambulance,
  AlertTriangle,
  Activity,
  Copy,
  Check,
  UserX,
  CalendarCheck
} from 'lucide-react';

import { StatCard } from './analytics/StatCard';
import { TriageDistribution } from './analytics/TriageDistribution';
import { StudiesChart } from './analytics/StudiesChart';
import { WaitTimeStats } from './analytics/WaitTimeStats';
import { StaffWorkload } from './analytics/StaffWorkload';
import { HourlyChart } from './analytics/HourlyChart';

interface AnalyticsDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnalyticsDashboard({ open, onOpenChange }: AnalyticsDashboardProps) {
  const { patients: currentPatients, shiftDate } = usePatientStore();
  const { getAvailableDates, loadShift } = useShiftHistoryStore();
  
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [copied, setCopied] = useState(false);
  
  // Get available dates for selector
  const availableDates = getAvailableDates();
  const todayString = shiftDate ? format(new Date(shiftDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
  
  // Get patients for selected date
  let patients: Patient[] = currentPatients;
  let displayDate = todayString;
  
  if (selectedDate !== 'today') {
    const historicalShift = loadShift(selectedDate);
    if (historicalShift) {
      patients = historicalShift.patients;
      displayDate = selectedDate;
    }
  }
  
  // Calculate analytics
  const analytics = useAnalytics(patients);
  
  // Export/Copy functionality
  const handleCopyStats = () => {
    const followupsText = Object.entries(analytics.followupCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => `${name}: ${count}`)
      .join(', ') || 'None';
    
    const stats = `
ED Analytics Report - ${format(new Date(displayDate), 'EEEE, dd MMMM yyyy')}
=====================================

END OF DAY SUMMARY
------------------
Total Arrivals: ${analytics.totalPatients}
DNW (Did Not Wait): ${analytics.dnwCount}
Discharges: ${analytics.discharges}
Admissions: ${analytics.admissions} (${analytics.admissionRate.toFixed(1)}% rate)
Transfers: ${analytics.transfers}
Active Patients: ${analytics.activePatients}

FOLLOW-UPS SCHEDULED
--------------------
${followupsText}

TRIAGE DISTRIBUTION
-------------------
T1 (Immediate): ${analytics.triageDistribution[1]}
T2 (Very Urgent): ${analytics.triageDistribution[2]}
T3 (Urgent): ${analytics.triageDistribution[3]}
T4 (Standard): ${analytics.triageDistribution[4]}
T5 (Non-Urgent): ${analytics.triageDistribution[5]}
Critical (T1-T2): ${analytics.criticalCount}

STUDIES PERFORMED
-----------------
CT: ${analytics.studiesCounts.ct}
ECG: ${analytics.studiesCounts.ecg}
ECHO: ${analytics.studiesCounts.echo}
X-Ray: ${analytics.studiesCounts.xray}
US: ${analytics.studiesCounts.us}
Total: ${analytics.totalStudies}

WAIT TIMES
----------
Average Wait: ${analytics.waitTimes.averageWait !== null ? formatDuration(analytics.waitTimes.averageWait) : 'N/A'}
Average Total: ${formatDuration(analytics.waitTimes.averageTotal)}
Longest: ${formatDuration(analytics.waitTimes.longest)}
Shortest: ${formatDuration(analytics.waitTimes.shortest)}

PHYSICIAN WORKLOAD
------------------
${analytics.physicianStats.map(p => 
  `${p.name}: ${p.patientCount} pts, ${p.admissions} admit, ${p.discharges} d/c`
).join('\n')}

NURSE WORKLOAD
--------------
${analytics.nurseStats.map(n => 
  `${n.name}: ${n.patientCount} pts`
).join('\n')}

Peak Hour: ${analytics.peakHour !== null ? `${String(analytics.peakHour).padStart(2, '0')}:00` : 'N/A'}
    `.trim();
    
    navigator.clipboard.writeText(stats);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <DialogTitle>Analytics Dashboard</DialogTitle>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">
                    Today ({format(new Date(todayString), 'dd MMM')})
                  </SelectItem>
                  {availableDates
                    .filter(d => d !== todayString)
                    .slice(0, 30)
                    .map(date => (
                      <SelectItem key={date} value={date}>
                        {format(new Date(date), 'EEEE, dd MMM yyyy')}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyStats}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Export
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {format(new Date(displayDate), 'EEEE, dd MMMM yyyy')}
          </p>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-100px)]">
          <div className="p-4 space-y-4">
            {/* Top Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <StatCard
                title="Total Patients"
                value={analytics.totalPatients}
                icon={Users}
                subtitle={`${analytics.activePatients} active`}
              />
              <StatCard
                title="Discharges"
                value={analytics.discharges}
                icon={LogOut}
              />
              <StatCard
                title="Admissions"
                value={analytics.admissions}
                icon={Building2}
                subtitle={`${analytics.admissionRate.toFixed(0)}% rate`}
              />
              <StatCard
                title="Transfers"
                value={analytics.transfers}
                icon={Ambulance}
              />
              <StatCard
                title="DNW"
                value={analytics.dnwCount}
                icon={UserX}
                subtitle="Did Not Wait"
                className="border-orange-500/30"
                iconClassName="bg-orange-500/20"
              />
              <StatCard
                title="Critical (T1-T2)"
                value={analytics.criticalCount}
                icon={AlertTriangle}
                className="border-red-500/30"
                iconClassName="bg-red-500/20"
              />
              <StatCard
                title="Total Studies"
                value={analytics.totalStudies}
                icon={Activity}
              />
            </div>
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <TriageDistribution distribution={analytics.triageDistribution} />
              <StudiesChart counts={analytics.studiesCounts} />
              <WaitTimeStats stats={analytics.waitTimes} />
            </div>
            
            {/* Hourly Chart */}
            <HourlyChart data={analytics.hourlyData} peakHour={analytics.peakHour} />
            
            {/* Staff Workload */}
            <StaffWorkload 
              physicianStats={analytics.physicianStats}
              nurseStats={analytics.nurseStats}
            />
            
            
            {/* Follow-ups Summary */}
            {Object.keys(analytics.followupCounts).length > 0 && (
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarCheck className="h-4 w-4 text-green-400" />
                  <h3 className="text-sm font-medium text-muted-foreground">Follow-up Appointments Scheduled</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analytics.followupCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([followup, count]) => (
                      <span 
                        key={followup}
                        className="px-3 py-1.5 rounded-md text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30"
                      >
                        {followup}: {count}
                      </span>
                    ))}
                </div>
              </div>
            )}
            
            {/* Precautions Summary */}
            {Object.keys(analytics.precautionCounts).length > 0 && (
              <div className="rounded-lg border bg-card p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Active Precautions</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analytics.precautionCounts).map(([precaution, count]) => (
                    <span 
                      key={precaution}
                      className="px-2 py-1 rounded-md text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    >
                      {precaution}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
