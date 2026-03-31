import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { useForm, Head } from '@inertiajs/react';
import React, { useState } from 'react';
import { Trash2, Plus, Search } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { format } from 'date-fns';
import { sl, enGB, hr, it, de } from 'date-fns/locale';

interface CouponType {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

interface Reservation {
  id: number;
  reservation_date: string;
  appointment?: { name: string };
  horse?: { name: string };
}

interface Coupon {
  id: number;
  user_id: number;
  coupon_type_id: number;
  quantity: number;
  transaction_type: 'purchase' | 'usage';
  reservation_id: number | null;
  created_at: string;
  user: User;
  coupon_type: CouponType;
  reservation?: Reservation;
}

interface Props {
  coupons: Coupon[];
  couponTypes: CouponType[];
  users: User[];
  canManageCoupons: boolean;
}

export default function Index({ coupons, couponTypes, users, canManageCoupons }: Props) {
  const { t, locale } = useTranslation();

  const getLocale = (localeStr: string) => {
    switch (localeStr) {
      case 'sl': return sl;
      case 'hr': return hr;
      case 'it': return it;
      case 'de': return de;
      default: return enGB;
    }
  };

  const currentLocale = getLocale(locale);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, setData, post, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    user_id: users.length === 1 ? users[0].id.toString() : '',
    coupon_type_id: '',
    quantity: '1',
    transaction_type: 'purchase',
  });

  const filteredCoupons = coupons.filter(item => {
    const matchesSearch = item.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const openAddDialog = () => {
    reset();
    clearErrors();
    setIsAddDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('coupons.store'), {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        reset();
      },
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleDelete = (item: Coupon) => {
    setCouponToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (couponToDelete) {
      destroy(route('coupons.destroy', { coupon: couponToDelete.id }), {
        onSuccess: () => setIsDeleteDialogOpen(false),
      });
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
          {t('Coupons Management')}
        </h2>
      }
    >
      <Head title={t('Coupons')} />

      <div className="py-12">
        <div className="mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">{t('Coupons Ledger')}</h3>
                <div className="flex items-center gap-4">
                  {canManageCoupons && (
                    <div className="relative w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t('Search user...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  )}
                  <Button onClick={openAddDialog}>
                    <Plus className="mr-2 h-4 w-4" /> {t('Add Record')}
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('User')}</TableHead>
                      <TableHead>{t('Type')}</TableHead>
                      <TableHead className="w-[100px] text-center">{t('Quantity')}</TableHead>
                      <TableHead className="w-[150px] text-center">{t('Transaction')}</TableHead>
                      <TableHead>{t('Reservation')}</TableHead>
                      <TableHead>{t('Date')}</TableHead>
                      <TableHead className="w-[100px] text-center">{t('Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCoupons.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground italic">
                          {t('No coupon records found.')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCoupons.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.user.name}</TableCell>
                          <TableCell>{item.coupon_type.name}</TableCell>
                          <TableCell className="text-center font-bold">
                            {item.transaction_type === 'usage' ? '-' : '+'}{item.quantity}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${item.transaction_type === 'purchase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {item.transaction_type === 'purchase' ? t('Purchase') : t('Usage')}
                            </span>
                          </TableCell>
                          <TableCell>
                            {item.reservation ? (
                                <div className="text-sm">
                                    <div>{item.reservation.appointment?.name || t('Appointment')}</div>
                                    <div className="text-muted-foreground">{format(new Date(item.reservation.reservation_date), 'P', { locale: currentLocale })}</div>
                                </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {format(new Date(item.created_at), 'Pp', { locale: currentLocale })}
                          </TableCell>
                          <TableCell className="w-[100px] text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{t('Add Coupon Record')}</DialogTitle>
              <DialogDescription>
                {t('Manually add a coupon purchase or usage record.')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              
              {canManageCoupons && (
                <div className="grid gap-2">
                    <Label htmlFor="user_id">{t('User')}</Label>
                    <Select value={data.user_id} onValueChange={(val) => setData('user_id', val)}>
                    <SelectTrigger className={errors.user_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder={t('Select user')} />
                    </SelectTrigger>
                    <SelectContent>
                        {users.map(u => (
                            <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    {errors.user_id && <p className="text-sm text-red-500">{errors.user_id}</p>}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="coupon_type_id">{t('Coupon Type')}</Label>
                <Select value={data.coupon_type_id} onValueChange={(val) => setData('coupon_type_id', val)}>
                  <SelectTrigger className={errors.coupon_type_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('Select type')} />
                  </SelectTrigger>
                  <SelectContent>
                    {couponTypes.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.coupon_type_id && <p className="text-sm text-red-500">{errors.coupon_type_id}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="transaction_type">{t('Transaction')}</Label>
                <Select value={data.transaction_type} onValueChange={(val) => setData('transaction_type', val)}>
                  <SelectTrigger className={errors.transaction_type ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('Select transaction type')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchase">{t('Purchase')}</SelectItem>
                    <SelectItem value="usage">{t('Usage')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.transaction_type && <p className="text-sm text-red-500">{errors.transaction_type}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="quantity">{t('Quantity')}</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={data.quantity}
                  onChange={(e) => setData('quantity', e.target.value)}
                  className={errors.quantity ? 'border-red-500' : ''}
                />
                {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t('Cancel')}
              </Button>
              <Button type="submit" disabled={processing}>
                {t('Save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('Delete Record')}</DialogTitle>
            <DialogDescription>
              {t('Are you sure you want to delete this coupon record?')} {t('This action will soft delete the record.')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t('Cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={processing}
            >
              {t('Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  );
}
