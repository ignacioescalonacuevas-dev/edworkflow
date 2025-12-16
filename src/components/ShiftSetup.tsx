import { useState } from 'react';
import { Settings, Trash2, Plus, Stethoscope, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePatientStore } from '@/store/patientStore';

export function ShiftSetup() {
  const [isOpen, setIsOpen] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const { 
    doctors, addDoctor, updateDoctor, removeDoctor,
    locations, addLocation, updateLocation, removeLocation 
  } = usePatientStore();
  const [editingDoctors, setEditingDoctors] = useState<Record<string, string>>({});
  const [editingLocations, setEditingLocations] = useState<Record<string, string>>({});

  const handleAddDoctor = () => {
    const trimmed = newDoctorName.trim();
    if (trimmed && !doctors.includes(trimmed)) {
      addDoctor(trimmed);
      setNewDoctorName('');
    }
  };

  const handleAddLocation = () => {
    const trimmed = newLocationName.trim();
    if (trimmed && !locations.includes(trimmed)) {
      addLocation(trimmed);
      setNewLocationName('');
    }
  };

  const handleEditDoctor = (oldName: string, newName: string) => {
    setEditingDoctors((prev) => ({ ...prev, [oldName]: newName }));
  };

  const handleEditLocation = (oldName: string, newName: string) => {
    setEditingLocations((prev) => ({ ...prev, [oldName]: newName }));
  };

  const handleSaveDoctorEdit = (oldName: string) => {
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

  const handleSaveLocationEdit = (oldName: string) => {
    const newName = editingLocations[oldName]?.trim();
    if (newName && newName !== oldName && !locations.includes(newName)) {
      updateLocation(oldName, newName);
    }
    setEditingLocations((prev) => {
      const updated = { ...prev };
      delete updated[oldName];
      return updated;
    });
  };

  const handleDoctorKeyDown = (e: React.KeyboardEvent, oldName: string) => {
    if (e.key === 'Enter') {
      handleSaveDoctorEdit(oldName);
    } else if (e.key === 'Escape') {
      setEditingDoctors((prev) => {
        const updated = { ...prev };
        delete updated[oldName];
        return updated;
      });
    }
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent, oldName: string) => {
    if (e.key === 'Enter') {
      handleSaveLocationEdit(oldName);
    } else if (e.key === 'Escape') {
      setEditingLocations((prev) => {
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
            <Settings className="h-5 w-5 text-primary" />
            Shift Setup
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="physicians" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="physicians" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Physicians
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Locations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="physicians" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Today's Physicians
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {doctors.map((doctor) => (
                <div key={doctor} className="flex items-center gap-2">
                  <Input
                    value={editingDoctors[doctor] ?? doctor}
                    onChange={(e) => handleEditDoctor(doctor, e.target.value)}
                    onBlur={() => handleSaveDoctorEdit(doctor)}
                    onKeyDown={(e) => handleDoctorKeyDown(e, doctor)}
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
          </TabsContent>

          <TabsContent value="locations" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Available Locations
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {locations.map((location) => (
                <div key={location} className="flex items-center gap-2">
                  <Input
                    value={editingLocations[location] ?? location}
                    onChange={(e) => handleEditLocation(location, e.target.value)}
                    onBlur={() => handleSaveLocationEdit(location)}
                    onKeyDown={(e) => handleLocationKeyDown(e, location)}
                    className="bg-input border-border flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeLocation(location)}
                    disabled={locations.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <Input
                placeholder="Add new location..."
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()}
                className="bg-input border-border flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={handleAddLocation}
                disabled={!newLocationName.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <Button
          className="w-full mt-4"
          onClick={() => setIsOpen(false)}
        >
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
}
