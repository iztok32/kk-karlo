import { useForm } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { NavigationItem } from '@/types';
import { FormEventHandler } from 'react';

// Since I don't see Select in the provided list, I will use a custom styled select or check if it exists
// Wait, I will use a standard select with tailwind styling for reliability if SHADCN select is missing
// Actually, I'll try to find if there is a Select component in the project.
// If not, I'll use a styled native select.

interface Props {
    item?: NavigationItem;
    items: NavigationItem[];
    fixedType?: string;
    onSuccess: () => void;
}

export default function NavigationForm({ item, items, fixedType, onSuccess }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        parent_id: item?.parent_id || null,
        type: item?.type || fixedType || 'main',
        title_key: item?.title_key || '',
        url: item?.url || '',
        icon: item?.icon || '',
        sort_order: item?.sort_order || 0,
        is_active: item?.is_active ?? true,
        permission: item?.permission || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (item) {
            patch(route('navigation.update', item.id), {
                onSuccess: () => onSuccess(),
            });
        } else {
            post(route('navigation.store'), {
                onSuccess: () => {
                    reset();
                    onSuccess();
                },
            });
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6 py-4">
            <div className="grid gap-4">
                <div className="space-y-2">
                    <Label htmlFor="title_key">{t('Title Key')}</Label>
                    <Input
                        id="title_key"
                        value={data.title_key}
                        onChange={(e) => setData('title_key', e.target.value)}
                        required
                        placeholder="menu.dashboard"
                    />
                    {errors.title_key && <div className="text-sm text-destructive">{errors.title_key}</div>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="url">{t('URL')}</Label>
                    <Input
                        id="url"
                        value={data.url || ''}
                        onChange={(e) => setData('url', e.target.value)}
                        placeholder="/dashboard"
                    />
                    {errors.url && <div className="text-sm text-destructive">{errors.url}</div>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {!fixedType && (
                        <div className="space-y-2">
                            <Label htmlFor="type">{t('Type')}</Label>
                            <select
                                id="type"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                            >
                                <option value="main">Main</option>
                                <option value="project">Project</option>
                                <option value="team">Team</option>
                            </select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="parent_id">{t('Parent Item')}</Label>
                        <select
                            id="parent_id"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={data.parent_id || ''}
                            onChange={(e) => setData('parent_id', e.target.value ? parseInt(e.target.value) : null)}
                        >
                            <option value="">{t('None')}</option>
                            {items.filter(i => i.id !== item?.id && i.type === data.type).map((i) => (
                                <option key={i.id} value={i.id}>
                                    {t(i.title_key)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="icon">{t('Icon')}</Label>
                        <Input
                            id="icon"
                            value={data.icon || ''}
                            onChange={(e) => setData('icon', e.target.value)}
                            placeholder="layout-dashboard"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sort_order">{t('Sort Order')}</Label>
                        <Input
                            id="sort_order"
                            type="number"
                            value={data.sort_order}
                            onChange={(e) => setData('sort_order', parseInt(e.target.value))}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="permission">{t('Permission Required')}</Label>
                    <Input
                        id="permission"
                        value={data.permission || ''}
                        onChange={(e) => setData('permission', e.target.value)}
                        placeholder="admin.access"
                    />
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

            <div className="flex justify-end gap-3 pt-4">
                <Button type="submit" disabled={processing}>
                    {item ? t('Update Item') : t('Create Item')}
                </Button>
            </div>
        </form>
    );
}
