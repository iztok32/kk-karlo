import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { NavigationItem } from '@/types';
import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Plus, Edit2, Trash2, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/Components/ui/sheet';
import NavigationForm from './Partials/NavigationForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

interface Props {
    items: NavigationItem[];
}

export default function Index({ items }: Props) {
    const { t } = useTranslation();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<NavigationItem | undefined>(undefined);
    const [activeType, setActiveType] = useState<string | undefined>(undefined);
    const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

    const handleCreate = (type: string) => {
        setEditingItem(undefined);
        setActiveType(type);
        setIsSheetOpen(true);
    };

    const handleEdit = (item: NavigationItem) => {
        setEditingItem(item);
        setActiveType(item.type);
        setIsSheetOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm(t('Are you sure you want to delete this item?'))) {
            router.delete(route('navigation.destroy', id));
        }
    };

    const toggleExpand = (id: number) => {
        setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const renderRows = (items: NavigationItem[], level = 0) => {
        return items.flatMap((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems[item.id];

            const rows = [
                <TableRow key={item.id} className={level > 0 ? 'bg-muted/30' : ''}>
                    <TableCell className="w-[50px]">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
                            {hasChildren ? (
                                <button onClick={() => toggleExpand(item.id)} className="p-1 hover:bg-muted rounded">
                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </button>
                            ) : (
                                <div className="w-6" />
                            )}
                            <span className="font-medium">{t(item.title_key)}</span>
                            <span className="text-xs text-muted-foreground ml-2">({item.title_key})</span>
                        </div>
                    </TableCell>
                    <TableCell>{item.url || '-'}</TableCell>
                    <TableCell>
                        <Badge variant={item.is_active ? 'default' : 'secondary'}>
                            {item.is_active ? t('Active') : t('Inactive')}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
            ];

            if (hasChildren && isExpanded) {
                rows.push(...renderRows(item.children || [], level + 1));
            }

            return rows;
        });
    };

    const NavigationCard = ({ type, title }: { type: string, title: string }) => {
        const filteredItems = items.filter(item => item.type === type);

        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle>{t(title)}</CardTitle>
                    <Button onClick={() => handleCreate(type)} size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t('Add New Item')}
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>{t('Title')}</TableHead>
                                <TableHead>{t('URL')}</TableHead>
                                <TableHead>{t('Status')}</TableHead>
                                <TableHead className="text-right">{t('Actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.length > 0 ? (
                                renderRows(filteredItems)
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        {t('No navigation items found.')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Navigation Management')}
                </h2>
            }
        >
            <Head title={t('Navigation')} />

            <div className="space-y-8">
                <NavigationCard type="main" title="Main Navigation" />
                <NavigationCard type="team" title="Team Navigation" />
                <NavigationCard type="project" title="Project Navigation" />
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="sm:max-w-[500px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{editingItem ? t('Edit Item') : t('Add New Item')}</SheetTitle>
                        <SheetDescription>
                            {t('Configure your side menu item here. Click save when you\'re done.')}
                        </SheetDescription>
                    </SheetHeader>
                    <NavigationForm 
                        item={editingItem} 
                        items={items} 
                        fixedType={activeType}
                        onSuccess={() => setIsSheetOpen(false)} 
                    />
                </SheetContent>
            </Sheet>
        </AuthenticatedLayout>
    );
}
