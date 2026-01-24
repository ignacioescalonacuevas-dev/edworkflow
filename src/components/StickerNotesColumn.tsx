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

export function StickerNotesColumn({ notes, onAddNote, onToggle, onRemove }: StickerNotesColumnProps) {
  return (
    <div className="flex flex-col gap-0.5 min-w-[70px] max-w-[100px]" onClick={(e) => e.stopPropagation()}>
      {/* Existing notes */}
      {notes.map((note) => (
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
          <button className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors text-[10px] mt-0.5">
            <Plus className="h-3 w-3" />
            <span>Add</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <AddNotePopover onAdd={onAddNote} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
