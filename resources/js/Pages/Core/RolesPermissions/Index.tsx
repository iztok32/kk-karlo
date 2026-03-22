import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import RolesList from './Partials/RolesList';
import RolePermissionsPanel from './Partials/RolePermissionsPanel';

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface Permission {
    id: number;
    name: string;
    slug: string;
    module: string;
    is_active: boolean;
    is_assigned: boolean;
}

interface ModulePermissions {
    module: string;
    web_root: string | null;
    description: string | null;
    standard: Permission[];
    custom: Permission[];
    assigned_count: number;
    total_count: number;
}

interface Props {
    roles: Role[];
    selectedRole: Role | null;
    groupedPermissions: ModulePermissions[];
    standardPermissions: string[];
}

export default function Index({ roles, selectedRole, groupedPermissions, standardPermissions }: Props) {
    const { t } = useTranslation();
    const [openAccordions, setOpenAccordions] = useState<string[]>([]);

    const handleRoleSelect = (roleId: number) => {
        router.get(route('roles-permissions.index', { role_id: roleId }), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExpandAll = () => {
        setOpenAccordions(groupedPermissions.map(g => g.module));
    };

    const handleCollapseAll = () => {
        setOpenAccordions([]);
    };

    const handleAccordionChange = (module: string, isOpen: boolean) => {
        setOpenAccordions(prev =>
            isOpen
                ? [...prev, module]
                : prev.filter(m => m !== module)
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Roles & Permissions')}
                </h2>
            }
        >
            <Head title={t('Roles & Permissions')} />

            <div className="grid grid-cols-12 gap-4">
                {/* Left Panel - Roles List */}
                <div className="col-span-12 lg:col-span-3">
                    <RolesList
                        roles={roles}
                        selectedRole={selectedRole}
                        onRoleSelect={handleRoleSelect}
                    />
                </div>

                {/* Right Panel - Permissions */}
                <div className="col-span-12 lg:col-span-9">
                    {selectedRole ? (
                        <RolePermissionsPanel
                            selectedRole={selectedRole}
                            groupedPermissions={groupedPermissions}
                            standardPermissions={standardPermissions}
                            openAccordions={openAccordions}
                            onExpandAll={handleExpandAll}
                            onCollapseAll={handleCollapseAll}
                            onAccordionChange={handleAccordionChange}
                        />
                    ) : (
                        <Card>
                            <CardContent className="py-12">
                                <div className="text-center text-muted-foreground">
                                    {t('Select a role to manage permissions')}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
