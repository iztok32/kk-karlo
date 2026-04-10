import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Separator } from '@/Components/ui/separator';
import {
    ShoppingCart,
    Minus,
    Plus,
    CreditCard,
    History,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Wallet,
    ArrowLeft,
    TicketCheck,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { sl, enGB, hr, it, de } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CouponType {
    id: number;
    name: string;
    price: number;
}

interface HistoryEntry {
    id: number;
    coupon_type_id: number;
    coupon_type_name: string | null;
    quantity: number;
    transaction_type: 'purchase' | 'usage';
    price_paid: number | null;
    notes: string | null;
    created_at: string;
}

interface Props {
    couponTypes: CouponType[];
    history: HistoryEntry[];
    balances: Record<number, number>;
}

interface SharedProps {
    stripe_publishable_key: string;
    locale: string;
    [key: string]: unknown;
}

const LOCALE_MAP: Record<string, Locale> = { sl, en: enGB, hr, it, de };

// ─── Payment form ─────────────────────────────────────────────────────────────

interface PaymentFormProps {
    items: { type_id: number; qty: number }[];
    couponTypes: CouponType[];
    totalEur: number;
    onSuccess: (paymentIntentId: string) => void;
    onCancel: () => void;
    t: (key: string, r?: Record<string, string>) => string;
}

function PaymentForm({ items, couponTypes, totalEur, onSuccess, onCancel, t }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setPaying(true);
        setError(null);

        const { error: submitErr } = await elements.submit();
        if (submitErr) {
            setError(submitErr.message ?? t('Payment failed.'));
            setPaying(false);
            return;
        }

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: window.location.origin + '/purchase' },
            redirect: 'if_required',
        });

        if (result.error) {
            setError(result.error.message ?? t('Payment failed.'));
            setPaying(false);
            return;
        }

        if (result.paymentIntent?.status === 'succeeded') {
            onSuccess(result.paymentIntent.id);
        } else {
            setError(t('Payment has not been completed.'));
            setPaying(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Order summary */}
            <div className="rounded-lg bg-muted/40 border border-border p-4 space-y-2">
                {items.map(item => {
                    const ct = couponTypes.find(c => c.id === item.type_id);
                    if (!ct) return null;
                    return (
                        <div key={item.type_id} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                                <TicketCheck className="w-3.5 h-3.5 text-primary opacity-70" />
                                {ct.name} × {item.qty}
                            </span>
                            <span className="font-medium tabular-nums">
                                €{(ct.price * item.qty).toFixed(2)}
                            </span>
                        </div>
                    );
                })}
                <Separator className="my-1" />
                <div className="flex items-center justify-between font-semibold">
                    <span>{t('Total')}</span>
                    <span className="text-lg tabular-nums">€{totalEur.toFixed(2)}</span>
                </div>
            </div>

            <PaymentElement />

            {error && (
                <div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2 text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {error}
                </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-1">
                <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={paying}>
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    {t('Back')}
                </Button>
                <Button type="submit" disabled={paying || !stripe} size="lg" className="min-w-44">
                    {paying ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('Processing...')}
                        </>
                    ) : (
                        <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            {t('Pay :amount', { amount: `€${totalEur.toFixed(2)}` })}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Index({ couponTypes, history, balances }: Props) {
    const { t, locale } = useTranslation();
    const { stripe_publishable_key } = usePage<{ props: SharedProps }>().props as unknown as SharedProps;
    const dateFnsLocale = LOCALE_MAP[locale] ?? sl;

    const [stripePromise] = useState(() =>
        stripe_publishable_key ? loadStripe(stripe_publishable_key) : null
    );

    const [step, setStep] = useState<'select' | 'payment' | 'success'>('select');
    const [quantities, setQuantities] = useState<Record<number, number>>(
        Object.fromEntries(couponTypes.map(ct => [ct.id, 0]))
    );
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [intentError, setIntentError] = useState<string | null>(null);
    const [intentLoading, setIntentLoading] = useState(false);

    const items = couponTypes
        .filter(ct => (quantities[ct.id] ?? 0) > 0)
        .map(ct => ({ type_id: ct.id, qty: quantities[ct.id] }));

    const totalEur = couponTypes.reduce((sum, ct) => {
        return sum + (quantities[ct.id] ?? 0) * (ct.price ?? 0);
    }, 0);

    const adjustQty = useCallback((typeId: number, delta: number) => {
        setQuantities(prev => ({
            ...prev,
            [typeId]: Math.max(0, Math.min(50, (prev[typeId] ?? 0) + delta)),
        }));
    }, []);

    const handleProceed = async () => {
        if (items.length === 0) return;
        setIntentLoading(true);
        setIntentError(null);

        try {
            const res = await fetch(route('purchase.intent'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ items }),
            });
            const json = await res.json();
            if (!res.ok || !json.client_secret) {
                setIntentError(json.message ?? json.errors?.items ?? t('Could not initiate payment. Please try again.'));
                return;
            }
            setClientSecret(json.client_secret);
            setStep('payment');
        } catch {
            setIntentError(t('Could not initiate payment. Please try again.'));
        } finally {
            setIntentLoading(false);
        }
    };

    const handlePaymentSuccess = (paymentIntentId: string) => {
        router.post(
            route('purchase.confirm'),
            { payment_intent_id: paymentIntentId, items },
            {
                onSuccess: () => {
                    setStep('success');
                    setQuantities(Object.fromEntries(couponTypes.map(ct => [ct.id, 0])));
                },
                onError: () => {
                    setIntentError(t('Payment succeeded but coupon issuing failed. Please contact support.'));
                    setStep('select');
                },
            }
        );
    };

    const totalBalance = Object.values(balances).reduce((a, b) => a + b, 0);

    return (
        <AuthenticatedLayout header={t('Purchase Coupons')}>
            <Head title={t('Purchase Coupons')} />

            <div className="p-4 lg:p-6 space-y-6">

                {/* ── Stat row ── */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {/* Total balance */}
                    <Card className="col-span-2 lg:col-span-1">
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        {t('Total balance')}
                                    </p>
                                    <p className="mt-1 text-3xl font-bold tabular-nums">{totalBalance}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{t('coupons')}</p>
                                </div>
                                <div className="rounded-xl bg-primary/10 p-2.5">
                                    <Wallet className="w-5 h-5 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Per-type balances */}
                    {couponTypes.map(ct => (
                        <Card key={ct.id}>
                            <CardContent className="pt-5 pb-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
                                            {ct.name}
                                        </p>
                                        <p className="mt-1 text-3xl font-bold tabular-nums">
                                            {balances[ct.id] ?? 0}
                                        </p>
                                        {ct.price > 0 && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                €{ct.price.toFixed(2)} / {t('pc.')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="rounded-xl bg-accent p-2.5">
                                        <TicketCheck className="w-5 h-5 text-accent-foreground opacity-70" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Purchases count */}
                    <Card className={couponTypes.length < 3 ? '' : 'hidden lg:block'}>
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        {t('Purchases')}
                                    </p>
                                    <p className="mt-1 text-3xl font-bold tabular-nums">
                                        {history.filter(h => h.transaction_type === 'purchase').length}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        €{history
                                            .filter(h => h.transaction_type === 'purchase' && h.price_paid)
                                            .reduce((s, h) => s + (h.price_paid ?? 0), 0)
                                            .toFixed(2)} {t('total spent')}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-green-100 dark:bg-green-900/30 p-2.5">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Two-column body ── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

                    {/* ── Left: Purchase form ── */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader className="border-b border-border pb-4">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <ShoppingCart className="w-5 h-5 text-primary" />
                                    {t('Buy Coupons')}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="pt-5">
                                {/* ── Success ── */}
                                {step === 'success' && (
                                    <div className="flex flex-col items-center gap-4 py-10 text-center">
                                        <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg">{t('Payment successful!')}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {t('Coupons have been added to your account.')}
                                            </p>
                                        </div>
                                        <Button variant="outline" onClick={() => setStep('select')} className="mt-2">
                                            {t('Buy more')}
                                        </Button>
                                    </div>
                                )}

                                {/* ── Select ── */}
                                {step === 'select' && (
                                    <div className="space-y-4">
                                        {couponTypes.length === 0 ? (
                                            <p className="text-sm text-muted-foreground italic py-4 text-center">
                                                {t('No coupon types available.')}
                                            </p>
                                        ) : (
                                            <>
                                                {couponTypes.map(ct => (
                                                    <div
                                                        key={ct.id}
                                                        className={cn(
                                                            'rounded-xl border-2 p-4 transition-colors',
                                                            (quantities[ct.id] ?? 0) > 0
                                                                ? 'border-primary bg-primary/5'
                                                                : 'border-border bg-muted/20',
                                                        )}
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <p className="font-semibold truncate">{ct.name}</p>
                                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                                    {ct.price > 0
                                                                        ? `€${ct.price.toFixed(2)} / ${t('coupon')}`
                                                                        : t('Price not set')}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => adjustQty(ct.id, -1)}
                                                                    disabled={(quantities[ct.id] ?? 0) === 0}
                                                                    className="w-9 h-9 rounded-full border-2 border-border flex items-center justify-center hover:bg-accent disabled:opacity-30 transition-colors font-bold"
                                                                >
                                                                    <Minus className="w-3.5 h-3.5" />
                                                                </button>
                                                                <span className="w-10 text-center text-lg font-bold tabular-nums">
                                                                    {quantities[ct.id] ?? 0}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => adjustQty(ct.id, 1)}
                                                                    className="w-9 h-9 rounded-full border-2 border-border flex items-center justify-center hover:bg-accent transition-colors font-bold"
                                                                >
                                                                    <Plus className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {(quantities[ct.id] ?? 0) > 0 && ct.price > 0 && (
                                                            <div className="mt-2.5 pt-2.5 border-t border-border/50 flex justify-between text-sm">
                                                                <span className="text-muted-foreground">
                                                                    {quantities[ct.id]} × €{ct.price.toFixed(2)}
                                                                </span>
                                                                <span className="font-semibold text-primary">
                                                                    €{(quantities[ct.id] * ct.price).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                {intentError && (
                                                    <div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2 text-red-700 dark:text-red-300">
                                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                        {intentError}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* ── Payment ── */}
                                {step === 'payment' && clientSecret && stripePromise && (
                                    <Elements
                                        stripe={stripePromise}
                                        options={{
                                            clientSecret,
                                            appearance: {
                                                theme: document.documentElement.classList.contains('dark') ? 'night' : 'stripe',
                                            },
                                        }}
                                    >
                                        <PaymentForm
                                            items={items}
                                            couponTypes={couponTypes}
                                            totalEur={totalEur}
                                            onSuccess={handlePaymentSuccess}
                                            onCancel={() => setStep('select')}
                                            t={t}
                                        />
                                    </Elements>
                                )}
                            </CardContent>

                            {/* Footer only for 'select' step */}
                            {step === 'select' && couponTypes.length > 0 && (
                                <CardFooter className="border-t border-border pt-4 flex items-center justify-between gap-4">
                                    <div>
                                        {totalEur > 0 ? (
                                            <>
                                                <p className="text-xs text-muted-foreground">{t('Total')}</p>
                                                <p className="text-2xl font-bold tabular-nums">€{totalEur.toFixed(2)}</p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">{t('Select coupons above')}</p>
                                        )}
                                    </div>
                                    <Button
                                        size="lg"
                                        onClick={handleProceed}
                                        disabled={items.length === 0 || totalEur <= 0 || intentLoading}
                                        className="shrink-0"
                                    >
                                        {intentLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {t('Loading...')}
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                {t('Continue to payment')}
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    </div>

                    {/* ── Right: Transaction history ── */}
                    <div className="lg:col-span-3">
                        <Card className="h-full">
                            <CardHeader className="border-b border-border pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <History className="w-5 h-5 text-muted-foreground" />
                                        {t('Transaction history')}
                                    </CardTitle>
                                    {history.length > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                            {history.length} {t('records')}
                                        </span>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                {history.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                                        <History className="w-10 h-10 opacity-20" />
                                        <p className="text-sm italic">{t('No transactions yet.')}</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-10"></TableHead>
                                                <TableHead>{t('Date')}</TableHead>
                                                <TableHead>{t('Coupon type')}</TableHead>
                                                <TableHead className="text-right">{t('Quantity')}</TableHead>
                                                <TableHead className="text-right">{t('Amount')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {history.map(entry => (
                                                <TableRow key={entry.id}>
                                                    <TableCell>
                                                        <div className={cn(
                                                            'w-7 h-7 rounded-full flex items-center justify-center',
                                                            entry.transaction_type === 'purchase'
                                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                                                : 'bg-muted text-muted-foreground',
                                                        )}>
                                                            {entry.transaction_type === 'purchase'
                                                                ? <TrendingUp className="w-3.5 h-3.5" />
                                                                : <TrendingDown className="w-3.5 h-3.5" />}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm whitespace-nowrap">
                                                        <p>{format(parseISO(entry.created_at), 'd. MMM yyyy', { locale: dateFnsLocale })}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {format(parseISO(entry.created_at), 'HH:mm')}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {entry.coupon_type_name ?? '—'}
                                                            </p>
                                                            {entry.notes && (
                                                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                                    {entry.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className={cn(
                                                            'font-semibold tabular-nums',
                                                            entry.transaction_type === 'purchase' ? 'text-green-600' : 'text-muted-foreground',
                                                        )}>
                                                            {entry.transaction_type === 'purchase' ? '+' : '−'}{entry.quantity}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {entry.price_paid != null && entry.price_paid > 0 ? (
                                                            <span className="text-sm font-medium tabular-nums">
                                                                €{entry.price_paid.toFixed(2)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">—</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
