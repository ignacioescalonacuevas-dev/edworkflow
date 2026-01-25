import { History, Calendar, Users, UserCheck, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useShiftHistoryStore } from '@/store/shiftHistoryStore';
import { useState } from 'react';

export function ShiftHistoryDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { getAvailableDates, loadShift, setViewingDate } = useShiftHistoryStore();
  const dates = getAvailableDates();

  const handleViewShift = (date: string) => {
    setViewingDate(date);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Shift History
          </DialogTitle>
        </DialogHeader>
        
        {dates.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No saved shifts yet.</p>
            <p className="text-sm mt-1">Shifts are saved when you start a new day.</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {dates.map((date) => {
                const shift = loadShift(date);
                if (!shift) return null;
                
                return (
                  <div 
                    key={date} 
                    className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {format(new Date(date), 'EEEE, dd MMM yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {shift.summary.totalPatients} patients
                        </span>
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3" />
                          {shift.summary.admissions} admitted
                        </span>
                        <span className="flex items-center gap-1">
                          <LogOut className="h-3 w-3" />
                          {shift.summary.discharges} discharged
                        </span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleViewShift(date)}
                    >
                      View
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
