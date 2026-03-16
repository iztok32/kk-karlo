import { useEffect, useState } from 'react';
import { Switch } from '@/Components/ui/switch';
import { useTranslation } from '@/lib/i18n';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const { t } = useTranslation();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (
            theme === 'dark' ||
            (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = (checked: boolean) => {
        setIsDark(checked);
        if (checked) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <div className="flex items-center">
            <div className="relative inline-flex items-center">
                <Switch
                    checked={isDark}
                    onCheckedChange={toggleTheme}
                    aria-label={t('Toggle theme')}
                    className="data-[state=checked]:bg-slate-700 data-[state=unchecked]:bg-slate-200"
                />
                <Sun className={`pointer-events-none absolute left-1 h-3 w-3 text-orange-500 transition-opacity duration-200 ${isDark ? 'opacity-0' : 'opacity-100'}`} />
                <Moon className={`pointer-events-none absolute right-1 h-3 w-3 text-blue-400 transition-opacity duration-200 ${isDark ? 'opacity-100' : 'opacity-0'}`} />
            </div>
        </div>
    );
}
