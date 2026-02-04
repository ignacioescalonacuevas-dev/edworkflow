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
    color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' 
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
                "w-[28px] h-[22px] rounded text-[10px] font-bold flex items-center justify-center border transition-colors",
                note.completed 
                  ? "bg-green-500/40 text-green-300 border-green-500/50"
                  : "bg-blue-500/30 text-blue-300 border-blue-500/40 hover:bg-blue-500/40"
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
            "w-[28px] h-[22px] rounded text-[10px] font-bold flex items-center justify-center border",
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
