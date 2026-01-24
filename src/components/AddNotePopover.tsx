import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StickerNote, StickerNoteType, STUDY_OPTIONS, FOLLOWUP_OPTIONS, PRECAUTION_OPTIONS, NOTE_TYPE_CONFIG } from '@/types/patient';

interface AddNotePopoverProps {
  onAdd: (note: Omit<StickerNote, 'id' | 'createdAt'>) => void;
}

export function AddNotePopover({ onAdd }: AddNotePopoverProps) {
  const [noteType, setNoteType] = useState<StickerNoteType>('study');
  const [text, setText] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  const handleAdd = () => {
    const noteText = noteType === 'study' || noteType === 'followup' || noteType === 'precaution'
      ? selectedOption
      : text;
    
    if (!noteText) return;

    onAdd({
      type: noteType,
      text: noteText,
      ...(noteType === 'study' && { completed: false }),
    });

    // Reset form
    setText('');
    setSelectedOption('');
  };

  const renderInput = () => {
    switch (noteType) {
      case 'study':
        return (
          <Select value={selectedOption} onValueChange={setSelectedOption}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="Select study..." />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {STUDY_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'followup':
        return (
          <Select value={selectedOption} onValueChange={setSelectedOption}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="Select follow-up..." />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {FOLLOWUP_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'precaution':
        return (
          <Select value={selectedOption} onValueChange={setSelectedOption}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="Select precaution..." />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {PRECAUTION_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'critical':
        return (
          <Input
            placeholder="e.g. Trop 85, K+ 6.2"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bg-input border-border"
          />
        );
      case 'admitting':
        return (
          <Input
            placeholder="e.g. Dr. Adams"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bg-input border-border"
          />
        );
      case 'note':
        return (
          <Input
            placeholder="Free text note..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bg-input border-border"
          />
        );
    }
  };

  const isDisabled = (noteType === 'study' || noteType === 'followup' || noteType === 'precaution')
    ? !selectedOption
    : !text.trim();

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Note Type</Label>
        <Select value={noteType} onValueChange={(v) => {
          setNoteType(v as StickerNoteType);
          setText('');
          setSelectedOption('');
        }}>
          <SelectTrigger className="bg-input border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {Object.entries(NOTE_TYPE_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Value</Label>
        {renderInput()}
      </div>

      <Button 
        onClick={handleAdd} 
        disabled={isDisabled}
        className="w-full"
        size="sm"
      >
        Add Note
      </Button>
    </div>
  );
}
