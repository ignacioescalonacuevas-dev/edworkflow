import { X, Check } from 'lucide-react';
import { StickerNote, NOTE_TYPE_CONFIG } from '@/types/patient';
import { cn } from '@/lib/utils';

interface StickerNoteItemProps {
  note: StickerNote;
  onToggle: (noteId: string) => void;
  onRemove: (noteId: string) => void;
}

export function StickerNoteItem({ note, onToggle, onRemove }: StickerNoteItemProps) {
  const config = NOTE_TYPE_CONFIG[note.type];

  // Study type: show checkmark when completed, click to toggle, X to remove
  if (note.type === 'study') {
    return (
      <div className="flex items-center gap-0.5 group">
        <button
          onClick={() => onToggle(note.id)}
          className={cn(
            "flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-medium border transition-colors",
            note.completed 
              ? "bg-green-500/30 text-green-300 border-green-500/40"
              : "bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30"
          )}
        >
          {note.completed && <Check className="h-2.5 w-2.5" />}
          <span>{note.text}</span>
        </button>
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

  return (
    <div className="flex items-center gap-0.5 group">
      <span className={cn(
        "px-1 py-0.5 rounded text-[10px] font-medium border",
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
