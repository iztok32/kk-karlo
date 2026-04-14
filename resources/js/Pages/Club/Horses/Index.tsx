import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { useForm, Head } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { Plus, Search, Check, X, LayoutGrid, LayoutList } from 'lucide-react';
import { Switch } from '@/Components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/tooltip';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Horse } from './types';
import HorseTable from './Partials/HorseTable';
import HorseCardView from './Partials/HorseCardView';
import HorseFormDialog from './Partials/HorseFormDialog';
import HorseImageManager from './Partials/HorseImageManager';
import DeleteConfirmDialog from './Partials/DeleteConfirmDialog';

interface Props {
    horses: Horse[];
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

export default function Index({ horses: initialHorses, canCreate, canEdit, canDelete }: Props) {
    const { t } = useTranslation();
    const [localHorses, setLocalHorses] = useState(initialHorses);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [editingHorse, setEditingHorse] = useState<Horse | null>(null);
    const [managingImagesHorse, setManagingImagesHorse] = useState<Horse | null>(null);
    const [horseToDelete, setHorseToDelete] = useState<Horse | null>(null);
    const [showActive, setShowActive] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

    const filteredHorses = localHorses.filter(h => {
        const matchesStatus = h.is_active === showActive;
        const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    useEffect(() => {
        setLocalHorses(initialHorses);

        // Update managingImagesHorse if it exists and horses data changed
        if (managingImagesHorse) {
            const updatedHorse = initialHorses.find(h => h.id === managingImagesHorse.id);
            if (updatedHorse) {
                setManagingImagesHorse(updatedHorse);
            }
        }
    }, [initialHorses]);

    const openAddDialog = () => {
        setEditingHorse(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (horse: Horse) => {
        setEditingHorse(horse);
        setIsDialogOpen(true);
    };

    const openManageImagesDialog = (horse: Horse) => {
        setManagingImagesHorse(horse);
        setIsImageDialogOpen(true);
    };

    const handleDelete = (horse: Horse) => {
        setHorseToDelete(horse);
        setIsDeleteDialogOpen(true);
    };

    const handleReorder = (reorderedHorses: Horse[]) => {
        setLocalHorses(reorderedHorses);
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
                <div className="mx-auto w-full sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* Header with filters and actions */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <h3 className="text-lg font-medium">{t('Horse List')}</h3>

                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Search */}
                                    <div className="relative w-64">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder={t('Search horses...')}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>

                                    {/* Active/Inactive Toggle */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="relative inline-flex items-center">
                                                <Switch
                                                    checked={showActive}
                                                    onCheckedChange={setShowActive}
                                                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
                                                />
                                                <X className={cn(
                                                    "pointer-events-none absolute left-1 h-3 w-3 text-white transition-opacity duration-200",
                                                    showActive ? "opacity-0" : "opacity-100"
                                                )} />
                                                <Check className={cn(
                                                    "pointer-events-none absolute right-1 h-3 w-3 text-white transition-opacity duration-200",
                                                    showActive ? "opacity-100" : "opacity-0"
                                                )} />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {t('Show active/inactive horses')}
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* View Mode Toggle */}
                                    <div className="flex items-center border rounded-md">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                                                    size="sm"
                                                    onClick={() => setViewMode('table')}
                                                    className="rounded-r-none"
                                                >
                                                    <LayoutList className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{t('Table View')}</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant={viewMode === 'cards' ? 'default' : 'ghost'}
                                                    size="sm"
                                                    onClick={() => setViewMode('cards')}
                                                    className="rounded-l-none"
                                                >
                                                    <LayoutGrid className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{t('Card View')}</TooltipContent>
                                        </Tooltip>
                                    </div>

                                    {/* Add Horse Button */}
                                    <Button onClick={openAddDialog}>
                                        <Plus className="mr-2 h-4 w-4" /> {t('Add Horse')}
                                    </Button>
                                </div>
                            </div>

                            {/* View Content */}
                            {viewMode === 'table' ? (
                                <HorseTable
                                    horses={filteredHorses}
                                    onEdit={openEditDialog}
                                    onDelete={handleDelete}
                                    onManageImages={openManageImagesDialog}
                                    onReorder={handleReorder}
                                />
                            ) : (
                                <HorseCardView
                                    horses={filteredHorses}
                                    onEdit={openEditDialog}
                                    onDelete={handleDelete}
                                    onManageImages={openManageImagesDialog}
                                />
                            )}

                            {/* Empty State */}
                            {filteredHorses.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    {searchTerm
                                        ? t('No horses found matching ":search".', { search: searchTerm })
                                        : (showActive ? t('No active horses found.') : t('No inactive horses found.'))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <HorseFormDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                editingHorse={editingHorse}
            />

            <DeleteConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                horse={horseToDelete}
            />

            <HorseImageManager
                isOpen={isImageDialogOpen}
                onClose={() => setIsImageDialogOpen(false)}
                horse={managingImagesHorse}
            />
        </AuthenticatedLayout>
    );
}
