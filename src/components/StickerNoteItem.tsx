import { X, Check } from 'lucide-react';
import { StickerNote, NOTE_TYPE_CONFIG, getAbbreviation } from '@/types/patient';
import { cn } from '@/lib/utils';
import { useDraggable } from '@dnd-kit/core';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StickerNoteItemProps {
  note: StickerNote;
  onToggle: (noteId: string) => void;
  onRemove: (noteId: string) => void;
}

export function StickerNoteItem({ note, onToggle, onRemove }: StickerNoteItemProps) {
  // Fallback config if note type is not recognized
  const config = NOTE_TYPE_CONFIG[note.type] || { 
    label: 'Note', 
    color: 'bg-slate-100 text-slate-700 border-slate-300' 
  };
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: note.id });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const abbreviation = getAbbreviation(note.text);

  // Study type: compact button with tooltip
  if (note.type === 'study') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            ref={setNodeRef} 
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
              "relative group touch-none",
              isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(note.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className={cn(
                "w-[34px] h-[26px] rounded text-[11px] font-bold flex items-center justify-center border transition-colors",
                note.completed 
                  ? "bg-green-100 text-green-700 border-green-400"
                  : "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"
              )}
            >
              {abbreviation}
              {note.completed && <Check className="h-2.5 w-2.5 ml-0.5" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(note.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-destructive text-destructive-foreground rounded-full w-3 h-3 flex items-center justify-center transition-opacity"
            >
              <X className="h-2 w-2" />
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {note.text} {note.completed ? '✓' : '(pendiente)'}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Other types (critical, precaution, etc.) - compact with tooltip
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          ref={setNodeRef} 
          style={style}
          {...attributes}
          {...listeners}
          className={cn(
            "relative group touch-none",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
        >
          <span className={cn(
            "w-[34px] h-[26px] rounded text-[11px] font-bold flex items-center justify-center border",
            config.color
          )}>
            {abbreviation}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(note.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-destructive text-destructive-foreground rounded-full w-3 h-3 flex items-center justify-center transition-opacity"
          >
            <X className="h-2 w-2" />
          </button>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {note.text}
      </TooltipContent>
    </Tooltip>
  );
}
