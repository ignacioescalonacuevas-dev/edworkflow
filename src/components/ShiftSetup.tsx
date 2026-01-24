import { useState } from 'react';
import { Settings, Trash2, Plus, Stethoscope, MapPin, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePatientStore } from '@/store/patientStore';

export function ShiftSetup() {
  const [isOpen, setIsOpen] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newNurseName, setNewNurseName] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const { 
    doctors, addDoctor, updateDoctor, removeDoctor,
    nurses, addNurse, updateNurse, removeNurse,
    locations, addLocation, updateLocation, removeLocation,
    clearShift
  } = usePatientStore();
  const [editingDoctors, setEditingDoctors] = useState<Record<string, string>>({});
  const [editingNurses, setEditingNurses] = useState<Record<string, string>>({});
  const [editingLocations, setEditingLocations] = useState<Record<string, string>>({});

  // Doctor handlers
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

  // Nurse handlers
  const handleAddNurse = () => {
    const trimmed = newNurseName.trim();
    if (trimmed && !nurses.includes(trimmed)) {
      addNurse(trimmed);
      setNewNurseName('');
    }
  };

  const handleEditNurse = (oldName: string, newName: string) => {
    setEditingNurses((prev) => ({ ...prev, [oldName]: newName }));
  };

  const handleSaveNurseEdit = (oldName: string) => {
    const newName = editingNurses[oldName]?.trim();
    if (newName && newName !== oldName && !nurses.includes(newName)) {
      updateNurse(oldName, newName);
    }
    setEditingNurses((prev) => {
      const updated = { ...prev };
      delete updated[oldName];
      return updated;
    });
  };

  const handleNurseKeyDown = (e: React.KeyboardEvent, oldName: string) => {
    if (e.key === 'Enter') {
      handleSaveNurseEdit(oldName);
    } else if (e.key === 'Escape') {
      setEditingNurses((prev) => {
        const updated = { ...prev };
        delete updated[oldName];
        return updated;
      });
    }
  };

  // Location handlers
  const handleAddLocation = () => {
    const trimmed = newLocationName.trim();
    if (trimmed && !locations.includes(trimmed)) {
      addLocation(trimmed);
      setNewLocationName('');
    }
  };

  const handleEditLocation = (oldName: string, newName: string) => {
    setEditingLocations((prev) => ({ ...prev, [oldName]: newName }));
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
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Shift Setup
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="physicians" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="physicians" className="flex items-center gap-2 text-xs">
              <Stethoscope className="h-3.5 w-3.5" />
              Physicians
            </TabsTrigger>
            <TabsTrigger value="nurses" className="flex items-center gap-2 text-xs">
              <Users className="h-3.5 w-3.5" />
              Nurses
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2 text-xs">
              <MapPin className="h-3.5 w-3.5" />
              Locations
            </TabsTrigger>
          </TabsList>

          {/* Physicians Tab */}
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

          {/* Nurses Tab */}
          <TabsContent value="nurses" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Today's Nurses
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {nurses.map((nurse) => (
                <div key={nurse} className="flex items-center gap-2">
                  <Input
                    value={editingNurses[nurse] ?? nurse}
                    onChange={(e) => handleEditNurse(nurse, e.target.value)}
                    onBlur={() => handleSaveNurseEdit(nurse)}
                    onKeyDown={(e) => handleNurseKeyDown(e, nurse)}
                    className="bg-input border-border flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeNurse(nurse)}
                    disabled={nurses.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <Input
                placeholder="Add new nurse..."
                value={newNurseName}
                onChange={(e) => setNewNurseName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNurse()}
                className="bg-input border-border flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={handleAddNurse}
                disabled={!newNurseName.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Locations Tab */}
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

        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <Button
            className="flex-1"
            onClick={() => setIsOpen(false)}
          >
            Done
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Clear Shift
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Shift Data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all patients from the board. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    clearShift();
                    setIsOpen(false);
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear Shift
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}
