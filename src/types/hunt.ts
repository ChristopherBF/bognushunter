// Canonical HuntItem type for Bognus Hunter

export interface HuntItem {
  id: string;
  event_id: string;
  suggestion_id: string;
  wager: number;
  result: number;
  bonus: boolean;
  super_bonus: boolean;
  completed: boolean;
  active: boolean;
  custom_thumb?: string | null;
  url_background?: string | null;
  item?: string; // Populated after joining with suggestions
  current_balance?: number;
}

// Minimal preview type for UI components that only need a subset
export interface HuntItemPreview {
  id: string;
  item: string;
  active: boolean;
  custom_thumb?: string | null;
  url_background?: string | null;
  wager?: number;
  result?: number;
  bonus?: boolean;
  super_bonus?: boolean;
  completed?: boolean;
  current_balance?: number;
}
