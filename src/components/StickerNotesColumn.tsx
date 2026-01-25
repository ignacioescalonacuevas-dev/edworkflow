import { useRef } from 'react';
import { Plus } from 'lucide-react';
import { StickerNote } from '@/types/patient';
import { StickerNoteItem } from './StickerNoteItem';
import { AddNotePopover } from './AddNotePopover';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

interface StickerNotesColumnProps {
  notes: StickerNote[];
  onAddNote: (note: Omit<StickerNote, 'id' | 'createdAt'>) => void;
  onToggle: (noteId: string) => void;
  onRemove: (noteId: string) => void;
  onUpdatePosition?: (noteId: string, position: { x: number; y: number }) => void;
}

export function StickerNotesColumn({ 
  notes = [], 
  onAddNote, 
  onToggle, 
  onRemove,
  onUpdatePosition 
}: StickerNotesColumnProps) {
  const safeNotes = notes || [];
  const containerRef = useRef<HTMLDivElement>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    
    if (!onUpdatePosition || !containerRef.current) return;
    
    const noteId = active.id as string;
    const note = safeNotes.find(n => n.id === noteId);
    if (!note) return;
    
    const currentX = note.position?.x ?? 0;
    const currentY = note.position?.y ?? 0;
    
    // Calculate new position
    let newX = currentX + delta.x;
    let newY = currentY + delta.y;
    
    // Get container bounds
    const containerRect = containerRef.current.getBoundingClientRect();
    const maxX = containerRect.width - 40; // Approximate note width
    const maxY = containerRect.height - 20; // Approximate note height
    
    // Clamp to container bounds
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));
    
    onUpdatePosition(noteId, { x: newX, y: newY });
  };

  // Calculate initial positions for notes without positions
  const notesWithPositions = safeNotes.map((note, index) => {
    if (note.position) return note;
    // Stack notes vertically by default
    return {
      ...note,
      position: { x: 0, y: index * 18 }
    };
  });

  return (
    <div 
      ref={containerRef}
      className="relative min-w-[80px] max-w-[120px] min-h-[60px]" 
      onClick={(e) => e.stopPropagation()}
    >
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        {notesWithPositions.map((note) => (
          <StickerNoteItem
            key={note.id}
            note={note}
            onToggle={onToggle}
            onRemove={onRemove}
          />
        ))}
      </DndContext>
      
      {/* Add button - fixed at bottom-left */}
      <Popover>
        <PopoverTrigger asChild>
          <button 
            className="absolute bottom-0 left-0 flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors text-[10px] px-1 py-0.5 rounded border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50"
            style={{ zIndex: 0 }}
          >
            <Plus className="h-2.5 w-2.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <AddNotePopover onAdd={onAddNote} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
