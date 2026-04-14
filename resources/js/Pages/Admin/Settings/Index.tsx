import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { useMemo, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/Components/ui/command';
import {
    Check,
    ChevronsUpDown,
    X,
    Save,
    Euro,
    CalendarClock,
    Users,
    Ticket,
} from 'lucide-react';
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

interface CouponType {
    id: number;
    name: string;
    price: number;
}

interface Props {
    settings: Setting[];
    adminUsers: AdminUser[];
    couponTypes: CouponType[];
}

const GROUP_META: Record<string, React.ReactNode> = {
    reservations: <CalendarClock className="h-5 w-5 text-primary" />,
    general:      <Users className="h-5 w-5 text-primary" />,
};

/** Renders a single settings group as a Card with per-row label+control layout */
function GroupCard({
    group,
    groupSettings,
    groupLabel,
    settingLabels,
    errors,
    renderControl,
}: {
    group: string;
    groupSettings: Setting[];
    groupLabel: string;
    settingLabels: Record<string, { label: string; description: string }>;
    errors: Partial<Record<string, string>>;
    renderControl: (setting: Setting) => React.ReactNode;
}) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        {GROUP_META[group] ?? <CalendarClock className="h-5 w-5 text-primary" />}
                    </div>
                    <CardTitle className="text-base">{groupLabel}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {groupSettings.map((setting, idx) => {
                    const meta = settingLabels[setting.key];
                    return (
                        <div
                            key={setting.key}
                            className={cn(
                                'flex items-start justify-between gap-6 px-6 py-4',
                                idx < groupSettings.length - 1 && 'border-b'
                            )}
                        >
                            <div className="flex-1 min-w-0">
                                <label
                                    htmlFor={setting.key}
                                    className="text-sm font-medium cursor-pointer"
                                >
                                    {meta?.label ?? setting.key}
                                </label>
                                {meta?.description && (
                                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                        {meta.description}
                                    </p>
                                )}
                                {errors.settings && (
                                    <p className="mt-1 text-xs text-red-500">{errors.settings}</p>
                                )}
                            </div>
                            <div className="shrink-0 pt-0.5">
                                {renderControl(setting)}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

export default function Index({ settings, adminUsers, couponTypes }: Props) {
    const { t } = useTranslation();
    const [adminSelectOpen, setAdminSelectOpen] = useState(false);

    const groupLabels: Record<string, string> = {
        reservations: t('Reservations'),
        general: t('General'),
    };

    const { data, setData, post, processing, errors } = useForm<{
        settings: { key: string; value: string }[];
        coupon_type_prices: Record<number, string>;
    }>({
        settings: settings.map(s => ({ key: s.key, value: s.value ?? '' })),
        coupon_type_prices: Object.fromEntries(couponTypes.map(ct => [ct.id, String(ct.price ?? 0)])),
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

    /** Render the control for a single setting */
    const renderControl = (setting: Setting) => {
        if (setting.key === 'general.default_admin_ids') {
            return (
                <div className="flex flex-col gap-2 items-end">
                    <Popover open={adminSelectOpen} onOpenChange={setAdminSelectOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                role="combobox"
                                aria-expanded={adminSelectOpen}
                                className="w-56 justify-between font-normal"
                            >
                                <span className="truncate text-muted-foreground">
                                    {selectedAdminUsers.length === 0
                                        ? t('Select administrators...')
                                        : t(':count selected', { count: String(selectedAdminUsers.length) })}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-0" align="end">
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
                                                        selectedAdminIds.includes(u.id)
                                                            ? 'opacity-100'
                                                            : 'opacity-0'
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
                        <div className="flex flex-wrap gap-1.5 justify-end">
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
            );
        }

        if (setting.type === 'integer') {
            return (
                <Input
                    id={setting.key}
                    type="number"
                    min={0}
                    value={getValue(setting.key)}
                    onChange={e => setValue(setting.key, e.target.value)}
                    className="w-24 text-center"
                />
            );
        }

        if (setting.type === 'boolean') {
            return (
                <select
                    id={setting.key}
                    value={getValue(setting.key)}
                    onChange={e => setValue(setting.key, e.target.value)}
                    className="flex h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                    <option value="true">{t('Yes')}</option>
                    <option value="false">{t('No')}</option>
                </select>
            );
        }

        return (
            <Input
                id={setting.key}
                type="text"
                value={getValue(setting.key)}
                onChange={e => setValue(setting.key, e.target.value)}
                className="w-56"
            />
        );
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
                <div className="mx-auto w-full sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        {/* Two-column grid — left: general + coupon prices, right: reservations */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                            {/* Left column: general group + coupon prices */}
                            <div className="space-y-6">
                                {Object.entries(groups)
                                    .filter(([group]) => group !== 'reservations')
                                    .map(([group, groupSettings]) => (
                                        <GroupCard
                                            key={group}
                                            group={group}
                                            groupSettings={groupSettings}
                                            groupLabel={groupLabels[group] ?? group}
                                            settingLabels={SETTING_LABELS}
                                            errors={errors}
                                            renderControl={renderControl}
                                        />
                                    ))}

                                {couponTypes.length > 0 && (
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                    <Ticket className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">
                                                        {t('Coupon Prices')}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs mt-0.5">
                                                        {t('Price per coupon unit for online purchase (EUR).')}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            {couponTypes.map((ct, idx) => (
                                                <div
                                                    key={ct.id}
                                                    className={cn(
                                                        'flex items-center justify-between gap-6 px-6 py-4',
                                                        idx < couponTypes.length - 1 && 'border-b'
                                                    )}
                                                >
                                                    <label
                                                        htmlFor={`coupon_price_${ct.id}`}
                                                        className="text-sm font-medium cursor-pointer"
                                                    >
                                                        {ct.name}
                                                    </label>
                                                    <div className="relative w-32 shrink-0">
                                                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                                        <Input
                                                            id={`coupon_price_${ct.id}`}
                                                            type="number"
                                                            min={0}
                                                            step={0.01}
                                                            value={data.coupon_type_prices[ct.id] ?? '0'}
                                                            onChange={e => setData('coupon_type_prices', {
                                                                ...data.coupon_type_prices,
                                                                [ct.id]: e.target.value,
                                                            })}
                                                            className="pl-8"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Right column: reservations group */}
                            <div className="space-y-6">
                                {Object.entries(groups)
                                    .filter(([group]) => group === 'reservations')
                                    .map(([group, groupSettings]) => (
                                        <GroupCard
                                            key={group}
                                            group={group}
                                            groupSettings={groupSettings}
                                            groupLabel={groupLabels[group] ?? group}
                                            settingLabels={SETTING_LABELS}
                                            errors={errors}
                                            renderControl={renderControl}
                                        />
                                    ))}
                            </div>
                        </div>

                        {/* Save action bar */}
                        <div className="mt-6 flex justify-end">
                            <Button type="submit" disabled={processing} size="lg">
                                <Save className="mr-2 h-4 w-4" />
                                {t('Save Settings')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
