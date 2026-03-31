import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/Components/ui/carousel';
import { Pencil, Trash2, Image as ImageIcon, Star, Globe, Lock } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { sl, enGB, hr, it, de } from 'date-fns/locale';

interface NewsImage {
    id: number;
    url: string;
    is_primary: boolean;
    display_order: number;
}

interface News {
    id: number;
    title: string;
    content: string;
    published_at: string | null;
    end_date: string | null;
    is_on_auth_page: boolean;
    is_on_public_page: boolean;
    is_active: boolean;
    images: NewsImage[];
}

interface Props {
    news: News[];
    locale: string;
    onDelete: (item: News) => void;
}

export default function NewsCardView({ news, locale, onDelete }: Props) {
    const { t } = useTranslation();

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

    if (news.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground italic">
                {t('No news found.')}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {news.map((item) => (
                <Card key={item.id} className="flex flex-col overflow-hidden">
                    {/* Image Carousel */}
                    <div className="relative h-48 bg-muted">
                        {item.images && item.images.length > 0 ? (
                            <Carousel className="w-full h-full">
                                <CarouselContent>
                                    {item.images.map((image) => (
                                        <CarouselItem key={image.id}>
                                            <div className="relative h-48">
                                                <img
                                                    src={image.url}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                {image.is_primary && (
                                                    <div className="absolute top-2 right-2 bg-yellow-400 rounded-full p-1.5">
                                                        <Star className="h-4 w-4 text-white fill-white" />
                                                    </div>
                                                )}
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
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center text-muted-foreground">
                                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">{t('No images')}</p>
                                </div>
                            </div>
                        )}

                        {item.images && item.images.length > 0 && (
                            <div className="absolute bottom-2 left-2">
                                <Badge variant="secondary" className="bg-black/70 text-white border-0">
                                    <ImageIcon className="h-3 w-3 mr-1" />
                                    {item.images.length}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Card Content */}
                    <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-base leading-tight line-clamp-2 flex-1">{item.title}</h3>
                            <Badge variant={item.is_active ? 'default' : 'secondary'} className="shrink-0">
                                {item.is_active ? t('Active') : t('Inactive')}
                            </Badge>
                        </div>
                        {item.published_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(item.published_at), 'PP', { locale: currentLocale })}
                            </p>
                        )}
                    </CardHeader>

                    <CardContent className="pb-2 flex-1">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className={`flex items-center gap-1 ${item.is_on_public_page ? 'text-green-600' : ''}`}>
                                <Globe className="h-3 w-3" />
                                {t('Public')}
                            </span>
                            <span className={`flex items-center gap-1 ${item.is_on_auth_page ? 'text-green-600' : ''}`}>
                                <Lock className="h-3 w-3" />
                                {t('Auth')}
                            </span>
                        </div>
                    </CardContent>

                    {/* Actions */}
                    <CardFooter className="pt-0 mt-auto border-t">
                        <div className="flex gap-2 w-full pt-3">
                            <Link href={route('news.edit', item.id)} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full">
                                    <Pencil className="h-4 w-4 mr-1" />
                                    {t('Edit')}
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => onDelete(item)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
