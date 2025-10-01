-- Fix existing clubs data
-- Update Design Thinking to be APPROVED since it's active
UPDATE clubs SET approval_status = 'APPROVED' WHERE id = 2 AND name = 'Design Thinking';

-- Delete coding ninjas cuiet since user wants to test registration process again
DELETE FROM clubs WHERE id = 3 AND name = 'coding ninjas cuiet';

-- Update any remaining clubs with null approval_status
UPDATE clubs SET approval_status = 'APPROVED' WHERE approval_status IS NULL AND is_active = true;
UPDATE clubs SET approval_status = 'REJECTED' WHERE approval_status IS NULL AND is_active = false;
