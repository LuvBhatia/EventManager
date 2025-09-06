-- Add approval_status column to clubs table
ALTER TABLE clubs ADD COLUMN approval_status VARCHAR(20) DEFAULT 'APPROVED';

-- Update existing clubs to be APPROVED (since they were created before approval system)
UPDATE clubs SET approval_status = 'APPROVED' WHERE approval_status IS NULL OR approval_status = 'PENDING';

-- Add constraint to ensure only valid status values
ALTER TABLE clubs ADD CONSTRAINT chk_approval_status 
    CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED'));
