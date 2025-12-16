import { useState } from 'react';
import { Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePatientStore } from '@/store/patientStore';
import { DOCTORS } from '@/types/patient';

export function NewPatientForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [box, setBox] = useState('');
  const [doctor, setDoctor] = useState('');
  const addPatient = usePatientStore((state) => state.addPatient);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && box && doctor) {
      addPatient({
        name,
        box,
        doctor,
        arrivalTime: new Date(),
        status: 'active',
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
          Nuevo Paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Registrar Nuevo Paciente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Paciente</Label>
            <Input
              id="name"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="box">Box / Ubicación</Label>
            <Input
              id="box"
              placeholder="Ej: Box 5"
              value={box}
              onChange={(e) => setBox(e.target.value)}
              className="bg-input border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor">Médico Tratante</Label>
            <Select value={doctor} onValueChange={setDoctor} required>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Seleccionar médico..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {DOCTORS.map((doc) => (
                  <SelectItem key={doc} value={doc}>
                    {doc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Registrar Paciente
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
