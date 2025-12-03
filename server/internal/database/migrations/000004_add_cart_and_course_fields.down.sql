-- Drop cart_items table
DROP TABLE IF EXISTS cart_items;

-- Drop carts table
DROP TABLE IF EXISTS carts;

-- Remove new fields from courses table
ALTER TABLE courses DROP COLUMN IF EXISTS num_lectures;
ALTER TABLE courses DROP COLUMN IF EXISTS start_date;
ALTER TABLE courses DROP COLUMN IF EXISTS end_date;
ALTER TABLE courses DROP COLUMN IF EXISTS class_timing;
