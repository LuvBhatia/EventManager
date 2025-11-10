-- Add hall_name column to events table to store hall name directly
ALTER TABLE events ADD COLUMN IF NOT EXISTS hall_name VARCHAR(255);
