ALTER TABLE courses
DROP COLUMN IF EXISTS this_includes;

DELETE FROM app_settings
WHERE key IN ('homepage_faq', 'homepage_testimonials', 'homepage_why_us');
