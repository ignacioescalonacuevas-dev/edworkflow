import { Plus } from 'lucide-react';
import { StickerNote } from '@/types/patient';
import { StickerNoteItem } from './StickerNoteItem';
import { AddNotePopover } from './AddNotePopover';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

interface StickerNotesColumnProps {
  notes: StickerNote[];
  onAddNote: (note: Omit<StickerNote, 'id' | 'createdAt'>) => void;
  onToggle: (noteId: string) => void;
  onRemove: (noteId: string) => void;
  onReorder?: (noteIds: string[]) => void;
}

export function StickerNotesColumn({ 
  notes = [], 
  onAddNote, 
  onToggle, 
  onRemove,
  onReorder 
}: StickerNotesColumnProps) {
  const safeNotes = notes || [];
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = safeNotes.findIndex((n) => n.id === active.id);
      const newIndex = safeNotes.findIndex((n) => n.id === over.id);
      
      const newOrder = arrayMove(safeNotes, oldIndex, newIndex);
      onReorder?.(newOrder.map((n) => n.id));
    }
  };

  return (
    <div 
      className="flex flex-wrap gap-0.5 items-start content-start min-w-[80px] max-w-[120px]" 
      onClick={(e) => e.stopPropagation()}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={safeNotes.map((n) => n.id)} 
          strategy={rectSortingStrategy}
        >
          {safeNotes.map((note) => (
            <StickerNoteItem
              key={note.id}
              note={note}
              onToggle={onToggle}
              onRemove={onRemove}
            />
          ))}
        </SortableContext>
      </DndContext>
      
      {/* Add button */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors text-[10px] px-1 py-0.5 rounded border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50">
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
