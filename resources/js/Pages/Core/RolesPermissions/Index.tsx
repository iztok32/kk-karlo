import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
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

            <RolePermissionsPanel
                roles={roles}
                selectedRole={selectedRole}
                groupedPermissions={groupedPermissions}
                standardPermissions={standardPermissions}
                openAccordions={openAccordions}
                onExpandAll={handleExpandAll}
                onCollapseAll={handleCollapseAll}
                onAccordionChange={handleAccordionChange}
                onRoleSelect={handleRoleSelect}
            />
        </AuthenticatedLayout>
    );
}
