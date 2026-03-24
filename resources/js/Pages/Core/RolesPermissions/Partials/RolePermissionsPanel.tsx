import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { ChevronsDownUp, ChevronsUpDown, ChevronsUpDown as SearchIcon } from 'lucide-react';
import PermissionModuleCard from './PermissionModuleCard';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { useState } from 'react';
import { Input } from '@/Components/ui/input';

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
    openAccordions: string[];
    onExpandAll: () => void;
    onCollapseAll: () => void;
    onAccordionChange: (module: string, isOpen: boolean) => void;
    onRoleSelect: (roleId: number) => void;
}

export default function RolePermissionsPanel({
    roles,
    selectedRole,
    groupedPermissions,
    standardPermissions,
    openAccordions,
    onExpandAll,
    onCollapseAll,
    onAccordionChange,
    onRoleSelect,
}: Props) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Card>
            <CardHeader className="space-y-4 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0 max-w-md">
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                            {t('Select Role')}
                        </label>
                        <Select
                            value={selectedRole?.id.toString() || ""}
                            onValueChange={(value) => onRoleSelect(parseInt(value))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('Select a role...')} />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2">
                                    <Input
                                        placeholder={t('Search roles...')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-9"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                {filteredRoles.length > 0 ? (
                                    filteredRoles.map((role) => (
                                        <SelectItem key={role.id} value={role.id.toString()}>
                                            {role.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                        {t('No roles found')}
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedRole && (
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
                    )}
                </div>
                {selectedRole && (
                    <div>
                        <p className="text-sm text-muted-foreground">
                            {t('Manage permissions for this role')}
                        </p>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {selectedRole ? (
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
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        {t('Select a role to manage permissions')}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
