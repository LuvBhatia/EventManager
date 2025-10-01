-- Add event_id column to ideas table
ALTER TABLE ideas
ADD COLUMN event_id BIGINT NOT NULL;

-- Add foreign key constraint
ALTER TABLE ideas
ADD CONSTRAINT fk_idea_event
FOREIGN KEY (event_id) REFERENCES events(id);

-- Create index for better query performance
CREATE INDEX idx_ideas_event_id ON ideas(event_id);
