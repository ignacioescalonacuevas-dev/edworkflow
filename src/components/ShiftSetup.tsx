import { useState } from 'react';
import { Settings, Trash2, Plus, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePatientStore } from '@/store/patientStore';

export function ShiftSetup() {
  const [isOpen, setIsOpen] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState('');
  const { doctors, addDoctor, updateDoctor, removeDoctor } = usePatientStore();
  const [editingDoctors, setEditingDoctors] = useState<Record<string, string>>({});

  const handleAddDoctor = () => {
    const trimmed = newDoctorName.trim();
    if (trimmed && !doctors.includes(trimmed)) {
      addDoctor(trimmed);
      setNewDoctorName('');
    }
  };

  const handleEditDoctor = (oldName: string, newName: string) => {
    setEditingDoctors((prev) => ({ ...prev, [oldName]: newName }));
  };

  const handleSaveEdit = (oldName: string) => {
    const newName = editingDoctors[oldName]?.trim();
    if (newName && newName !== oldName && !doctors.includes(newName)) {
      updateDoctor(oldName, newName);
    }
    setEditingDoctors((prev) => {
      const updated = { ...prev };
      delete updated[oldName];
      return updated;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, oldName: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(oldName);
    } else if (e.key === 'Escape') {
      setEditingDoctors((prev) => {
        const updated = { ...prev };
        delete updated[oldName];
        return updated;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Shift Setup
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Today's Physicians
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {doctors.map((doctor) => (
              <div key={doctor} className="flex items-center gap-2">
                <Input
                  value={editingDoctors[doctor] ?? doctor}
                  onChange={(e) => handleEditDoctor(doctor, e.target.value)}
                  onBlur={() => handleSaveEdit(doctor)}
                  onKeyDown={(e) => handleKeyDown(e, doctor)}
                  className="bg-input border-border flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeDoctor(doctor)}
                  disabled={doctors.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Input
              placeholder="Add new physician..."
              value={newDoctorName}
              onChange={(e) => setNewDoctorName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddDoctor()}
              className="bg-input border-border flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={handleAddDoctor}
              disabled={!newDoctorName.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            className="w-full"
            onClick={() => setIsOpen(false)}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
