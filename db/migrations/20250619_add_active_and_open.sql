-- Migration: Add 'active' to hunt_items and 'open' to suggestion_events
ALTER TABLE hunt_items ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
ALTER TABLE suggestion_events ADD COLUMN IF NOT EXISTS open boolean DEFAULT true;
