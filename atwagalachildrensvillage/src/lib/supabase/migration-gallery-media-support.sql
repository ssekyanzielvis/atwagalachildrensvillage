-- Add media type support to gallery for both images and videos

-- Add media_type column to gallery table
ALTER TABLE gallery 
ADD COLUMN IF NOT EXISTS media_type VARCHAR(10) DEFAULT 'image' CHECK (media_type IN ('image', 'video'));

-- Rename image_url to media_url for clarity
ALTER TABLE gallery 
RENAME COLUMN image_url TO media_url;

-- Update existing records to have media_type = 'image' if not set
UPDATE gallery 
SET media_type = 'image' 
WHERE media_type IS NULL;

-- Add comment to table
COMMENT ON COLUMN gallery.media_type IS 'Type of media: image or video';
COMMENT ON COLUMN gallery.media_url IS 'URL to the media file (image or video)';
