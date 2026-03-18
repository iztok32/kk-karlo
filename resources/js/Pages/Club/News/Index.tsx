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
import Editor from '@/Components/Editor';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { useForm, Head } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Check, X, Calendar } from 'lucide-react';
import { Switch } from '@/Components/ui/switch';
import { useTranslation } from '@/lib/i18n';
import { format, parseISO } from 'date-fns';
import { sl, enGB, hr, it, de } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Components/ui/popover"
import { Calendar as CalendarComponent } from "@/Components/ui/calendar"
import { cn } from "@/lib/utils"

interface News {
  id: number;
  title: string;
  content: string;
  published_at: string | null;
  end_date: string | null;
  is_on_auth_page: boolean;
  is_on_public_page: boolean;
  is_active: boolean;
}

interface Props {
  news: News[];
}

export default function Index({ news }: Props) {
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [newsToDelete, setNewsToDelete] = useState<News | null>(null);

  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    title: '',
    content: '',
    published_at: '',
    end_date: '',
    is_on_auth_page: false,
    is_on_public_page: false,
    is_active: true,
  });

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    return dateString;
  };

  const openAddDialog = () => {
    setEditingNews(null);
    reset();
    setData('published_at', new Date().toISOString());
    clearErrors();
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: News) => {
    setEditingNews(item);
    setData({
      title: item.title,
      content: item.content,
      published_at: formatDateForInput(item.published_at),
      end_date: formatDateForInput(item.end_date),
      is_on_auth_page: item.is_on_auth_page,
      is_on_public_page: item.is_on_public_page,
      is_active: item.is_active,
    });
    clearErrors();
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const options = {
      onSuccess: () => {
        setIsDialogOpen(false);
        reset();
      },
      preserveState: true,
      preserveScroll: true,
    };

    if (editingNews) {
      put(route('news.update', { news: editingNews.id }), options);
    } else {
      post(route('news.store'), options);
    }
  };

  const handleDelete = (item: News) => {
    setNewsToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (newsToDelete) {
      destroy(route('news.destroy', { news: newsToDelete.id }), {
        onSuccess: () => setIsDeleteDialogOpen(false),
      });
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
          {t('News Management')}
        </h2>
      }
    >
      <Head title={t('News')} />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">{t('News List')}</h3>
                <Button onClick={openAddDialog}>
                  <Plus className="mr-2 h-4 w-4" /> {t('Add News')}
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Title')}</TableHead>
                      <TableHead>{t('Published At')}</TableHead>
                      <TableHead>{t('Public')}</TableHead>
                      <TableHead>{t('Auth')}</TableHead>
                      <TableHead>{t('Active')}</TableHead>
                      <TableHead className="text-right">{t('Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {news.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          {t('No news found.')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      news.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>
                            {item.published_at ? format(new Date(item.published_at), 'Pp', { locale: currentLocale }) : '-'}
                          </TableCell>
                          <TableCell>
                            {item.is_on_public_page ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {item.is_on_auth_page ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {item.is_active ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingNews ? t('Edit News') : t('Add News')}</DialogTitle>
              <DialogDescription>
                {t('Fill in the details for the news article.')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="published_at">{t('Start Date')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !data.published_at && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {data.published_at ? format(new Date(data.published_at), "PPP", { locale: currentLocale }) : <span>{t('Pick a date')}</span>}
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
                  <Label htmlFor="end_date">{t('End Date')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !data.end_date && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {data.end_date ? format(new Date(data.end_date), "PPP", { locale: currentLocale }) : <span>{t('Pick a date')}</span>}
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('Cancel')}
              </Button>
              <Button type="submit" disabled={processing}>
                {editingNews ? t('Update') : t('Save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('Delete News')}</DialogTitle>
            <DialogDescription>
              {t('Are you sure you want to delete this news article?')} {t('This action will soft delete the record.')}
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
