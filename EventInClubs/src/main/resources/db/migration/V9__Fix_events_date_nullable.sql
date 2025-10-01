-- Make end_date nullable in events table
-- This is needed because events can be created as proposals without end dates initially

ALTER TABLE events ALTER COLUMN end_date DROP NOT NULL;

-- Update the status check constraint to include new status values
-- First drop the old constraint
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;

-- Add the updated constraint with all status values including new approval workflow statuses
ALTER TABLE events ADD CONSTRAINT events_status_check 
    CHECK (status IN (
        'DRAFT',
        'PENDING_APPROVAL',
        'APPROVED',
        'REJECTED',
        'PUBLISHED',
        'REGISTRATION_CLOSED',
        'ONGOING',
        'COMPLETED',
        'CANCELLED'
    ));
