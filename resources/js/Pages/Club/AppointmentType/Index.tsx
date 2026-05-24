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
import { Switch } from '@/Components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/tooltip';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useForm, Head, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { Check, GripVertical, Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface CouponTypeItem {
  id: number;
  name: string;
}

interface AppointmentType {
  id: number;
  name: string;
  is_active: boolean;
  horses_selectable: boolean;
  coupon_type_id: number | null;
  display_order: number;
  deleted_at: string | null;
}

interface Props {
  types: AppointmentType[];
  couponTypes: CouponTypeItem[];
}

function SortableRow({
  item,
  couponTypes,
  onEdit,
  onDelete,
  onRestore,
}: {
  item: AppointmentType;
  couponTypes: CouponTypeItem[];
  onEdit: (item: AppointmentType) => void;
  onDelete: (item: AppointmentType) => void;
  onRestore: (item: AppointmentType) => void;
}) {
  const { t } = useTranslation();
  const isDeleted = !!item.deleted_at;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: isDeleted,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={isDeleted ? 'opacity-50' : ''}>
      <TableCell className="w-10">
        {!isDeleted && (
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </TableCell>
      <TableCell className="font-medium">
        <span className={isDeleted ? 'line-through text-muted-foreground' : ''}>{item.name}</span>
        {isDeleted && (
          <span className="ml-2 text-xs text-red-500">{t('Deleted')}</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        {item.horses_selectable ? (
          <Check className="h-4 w-4 text-green-500 mx-auto" />
        ) : (
          <X className="h-4 w-4 text-muted-foreground mx-auto" />
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {item.coupon_type_id
          ? (couponTypes.find(ct => ct.id === item.coupon_type_id)?.name ?? '—')
          : '—'}
      </TableCell>
      <TableCell className="text-center">
        {item.is_active ? (
          <Check className="h-4 w-4 text-green-500 mx-auto" />
        ) : (
          <X className="h-4 w-4 text-red-500 mx-auto" />
        )}
      </TableCell>
      <TableCell className="w-[120px] text-right">
        {isDeleted ? (
          <Button
            variant="ghost"
            size="icon"
            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
            onClick={() => onRestore(item)}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        ) : (
          <>
            <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
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
          </>
        )}
      </TableCell>
    </TableRow>
  );
}

export default function Index({ types: initialItems, couponTypes }: Props) {
  const { t } = useTranslation();
  const [localItems, setLocalItems] = useState(initialItems);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AppointmentType | null>(null);
  const [itemToDelete, setItemToDelete] = useState<AppointmentType | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    setLocalItems(initialItems);
  }, [initialItems]);

  const visibleItems = showDeleted ? localItems : localItems.filter(i => !i.deleted_at);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  interface TypeForm {
    name: string;
    is_active: boolean;
    horses_selectable: boolean;
    coupon_type_id: string;
  }

  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } =
    useForm<TypeForm>({
      name: '',
      is_active: true,
      horses_selectable: true,
      coupon_type_id: '',
    });

  const openAddDialog = () => {
    setEditingItem(null);
    reset();
    clearErrors();
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: AppointmentType) => {
    setEditingItem(item);
    setData({
      name: item.name,
      is_active: item.is_active,
      horses_selectable: item.horses_selectable,
      coupon_type_id: item.coupon_type_id ? String(item.coupon_type_id) : '',
    });
    clearErrors();
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const options = {
      onSuccess: () => { setIsDialogOpen(false); reset(); },
      preserveState: true,
      preserveScroll: true,
    };
    if (editingItem) {
      put(route('appointment-types.update', { appointmentType: editingItem.id }), options);
    } else {
      post(route('appointment-types.store'), options);
    }
  };

  const handleDelete = (item: AppointmentType) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    destroy(route('appointment-types.destroy', { appointmentType: itemToDelete.id }), {
      onSuccess: () => setIsDeleteDialogOpen(false),
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleRestore = (item: AppointmentType) => {
    router.post(route('appointment-types.restore', { id: item.id }), {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeItems = localItems.filter(i => !i.deleted_at);
    const oldIndex = activeItems.findIndex(i => i.id === active.id);
    const newIndex = activeItems.findIndex(i => i.id === over.id);
    const reordered = arrayMove(activeItems, oldIndex, newIndex);

    setLocalItems([...reordered, ...localItems.filter(i => i.deleted_at)]);
    router.post(route('appointment-types.reorder'), { ids: reordered.map(i => i.id) }, {
      preserveScroll: true,
      preserveState: true,
    });
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
          {t('Appointment Type Management')}
        </h2>
      }
    >
      <Head title={t('Appointment Types')} />

      <div className="py-12">
        <div className="mx-auto w-full sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">{t('Appointment Type List')}</h3>
                <div className="flex items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative inline-flex items-center">
                        <Switch
                          checked={showDeleted}
                          onCheckedChange={setShowDeleted}
                          className="data-[state=checked]:bg-red-600"
                        />
                        <Trash2 className={cn(
                          'pointer-events-none absolute right-1 h-3 w-3 text-white transition-opacity duration-200',
                          showDeleted ? 'opacity-100' : 'opacity-0'
                        )} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{t('Show deleted types')}</TooltipContent>
                  </Tooltip>
                  <Button onClick={openAddDialog}>
                    <Plus className="mr-2 h-4 w-4" /> {t('Add Type')}
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10" />
                        <TableHead>{t('Name')}</TableHead>
                        <TableHead className="text-center">{t('Horses selectable')}</TableHead>
                        <TableHead>{t('Coupon type')}</TableHead>
                        <TableHead className="text-center">{t('Active')}</TableHead>
                        <TableHead className="w-[120px] text-center">{t('Actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground italic">
                            {t('No appointment types found.')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        <SortableContext
                          items={visibleItems.filter(i => !i.deleted_at).map(i => i.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {visibleItems.map(item => (
                            <SortableRow
                              key={item.id}
                              item={item}
                              couponTypes={couponTypes}
                              onEdit={openEditDialog}
                              onDelete={handleDelete}
                              onRestore={handleRestore}
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

      {/* Add / Edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingItem ? t('Edit Type') : t('Add Type')}</DialogTitle>
              <DialogDescription>
                {t('Enter appointment type details below. Click save when finished.')}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-1.5">
                <Label htmlFor="name">{t('Name')}</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                  autoFocus
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{t('Horses selectable')}</p>
                  <p className="text-xs text-muted-foreground">{t('Can a horse be selected for this appointment type?')}</p>
                </div>
                <Switch
                  checked={data.horses_selectable}
                  onCheckedChange={v => setData('horses_selectable', v)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>{t('Required coupon type')} <span className="text-muted-foreground text-xs">({t('optional')})</span></Label>
                <Select value={data.coupon_type_id} onValueChange={v => setData('coupon_type_id', v === 'none' ? '' : v)}>
                  <SelectTrigger className={errors.coupon_type_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('No coupon required')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('No coupon required')}</SelectItem>
                    {couponTypes.map(ct => (
                      <SelectItem key={ct.id} value={String(ct.id)}>{ct.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.coupon_type_id && <p className="text-xs text-red-500">{errors.coupon_type_id}</p>}
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{t('Active')}</p>
                  <p className="text-xs text-muted-foreground">{t('Inactive types are not shown in the appointment form.')}</p>
                </div>
                <Switch
                  checked={data.is_active}
                  onCheckedChange={v => setData('is_active', v)}
                />
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

      {/* Delete confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('Delete Appointment Type')}</DialogTitle>
            <DialogDescription>
              {t('Are you sure you want to delete type :name?', { name: itemToDelete?.name ?? '' })}{' '}
              {t('The type will be soft-deleted and can be restored later.')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={processing}>
              {t('Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  );
}
