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
import { Pencil, Trash2, Image as ImageIcon, Star, Calendar } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { Horse } from '../types';

interface Props {
    horses: Horse[];
    onEdit: (horse: Horse) => void;
    onDelete: (horse: Horse) => void;
    onManageImages: (horse: Horse) => void;
}

export default function HorseCardView({ horses, onEdit, onDelete, onManageImages }: Props) {
    const { t } = useTranslation();

    if (horses.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground italic">
                {t('No horses found.')}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {horses.map((horse) => (
                <Card key={horse.id} className="flex flex-col overflow-hidden">
                    {/* Image Carousel */}
                    <div className="relative h-48 bg-muted">
                        {horse.images && horse.images.length > 0 ? (
                            <Carousel className="w-full h-full">
                                <CarouselContent>
                                    {horse.images.map((image) => (
                                        <CarouselItem key={image.id}>
                                            <div className="relative h-48">
                                                <img
                                                    src={image.url}
                                                    alt={horse.name}
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
                                {horse.images.length > 1 && (
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

                        {/* Image Counter Badge */}
                        {horse.images && horse.images.length > 0 && (
                            <div className="absolute bottom-2 left-2">
                                <Badge variant="secondary" className="bg-black/70 text-white border-0">
                                    <ImageIcon className="h-3 w-3 mr-1" />
                                    {horse.images.length}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Card Content */}
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg truncate">{horse.name}</h3>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{horse.year}</span>
                                </div>
                            </div>
                            <Badge variant={horse.is_active ? "default" : "secondary"}>
                                {horse.is_active ? t('Active') : t('Inactive')}
                            </Badge>
                        </div>
                    </CardHeader>

                    {/* Card Footer with Actions */}
                    <CardFooter className="pt-0 mt-auto border-t">
                        <div className="flex gap-2 w-full pt-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => onManageImages(horse)}
                            >
                                <ImageIcon className="h-4 w-4 mr-1" />
                                {t('Images')}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(horse)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => onDelete(horse)}
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
