-- Remove external_link column from events table
ALTER TABLE events DROP COLUMN IF EXISTS external_link;
