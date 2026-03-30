import { useForm } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import { Switch } from '@/Components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/Components/ui/accordion';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { Info } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { useEffect } from 'react';
import { HorsemanType } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    gsm_number?: string;
    is_active: boolean;
    roles: string[];
    // Profile fields
    address?: string;
    postal_code?: string;
    city?: string;
    date_of_birth?: string;
    username?: string;
    home_phone?: string;
    work_phone?: string;
    fax?: string;
    gsm_number_public?: boolean;
    home_phone_public?: boolean;
    work_phone_public?: boolean;
    fax_public?: boolean;
    horseman_type_id?: number;
    is_member?: boolean;
    membership_paid?: boolean;
    notify_free_slots?: boolean;
}

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    user?: User;
    roles: Role[];
    horsemanTypes: HorsemanType[];
    onClose: () => void;
}

export default function UserForm({ user, roles, horsemanTypes, onClose }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, put, errors, processing, reset } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        gsm_number: user?.gsm_number || '',
        is_active: user?.is_active ?? true,
        role_id: null as number | null,
        // Profile fields
        address: user?.address || '',
        postal_code: user?.postal_code || '',
        city: user?.city || '',
        date_of_birth: user?.date_of_birth || '',
        username: user?.username || '',
        home_phone: user?.home_phone || '',
        work_phone: user?.work_phone || '',
        fax: user?.fax || '',
        gsm_number_public: user?.gsm_number_public || false,
        home_phone_public: user?.home_phone_public || false,
        work_phone_public: user?.work_phone_public || false,
        fax_public: user?.fax_public || false,
        horseman_type_id: user?.horseman_type_id || ('' as number | ''),
        is_member: user?.is_member || false,
        membership_paid: user?.membership_paid || false,
        notify_free_slots: user?.notify_free_slots ?? true,
    });

    // Load user role on edit
    useEffect(() => {
        if (user && user.roles.length > 0) {
            // Find the first role ID that matches user's role
            const userRole = roles.find(role => user.roles.includes(role.name));
            if (userRole) {
                setData('role_id', userRole.id);
            }
        }
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (user) {
            put(route('users.update', user.id), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <Accordion type="multiple" defaultValue={["basic", "profile", "phones", "membership"]} className="w-full">
                {/* Basic Information */}
                <AccordionItem value="basic">
                    <AccordionTrigger className="text-base font-semibold">
                        {t('General Information')}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('Name')}</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">{t('Email')}</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">{t('Role')}</Label>
                            <Select
                                value={data.role_id?.toString()}
                                onValueChange={(value) => setData('role_id', parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('Select a role')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id.toString()}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role_id && (
                                <p className="text-sm text-destructive">{errors.role_id}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', !!checked)}
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">
                                {t('Active')}
                            </Label>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Profile Information */}
                <AccordionItem value="profile">
                    <AccordionTrigger className="text-base font-semibold">
                        {t('Personal Information')}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">{t('Username')}</Label>
                            <Input
                                id="username"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                placeholder={t('Optional')}
                            />
                            {errors.username && (
                                <p className="text-sm text-destructive">{errors.username}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">{t('Address')}</Label>
                            <Input
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                            />
                            {errors.address && (
                                <p className="text-sm text-destructive">{errors.address}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="postal_code">{t('Postal Code')}</Label>
                                <Input
                                    id="postal_code"
                                    value={data.postal_code}
                                    onChange={(e) => setData('postal_code', e.target.value)}
                                    placeholder="0000"
                                    maxLength={4}
                                />
                                {errors.postal_code && (
                                    <p className="text-sm text-destructive">{errors.postal_code}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">{t('City')}</Label>
                                <Input
                                    id="city"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                />
                                {errors.city && (
                                    <p className="text-sm text-destructive">{errors.city}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date_of_birth">{t('Date of Birth')}</Label>
                            <Input
                                id="date_of_birth"
                                type="date"
                                value={data.date_of_birth}
                                onChange={(e) => setData('date_of_birth', e.target.value)}
                            />
                            {errors.date_of_birth && (
                                <p className="text-sm text-destructive">{errors.date_of_birth}</p>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Phone Numbers */}
                <AccordionItem value="phones">
                    <AccordionTrigger className="text-base font-semibold">
                        {t('Phone Numbers')}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <TooltipProvider>
                            {/* GSM Number */}
                            <div className="space-y-2">
                                <Label htmlFor="gsm_number">{t('GSM Number')}</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="gsm_number"
                                        type="tel"
                                        value={data.gsm_number}
                                        onChange={(e) => setData('gsm_number', e.target.value)}
                                        placeholder="+386 XX XXX XXX"
                                    />
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div>
                                                <Switch
                                                    id="gsm_number_public"
                                                    checked={data.gsm_number_public}
                                                    onCheckedChange={(checked) => setData('gsm_number_public', checked)}
                                                />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{t('Make this number publicly visible')}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                {errors.gsm_number && (
                                    <p className="text-sm text-destructive">{errors.gsm_number}</p>
                                )}
                            </div>

                            {/* Home Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="home_phone">{t('Home Phone')}</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="home_phone"
                                        type="tel"
                                        value={data.home_phone}
                                        onChange={(e) => setData('home_phone', e.target.value)}
                                        placeholder="+386 XX XXX XXX"
                                    />
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div>
                                                <Switch
                                                    id="home_phone_public"
                                                    checked={data.home_phone_public}
                                                    onCheckedChange={(checked) => setData('home_phone_public', checked)}
                                                />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{t('Make this number publicly visible')}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                {errors.home_phone && (
                                    <p className="text-sm text-destructive">{errors.home_phone}</p>
                                )}
                            </div>

                            {/* Work Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="work_phone">{t('Work Phone')}</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="work_phone"
                                        type="tel"
                                        value={data.work_phone}
                                        onChange={(e) => setData('work_phone', e.target.value)}
                                        placeholder="+386 XX XXX XXX"
                                    />
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div>
                                                <Switch
                                                    id="work_phone_public"
                                                    checked={data.work_phone_public}
                                                    onCheckedChange={(checked) => setData('work_phone_public', checked)}
                                                />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{t('Make this number publicly visible')}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                {errors.work_phone && (
                                    <p className="text-sm text-destructive">{errors.work_phone}</p>
                                )}
                            </div>

                            {/* Fax */}
                            <div className="space-y-2">
                                <Label htmlFor="fax">{t('Fax')}</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="fax"
                                        type="tel"
                                        value={data.fax}
                                        onChange={(e) => setData('fax', e.target.value)}
                                        placeholder="+386 XX XXX XXX"
                                    />
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div>
                                                <Switch
                                                    id="fax_public"
                                                    checked={data.fax_public}
                                                    onCheckedChange={(checked) => setData('fax_public', checked)}
                                                />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{t('Make this number publicly visible')}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                {errors.fax && (
                                    <p className="text-sm text-destructive">{errors.fax}</p>
                                )}
                            </div>

                            {/* Info Alert - na koncu */}
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    {t('Phone numbers marked as public will be visible to all members.')}
                                </AlertDescription>
                            </Alert>
                        </TooltipProvider>
                    </AccordionContent>
                </AccordionItem>

                {/* Membership Information */}
                <AccordionItem value="membership">
                    <AccordionTrigger className="text-base font-semibold">
                        {t('Membership Information')}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="horseman_type_id">{t('Rider Type')}</Label>
                            <Select
                                value={data.horseman_type_id ? String(data.horseman_type_id) : ''}
                                onValueChange={(value) => setData('horseman_type_id', value ? Number(value) : '')}
                            >
                                <SelectTrigger id="horseman_type_id">
                                    <SelectValue placeholder={t('Select rider type')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {horsemanTypes.map((type: HorsemanType) => (
                                        <SelectItem key={type.id} value={String(type.id)}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.horseman_type_id && (
                                <p className="text-sm text-destructive">{errors.horseman_type_id}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_member"
                                checked={data.is_member}
                                onCheckedChange={(checked) => setData('is_member', checked as boolean)}
                            />
                            <Label htmlFor="is_member" className="text-sm font-normal cursor-pointer">
                                {t('Member of KK Karlo')}
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="membership_paid"
                                checked={data.membership_paid}
                                onCheckedChange={(checked) => setData('membership_paid', checked as boolean)}
                            />
                            <Label htmlFor="membership_paid" className="text-sm font-normal cursor-pointer">
                                {t('Membership Paid')}
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="notify_free_slots"
                                checked={data.notify_free_slots}
                                onCheckedChange={(checked) => setData('notify_free_slots', checked as boolean)}
                            />
                            <Label htmlFor="notify_free_slots" className="text-sm font-normal cursor-pointer">
                                {t('Notify About Free Slots')}
                            </Label>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={onClose}>
                    {t('Cancel')}
                </Button>
                <Button type="submit" disabled={processing}>
                    {user ? t('Update') : t('Create')}
                </Button>
            </div>
        </form>
    );
}
