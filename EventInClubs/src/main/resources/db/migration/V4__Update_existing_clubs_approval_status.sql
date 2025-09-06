-- Update existing clubs to be APPROVED (since they were created before approval system)
UPDATE clubs SET approval_status = 'APPROVED' WHERE approval_status IS NULL OR approval_status = 'PENDING' OR approval_status = '';

-- Ensure all active clubs are approved
UPDATE clubs SET approval_status = 'APPROVED' WHERE is_active = true AND (approval_status IS NULL OR approval_status = '');
