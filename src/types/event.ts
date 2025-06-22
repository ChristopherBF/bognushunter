// src/types/event.ts

export interface Event {
  id: string;
  date: string;
  created_by: string;
  created_at: string;
  starting_balance?: number;
  current_balance?: number;
  suggestions_count?: number;
  hunt_items_count?: number;
  open: boolean; // True if event is open, false if closed
}
