-- Add member attendance statuses column to team_registrations table
ALTER TABLE team_registrations ADD COLUMN IF NOT EXISTS member_attendance_statuses TEXT;
