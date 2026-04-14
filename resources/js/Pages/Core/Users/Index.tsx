import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Switch } from '@/Components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Plus, Edit2, Trash2, Mail, Check, X, Search, LayoutGrid, LayoutList,
    MoreHorizontal, Ticket, UserCheck, UserX,
} from 'lucide-react';
import { PageProps } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/Components/ui/sheet';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';
import UserForm from './Partials/UserForm';

interface User {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    is_member: boolean;
    membership_paid: boolean;
    coupon_balance: number;
    roles: string[];
    created_at: string;
    deleted_at: string | null;
}

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface HorsemanType {
    id: number;
    name: string;
}

interface Props {
    users: User[];
    roles: Role[];
    horsemanTypes: HorsemanType[];
}

export default function Index({ users, roles, horsemanTypes }: Props) {
    const { t } = useTranslation();
    const { auth } = usePage<PageProps>().props;
    const userPermissions = auth.user?.permissions || [];

    const canCreate = userPermissions.includes('users.create');
    const canEdit = userPermissions.includes('users.edit');
    const canDelete = userPermissions.includes('users.delete');

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showActive, setShowActive] = useState(true);
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

    const handleCreate = () => {
        setEditingUser(undefined);
        setIsSheetOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsSheetOpen(true);
    };

    const handleCloseSheet = () => {
        setIsSheetOpen(false);
        setEditingUser(undefined);
    };

    const handleDelete = (id: number) => {
        setUserToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            router.delete(route('users.destroy', userToDelete), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setUserToDelete(null);
                },
            });
        }
    };

    const handleSendPasswordReset = (userId: number) => {
        router.post(route('users.send-password-reset'), { user_id: userId });
    };

    const filteredUsers = users.filter(user => {
        if (user.is_active !== showActive) return false;
        const query = searchQuery.toLowerCase();
        return (
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.roles.some(role => role.toLowerCase().includes(query))
        );
    });

    const StatusIcon = ({ user }: { user: User }) => {
        if (user.deleted_at) {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </TooltipTrigger>
                    <TooltipContent>{t('Deleted')}</TooltipContent>
                </Tooltip>
            );
        }
        return user.is_active ? (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Check className="h-4 w-4 text-green-600" />
                </TooltipTrigger>
                <TooltipContent>{t('Active')}</TooltipContent>
            </Tooltip>
        ) : (
            <Tooltip>
                <TooltipTrigger asChild>
                    <X className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>{t('Inactive')}</TooltipContent>
            </Tooltip>
        );
    };

    const MemberIcon = ({ user }: { user: User }) => {
        if (!user.is_member) return null;
        return user.membership_paid ? (
            <Tooltip>
                <TooltipTrigger asChild>
                    <UserCheck className="h-4 w-4 text-green-600" />
                </TooltipTrigger>
                <TooltipContent>{t('Member')} – {t('Paid')}</TooltipContent>
            </Tooltip>
        ) : (
            <Tooltip>
                <TooltipTrigger asChild>
                    <UserX className="h-4 w-4 text-orange-500" />
                </TooltipTrigger>
                <TooltipContent>{t('Member')} – {t('Unpaid')}</TooltipContent>
            </Tooltip>
        );
    };

    const CouponBadge = ({ balance }: { balance: number }) => (
        <span className={cn(
            'inline-flex items-center gap-1 text-sm font-medium',
            balance > 0 ? 'text-foreground' : 'text-muted-foreground'
        )}>
            <Ticket className="h-3.5 w-3.5 shrink-0" />
            {balance}
        </span>
    );

    const UserActions = ({ user }: { user: User }) => {
        if (!canEdit && !canDelete) return null;
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {canEdit && (
                        <>
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                {t('Edit User')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendPasswordReset(user.id)}>
                                <Mail className="mr-2 h-4 w-4" />
                                {t('Send Password Reset Link')}
                            </DropdownMenuItem>
                        </>
                    )}
                    {canEdit && canDelete && <DropdownMenuSeparator />}
                    {canDelete && (
                        <DropdownMenuItem
                            onClick={() => handleDelete(user.id)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('Delete User')}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Users Management')}
                </h2>
            }
        >
            <Head title={t('Users Management')} />

            <div className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle>{t('Users')}</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('Search users...')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 w-64"
                                />
                            </div>

                            {/* Active/Inactive Toggle */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="relative inline-flex items-center">
                                        <Switch
                                            checked={showActive}
                                            onCheckedChange={setShowActive}
                                            className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
                                        />
                                        <X className={cn(
                                            'pointer-events-none absolute left-1 h-3 w-3 text-white transition-opacity duration-200',
                                            showActive ? 'opacity-0' : 'opacity-100'
                                        )} />
                                        <Check className={cn(
                                            'pointer-events-none absolute right-1 h-3 w-3 text-white transition-opacity duration-200',
                                            showActive ? 'opacity-100' : 'opacity-0'
                                        )} />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {t('Show active/inactive users')}
                                </TooltipContent>
                            </Tooltip>

                            {/* View Mode Toggle */}
                            <div className="flex items-center border rounded-md">
                                <Button
                                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="h-9 w-9 p-0 rounded-r-none"
                                    onClick={() => setViewMode('table')}
                                    title={t('Table view')}
                                >
                                    <LayoutList className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'card' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="h-9 w-9 p-0 rounded-l-none"
                                    onClick={() => setViewMode('card')}
                                    title={t('Card view')}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                            </div>

                            {canCreate && (
                                <Button onClick={handleCreate} size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    {t('Add User')}
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {viewMode === 'table' ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('Name')}</TableHead>
                                        <TableHead>{t('Email')}</TableHead>
                                        <TableHead className="text-center">{t('Status')}</TableHead>
                                        <TableHead className="text-center">{t('Member')}</TableHead>
                                        <TableHead className="text-center">{t('Coupons')}</TableHead>
                                        <TableHead>{t('Roles')}</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.id} className={user.deleted_at ? 'opacity-50' : ''}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell className="text-center">
                                                    <StatusIcon user={user} />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <MemberIcon user={user} />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <CouponBadge balance={user.coupon_balance} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles.map((role, index) => (
                                                            <Badge key={index} variant="outline">
                                                                {role}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <UserActions user={user} />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                {t('No users found.')}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        ) : (
                            filteredUsers.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className={cn(
                                                'border rounded-lg p-4 flex flex-col gap-3',
                                                user.deleted_at && 'opacity-50'
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium truncate">{user.name}</p>
                                                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="shrink-0">
                                                    <StatusIcon user={user} />
                                                </div>
                                            </div>

                                            {/* Member + Coupons row */}
                                            <div className="flex items-center gap-3">
                                                <MemberIcon user={user} />
                                                <CouponBadge balance={user.coupon_balance} />
                                            </div>

                                            {user.roles.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map((role, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {role}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-end mt-auto pt-1 border-t">
                                                <UserActions user={user} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    {t('No users found.')}
                                </div>
                            )
                        )}
                    </CardContent>
                </Card>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {editingUser ? t('Edit User') : t('Add User')}
                        </SheetTitle>
                        <SheetDescription>
                            {editingUser ? t('Update user information') : t('Create a new user. Password reset link will be sent to the email.')}
                        </SheetDescription>
                    </SheetHeader>
                    <UserForm
                        user={editingUser}
                        roles={roles}
                        horsemanTypes={horsemanTypes}
                        onClose={handleCloseSheet}
                    />
                </SheetContent>
            </Sheet>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Confirm Delete')}</DialogTitle>
                        <DialogDescription>
                            {t('Are you sure you want to delete this user? This action cannot be undone.')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            {t('Delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
