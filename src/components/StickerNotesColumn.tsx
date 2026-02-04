import { Plus } from 'lucide-react';
import { StickerNote } from '@/types/patient';
import { StickerNoteItem } from './StickerNoteItem';
import { AddNotePopover } from './AddNotePopover';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useShiftHistoryStore } from '@/store/shiftHistoryStore';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';

const TOTAL_SLOTS = 6; // 3x2 grid

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

  // Add button slot - compact
  if (isAddButton && onAddNote) {
    return (
      <div
        ref={setNodeRef}
        className="w-[36px] h-[28px] flex items-center justify-center"
      >
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-[36px] h-[28px] rounded border border-dashed border-muted-foreground/40 hover:border-primary/60 hover:bg-primary/10 flex items-center justify-center transition-colors"
            >
              <Plus className="h-2.5 w-2.5 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <AddNotePopover onAdd={onAddNote} />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Slot with note - compact
  if (note) {
    return (
      <div
        ref={setNodeRef}
        className={`w-[36px] h-[28px] flex items-center justify-center ${isOver ? 'bg-primary/10 rounded' : ''}`}
      >
        <StickerNoteItem
          note={note}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      </div>
    );
  }

  // Empty slot (droppable target) - compact
  return (
    <div
      ref={setNodeRef}
      className={`w-[36px] h-[28px] rounded transition-colors ${
        isOver ? 'bg-primary/20 border border-dashed border-primary/40' : 'border border-dashed border-muted-foreground/20'
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
  readOnly?: boolean;
}

export function StickerNotesColumn({ 
  notes = [], 
  onAddNote, 
  onToggle, 
  onRemove,
  onMoveToSlot,
  readOnly = false,
}: StickerNotesColumnProps) {
  const safeNotes = notes || [];
  const { viewingDate } = useShiftHistoryStore();
  const isReadOnly = readOnly || viewingDate !== null;
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  // Create a map of slot -> note
  const slotMap = new Map<number, StickerNote>();
  safeNotes.forEach((note, index) => {
    const slotIndex = note.slotIndex ?? index;
    slotMap.set(slotIndex, note);
  });

  const handleDragEnd = (event: DragEndEvent) => {
    if (isReadOnly) return;
    
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

  // Find first empty slot for the add button (only if not read-only)
  let addButtonSlot = -1;
  if (!isReadOnly) {
    for (let i = 0; i < TOTAL_SLOTS; i++) {
      if (!slotMap.has(i)) {
        addButtonSlot = i;
        break;
      }
    }
  }

  // Remove duplicate add button logic (now handled above)

  return (
    <div 
      className="w-[114px]"
      onClick={(e) => e.stopPropagation()}
    >
      <DndContext
        sensors={isReadOnly ? [] : sensors}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-3 grid-rows-2 gap-1">
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
