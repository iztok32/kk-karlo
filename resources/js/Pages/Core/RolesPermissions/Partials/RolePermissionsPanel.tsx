import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import PermissionModuleCard from './PermissionModuleCard';

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
    selectedRole: Role;
    groupedPermissions: ModulePermissions[];
    standardPermissions: string[];
    openAccordions: string[];
    onExpandAll: () => void;
    onCollapseAll: () => void;
    onAccordionChange: (module: string, isOpen: boolean) => void;
}

export default function RolePermissionsPanel({
    selectedRole,
    groupedPermissions,
    standardPermissions,
    openAccordions,
    onExpandAll,
    onCollapseAll,
    onAccordionChange,
}: Props) {
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                    <CardTitle>{selectedRole.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t('Manage permissions for this role')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={onExpandAll}
                        size="sm"
                        variant="outline"
                        className="h-9 w-9 p-0"
                        title={t('Expand All')}
                    >
                        <ChevronsDownUp className="h-4 w-4" />
                    </Button>
                    <Button
                        onClick={onCollapseAll}
                        size="sm"
                        variant="outline"
                        className="h-9 w-9 p-0"
                        title={t('Collapse All')}
                    >
                        <ChevronsUpDown className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {groupedPermissions.length > 0 ? (
                        groupedPermissions.map((moduleData) => (
                            <PermissionModuleCard
                                key={moduleData.module}
                                roleId={selectedRole.id}
                                moduleData={moduleData}
                                standardPermissions={standardPermissions}
                                isOpen={openAccordions.includes(moduleData.module)}
                                onOpenChange={(isOpen) => onAccordionChange(moduleData.module, isOpen)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            {t('No modules found.')}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
