import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import Editor from '@/Components/Editor';
import { useForm, Head, Link } from '@inertiajs/react';
import React from 'react';
import { Calendar, ArrowLeft } from 'lucide-react';
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

export default function Create() {
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

  const { data, setData, post, processing, errors } = useForm({
    title: '',
    content: '',
    published_at: new Date().toISOString(),
    end_date: '',
    is_on_auth_page: false,
    is_on_public_page: false,
    is_active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('news.store'));
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
          {t('Add News')}
        </h2>
      }
    >
      <Head title={t('Add News')} />

      <div className="py-12">
        <div className="mx-auto w-full sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <Link href={route('news.index')}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('Back')}
                  </Button>
                </Link>
                <h3 className="text-lg font-medium">{t('New News Article')}</h3>
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
                    {t('Save and Continue')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
