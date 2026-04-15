import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { format, differenceInCalendarDays } from 'date-fns';
import { sl, enGB, hr, it, de } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/Components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import {
    Ticket, CalendarDays, Image as ImageIcon, Clock,
    CalendarPlus, CalendarCheck, Users, AlertTriangle,
    ChevronRight, Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';

interface NewsItem {
    id: number;
    title: string;
    content: string;
    published_at: string | null;
    images: { url: string }[];
}

interface CouponBalance {
    type_name: string;
    balance: number;
}

interface ReservationItem {
    id: number;
    reservation_date: string;
    appointment_name: string | null;
    start_time: string | null;
    end_time: string | null;
    horse_name: string | null;
}

interface HorseImage {
    id: number;
    url: string;
    is_primary: boolean;
}

interface HorseItem {
    id: number;
    name: string;
    year: number;
    images: HorseImage[];
}

interface AdminStats {
    reservations_today: number;
    active_members: number;
    active_horses: number;
}

interface Props {
    news: NewsItem[];
    coupons: CouponBalance[];
    reservations: ReservationItem[];
    horses: HorseItem[];
    membership: { is_member: boolean; membership_paid: boolean };
    adminStats: AdminStats | null;
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export default function Dashboard({ news, coupons, reservations, horses, membership, adminStats }: Props) {
    const { t, locale } = useTranslation();
    const { auth } = usePage<PageProps>().props;
    const userName = (auth.user as any)?.name ?? '';

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

    const hour = new Date().getHours();
    const greeting = hour < 12 ? t('Good morning') : hour < 18 ? t('Good afternoon') : t('Good evening');

    const dayLabel = (days: number) => {
        if (days === 0) return { text: t('Today'), cls: 'text-green-600 dark:text-green-400 font-semibold' };
        if (days === 1) return { text: t('Tomorrow'), cls: 'text-amber-600 dark:text-amber-400 font-semibold' };
        return { text: t(':days days', { days: String(days) }), cls: 'text-muted-foreground' };
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Dashboard')}
                </h2>
            }
        >
            <Head title={t('Dashboard')} />

            <div className="p-4 pt-0 space-y-4">

                {/* Welcome banner */}
                <div className="rounded-xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {greeting}, {userName}!
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1 capitalize">
                                {format(new Date(), 'EEEE, d. MMMM yyyy', { locale: currentLocale })}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button asChild size="sm">
                                <Link href={route('reservations.index')}>
                                    <CalendarPlus className="mr-2 h-4 w-4" />
                                    {t('Make Reservation')}
                                </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline">
                                <Link href={route('purchase.index')}>
                                    <Ticket className="mr-2 h-4 w-4" />
                                    {t('Buy Coupons')}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Membership unpaid warning */}
                {membership.is_member && !membership.membership_paid && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 px-4 py-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                {t('Membership fee unpaid')}
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                                {t('Your membership fee has not been paid yet. Please contact the club administration.')}
                            </p>
                        </div>
                    </div>
                )}

                {/* Admin stats */}
                {adminStats && (
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                                    <CalendarCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold leading-none">{adminStats.reservations_today}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{t('Reservations today')}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold leading-none">{adminStats.active_members}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{t('Active members')}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                                    <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold leading-none">{adminStats.active_horses}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{t('Active horses')}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Main 2-col layout */}
                <div className="flex flex-col lg:flex-row gap-4 items-start">

                    {/* Left: News (2/3) */}
                    <div className="w-full lg:w-2/3 space-y-4">
                        {news.length === 0 ? (
                            <div className="rounded-xl bg-muted/50 p-6 text-center text-muted-foreground italic">
                                {t('No news available.')}
                            </div>
                        ) : (
                            news.map((item) => (
                                <Card key={item.id} className="overflow-hidden">
                                    {item.images.length > 0 && (
                                        <Carousel
                                            plugins={item.images.length > 1 ? [Autoplay({ delay: 3000, stopOnInteraction: false })] : []}
                                            className="w-full"
                                        >
                                            <CarouselContent>
                                                {item.images.map((img, idx) => (
                                                    <CarouselItem key={idx}>
                                                        <div className="h-96 overflow-hidden">
                                                            <img
                                                                src={img.url}
                                                                alt={item.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            {item.images.length > 1 && (
                                                <>
                                                    <CarouselPrevious className="left-2" />
                                                    <CarouselNext className="right-2" />
                                                </>
                                            )}
                                        </Carousel>
                                    )}
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <h3 className="font-semibold text-lg leading-tight">{item.title}</h3>
                                            {item.published_at && (
                                                <span className="text-xs text-muted-foreground whitespace-nowrap mt-1">
                                                    {format(new Date(item.published_at), 'PP', { locale: currentLocale })}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {stripHtml(item.content)}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Right: Widgets (1/3) */}
                    <div className="w-full lg:w-1/3 space-y-4">

                        {/* Upcoming Reservations */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4" />
                                        {t('Upcoming Reservations')}
                                    </CardTitle>
                                    <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground">
                                        <Link href={route('reservations.index')}>
                                            {t('All')}
                                            <ChevronRight className="ml-1 h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                {reservations.length === 0 ? (
                                    <div className="text-center py-4 space-y-2">
                                        <p className="text-sm text-muted-foreground italic">{t('No upcoming reservations.')}</p>
                                        <Button asChild size="sm" variant="outline" className="mt-2">
                                            <Link href={route('reservations.index')}>
                                                <CalendarPlus className="mr-2 h-3.5 w-3.5" />
                                                {t('Make Reservation')}
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {reservations.map((res) => {
                                            const days = differenceInCalendarDays(
                                                new Date(res.reservation_date),
                                                new Date()
                                            );
                                            const { text: dayText, cls: dayCls } = dayLabel(days);
                                            return (
                                                <div
                                                    key={res.id}
                                                    className="flex gap-3 border-l-2 border-primary/40 pl-3 py-0.5"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-baseline justify-between gap-1">
                                                            <p className="text-sm font-medium capitalize truncate">
                                                                {format(new Date(res.reservation_date), 'EEE, d. MMM', { locale: currentLocale })}
                                                            </p>
                                                            <span className={cn('text-xs shrink-0', dayCls)}>
                                                                {dayText}
                                                            </span>
                                                        </div>
                                                        {res.appointment_name && (
                                                            <p className="text-xs text-muted-foreground truncate">{res.appointment_name}</p>
                                                        )}
                                                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                                            {(res.start_time || res.end_time) && (
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {res.start_time}{res.end_time ? ` – ${res.end_time}` : ''}
                                                                </span>
                                                            )}
                                                            {res.horse_name && (
                                                                <span className="text-xs text-muted-foreground">🐴 {res.horse_name}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Coupons */}
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Ticket className="h-4 w-4" />
                                        {t('My Coupons')}
                                    </CardTitle>
                                    <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground">
                                        <Link href={route('purchase.index')}>
                                            {t('Buy')}
                                            <ChevronRight className="ml-1 h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {coupons.length === 0 ? (
                                    <div className="text-center py-3 space-y-2">
                                        <p className="text-sm text-muted-foreground italic">{t('No coupons available.')}</p>
                                        <Button asChild size="sm" variant="outline">
                                            <Link href={route('purchase.index')}>
                                                <Ticket className="mr-2 h-3.5 w-3.5" />
                                                {t('Buy Coupons')}
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {coupons.map((coupon, idx) => (
                                            <div
                                                key={idx}
                                                className="flex flex-col items-center justify-center rounded-xl bg-primary/10 border border-primary/20 p-4 gap-1 w-[calc(50%-6px)]"
                                            >
                                                <span className="text-4xl font-extrabold text-primary leading-none">{coupon.balance}</span>
                                                <span className="text-xs text-muted-foreground text-center leading-tight mt-1">{coupon.type_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Horses */}
                        {horses.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <span className="text-base">🐴</span>
                                        {t('Horses')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Carousel
                                        className="w-full"
                                        plugins={horses.length > 1 ? [Autoplay({ delay: 3500, stopOnInteraction: false })] : []}
                                    >
                                        <CarouselContent>
                                            {horses.map((horse) => {
                                                const img = horse.images.find(i => i.is_primary) ?? horse.images[0] ?? null;
                                                return (
                                                    <CarouselItem key={horse.id}>
                                                        <div className="space-y-2">
                                                            {img ? (
                                                                <img
                                                                    src={img.url}
                                                                    alt={horse.name}
                                                                    className="w-full h-52 object-cover rounded-md"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-52 bg-muted rounded-md flex items-center justify-center">
                                                                    <ImageIcon className="h-10 w-10 text-muted-foreground opacity-20" />
                                                                </div>
                                                            )}
                                                            <div className="text-center pb-1">
                                                                <p className="font-medium">{horse.name}</p>
                                                                {horse.year && (
                                                                    <p className="text-xs text-muted-foreground">{horse.year}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CarouselItem>
                                                );
                                            })}
                                        </CarouselContent>
                                        {horses.length > 1 && (
                                            <>
                                                <CarouselPrevious className="left-0" />
                                                <CarouselNext className="right-0" />
                                            </>
                                        )}
                                    </Carousel>
                                </CardContent>
                            </Card>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
