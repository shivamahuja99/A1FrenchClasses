ALTER TABLE courses
ADD COLUMN IF NOT EXISTS this_includes JSONB NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'courses' AND column_name = 'includes'
    ) THEN
        EXECUTE 'UPDATE courses SET this_includes = COALESCE(includes, ''[]''::jsonb) WHERE this_includes = ''[]''::jsonb';
    END IF;
END $$;

INSERT INTO app_settings (key, value, description) VALUES
('homepage_faq', '[]', 'Homepage FAQ items as JSON array'),
('homepage_testimonials', '[]', 'Homepage testimonials as JSON array'),
('homepage_why_us', '[]', 'Homepage Why Us items as JSON array')
ON CONFLICT (key) DO NOTHING;
