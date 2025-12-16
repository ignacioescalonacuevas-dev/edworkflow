import { useState, useEffect } from 'react';
import { Clock, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TimerDisplayProps {
  startTime: Date | string;
  onEdit?: (newTime: Date) => void;
  label?: string;
}

export function TimerDisplay({ startTime, onEdit, label = 'Time in ED' }: TimerDisplayProps) {
  const [elapsed, setElapsed] = useState('00:00:00');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const updateElapsed = () => {
      const now = new Date();
      const start = new Date(startTime);
      const diff = now.getTime() - start.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setElapsed(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const handleEdit = () => {
    if (onEdit && editValue) {
      const [hours, minutes] = editValue.split(':').map(Number);
      const newTime = new Date(new Date(startTime));
      newTime.setHours(hours, minutes, 0, 0);
      onEdit(newTime);
      setIsEditing(false);
    }
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30 border border-border">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm">{label}:</span>
        </div>
        <div className="font-mono font-bold text-primary text-xl">
          {elapsed}
        </div>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <span>Arrival: {formatTime(startTime)}</span>
        {onEdit && (
          <Popover open={isEditing} onOpenChange={setIsEditing}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4 bg-card border-border">
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium">Edit arrival time</span>
                <Input
                  type="time"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="bg-input border-border"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEdit}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
