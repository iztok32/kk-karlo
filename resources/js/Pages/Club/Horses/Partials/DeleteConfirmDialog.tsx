import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { Horse } from '../types';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    horse: Horse | null;
}

export default function DeleteConfirmDialog({ isOpen, onClose, horse }: Props) {
    const { t } = useTranslation();
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (!horse) return;

        setProcessing(true);
        router.delete(route('horses.destroy', { horse: horse.id }), {
            onSuccess: () => {
                onClose();
                setProcessing(false);
            },
            onError: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('Delete Horse')}</DialogTitle>
                    <DialogDescription>
                        {t('Are you sure you want to delete horse :name?', { name: horse?.name || '' })} {t('This action cannot be undone.')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={processing}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={processing}
                    >
                        {t('Delete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
