import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdateProfileAvatar from './Partials/UpdateProfileAvatar';
import CouponsTab from './Partials/CouponsTab';
import AppointmentTypesTab from './Partials/AppointmentTypesTab';
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { User, Lock, AlertTriangle, CalendarDays, Ticket } from 'lucide-react';
import { useMemo } from 'react';

interface Permissions {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

interface CouponBalance {
    id: number;
    name: string;
    balance: number;
}

interface CouponRecord {
    id: number;
    coupon_type: string | null;
    quantity: number;
    transaction_type: string;
    price_paid: number | null;
    appointment: string | null;
    created_at: string;
}

interface AppointmentType {
    id: number;
    name: string;
    horses_selectable: boolean;
}

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    permissions: Permissions;
    couponBalances: CouponBalance[];
    couponHistory: CouponRecord[];
    allAppointmentTypes: AppointmentType[];
    assignedTypeIds: number[];
}

export default function Edit({ mustVerifyEmail, status, permissions, couponBalances, couponHistory, allAppointmentTypes, assignedTypeIds }: Props) {
    const { t } = useTranslation();

    // Determine which tabs should be visible
    const visibleTabs = useMemo(() => {
        const tabs = [];

        // Profile tab: visible if user has view permission
        if (permissions.canView) {
            tabs.push('profile');
        }

        // Coupons tab: always visible (2nd position)
        tabs.push('coupons');

        // Appointment types tab: always visible
        tabs.push('appointment-types');

        // Password tab: always visible
        tabs.push('password');

        // Delete tab: visible if user has delete permission
        if (permissions.canDelete) {
            tabs.push('delete');
        }

        return tabs;
    }, [permissions]);

    // Default tab is first visible tab
    const defaultTab = visibleTabs[0] || 'coupons';

    const gridCols = visibleTabs.length === 1 ? 'grid-cols-1' :
                     visibleTabs.length === 2 ? 'grid-cols-2' :
                     visibleTabs.length === 3 ? 'grid-cols-3' :
                     visibleTabs.length === 4 ? 'grid-cols-4' : 'grid-cols-5';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Profile')}
                </h2>
            }
        >
            <Head title={t('Profile')} />

            <div className="space-y-4">
                <Card>
                    <CardContent className="p-6">
                        <Tabs defaultValue={defaultTab} className="w-full">
                            <TabsList className={`grid w-full ${gridCols}`}>
                                {permissions.canView && (
                                    <TabsTrigger value="profile" className="gap-2">
                                        <User className="h-4 w-4" />
                                        {t('Profile Information')}
                                    </TabsTrigger>
                                )}
                                <TabsTrigger value="coupons" className="gap-2">
                                    <Ticket className="h-4 w-4" />
                                    {t('My Coupons')}
                                </TabsTrigger>
                                <TabsTrigger value="appointment-types" className="gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    {t('Appointment Types')}
                                </TabsTrigger>
                                <TabsTrigger value="password" className="gap-2">
                                    <Lock className="h-4 w-4" />
                                    {t('Update Password')}
                                </TabsTrigger>
                                {permissions.canDelete && (
                                    <TabsTrigger value="delete" className="gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        {t('Delete Account')}
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            {permissions.canView && (
                                <TabsContent value="profile" className="mt-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Avatar Section - 1/3 width */}
                                        <div className="lg:col-span-1">
                                            <Card>
                                                <CardContent className="p-6">
                                                    <UpdateProfileAvatar canEdit={permissions.canEdit} />
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Profile Information - 2/3 width */}
                                        <div className="lg:col-span-2">
                                            <Card>
                                                <CardContent className="p-6">
                                                    <UpdateProfileInformationForm
                                                        mustVerifyEmail={mustVerifyEmail}
                                                        status={status}
                                                        canEdit={permissions.canEdit}
                                                    />
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </TabsContent>
                            )}

                            <TabsContent value="coupons" className="mt-6">
                                <CouponsTab
                                    couponBalances={couponBalances}
                                    couponHistory={couponHistory}
                                />
                            </TabsContent>

                            <TabsContent value="appointment-types" className="mt-6">
                                <AppointmentTypesTab
                                    allAppointmentTypes={allAppointmentTypes}
                                    assignedTypeIds={assignedTypeIds}
                                />
                            </TabsContent>

                            <TabsContent value="password" className="mt-6">
                                <UpdatePasswordForm />
                            </TabsContent>

                            {permissions.canDelete && (
                                <TabsContent value="delete" className="mt-6">
                                    <DeleteUserForm />
                                </TabsContent>
                            )}
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
