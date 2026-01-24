import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StickerNote, StickerNoteType, NOTE_TYPE_CONFIG } from '@/types/patient';
import { usePatientStore } from '@/store/patientStore';
import { Plus } from 'lucide-react';

interface AddNotePopoverProps {
  onAdd: (note: Omit<StickerNote, 'id' | 'createdAt'>) => void;
}

export function AddNotePopover({ onAdd }: AddNotePopoverProps) {
  const { 
    studyOptions, followupOptions, precautionOptions, dischargeOptions,
    addStudyOption, addFollowupOption, addPrecautionOption, addDischargeOption 
  } = usePatientStore();
  const [noteType, setNoteType] = useState<StickerNoteType>('study');
  const [text, setText] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const hasSelectOptions = noteType === 'study' || noteType === 'followup' || noteType === 'precaution' || noteType === 'discharge';

  const handleAdd = () => {
    const noteText = hasSelectOptions ? selectedOption : text;
    
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

  const handleAddCustomOption = () => {
    if (!customValue.trim()) return;
    
    switch (noteType) {
      case 'study':
        addStudyOption(customValue.trim());
        break;
      case 'followup':
        addFollowupOption(customValue.trim());
        break;
      case 'precaution':
        addPrecautionOption(customValue.trim());
        break;
      case 'discharge':
        addDischargeOption(customValue.trim());
        break;
    }
    
    setSelectedOption(customValue.trim());
    setCustomValue('');
    setShowCustomInput(false);
  };

  const renderSelectWithAddOption = (options: string[], placeholder: string) => {
    if (showCustomInput) {
      return (
        <div className="flex gap-2">
          <Input
            autoFocus
            placeholder="New option..."
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCustomOption();
              if (e.key === 'Escape') {
                setShowCustomInput(false);
                setCustomValue('');
              }
            }}
            className="bg-input border-border flex-1"
          />
          <Button size="sm" onClick={handleAddCustomOption} className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Select value={selectedOption} onValueChange={setSelectedOption}>
          <SelectTrigger className="bg-input border-border">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {options.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowCustomInput(true)}
          className="w-full text-xs text-muted-foreground"
        >
          <Plus className="h-3 w-3 mr-1" /> Add new option
        </Button>
      </div>
    );
  };

  const renderInput = () => {
    switch (noteType) {
      case 'study':
        return renderSelectWithAddOption(studyOptions, 'Select study...');
      case 'followup':
        return renderSelectWithAddOption(followupOptions, 'Select follow-up...');
      case 'precaution':
        return renderSelectWithAddOption(precautionOptions, 'Select precaution...');
      case 'discharge':
        return renderSelectWithAddOption(dischargeOptions, 'Select discharge...');
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

  const isDisabled = hasSelectOptions ? !selectedOption : !text.trim();

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Note Type</Label>
        <Select value={noteType} onValueChange={(v) => {
          setNoteType(v as StickerNoteType);
          setText('');
          setSelectedOption('');
          setShowCustomInput(false);
          setCustomValue('');
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
