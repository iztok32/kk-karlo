import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { useMemo, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/Components/ui/command';
import { Check, ChevronsUpDown, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Setting {
    id: number;
    key: string;
    value: string | null;
    type: 'string' | 'integer' | 'boolean';
    group: string;
}

interface AdminUser {
    id: number;
    name: string;
}

interface Props {
    settings: Setting[];
    adminUsers: AdminUser[];
}

export default function Index({ settings, adminUsers }: Props) {
    const { t } = useTranslation();
    const [adminSelectOpen, setAdminSelectOpen] = useState(false);

    const groupLabels: Record<string, string> = {
        reservations: t('Reservations'),
        general: t('General'),
    };

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

    const selectedAdminIds = useMemo<number[]>(() => {
        try {
            return JSON.parse(getValue('general.default_admin_ids')) ?? [];
        } catch {
            return [];
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.settings]);

    const toggleAdminId = (id: number) => {
        const updated = selectedAdminIds.includes(id)
            ? selectedAdminIds.filter(x => x !== id)
            : [...selectedAdminIds, id];
        setValue('general.default_admin_ids', JSON.stringify(updated));
    };

    const selectedAdminUsers = adminUsers.filter(u => selectedAdminIds.includes(u.id));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.settings.update'), { preserveScroll: true });
    };

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
        'reservation.cancellation_days': {
            label: t('Cancellation deadline (days)'),
            description: t('How many days before the appointment a user can cancel and receive a coupon refund. Admins can always cancel without restrictions.'),
        },
        'general.default_admin_ids': {
            label: t('Default administrators'),
            description: t('Administrators who receive notifications when a user requests a late cancellation and no teacher is assigned to the appointment.'),
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
                                            {groupLabels[group] ?? group}
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

                                                    {setting.key === 'general.default_admin_ids' ? (
                                                        <div className="flex flex-col gap-2">
                                                            <Popover open={adminSelectOpen} onOpenChange={setAdminSelectOpen}>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        role="combobox"
                                                                        aria-expanded={adminSelectOpen}
                                                                        className="w-80 justify-between font-normal"
                                                                    >
                                                                        <span className="truncate text-muted-foreground">
                                                                            {selectedAdminUsers.length === 0
                                                                                ? t('Select administrators...')
                                                                                : t(':count selected', { count: selectedAdminUsers.length })}
                                                                        </span>
                                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-80 p-0" align="start">
                                                                    <Command>
                                                                        <CommandInput placeholder={t('Search...')} />
                                                                        <CommandList>
                                                                            <CommandEmpty>{t('No users found.')}</CommandEmpty>
                                                                            <CommandGroup>
                                                                                {adminUsers.map(u => (
                                                                                    <CommandItem
                                                                                        key={u.id}
                                                                                        value={u.name}
                                                                                        onSelect={() => toggleAdminId(u.id)}
                                                                                    >
                                                                                        <Check
                                                                                            className={cn(
                                                                                                'mr-2 h-4 w-4',
                                                                                                selectedAdminIds.includes(u.id) ? 'opacity-100' : 'opacity-0'
                                                                                            )}
                                                                                        />
                                                                                        {u.name}
                                                                                    </CommandItem>
                                                                                ))}
                                                                            </CommandGroup>
                                                                        </CommandList>
                                                                    </Command>
                                                                </PopoverContent>
                                                            </Popover>

                                                            {selectedAdminUsers.length > 0 && (
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {selectedAdminUsers.map(u => (
                                                                        <span
                                                                            key={u.id}
                                                                            className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
                                                                        >
                                                                            {u.name}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => toggleAdminId(u.id)}
                                                                                className="hover:text-destructive transition-colors"
                                                                            >
                                                                                <X className="h-3 w-3" />
                                                                            </button>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : setting.type === 'integer' ? (
                                                        <Input
                                                            id={setting.key}
                                                            type="number"
                                                            min={0}
                                                            value={getValue(setting.key)}
                                                            onChange={e => setValue(setting.key, e.target.value)}
                                                            className="w-32"
                                                        />
                                                    ) : setting.type === 'boolean' ? (
                                                        <select
                                                            id={setting.key}
                                                            value={getValue(setting.key)}
                                                            onChange={e => setValue(setting.key, e.target.value)}
                                                            className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                        >
                                                            <option value="true">{t('Yes')}</option>
                                                            <option value="false">{t('No')}</option>
                                                        </select>
                                                    ) : (
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
