import { useState } from 'react';
import { format } from 'date-fns';
import { Edit2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EditableTimestampProps {
  timestamp: Date | string;
  onEdit: (newTime: Date) => void;
  label?: string;
  className?: string;
}

export function EditableTimestamp({ timestamp, onEdit, label, className }: EditableTimestampProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  
  // Ensure timestamp is a Date object
  const dateTimestamp = new Date(timestamp);

  const handleStartEdit = () => {
    setEditValue(format(dateTimestamp, 'HH:mm'));
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue) {
      const [hours, minutes] = editValue.split(':').map(Number);
      const newTime = new Date(dateTimestamp);
      newTime.setHours(hours, minutes, 0, 0);
      onEdit(newTime);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {label && <span className="text-xs text-muted-foreground mr-1">{label}:</span>}
        <Input
          type="time"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-6 w-20 text-xs bg-input border-border px-1"
          autoFocus
        />
        <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleSave}>
          <Check className="h-3 w-3 text-status-complete" />
        </Button>
        <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleCancel}>
          <X className="h-3 w-3 text-destructive" />
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={handleStartEdit}
      className={cn(
        'flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors group',
        className
      )}
    >
      {label && <span>{label}:</span>}
      <span className="font-mono">{format(dateTimestamp, 'HH:mm')}</span>
      <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
