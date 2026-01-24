import { X, Check, GripVertical } from 'lucide-react';
import { StickerNote, NOTE_TYPE_CONFIG } from '@/types/patient';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StickerNoteItemProps {
  note: StickerNote;
  onToggle: (noteId: string) => void;
  onRemove: (noteId: string) => void;
}

export function StickerNoteItem({ note, onToggle, onRemove }: StickerNoteItemProps) {
  const config = NOTE_TYPE_CONFIG[note.type];
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  // Study type: show checkmark when completed, click to toggle, X to remove
  if (note.type === 'study') {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="flex items-center gap-0.5 group"
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity touch-none"
        >
          <GripVertical className="h-2.5 w-2.5" />
        </div>
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
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center gap-0.5 group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity touch-none"
      >
        <GripVertical className="h-2.5 w-2.5" />
      </div>
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
