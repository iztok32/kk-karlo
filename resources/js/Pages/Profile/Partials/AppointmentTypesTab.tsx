import { useTranslation } from '@/lib/i18n';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { Check, Footprints, Send } from 'lucide-react';
import { useState } from 'react';

interface AppointmentType {
    id: number;
    name: string;
    horses_selectable: boolean;
}

interface Props {
    allAppointmentTypes: AppointmentType[];
    assignedTypeIds: number[];
}

export default function AppointmentTypesTab({ allAppointmentTypes, assignedTypeIds }: Props) {
    const { t } = useTranslation();
    const [dialogOpen, setDialogOpen] = useState(false);

    const unassignedTypes = allAppointmentTypes.filter(at => !assignedTypeIds.includes(at.id));

    const { data, setData, post, processing, reset, wasSuccessful } = useForm<{
        type_ids: number[];
        note: string;
    }>({
        type_ids: [],
        note: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.request-appointment-type'), {
            onSuccess: () => {
                setDialogOpen(false);
                reset();
            },
        });
    };

    const toggleType = (id: number) => {
        setData('type_ids',
            data.type_ids.includes(id)
                ? data.type_ids.filter(tid => tid !== id)
                : [...data.type_ids, id]
        );
    };

    return (
        <div className="space-y-6">
            {/* Currently assigned types */}
            <div>
                <h3 className="text-sm font-semibold mb-3">{t('My allowed appointment types')}</h3>
                {assignedTypeIds.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {t('You have access to all appointment types.')}
                    </p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {allAppointmentTypes
                            .filter(at => assignedTypeIds.includes(at.id))
                            .map(at => (
                                <Badge key={at.id} variant="secondary" className="gap-1.5 text-sm py-1 px-3">
                                    <Check className="h-3.5 w-3.5 text-green-600" />
                                    {at.name}
                                    {!at.horses_selectable && (
                                        <span className="text-muted-foreground">
                                            <Footprints className="h-3 w-3 inline ml-0.5 opacity-50" />
                                        </span>
                                    )}
                                </Badge>
                            ))}
                    </div>
                )}
            </div>

            {/* Request button — only if there are types not yet assigned */}
            {unassignedTypes.length > 0 && (
                <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                        {t('If you need access to additional appointment types, you can send a request to the administrator.')}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                        <Send className="h-4 w-4 mr-2" />
                        {t('Request additional types')}
                    </Button>
                </div>
            )}

            {/* Request dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[440px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{t('Request appointment type access')}</DialogTitle>
                            <DialogDescription>
                                {t('Select the types you would like access to. The administrator will be notified.')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                {unassignedTypes.map(at => (
                                    <div key={at.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`req-${at.id}`}
                                            checked={data.type_ids.includes(at.id)}
                                            onCheckedChange={() => toggleType(at.id)}
                                        />
                                        <Label htmlFor={`req-${at.id}`} className="text-sm font-normal cursor-pointer">
                                            {at.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="note">{t('Note')} <span className="text-muted-foreground text-xs">({t('optional')})</span></Label>
                                <Textarea
                                    id="note"
                                    value={data.note}
                                    onChange={e => setData('note', e.target.value)}
                                    placeholder={t('Add a note for the administrator...')}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                {t('Cancel')}
                            </Button>
                            <Button type="submit" disabled={processing || data.type_ids.length === 0}>
                                <Send className="h-4 w-4 mr-2" />
                                {t('Send request')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
