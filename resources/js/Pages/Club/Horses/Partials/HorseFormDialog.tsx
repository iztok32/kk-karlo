import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { useForm } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { Horse, HorseFormData } from '../types';
import { useEffect } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    editingHorse: Horse | null;
}

export default function HorseFormDialog({ isOpen, onClose, editingHorse }: Props) {
    const { t } = useTranslation();

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<HorseFormData>({
        name: '',
        year: new Date().getFullYear(),
        is_active: true,
    });

    useEffect(() => {
        if (editingHorse) {
            setData({
                name: editingHorse.name,
                year: editingHorse.year,
                is_active: editingHorse.is_active,
            });
        } else {
            reset();
        }
        clearErrors();
    }, [editingHorse, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                onClose();
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
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
                        <Button type="button" variant="outline" onClick={onClose}>
                            {t('Cancel')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {editingHorse ? t('Update') : t('Save')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
