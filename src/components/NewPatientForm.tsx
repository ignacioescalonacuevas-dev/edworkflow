import { useState } from 'react';
import { Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePatientStore } from '@/store/patientStore';

export function NewPatientForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [box, setBox] = useState('');
  const [doctor, setDoctor] = useState('');
  const { addPatient, doctors, locations } = usePatientStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && box) {
      addPatient({
        name,
        box,
        doctor: doctor || '',
        arrivalTime: new Date(),
        status: 'registration',
      });
      setName('');
      setBox('');
      setDoctor('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          New Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Register New Patient
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Patient Name</Label>
            <Input
              id="name"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="box">Box / Location</Label>
            <Select value={box} onValueChange={setBox} required>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select location..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor">Attending Physician (Optional)</Label>
            <Select value={doctor || '__unassigned__'} onValueChange={(value) => setDoctor(value === '__unassigned__' ? '' : value)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Not assigned yet" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="__unassigned__">Not assigned yet</SelectItem>
                {doctors.map((doc) => (
                  <SelectItem key={doc} value={doc}>
                    {doc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Register Patient
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
