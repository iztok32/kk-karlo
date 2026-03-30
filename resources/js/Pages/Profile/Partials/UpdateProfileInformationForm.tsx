import { Link, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from "@/lib/i18n";
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/Components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Checkbox } from '@/Components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { Calendar } from '@/Components/ui/calendar';
import { CheckCircle2, Eye, Info, CalendarIcon } from 'lucide-react';
import { PageProps, HorsemanType } from '@/types';
import { format, parse } from 'date-fns';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    canEdit: boolean;
}

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    canEdit,
}: Props) {
    const { t } = useTranslation();
    const user = usePage<PageProps>().props.auth.user;
    const horsemanTypes = usePage<PageProps>().props.horsemanTypes || [];

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            gsm_number: user.gsm_number || '',
            address: user.address || '',
            postal_code: user.postal_code || '',
            city: user.city || '',
            date_of_birth: user.date_of_birth || '',
            username: user.username || '',
            home_phone: user.home_phone || '',
            work_phone: user.work_phone || '',
            fax: user.fax || '',
            gsm_number_public: user.gsm_number_public || false,
            home_phone_public: user.home_phone_public || false,
            work_phone_public: user.work_phone_public || false,
            fax_public: user.fax_public || false,
            horseman_type_id: user.horseman_type_id || '',
            is_member: user.is_member || false,
            membership_paid: user.membership_paid || false,
            notify_free_slots: user.notify_free_slots ?? true,
        });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (canEdit) {
            patch(route('profile.update'));
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                    {canEdit ? t('Profile Information') : (
                        <>
                            <Eye className="h-5 w-5" />
                            {t('Profile Information')} ({t('Read Only')})
                        </>
                    )}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {canEdit
                        ? t("Update your account's profile information and email address.")
                        : t("View your account's profile information and email address.")
                    }
                </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <Accordion type="multiple" defaultValue={["general"]} className="w-full">
                    {/* General Information */}
                    <AccordionItem value="general">
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
                                    autoComplete="name"
                                    disabled={!canEdit}
                                    readOnly={!canEdit}
                                    className={!canEdit ? 'cursor-not-allowed opacity-60' : ''}
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
                                    autoComplete="username"
                                    disabled={!canEdit}
                                    readOnly={!canEdit}
                                    className={!canEdit ? 'cursor-not-allowed opacity-60' : ''}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username">{t('Username')}</Label>
                                <Input
                                    id="username"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder={t('Optional')}
                                    autoComplete="username"
                                    disabled={!canEdit}
                                    readOnly={!canEdit}
                                    className={!canEdit ? 'cursor-not-allowed opacity-60' : ''}
                                />
                                {errors.username && (
                                    <p className="text-sm text-destructive">{errors.username}</p>
                                )}
                            </div>

                            {mustVerifyEmail && user.email_verified_at === null && (
                                <Alert>
                                    <AlertDescription>
                                        {t('Your email address is unverified.')}{' '}
                                        <Link
                                            href={route('verification.send')}
                                            method="post"
                                            as="button"
                                            className="underline hover:no-underline"
                                        >
                                            {t('Click here to re-send the verification email.')}
                                        </Link>
                                    </AlertDescription>
                                    {status === 'verification-link-sent' && (
                                        <AlertDescription className="mt-2 font-medium text-green-600">
                                            {t('A new verification link has been sent to your email address.')}
                                        </AlertDescription>
                                    )}
                                </Alert>
                            )}
                        </AccordionContent>
                    </AccordionItem>

                    {/* Personal Information */}
                    <AccordionItem value="personal">
                        <AccordionTrigger className="text-base font-semibold">
                            {t('Personal Information')}
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="address">{t('Address')}</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    autoComplete="street-address"
                                    disabled={!canEdit}
                                    readOnly={!canEdit}
                                    className={!canEdit ? 'cursor-not-allowed opacity-60' : ''}
                                />
                                {errors.address && (
                                    <p className="text-sm text-destructive">{errors.address}</p>
                                )}
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="space-y-2 w-36 shrink-0">
                                    <Label htmlFor="postal_code">{t('Postal Code')}</Label>
                                    <Input
                                        id="postal_code"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        placeholder="0000"
                                        maxLength={4}
                                        autoComplete="postal-code"
                                        disabled={!canEdit}
                                        readOnly={!canEdit}
                                        className={!canEdit ? 'cursor-not-allowed opacity-60' : ''}
                                    />
                                    {errors.postal_code && (
                                        <p className="text-sm text-destructive">{errors.postal_code}</p>
                                    )}
                                </div>

                                <div className="space-y-2 flex-1">
                                    <Label htmlFor="city">{t('City')}</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        autoComplete="address-level2"
                                        disabled={!canEdit}
                                        readOnly={!canEdit}
                                        className={!canEdit ? 'cursor-not-allowed opacity-60' : ''}
                                    />
                                    {errors.city && (
                                        <p className="text-sm text-destructive">{errors.city}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_of_birth">{t('Date of Birth')}</Label>
                                <div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="date_of_birth"
                                                variant="outline"
                                                className={`w-fit justify-start text-left font-normal ${!canEdit ? 'cursor-not-allowed opacity-60' : ''} ${!data.date_of_birth && 'text-muted-foreground'}`}
                                                disabled={!canEdit}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {data.date_of_birth ? (
                                                    format(new Date(data.date_of_birth), 'dd.MM.yyyy')
                                                ) : (
                                                    <span>{t('Pick a date')}</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={data.date_of_birth ? new Date(data.date_of_birth) : undefined}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        setData('date_of_birth', format(date, 'yyyy-MM-dd'));
                                                    }
                                                }}
                                                disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
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
                                            autoComplete="tel"
                                            disabled={!canEdit}
                                            readOnly={!canEdit}
                                            className={!canEdit ? 'cursor-not-allowed opacity-60' : ''}
                                        />
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div>
                                                    <Switch
                                                        id="gsm_number_public"
                                                        checked={data.gsm_number_public}
                                                        onCheckedChange={(checked) => setData('gsm_number_public', checked)}
                                                        disabled={!canEdit}
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
                                            autoComplete="tel-local"
                                            disabled={!canEdit}
                                            readOnly={!canEdit}
                                            className={!canEdit ? 'cursor-not-allowed opacity-60' : ''}
                                        />
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div>
                                                    <Switch
                                                        id="home_phone_public"
                                                        checked={data.home_phone_public}
                                                        onCheckedChange={(checked) => setData('home_phone_public', checked)}
                                                        disabled={!canEdit}
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
                                            autoComplete="tel-national"
                                            disabled={!canEdit}
                                            readOnly={!canEdit}
                                            className={!canEdit ? 'cursor-not-allowed opacity-60' : ''}
                                        />
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div>
                                                    <Switch
                                                        id="work_phone_public"
                                                        checked={data.work_phone_public}
                                                        onCheckedChange={(checked) => setData('work_phone_public', checked)}
                                                        disabled={!canEdit}
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
                                            disabled={!canEdit}
                                            readOnly={!canEdit}
                                            className={!canEdit ? 'cursor-not-allowed opacity-60' : ''}
                                        />
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div>
                                                    <Switch
                                                        id="fax_public"
                                                        checked={data.fax_public}
                                                        onCheckedChange={(checked) => setData('fax_public', checked)}
                                                        disabled={!canEdit}
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
                                    disabled={true}
                                >
                                    <SelectTrigger
                                        id="horseman_type_id"
                                        className="cursor-not-allowed opacity-60"
                                    >
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

                            <div className="flex items-center justify-between">
                                <Label htmlFor="is_member" className="text-sm font-normal">
                                    {t('Member of KK Karlo')}
                                </Label>
                                <Switch
                                    id="is_member"
                                    checked={data.is_member}
                                    disabled={true}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="membership_paid" className="text-sm font-normal">
                                    {t('Membership Paid')}
                                </Label>
                                <Switch
                                    id="membership_paid"
                                    checked={data.membership_paid}
                                    disabled={true}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="notify_free_slots" className="text-sm font-normal">
                                    {t('Notify About Free Slots')}
                                </Label>
                                <Switch
                                    id="notify_free_slots"
                                    checked={data.notify_free_slots}
                                    onCheckedChange={(checked) => setData('notify_free_slots', checked)}
                                    disabled={!canEdit}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {canEdit && (
                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            {t('Save')}
                        </Button>

                        {recentlySuccessful && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span>{t('Saved.')}</span>
                            </div>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
}
