import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import Editor from '@/Components/Editor';
import { Card, CardContent } from '@/Components/ui/card';
import { useForm, Head, Link, router } from '@inertiajs/react';
import React, { useState, useRef } from 'react';
import { Calendar, ArrowLeft, Upload, Trash2, Star, Images } from 'lucide-react';
import { Switch } from '@/Components/ui/switch';
import { useTranslation } from '@/lib/i18n';
import { format } from 'date-fns';
import { sl, enGB, hr, it, de } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/Components/ui/popover';
import { Calendar as CalendarComponent } from '@/Components/ui/calendar';
import { cn } from '@/lib/utils';

interface NewsImage {
  id: number;
  url: string;
  is_primary: boolean;
  display_order: number;
}

interface NewsItem {
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
  news: NewsItem;
}

export default function Edit({ news }: Props) {
  const { t, locale } = useTranslation();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const { data, setData, put, processing, errors } = useForm({
    title: news.title,
    content: news.content,
    published_at: news.published_at || '',
    end_date: news.end_date || '',
    is_on_auth_page: news.is_on_auth_page,
    is_on_public_page: news.is_on_public_page,
    is_active: news.is_active,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('news.update', news.id), { preserveScroll: true });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUploadImages = () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    Array.from(selectedFiles).forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });

    router.post(route('news.images.upload', news.id), formData, {
      onSuccess: () => {
        setSelectedFiles(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setUploading(false);
      },
      onError: () => setUploading(false),
      preserveScroll: true,
    });
  };

  const handleDeleteImage = (imageId: number) => {
    if (!window.confirm(t('Are you sure you want to delete this image?'))) return;
    router.delete(route('news.images.delete', imageId), { preserveScroll: true });
  };

  const handleSetPrimaryImage = (imageId: number) => {
    router.post(
      route('news.images.primary', { news: news.id, image: imageId }),
      {},
      { preserveScroll: true }
    );
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
          {t('Edit News')}
        </h2>
      }
    >
      <Head title={t('Edit News')} />

      <div className="py-12">
        <div className="mx-auto w-full sm:px-6 lg:px-8 space-y-6">

          {/* Form */}
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <Link href={route('news.index')}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('Back')}
                  </Button>
                </Link>
                <h3 className="text-lg font-medium">{news.title}</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="title">{t('Title')}</Label>
                  <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="content">{t('Content')}</Label>
                  <Editor
                    content={data.content}
                    onChange={(content) => setData('content', content)}
                    className={errors.content ? 'border-red-500' : ''}
                  />
                  {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="grid gap-2">
                    <Label>{t('Start Date')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'justify-start text-left font-normal',
                            !data.published_at && 'text-muted-foreground'
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {data.published_at
                            ? format(new Date(data.published_at), 'PPP', { locale: currentLocale })
                            : <span>{t('Pick a date')}</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={data.published_at ? new Date(data.published_at) : undefined}
                          onSelect={(date) => setData('published_at', date?.toISOString() || '')}
                          initialFocus
                          locale={currentLocale}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.published_at && <p className="text-sm text-red-500">{errors.published_at}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('End Date')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'justify-start text-left font-normal',
                            !data.end_date && 'text-muted-foreground'
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {data.end_date
                            ? format(new Date(data.end_date), 'PPP', { locale: currentLocale })
                            : <span>{t('Pick a date')}</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={data.end_date ? new Date(data.end_date) : undefined}
                          onSelect={(date) => setData('end_date', date?.toISOString() || '')}
                          initialFocus
                          locale={currentLocale}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_on_public_page"
                      checked={data.is_on_public_page}
                      onCheckedChange={(checked) => setData('is_on_public_page', checked)}
                    />
                    <Label htmlFor="is_on_public_page">{t('Show on Public Page')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_on_auth_page"
                      checked={data.is_on_auth_page}
                      onCheckedChange={(checked) => setData('is_on_auth_page', checked)}
                    />
                    <Label htmlFor="is_on_auth_page">{t('Show on Auth Page')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={data.is_active}
                      onCheckedChange={(checked) => setData('is_active', checked)}
                    />
                    <Label htmlFor="is_active">{t('Is Active')}</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Link href={route('news.index')}>
                    <Button type="button" variant="outline">
                      {t('Cancel')}
                    </Button>
                  </Link>
                  <Button type="submit" disabled={processing}>
                    {t('Update')}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Images */}
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Images className="h-5 w-5" />
                <h3 className="text-lg font-medium">{t('Images')}</h3>
                <span className="text-sm text-muted-foreground">({news.images.length})</span>
              </div>

              {/* Upload */}
              <div className="border-2 border-dashed rounded-lg p-4 mb-6">
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

              {/* Image Grid */}
              {news.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {news.images.map((image) => (
                    <Card key={image.id}>
                      <CardContent className="p-2">
                        <div className="relative">
                          <img
                            src={image.url}
                            alt={news.title}
                            className="w-full h-36 object-cover rounded-md"
                          />
                          {image.is_primary && (
                            <div className="absolute top-2 right-2 bg-yellow-400 rounded-full p-1">
                              <Star className="h-4 w-4 text-white fill-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-2 gap-2">
                          {!image.is_primary ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetPrimaryImage(image.id)}
                              className="flex-1"
                            >
                              <Star className="h-3 w-3 mr-1" />
                              {t('Set Primary')}
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground flex-1">{t('Primary')}</span>
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
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-4">
                  {t('No images uploaded yet.')}
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}
