import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent } from '@/Components/ui/card';
import { Trash2, Star, Upload } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { Horse } from '../types';
import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    horse: Horse | null;
}

export default function HorseImageManager({ isOpen, onClose, horse }: Props) {
    const { t } = useTranslation();
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFiles(e.target.files);
        }
    };

    const handleUploadImages = () => {
        if (!horse || !selectedFiles || selectedFiles.length === 0) return;

        setUploading(true);
        const formData = new FormData();

        Array.from(selectedFiles).forEach((file, index) => {
            formData.append(`images[${index}]`, file);
        });

        router.post(route('horses.images.upload', horse.id), formData, {
            onSuccess: () => {
                setSelectedFiles(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setUploading(false);
            },
            onError: () => {
                setUploading(false);
            },
            preserveScroll: true,
        });
    };

    const handleDeleteImage = (imageId: number) => {
        if (!window.confirm(t('Are you sure you want to delete this image?'))) return;

        router.delete(route('horses.images.delete', imageId), {
            preserveScroll: true,
        });
    };

    const handleSetPrimaryImage = (imageId: number) => {
        if (!horse) return;

        router.post(route('horses.images.primary', { horse: horse.id, image: imageId }), {}, {
            preserveScroll: true,
        });
    };

    const handleClose = () => {
        setSelectedFiles(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{t('Manage Images')} - {horse?.name}</DialogTitle>
                    <DialogDescription>
                        {t('Upload new images or manage existing ones.')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Upload Section */}
                    <div className="border-2 border-dashed rounded-lg p-4">
                        <Label htmlFor="images">{t('Upload Images')}</Label>
                        <Input
                            ref={fileInputRef}
                            id="images"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="mt-2"
                        />
                        {selectedFiles && selectedFiles.length > 0 && (
                            <div className="mt-2">
                                <p className="text-sm text-muted-foreground">
                                    {selectedFiles.length} {selectedFiles.length === 1 ? t('file') : t('files')} {t('selected')}
                                </p>
                                <Button
                                    onClick={handleUploadImages}
                                    disabled={uploading}
                                    className="mt-2"
                                    size="sm"
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    {uploading ? t('Uploading...') : t('Upload')}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Existing Images */}
                    {horse && horse.images && horse.images.length > 0 && (
                        <div>
                            <Label>{t('Current Images')}</Label>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                {horse.images.map((image) => (
                                    <Card key={image.id} className="relative">
                                        <CardContent className="p-2">
                                            <div className="relative">
                                                <img
                                                    src={image.url}
                                                    alt={horse.name}
                                                    className="w-full h-32 object-cover rounded-md"
                                                />
                                                {image.is_primary && (
                                                    <div className="absolute top-2 right-2 bg-yellow-400 rounded-full p-1">
                                                        <Star className="h-4 w-4 text-white fill-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center mt-2 gap-2">
                                                {!image.is_primary && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleSetPrimaryImage(image.id)}
                                                        className="flex-1"
                                                    >
                                                        <Star className="h-3 w-3 mr-1" />
                                                        {t('Set Primary')}
                                                    </Button>
                                                )}
                                                {image.is_primary && (
                                                    <span className="text-xs text-muted-foreground flex-1">
                                                        {t('Primary')}
                                                    </span>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteImage(image.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {horse && (!horse.images || horse.images.length === 0) && (
                        <p className="text-sm text-muted-foreground italic text-center py-4">
                            {t('No images uploaded yet.')}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={handleClose}>
                        {t('Close')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
