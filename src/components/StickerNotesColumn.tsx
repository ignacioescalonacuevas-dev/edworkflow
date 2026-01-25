import { Plus } from 'lucide-react';
import { StickerNote } from '@/types/patient';
import { StickerNoteItem } from './StickerNoteItem';
import { AddNotePopover } from './AddNotePopover';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';

const TOTAL_SLOTS = 12; // 3x4 grid

interface SlotProps {
  slotIndex: number;
  note?: StickerNote;
  onToggle: (noteId: string) => void;
  onRemove: (noteId: string) => void;
  isAddButton?: boolean;
  onAddNote?: (note: Omit<StickerNote, 'id' | 'createdAt'>) => void;
}

function Slot({ slotIndex, note, onToggle, onRemove, isAddButton, onAddNote }: SlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${slotIndex}`,
    data: { slotIndex },
  });

  // Add button slot
  if (isAddButton && onAddNote) {
    return (
      <div
        ref={setNodeRef}
        className="h-[22px] flex items-center justify-center"
      >
        <Popover>
          <PopoverTrigger asChild>
            <button 
              className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-[10px] px-1.5 py-0.5 rounded border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 h-full w-full"
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

  // Slot with note
  if (note) {
    return (
      <div
        ref={setNodeRef}
        className={`h-[22px] flex items-center ${isOver ? 'bg-primary/10 rounded' : ''}`}
      >
        <StickerNoteItem
          note={note}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      </div>
    );
  }

  // Empty slot (droppable target)
  return (
    <div
      ref={setNodeRef}
      className={`h-[22px] rounded transition-colors ${
        isOver ? 'bg-primary/20 border border-dashed border-primary/40' : ''
      }`}
    />
  );
}

interface StickerNotesColumnProps {
  notes: StickerNote[];
  onAddNote: (note: Omit<StickerNote, 'id' | 'createdAt'>) => void;
  onToggle: (noteId: string) => void;
  onRemove: (noteId: string) => void;
  onMoveToSlot: (noteId: string, slotIndex: number) => void;
}

export function StickerNotesColumn({ 
  notes = [], 
  onAddNote, 
  onToggle, 
  onRemove,
  onMoveToSlot,
}: StickerNotesColumnProps) {
  const safeNotes = notes || [];
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const noteId = active.id as string;
    const overId = over.id as string;
    
    // Check if dropped on a slot
    if (overId.startsWith('slot-')) {
      const targetSlotIndex = parseInt(overId.replace('slot-', ''), 10);
      onMoveToSlot(noteId, targetSlotIndex);
    }
  };

  // Create a map of slot -> note
  const slotMap = new Map<number, StickerNote>();
  safeNotes.forEach((note, index) => {
    const slotIndex = note.slotIndex ?? index;
    slotMap.set(slotIndex, note);
  });

  // Find first empty slot for the add button
  let addButtonSlot = -1;
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    if (!slotMap.has(i)) {
      addButtonSlot = i;
      break;
    }
  }

  return (
    <div 
      className="min-w-[100px] max-w-[140px]"
      onClick={(e) => e.stopPropagation()}
    >
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-3 gap-0.5">
          {Array.from({ length: TOTAL_SLOTS }).map((_, slotIndex) => {
            const note = slotMap.get(slotIndex);
            const isAddButtonSlot = slotIndex === addButtonSlot;
            
            return (
              <Slot
                key={slotIndex}
                slotIndex={slotIndex}
                note={note}
                onToggle={onToggle}
                onRemove={onRemove}
                isAddButton={isAddButtonSlot}
                onAddNote={onAddNote}
              />
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}
