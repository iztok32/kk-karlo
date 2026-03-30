export interface HorseImage {
    id: number;
    url: string;
    is_primary: boolean;
    display_order: number;
}

export interface Horse {
    id: number;
    name: string;
    year: number;
    display_order: number;
    is_active: boolean;
    images: HorseImage[];
}

export interface HorseFormData {
    name: string;
    year: number;
    is_active: boolean;
}
