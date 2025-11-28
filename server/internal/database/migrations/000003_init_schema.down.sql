-- Drop new tables
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS payment_plans;

-- Revert courses table changes (Best effort)
ALTER TABLE courses DROP COLUMN IF EXISTS instructor_id;
ALTER TABLE courses DROP COLUMN IF EXISTS course_url;
ALTER TABLE courses DROP COLUMN IF EXISTS difficulty;
ALTER TABLE courses DROP COLUMN IF EXISTS image_url;
ALTER TABLE courses DROP COLUMN IF EXISTS rating;
ALTER TABLE courses DROP COLUMN IF EXISTS duration;
ALTER TABLE courses RENAME COLUMN name TO title;

-- Revert users table changes (Best effort)
ALTER TABLE users DROP COLUMN IF EXISTS type;
ALTER TABLE users DROP COLUMN IF EXISTS mobile_number;

-- Note: We are NOT reverting the ID types from UUID back to SERIAL as it is lossy and complex.
-- If a full revert is needed, it's better to reset the database.
