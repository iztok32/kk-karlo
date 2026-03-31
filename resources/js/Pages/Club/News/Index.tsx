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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { router, Head, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import { Pencil, Trash2, Plus, Check, X, Search, ImageOff, LayoutList, LayoutGrid } from 'lucide-react';
import { Switch } from '@/Components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/tooltip';
import { useTranslation } from '@/lib/i18n';
import { format } from 'date-fns';
import { sl, enGB, hr, it, de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import NewsCardView from './Partials/NewsCardView';

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<News | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showActive, setShowActive] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filteredNews = news.filter(item => {
    const matchesStatus = item.is_active === showActive;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleDelete = (item: News) => {
    setNewsToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!newsToDelete) return;
    setDeleting(true);
    router.delete(route('news.destroy', { news: newsToDelete.id }), {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setDeleting(false);
      },
      onError: () => setDeleting(false),
    });
  };

  const getPrimaryImage = (item: News) => {
    return item.images.find(img => img.is_primary) ?? item.images[0] ?? null;
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
        <div className="mx-auto w-full sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">{t('News List')}</h3>
                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('Search news...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative inline-flex items-center">
                        <Switch
                          checked={showActive}
                          onCheckedChange={setShowActive}
                          className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
                        />
                        <X className={cn(
                          'pointer-events-none absolute left-1 h-3 w-3 text-white transition-opacity duration-200',
                          showActive ? 'opacity-0' : 'opacity-100'
                        )} />
                        <Check className={cn(
                          'pointer-events-none absolute right-1 h-3 w-3 text-white transition-opacity duration-200',
                          showActive ? 'opacity-100' : 'opacity-0'
                        )} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {t('Show active/inactive news')}
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex items-center border rounded-md">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === 'table' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('table')}
                          className="rounded-r-none"
                        >
                          <LayoutList className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('Table View')}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === 'cards' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('cards')}
                          className="rounded-l-none"
                        >
                          <LayoutGrid className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('Card View')}</TooltipContent>
                    </Tooltip>
                  </div>
                  <Link href={route('news.create')}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> {t('Add News')}
                    </Button>
                  </Link>
                </div>
              </div>

              {viewMode === 'table' ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]"></TableHead>
                        <TableHead>{t('Title')}</TableHead>
                        <TableHead>{t('Published At')}</TableHead>
                        <TableHead className="w-[100px] text-center">{t('Public')}</TableHead>
                        <TableHead className="w-[100px] text-center">{t('Auth')}</TableHead>
                        <TableHead className="w-[100px] text-center">{t('Active')}</TableHead>
                        <TableHead className="w-[100px] text-center">{t('Actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNews.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-muted-foreground italic">
                            {searchTerm
                              ? t('No news found matching ":search".', { search: searchTerm })
                              : (showActive ? t('No active news found.') : t('No inactive news found.'))}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredNews.map((item) => {
                          const primaryImage = getPrimaryImage(item);
                          return (
                            <TableRow key={item.id}>
                              <TableCell className="p-2">
                                {primaryImage ? (
                                  <img
                                    src={primaryImage.url}
                                    alt={item.title}
                                    className="w-12 h-12 object-cover rounded-md"
                                  />
                                ) : (
                                  <div className="w-12 h-12 flex items-center justify-center rounded-md bg-muted">
                                    <ImageOff className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="font-medium">{item.title}</TableCell>
                              <TableCell>
                                {item.published_at ? format(new Date(item.published_at), 'PP', { locale: currentLocale }) : '-'}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-center">
                                  {item.is_on_public_page ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <X className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-center">
                                  {item.is_on_auth_page ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <X className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-center">
                                  {item.is_active ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <X className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="w-[100px] text-right">
                                <Link href={route('news.edit', item.id)}>
                                  <Button variant="ghost" size="icon">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </Link>
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
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <NewsCardView
                  news={filteredNews}
                  locale={locale}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        </div>
      </div>

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
              disabled={deleting}
            >
              {t('Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  );
}
