// src/types/suggestion.ts

export interface Suggestion {
    id: string;
    item: string;
    count: number;
    custom_thumb?: string;
    url_thumb?: string;
    url_background?: string;
}
