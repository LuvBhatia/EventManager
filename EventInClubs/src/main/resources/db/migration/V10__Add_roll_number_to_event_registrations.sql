-- Add roll_number column to event_registrations
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS roll_number VARCHAR(32);


