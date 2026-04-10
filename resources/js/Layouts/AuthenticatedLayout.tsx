import { AppSidebar } from '@/Components/app-sidebar';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import ThemeToggle from '@/Components/ThemeToggle';
import FlashMessages from '@/Components/FlashMessages';
import { useTranslation } from '@/lib/i18n';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/Components/ui/breadcrumb';
import { Separator } from '@/Components/ui/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/Components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/Components/ui/tooltip';
import { usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';
import { PageProps } from '@/types';
import { BadgeEuro } from 'lucide-react';

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { user } = usePage<PageProps>().props.auth;
    const { navigation } = usePage<PageProps>().props;
    const { t } = useTranslation();

    const couponBalances = user?.coupon_balances ?? [];
    const totalCoupons = couponBalances.reduce((sum, b) => sum + b.balance, 0);
    const hasCoupons = couponBalances.length > 0;

    return (
        <SidebarProvider>
            <AppSidebar user={user} navigation={navigation} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b dark:border-gray-800">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    {header ? (
                                        <BreadcrumbLink href="/dashboard">{t('Home')}</BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage>{t('Home')}</BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                                {header && (
                                    <>
                                        <BreadcrumbSeparator />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>{header}</BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </>
                                )}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex items-center gap-3 px-4">
                        {hasCoupons && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="relative flex items-center justify-center w-9 h-9 rounded-md hover:bg-muted transition-colors">
                                        <BadgeEuro className="w-5 h-5" />
                                        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[1.1rem] h-[1.1rem] rounded-full bg-primary text-primary-foreground text-[10px] font-bold leading-none px-0.5">
                                            {totalCoupons}
                                        </span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="end" className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                        {t('My coupons')}
                                    </p>
                                    {couponBalances.map(b => (
                                        <div key={b.id} className="flex items-center justify-between gap-4 text-sm">
                                            <span>{b.name}</span>
                                            <span className="font-semibold">{b.balance}</span>
                                        </div>
                                    ))}
                                </TooltipContent>
                            </Tooltip>
                        )}
                        <ThemeToggle />
                        <LanguageSwitcher />
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4">
                    <FlashMessages />
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
