import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Activity, CalendarIcon, Users, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { usePatientStore } from '@/store/patientStore';

interface StaffMember {
  role: string;
  name: string;
}

const STAFF_ROLES = [
  { role: 'physician1', label: 'Physician 1', icon: Stethoscope },
  { role: 'physician2', label: 'Physician 2', icon: Stethoscope },
  { role: 'physician3', label: 'Physician 3', icon: Stethoscope },
  { role: 'physician4', label: 'Physician 4', icon: Stethoscope },
  { role: 'consultant', label: 'Consultant', icon: Stethoscope },
  { role: 'triage1', label: 'Triage 1', icon: Users },
  { role: 'triage2', label: 'Triage 2', icon: Users },
  { role: 'coordinator', label: 'Coordinator', icon: Users },
  { role: 'hca1', label: 'HCA 1', icon: Users },
  { role: 'hca2', label: 'HCA 2', icon: Users },
  { role: 'hca3', label: 'HCA 3', icon: Users },
];

interface DaySetupProps {
  onComplete: () => void;
}

export function DaySetup({ onComplete }: DaySetupProps) {
  const { setShiftDate, setShiftStaff, loadPreviousShift, shiftDate } = usePatientStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [staffNames, setStaffNames] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<'choose' | 'new'>('choose');

  const handleStaffChange = (role: string, name: string) => {
    setStaffNames(prev => ({ ...prev, [role]: name }));
  };

  const handleStartNewDay = () => {
    if (!selectedDate) return;
    
    // Set the date
    setShiftDate(selectedDate);
    
    // Build staff arrays from the form
    const physicians = [
      staffNames.physician1,
      staffNames.physician2,
      staffNames.physician3,
      staffNames.physician4,
      staffNames.consultant,
    ].filter(Boolean);
    
    const nurses = [
      staffNames.triage1,
      staffNames.triage2,
      staffNames.coordinator,
      staffNames.hca1,
      staffNames.hca2,
      staffNames.hca3,
    ].filter(Boolean);
    
    setShiftStaff(physicians, nurses);
    onComplete();
  };

  const handleLoadPrevious = () => {
    loadPreviousShift();
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-border bg-card">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <Activity className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">ED Coordination Board</CardTitle>
          <p className="text-muted-foreground">Select a date or start a new shift</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {mode === 'choose' ? (
            <div className="space-y-4">
              {/* Date selection */}
              <div className="flex flex-col items-center gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-64 justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  size="lg" 
                  className="w-full" 
                  onClick={() => setMode('new')}
                >
                  Start New Day
                </Button>
                
                {shiftDate && (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                    onClick={handleLoadPrevious}
                  >
                    Continue Previous Shift ({format(new Date(shiftDate), 'PP')})
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Date display */}
              <div className="text-center pb-4 border-b border-border">
                <span className="text-lg font-medium">
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'No date selected'}
                </span>
              </div>

              {/* Staff input grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Physicians */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-sm">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    Physicians
                  </h3>
                  {STAFF_ROLES.filter(r => r.icon === Stethoscope).map(({ role, label }) => (
                    <div key={role} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{label}</Label>
                      <Input
                        placeholder={`Enter ${label.toLowerCase()} name...`}
                        value={staffNames[role] || ''}
                        onChange={(e) => handleStaffChange(role, e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>
                  ))}
                </div>

                {/* Nurses / Support */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-primary" />
                    Nursing / Support
                  </h3>
                  {STAFF_ROLES.filter(r => r.icon === Users).map(({ role, label }) => (
                    <div key={role} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{label}</Label>
                      <Input
                        placeholder={`Enter ${label.toLowerCase()} name...`}
                        value={staffNames[role] || ''}
                        onChange={(e) => handleStaffChange(role, e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setMode('choose')}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleStartNewDay}
                >
                  Start Shift
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
