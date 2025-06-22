// src/types/payloads.ts

export interface HuntItemPayload {
  new: {
    id?: string;
    event_id?: string;
    suggestion_id?: string;
    item?: string;
    wager?: number;
    result?: number;
    bonus?: boolean;
    super_bonus?: boolean;
    completed?: boolean;
    created_at?: string;
  };
}

export interface SuggestionPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: {
    id?: string;
    event_id?: string;
    item?: string;
    count?: number;
    created_at?: string;
    custom_thumb?: string;
    url_thumb?: string;
    url_background?: string;
  };
  old?: {
    id?: string;
    event_id?: string;
    item?: string;
  };
}

export type SubscriptionCallback<T> = (payload: T) => void;
