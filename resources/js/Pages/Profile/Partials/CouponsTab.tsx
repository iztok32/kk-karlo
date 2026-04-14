import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { ShoppingCart, Ticket, TrendingDown, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { format } from 'date-fns';
import { sl, enGB, hr, it, de } from 'date-fns/locale';

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

interface Props {
    couponBalances: CouponBalance[];
    couponHistory: CouponRecord[];
}

export default function CouponsTab({ couponBalances, couponHistory }: Props) {
    const { t, locale } = useTranslation();

    const getLocale = (l: string) => {
        switch (l) {
            case 'sl': return sl;
            case 'hr': return hr;
            case 'it': return it;
            case 'de': return de;
            default: return enGB;
        }
    };

    const totalBalance = couponBalances.reduce((sum, b) => sum + b.balance, 0);
    const purchaseCount = couponHistory.filter(r => r.transaction_type === 'purchase').length;

    return (
        <div className="space-y-6">
            {/* Header with purchase shortcut */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">{t('My Coupons')}</h3>
                    <p className="text-sm text-muted-foreground">
                        {t('Overview of your coupon balance and transaction history.')}
                    </p>
                </div>
                <Link href={route('purchase.index')}>
                    <Button>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {t('Buy Coupons')}
                    </Button>
                </Link>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t('Total Balance')}
                        </CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${totalBalance <= 0 ? 'text-red-500' : ''}`}>
                            {totalBalance}
                        </div>
                        <p className="text-xs text-muted-foreground">{t('coupons available')}</p>
                    </CardContent>
                </Card>

                {couponBalances.map(b => (
                    <Card key={b.id}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {b.name}
                            </CardTitle>
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${b.balance <= 0 ? 'text-red-500' : ''}`}>
                                {b.balance}
                            </div>
                            <p className="text-xs text-muted-foreground">{t('available')}</p>
                        </CardContent>
                    </Card>
                ))}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t('Total Purchases')}
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{purchaseCount}</div>
                        <p className="text-xs text-muted-foreground">{t('purchases made')}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction history */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('Date')}</TableHead>
                            <TableHead>{t('Coupon Type')}</TableHead>
                            <TableHead>{t('Transaction')}</TableHead>
                            <TableHead className="text-right">{t('Quantity')}</TableHead>
                            <TableHead className="text-right">{t('Amount')}</TableHead>
                            <TableHead>{t('Appointment')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {couponHistory.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center py-10 text-muted-foreground italic"
                                >
                                    {t('No coupon transactions yet.')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            couponHistory.map(record => (
                                <TableRow key={record.id}>
                                    <TableCell className="text-sm whitespace-nowrap">
                                        {format(new Date(record.created_at), 'PP', {
                                            locale: getLocale(locale),
                                        })}
                                    </TableCell>
                                    <TableCell>{record.coupon_type ?? '—'}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                record.transaction_type === 'purchase'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {record.transaction_type === 'purchase'
                                                ? t('Purchase')
                                                : t('Usage')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span
                                            className={`font-medium inline-flex items-center justify-end gap-1 ${
                                                record.quantity > 0
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-500'
                                            }`}
                                        >
                                            {record.quantity > 0 ? (
                                                <TrendingUp className="h-3 w-3" />
                                            ) : (
                                                <TrendingDown className="h-3 w-3" />
                                            )}
                                            {record.quantity > 0
                                                ? `+${record.quantity}`
                                                : record.quantity}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right text-sm">
                                        {record.price_paid != null
                                            ? `€${Number(record.price_paid).toFixed(2)}`
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {record.appointment ?? '—'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
