import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { useForm, Head } from '@inertiajs/react';
import { useState } from 'react';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { Switch } from '@/Components/ui/switch';

interface Horse {
  id: number;
  name: string;
  year: number;
  display_order: number;
  is_active: boolean;
}

interface Props {
  horses: Horse[];
}

export default function Index({ horses }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHorse, setEditingHorse] = useState<Horse | null>(null);

  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    name: '',
    year: new Date().getFullYear(),
    display_order: 0,
    is_active: true,
  });

  const openAddDialog = () => {
    setEditingHorse(null);
    reset();
    clearErrors();
    setIsDialogOpen(true);
  };

  const openEditDialog = (horse: Horse) => {
    setEditingHorse(horse);
    setData({
      name: horse.name,
      year: horse.year,
      display_order: horse.display_order,
      is_active: horse.is_active,
    });
    clearErrors();
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const options = {
      onSuccess: () => {
        setIsDialogOpen(false);
        reset();
      },
      onError: (errors: any) => {
        console.error('Submission errors:', errors);
      },
      preserveState: true,
      preserveScroll: true,
    };

    if (editingHorse) {
      put(route('club.horses.update', { horse: editingHorse.id }), options);
    } else {
      post(route('club.horses.store'), options);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Ali ste prepričani, da želite izbrisati tega konja?')) {
      destroy(route('club.horses.destroy', { horse: id }));
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
          Upravljanje konjev
        </h2>
      }
    >
      <Head title="Konji" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Seznam konjev</h3>
                <Button onClick={openAddDialog}>
                  <Plus className="mr-2 h-4 w-4" /> Dodaj konja
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ime</TableHead>
                      <TableHead>Letnica</TableHead>
                      <TableHead>Vrstni red</TableHead>
                      <TableHead>Aktivno</TableHead>
                      <TableHead className="text-right">Akcije</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {horses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Ni podatkov o konjih.
                        </TableCell>
                      </TableRow>
                    ) : (
                      horses.map((horse) => (
                        <TableRow key={horse.id}>
                          <TableCell className="font-medium">{horse.name}</TableCell>
                          <TableCell>{horse.year}</TableCell>
                          <TableCell>{horse.display_order}</TableCell>
                          <TableCell>
                            {horse.is_active ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(horse)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => handleDelete(horse.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingHorse ? 'Uredi konja' : 'Dodaj konja'}</DialogTitle>
              <DialogDescription>
                Vnesite podatke o konju spodaj. Kliknite shrani, ko končate.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Ime konja</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year">Letnica rojstva</Label>
                <Input
                  id="year"
                  type="number"
                  value={data.year || ''}
                  onChange={(e) => setData('year', e.target.value ? parseInt(e.target.value) : 0)}
                  className={errors.year ? 'border-red-500' : ''}
                />
                {errors.year && <p className="text-sm text-red-500">{errors.year}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="display_order">Vrstni red prikaza</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={data.display_order ?? ''}
                  onChange={(e) => setData('display_order', e.target.value ? parseInt(e.target.value) : 0)}
                  className={errors.display_order ? 'border-red-500' : ''}
                />
                {errors.display_order && <p className="text-sm text-red-500">{errors.display_order}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={data.is_active}
                  onCheckedChange={(checked) => setData('is_active', checked)}
                />
                <Label htmlFor="is_active">Aktiven</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Prekliči
              </Button>
              <Button type="submit" disabled={processing}>
                {editingHorse ? 'Posodobi' : 'Shrani'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  );
}
