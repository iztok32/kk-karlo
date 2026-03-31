import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { format } from 'date-fns';
import { sl, enGB, hr, it, de } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/Components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Ticket, CalendarDays, Image as ImageIcon, Clock } from 'lucide-react';

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

interface Props {
    news: NewsItem[];
    coupons: CouponBalance[];
    reservations: ReservationItem[];
    horses: HorseItem[];
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export default function Dashboard({ news, coupons, reservations, horses }: Props) {
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

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Dashboard')}
                </h2>
            }
        >
            <Head title={t('Dashboard')} />

            <div className="p-4 pt-0">
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

                        {/* Coupons */}
                        <Card>
                            <CardHeader className="pb-2 items-center">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Ticket className="h-4 w-4" />
                                    {t('My Coupons')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {coupons.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic text-center">{t('No coupons available.')}</p>
                                ) : (
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {coupons.map((coupon, idx) => (
                                            <div key={idx} className="flex flex-col items-center justify-center rounded-xl bg-primary/10 border border-primary/20 p-4 gap-1 w-[calc(50%-6px)]">
                                                <span className="text-4xl font-extrabold text-primary leading-none">{coupon.balance}</span>
                                                <span className="text-xs text-muted-foreground text-center leading-tight mt-1">{coupon.type_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Upcoming Reservations */}
                        <Card>
                            <CardHeader className="pb-3 items-center">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    {t('Upcoming Reservations')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {reservations.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic text-center">{t('No upcoming reservations.')}</p>
                                ) : (
                                    <div className="space-y-3">
                                        {reservations.map((res) => (
                                            <div key={res.id} className="flex flex-col items-center border-b last:border-b-0 pb-3 last:pb-0 text-center">
                                                <p className="text-sm font-semibold">
                                                    {format(new Date(res.reservation_date), 'PP', { locale: currentLocale })}
                                                </p>
                                                {res.appointment_name && (
                                                    <p className="text-xs text-muted-foreground">{res.appointment_name}</p>
                                                )}
                                                {(res.start_time || res.end_time) && (
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                        <Clock className="h-3 w-3" />
                                                        {res.start_time}{res.end_time ? ` – ${res.end_time}` : ''}
                                                    </p>
                                                )}
                                                {res.horse_name && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">{res.horse_name}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Horses */}
                        <Card>
                            <CardHeader className="pb-3 items-center">
                                <CardTitle className="text-base">{t('Horses')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {horses.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">{t('No horses available.')}</p>
                                ) : (
                                    <Carousel className="w-full" plugins={horses.length > 1 ? [Autoplay({ delay: 3000, stopOnInteraction: false })] : []}>
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
                                                                    className="w-full h-64 object-cover rounded-md"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-64 bg-muted rounded-md flex items-center justify-center">
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
                                )}
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
