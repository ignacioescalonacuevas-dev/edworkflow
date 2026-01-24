import { useState } from 'react';
import { Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePatientStore } from '@/store/patientStore';

export function NewPatientForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [mNumber, setMNumber] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [box, setBox] = useState('');
  const [doctor, setDoctor] = useState('');
  const [nurse, setNurse] = useState('');
  const { addPatient, doctors, nurses, locations } = usePatientStore();

  const handleMNumberChange = (value: string) => {
    // Format: M followed by 8 digits
    const cleaned = value.replace(/[^0-9M]/gi, '').toUpperCase();
    if (cleaned.startsWith('M')) {
      setMNumber('M' + cleaned.slice(1, 9).replace(/\D/g, ''));
    } else {
      setMNumber('M' + cleaned.slice(0, 8).replace(/\D/g, ''));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && box && dateOfBirth && mNumber) {
      addPatient({
        name,
        dateOfBirth,
        mNumber,
        chiefComplaint: chiefComplaint || 'Not specified',
        box,
        doctor: doctor || '',
        nurse: nurse || '',
        arrivalTime: new Date(),
        status: 'treatment_room',
      });
      // Reset form
      setName('');
      setDateOfBirth('');
      setMNumber('');
      setChiefComplaint('');
      setBox('');
      setDoctor('');
      setNurse('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          New Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Register New Patient
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Patient Name *</Label>
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
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                placeholder="DD/MM/YYYY"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="bg-input border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mNumber">M-Number *</Label>
              <Input
                id="mNumber"
                placeholder="M00000000"
                value={mNumber}
                onChange={(e) => handleMNumberChange(e.target.value)}
                className="bg-input border-border font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chiefComplaint">Chief Complaint</Label>
            <Textarea
              id="chiefComplaint"
              placeholder="Reason for visit..."
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="bg-input border-border resize-none"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="box">Box / Location *</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doctor">Physician</Label>
              <Select value={doctor || '__unassigned__'} onValueChange={(value) => setDoctor(value === '__unassigned__' ? '' : value)}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Not assigned" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="__unassigned__">Not assigned</SelectItem>
                  {doctors.map((doc) => (
                    <SelectItem key={doc} value={doc}>
                      {doc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nurse">Nurse</Label>
              <Select value={nurse || '__unassigned__'} onValueChange={(value) => setNurse(value === '__unassigned__' ? '' : value)}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Not assigned" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="__unassigned__">Not assigned</SelectItem>
                  {nurses.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
