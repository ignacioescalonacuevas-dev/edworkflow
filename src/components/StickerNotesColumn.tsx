import { Plus } from 'lucide-react';
import { StickerNote, StickerNoteType } from '@/types/patient';
import { StickerNoteItem } from './StickerNoteItem';
import { AddNotePopover } from './AddNotePopover';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface StickerNotesColumnProps {
  notes: StickerNote[];
  onAddNote: (note: Omit<StickerNote, 'id' | 'createdAt'>) => void;
  onToggle: (noteId: string) => void;
  onRemove: (noteId: string) => void;
}

export function StickerNotesColumn({ notes = [], onAddNote, onToggle, onRemove }: StickerNotesColumnProps) {
  const safeNotes = notes || [];
  
  return (
    <div className="flex flex-wrap gap-0.5 items-start content-start min-w-[80px] max-w-[120px]" onClick={(e) => e.stopPropagation()}>
      {/* Existing notes */}
      {safeNotes.map((note) => (
        <StickerNoteItem
          key={note.id}
          note={note}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      ))}
      
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
