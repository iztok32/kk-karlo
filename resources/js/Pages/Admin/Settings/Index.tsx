import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Save } from 'lucide-react';

interface Setting {
    id: number;
    key: string;
    value: string | null;
    type: 'string' | 'integer' | 'boolean';
    group: string;
}

interface Props {
    settings: Setting[];
}

const GROUP_LABELS: Record<string, string> = {
    reservations: 'Rezervacije',
    general: 'Splošno',
};

export default function Index({ settings }: Props) {
    const { t } = useTranslation();

    const { data, setData, post, processing, errors } = useForm({
        settings: settings.map(s => ({ key: s.key, value: s.value ?? '' })),
    });

    const getValue = (key: string) =>
        data.settings.find(s => s.key === key)?.value ?? '';

    const setValue = (key: string, value: string) => {
        setData('settings', data.settings.map(s =>
            s.key === key ? { ...s, value } : s
        ));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.settings.update'), { preserveScroll: true });
    };

    // Group settings by group field
    const groups = settings.reduce<Record<string, Setting[]>>((acc, s) => {
        (acc[s.group] ??= []).push(s);
        return acc;
    }, {});

    const SETTING_LABELS: Record<string, { label: string; description: string }> = {
        'reservation.min_days_in_advance': {
            label: t('Min days in advance for reservation'),
            description: t('Minimum number of days before the appointment date that a reservation can be made. 0 = same day allowed, 1 = at least 1 day before, etc.'),
        },
        'reservation.max_days_in_advance': {
            label: t('Max days in advance for reservation'),
            description: t('Maximum number of days in advance a non-admin user can make a reservation. Admins have no limit.'),
        },
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('System Settings')}
                </h2>
            }
        >
            <Head title={t('System Settings')} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            {Object.entries(groups).map(([group, groupSettings]) => (
                                <div key={group} className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                                    <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                            {GROUP_LABELS[group] ?? group}
                                        </h3>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        {groupSettings.map(setting => {
                                            const meta = SETTING_LABELS[setting.key];
                                            return (
                                                <div key={setting.key} className="grid gap-2">
                                                    <Label htmlFor={setting.key}>
                                                        {meta?.label ?? setting.key}
                                                    </Label>
                                                    {setting.type === 'integer' && (
                                                        <Input
                                                            id={setting.key}
                                                            type="number"
                                                            min={0}
                                                            value={getValue(setting.key)}
                                                            onChange={e => setValue(setting.key, e.target.value)}
                                                            className="w-32"
                                                        />
                                                    )}
                                                    {setting.type === 'boolean' && (
                                                        <select
                                                            id={setting.key}
                                                            value={getValue(setting.key)}
                                                            onChange={e => setValue(setting.key, e.target.value)}
                                                            className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                        >
                                                            <option value="true">{t('Yes')}</option>
                                                            <option value="false">{t('No')}</option>
                                                        </select>
                                                    )}
                                                    {setting.type === 'string' && (
                                                        <Input
                                                            id={setting.key}
                                                            type="text"
                                                            value={getValue(setting.key)}
                                                            onChange={e => setValue(setting.key, e.target.value)}
                                                            className="w-80"
                                                        />
                                                    )}
                                                    {meta?.description && (
                                                        <p className="text-xs text-muted-foreground">{meta.description}</p>
                                                    )}
                                                    {errors.settings && (
                                                        <p className="text-xs text-red-500">{errors.settings}</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {t('Save Settings')}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
