import { Button } from '@/Components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/Components/ui/carousel';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/tooltip';
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
import { Pencil, Trash2, Check, X, GripVertical, Image as ImageIcon, Star } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { Horse } from '../types';
import { router } from '@inertiajs/react';

interface Props {
    horses: Horse[];
    onEdit: (horse: Horse) => void;
    onDelete: (horse: Horse) => void;
    onManageImages: (horse: Horse) => void;
    onReorder: (horses: Horse[]) => void;
}

function SortableRow({
    horse,
    onEdit,
    onDelete,
    onManageImages
}: {
    horse: Horse;
    onEdit: (horse: Horse) => void;
    onDelete: (horse: Horse) => void;
    onManageImages: (horse: Horse) => void;
}) {
    const { t } = useTranslation();
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
            <TableCell className="text-center">{horse.year}</TableCell>
            <TableCell className="w-[200px]">
                {horse.images && horse.images.length > 0 ? (
                    <div className="flex items-center gap-2">
                        <Carousel className="w-32 h-20">
                            <CarouselContent>
                                {horse.images.map((image) => (
                                    <CarouselItem key={image.id}>
                                        <div className="relative h-20">
                                            <img
                                                src={image.url}
                                                alt={horse.name}
                                                className="w-full h-full object-cover rounded-md"
                                            />
                                            {image.is_primary && (
                                                <Star className="absolute top-1 right-1 h-4 w-4 text-yellow-400 fill-yellow-400" />
                                            )}
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            {horse.images.length > 1 && (
                                <>
                                    <CarouselPrevious className="left-0" />
                                    <CarouselNext className="right-0" />
                                </>
                            )}
                        </Carousel>
                        <span className="text-sm text-muted-foreground">
                            {horse.images.length} {horse.images.length === 1 ? t('image') : t('images')}
                        </span>
                    </div>
                ) : (
                    <span className="text-sm text-muted-foreground italic">{t('No images')}</span>
                )}
            </TableCell>
            <TableCell>
                <div className="flex justify-center">
                    {horse.is_active ? (
                        <Check className="h-4 w-4 text-green-500" />
                    ) : (
                        <X className="h-4 w-4 text-red-500" />
                    )}
                </div>
            </TableCell>
            <TableCell className="w-[140px] text-right">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onManageImages(horse)}
                        >
                            <ImageIcon className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('Manage Images')}</TooltipContent>
                </Tooltip>
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

export default function HorseTable({ horses, onEdit, onDelete, onManageImages, onReorder }: Props) {
    const { t } = useTranslation();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = horses.findIndex((h) => h.id === active.id);
            const newIndex = horses.findIndex((h) => h.id === over.id);

            const newOrder = arrayMove(horses, oldIndex, newIndex);
            onReorder(newOrder);

            const ids = newOrder.map((h) => h.id);
            router.post(route('horses.reorder'), { ids }, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    return (
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
                            <TableHead className="w-[100px] text-center">{t('Year')}</TableHead>
                            <TableHead className="w-[200px]">{t('Images')}</TableHead>
                            <TableHead className="w-[100px] text-center">{t('Active')}</TableHead>
                            <TableHead className="w-[140px] text-center">{t('Actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {horses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground italic">
                                    {t('No horses found.')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            <SortableContext
                                items={horses.map((h) => h.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {horses.map((horse) => (
                                    <SortableRow
                                        key={horse.id}
                                        horse={horse}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onManageImages={onManageImages}
                                    />
                                ))}
                            </SortableContext>
                        )}
                    </TableBody>
                </Table>
            </DndContext>
        </div>
    );
}
