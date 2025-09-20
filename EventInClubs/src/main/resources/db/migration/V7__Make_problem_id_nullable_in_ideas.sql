-- Make problem_id nullable in ideas table to allow ideas for events without problems
ALTER TABLE ideas
ALTER COLUMN problem_id DROP NOT NULL;
