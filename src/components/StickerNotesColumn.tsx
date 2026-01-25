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
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

interface StickerNotesColumnProps {
  notes: StickerNote[];
  onAddNote: (note: Omit<StickerNote, 'id' | 'createdAt'>) => void;
  onToggle: (noteId: string) => void;
  onRemove: (noteId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function StickerNotesColumn({ 
  notes = [], 
  onAddNote, 
  onToggle, 
  onRemove,
  onReorder,
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
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = safeNotes.findIndex(n => n.id === active.id);
    const newIndex = safeNotes.findIndex(n => n.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex);
    }
  };

  const noteIds = safeNotes.map(n => n.id);

  return (
    <div 
      className="min-w-[100px] max-w-[140px]" 
      onClick={(e) => e.stopPropagation()}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={noteIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 gap-0.5">
            {safeNotes.map((note) => (
              <StickerNoteItem
                key={note.id}
                note={note}
                onToggle={onToggle}
                onRemove={onRemove}
              />
            ))}
            
            {/* Add button - part of the grid */}
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-[10px] px-1 py-0.5 rounded border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 h-[22px]"
                >
                  <Plus className="h-2.5 w-2.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="start">
                <AddNotePopover onAdd={onAddNote} />
              </PopoverContent>
            </Popover>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
