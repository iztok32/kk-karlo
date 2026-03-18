import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import React, { useState, useEffect, FormEvent } from 'react';
import { Pencil, Trash2, Plus, Check, X, GripVertical } from 'lucide-react';
import { Switch } from '@/Components/ui/switch';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';

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

function SortableRow({ 
  horse, 
  onEdit, 
  onDelete 
}: { 
  horse: Horse; 
  onEdit: (horse: Horse) => void; 
  onDelete: (horse: Horse) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: horse.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-10">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{horse.name}</TableCell>
      <TableCell>{horse.year}</TableCell>
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
          onClick={() => onEdit(horse)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={() => onDelete(horse)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function Index({ horses: initialHorses }: Props) {
  const { t } = useTranslation();
  const [localHorses, setLocalHorses] = useState(initialHorses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingHorse, setEditingHorse] = useState<Horse | null>(null);
  const [horseToDelete, setHorseToDelete] = useState<Horse | null>(null);

  useEffect(() => {
    setLocalHorses(initialHorses);
  }, [initialHorses]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    name: '',
    year: new Date().getFullYear(),
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
      is_active: horse.is_active,
    });
    clearErrors();
    setIsDialogOpen(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localHorses.findIndex((h) => h.id === active.id);
      const newIndex = localHorses.findIndex((h) => h.id === over.id);

      const newOrder = arrayMove(localHorses, oldIndex, newIndex);
      setLocalHorses(newOrder);

      const ids = newOrder.map((h) => h.id);
      router.post(route('horses.reorder'), { ids }, {
        preserveScroll: true,
        preserveState: true,
      });
    }
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
      put(route('horses.update', { horse: editingHorse.id }), options);
    } else {
      post(route('horses.store'), options);
    }
  };

  const handleDelete = (horse: Horse) => {
    setHorseToDelete(horse);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (horseToDelete) {
      destroy(route('horses.destroy', { horse: horseToDelete.id }), {
        onSuccess: () => setIsDeleteDialogOpen(false),
      });
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
          {t('Horse Management')}
        </h2>
      }
    >
      <Head title={t('Horses')} />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">{t('Horse List')}</h3>
                <Button onClick={openAddDialog}>
                  <Plus className="mr-2 h-4 w-4" /> {t('Add Horse')}
                </Button>
              </div>

              <div className="rounded-md border">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead>{t('Name')}</TableHead>
                        <TableHead>{t('Year')}</TableHead>
                        <TableHead>{t('Active')}</TableHead>
                        <TableHead className="text-right">{t('Actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {localHorses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            {t('No horse data.')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        <SortableContext
                          items={localHorses.map((h) => h.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {localHorses.map((horse) => (
                            <SortableRow
                              key={horse.id}
                              horse={horse}
                              onEdit={openEditDialog}
                              onDelete={handleDelete}
                            />
                          ))}
                        </SortableContext>
                      )}
                    </TableBody>
                  </Table>
                </DndContext>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingHorse ? t('Edit Horse') : t('Add Horse')}</DialogTitle>
              <DialogDescription>
                {t('Enter horse details below. Click save when finished.')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t('Horse Name')}</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year">{t('Year of Birth')}</Label>
                <Input
                  id="year"
                  type="number"
                  value={data.year || ''}
                  onChange={(e) => setData('year', e.target.value ? parseInt(e.target.value) : 0)}
                  className={errors.year ? 'border-red-500' : ''}
                />
                {errors.year && <p className="text-sm text-red-500">{errors.year}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={data.is_active}
                  onCheckedChange={(checked) => setData('is_active', checked)}
                />
                <Label htmlFor="is_active">{t('Active')}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('Cancel')}
              </Button>
              <Button type="submit" disabled={processing}>
                {editingHorse ? t('Update') : t('Save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('Delete Horse')}</DialogTitle>
            <DialogDescription>
              {t('Are you sure you want to delete horse :name?', { name: horseToDelete?.name || '' })} {t('This action cannot be undone.')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t('Cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={processing}
            >
              {t('Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  );
}
