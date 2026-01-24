import { X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { StickerNote, NOTE_TYPE_CONFIG } from '@/types/patient';
import { cn } from '@/lib/utils';

interface StickerNoteItemProps {
  note: StickerNote;
  onToggle: (noteId: string) => void;
  onRemove: (noteId: string) => void;
}

export function StickerNoteItem({ note, onToggle, onRemove }: StickerNoteItemProps) {
  const config = NOTE_TYPE_CONFIG[note.type];

  if (note.type === 'study') {
    return (
      <div className="flex items-center gap-1 group">
        <Checkbox
          checked={note.completed}
          onCheckedChange={() => onToggle(note.id)}
          className="h-3 w-3 border-muted-foreground/50"
        />
        <span className={cn(
          "text-xs",
          note.completed && "line-through text-muted-foreground"
        )}>
          {note.text}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(note.id);
          }}
          className="opacity-0 group-hover:opacity-100 ml-auto text-muted-foreground hover:text-destructive transition-opacity"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 group">
      <span className={cn(
        "px-1.5 py-0.5 rounded text-[10px] font-medium border",
        config.color
      )}>
        {note.text}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(note.id);
        }}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}
