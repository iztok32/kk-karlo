import { Config, RouteParam, RouteName } from 'ziggy-js';

export interface UserConfig {
    theme?: 'light' | 'dark';
    colorTheme?: string;
    language?: string;
    [key: string]: any;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    gsm_number?: string;
    avatar?: string;
    permissions?: string[];
    config?: UserConfig;
    // Profile fields
    address?: string;
    postal_code?: string;
    city?: string;
    date_of_birth?: string;
    username?: string;
    home_phone?: string;
    work_phone?: string;
    fax?: string;
    gsm_number_public: boolean;
    home_phone_public: boolean;
    work_phone_public: boolean;
    fax_public: boolean;
    horseman_type_id?: number;
    horseman_type?: HorsemanType;
    is_member: boolean;
    membership_paid: boolean;
    notify_free_slots: boolean;
}

export interface HorsemanType {
    id: number;
    name: string;
    display_order: number;
    is_active: boolean;
}

export interface NavigationItem {
    id: number;
    parent_id?: number | null;
    type: string;
    title_key: string;
    url?: string | null;
    icon?: string | null;
    metadata?: any;
    sort_order: number;
    is_active: boolean;
    permission?: string | null;
    children?: NavigationItem[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    locale: string;
    availableLocales: string[];
    availableColorThemes: string[];
    translations: Record<string, string>;
    navigation: {
        main: NavigationItem[];
        teams: NavigationItem[];
        projects: NavigationItem[];
    };
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
        permission_denied?: boolean;
    };
    horsemanTypes?: HorsemanType[];
};

declare global {
    function route(): { current: (name?: string, params?: any) => boolean };
    function route(
        name: RouteName,
        params?: RouteParam | undefined,
        absolute?: boolean,
        config?: Config,
    ): string;
}
