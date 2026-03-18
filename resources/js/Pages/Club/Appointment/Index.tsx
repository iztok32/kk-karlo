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
import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Check, X, GripVertical, Calendar as CalendarIcon } from 'lucide-react';
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
import { format } from 'date-fns';
import { sl, enGB, hr, it, de } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Components/ui/popover"
import { Calendar as CalendarComponent } from "@/Components/ui/calendar"
import { cn } from "@/lib/utils"

interface Appointment {
  id: number;
  name: string;
  valid_from: string | null;
  valid_to: string | null;
  day_monday: boolean;
  day_tuesday: boolean;
  day_wednesday: boolean;
  day_thursday: boolean;
  day_friday: boolean;
  day_saturday: boolean;
  day_sunday: boolean;
  start_time: string | null;
  end_time: string | null;
  capacity: number | null;
  type: number | null;
  display_order: number;
  is_active: boolean;
}

interface Props {
  appointments: Appointment[];
}

const DaysRow = ({ item }: { item: Appointment }) => {
  const { t } = useTranslation();
  const days = [
    { key: 'day_monday', label: t('Mo') },
    { key: 'day_tuesday', label: t('Tu') },
    { key: 'day_wednesday', label: t('We') },
    { key: 'day_thursday', label: t('Th') },
    { key: 'day_friday', label: t('Fr') },
    { key: 'day_saturday', label: t('Sa') },
    { key: 'day_sunday', label: t('Su') },
  ];

  return (
    <div className="flex gap-1">
      {days.map((day) => (
        <span
          key={day.key}
          className={cn(
            "text-[10px] px-1 rounded",
            (item as any)[day.key] 
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
              : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
          )}
        >
          {day.label}
        </span>
      ))}
    </div>
  );
};

function SortableRow({
  item,
  onEdit,
  onDelete,
}: {
  item: Appointment;
  onEdit: (item: Appointment) => void;
  onDelete: (item: Appointment) => void;
}) {
  const { t, locale } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const,
    opacity: isDragging ? 0.5 : 1,
  };

  const getLocale = (l: string) => {
    switch (l) {
      case 'sl': return sl;
      case 'hr': return hr;
      case 'it': return it;
      case 'de': return de;
      default: return enGB;
    }
  };

  const getTypeLabel = (type: number | null) => {
    switch (type) {
      case 1: return t('Full appointment');
      case 2: return t('Half appointment');
      default: return t('N/A');
    }
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
      <TableCell className="font-medium">
        <div>{item.name}</div>
        <div className="text-xs text-muted-foreground">
          {item.start_time?.substring(0, 5)} - {item.end_time?.substring(0, 5)} 
          <span className="mx-1">•</span>
          {getTypeLabel(item.type)}
        </div>
      </TableCell>
      <TableCell>
        <DaysRow item={item} />
      </TableCell>
      <TableCell>
        <div className="text-xs">
          {item.valid_from ? format(new Date(item.valid_from), 'dd.MM.yyyy') : t('N/A')} - {item.valid_to ? format(new Date(item.valid_to), 'dd.MM.yyyy') : t('N/A')}
        </div>
      </TableCell>
      <TableCell>
        {item.is_active ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <X className="h-4 w-4 text-red-500" />
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(item)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={() => onDelete(item)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function Index({ appointments: initialItems }: Props) {
  const { t, locale } = useTranslation();
  const [localItems, setLocalItems] = useState(initialItems);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Appointment | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Appointment | null>(null);

  const getLocale = (l: string) => {
    switch (l) {
      case 'sl': return sl;
      case 'hr': return hr;
      case 'it': return it;
      case 'de': return de;
      default: return enGB;
    }
  };

  const currentLocale = getLocale(locale);

  useEffect(() => {
    setLocalItems(initialItems);
  }, [initialItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  interface AppointmentForm {
    name: string;
    valid_from: string;
    valid_to: string;
    day_monday: boolean;
    day_tuesday: boolean;
    day_wednesday: boolean;
    day_thursday: boolean;
    day_friday: boolean;
    day_saturday: boolean;
    day_sunday: boolean;
    start_time: string;
    end_time: string;
    capacity: number | null;
    type: number | null;
    is_active: boolean;
  }

  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm<AppointmentForm>({
    name: '',
    valid_from: '',
    valid_to: '',
    day_monday: false,
    day_tuesday: false,
    day_wednesday: false,
    day_thursday: false,
    day_friday: false,
    day_saturday: false,
    day_sunday: false,
    start_time: '08:00',
    end_time: '16:00',
    capacity: 1,
    type: 1,
    is_active: true,
  });

  const openAddDialog = () => {
    setEditingItem(null);
    reset();
    clearErrors();
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: Appointment) => {
    setEditingItem(item);
    setData({
      name: item.name,
      valid_from: item.valid_from ? format(new Date(item.valid_from), 'yyyy-MM-dd') : '',
      valid_to: item.valid_to ? format(new Date(item.valid_to), 'yyyy-MM-dd') : '',
      day_monday: item.day_monday,
      day_tuesday: item.day_tuesday,
      day_wednesday: item.day_wednesday,
      day_thursday: item.day_thursday,
      day_friday: item.day_friday,
      day_saturday: item.day_saturday,
      day_sunday: item.day_sunday,
      start_time: item.start_time?.substring(0, 5) || '08:00',
      end_time: item.end_time?.substring(0, 5) || '16:00',
      capacity: item.capacity,
      type: item.type,
      is_active: item.is_active,
    });
    clearErrors();
    setIsDialogOpen(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex((h) => h.id === active.id);
      const newIndex = localItems.findIndex((h) => h.id === over.id);

      const newOrder = arrayMove(localItems, oldIndex, newIndex);
      setLocalItems(newOrder);

      const ids = newOrder.map((h) => h.id);
      router.post(route('appointment.reorder'), { ids }, {
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
      preserveState: true,
      preserveScroll: true,
    };

    if (editingItem) {
      put(route('appointment.update', { appointment: editingItem.id }), options);
    } else {
      post(route('appointment.store'), options);
    }
  };

  const handleDelete = (item: Appointment) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      destroy(route('appointment.destroy', { appointment: itemToDelete.id }), {
        onSuccess: () => setIsDeleteDialogOpen(false),
      });
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
          {t('Appointment Management')}
        </h2>
      }
    >
      <Head title={t('Appointments')} />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">{t('Appointment List')}</h3>
                <Button onClick={openAddDialog}>
                  <Plus className="mr-2 h-4 w-4" /> {t('Add Appointment')}
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
                        <TableHead>{t('Days')}</TableHead>
                        <TableHead>{t('Validity')}</TableHead>
                        <TableHead>{t('Active')}</TableHead>
                        <TableHead className="text-right">{t('Actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {localItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            {t('No appointments found.')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        <SortableContext
                          items={localItems.map((h) => h.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {localItems.map((item) => (
                            <SortableRow
                              key={item.id}
                              item={item}
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
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingItem ? t('Edit Appointment') : t('Add Appointment')}</DialogTitle>
              <DialogDescription>
                {t('Enter appointment details below. Click save when finished.')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t('Name')}</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('Valid From')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !data.valid_from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {data.valid_from ? format(new Date(data.valid_from), "PPP", { locale: currentLocale }) : <span>{t('Pick a date')}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={data.valid_from ? new Date(data.valid_from) : undefined}
                        onSelect={(date) => setData('valid_from', date ? format(date, 'yyyy-MM-dd') : '')}
                        initialFocus
                        locale={currentLocale}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label>{t('Valid To')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !data.valid_to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {data.valid_to ? format(new Date(data.valid_to), "PPP", { locale: currentLocale }) : <span>{t('Pick a date')}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={data.valid_to ? new Date(data.valid_to) : undefined}
                        onSelect={(date) => setData('valid_to', date ? format(date, 'yyyy-MM-dd') : '')}
                        initialFocus
                        locale={currentLocale}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>{t('Days in week')}</Label>
                <div className="flex flex-wrap gap-4 pt-2">
                  {[
                    { key: 'day_monday', label: t('Mon') },
                    { key: 'day_tuesday', label: t('Tue') },
                    { key: 'day_wednesday', label: t('Wed') },
                    { key: 'day_thursday', label: t('Thu') },
                    { key: 'day_friday', label: t('Fri') },
                    { key: 'day_saturday', label: t('Sat') },
                    { key: 'day_sunday', label: t('Sun') },
                  ].map((day) => (
                    <div key={day.key} className="flex items-center space-x-2">
                      <Switch
                        id={day.key}
                        checked={(data as any)[day.key]}
                        onCheckedChange={(checked) => setData(day.key as any, checked)}
                      />
                      <Label htmlFor={day.key} className="text-xs">{day.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_time">{t('Start Time')}</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={data.start_time}
                    onChange={(e) => setData('start_time', e.target.value)}
                  />
                  {errors.start_time && <p className="text-sm text-red-500">{errors.start_time}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_time">{t('End Time')}</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={data.end_time}
                    onChange={(e) => setData('end_time', e.target.value)}
                  />
                  {errors.end_time && <p className="text-sm text-red-500">{errors.end_time}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="capacity">{t('Capacity')}</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={data.capacity || ''}
                    onChange={(e) => setData('capacity', e.target.value ? parseInt(e.target.value) : 1)}
                  />
                  {errors.capacity && <p className="text-sm text-red-500">{errors.capacity}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">{t('Type')}</Label>
                  <select
                    id="type"
                    value={data.type || 1}
                    onChange={(e) => setData('type', parseInt(e.target.value))}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                      errors.type && "border-red-500"
                    )}
                  >
                    <option value={1}>{t('Full appointment')}</option>
                    <option value={2}>{t('Half appointment')}</option>
                  </select>
                  {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                </div>
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
                {editingItem ? t('Update') : t('Save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('Delete Appointment')}</DialogTitle>
            <DialogDescription>
              {t('Are you sure you want to delete appointment :name?', { name: itemToDelete?.name || '' })} {t('This action cannot be undone.')}
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
