CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial settings
INSERT INTO app_settings (key, value, description) VALUES
('contact_recipient_email', 'admin@example.com', 'Email where contact submissions are sent'),
('contact_whatsapp_number', '+1234567890', 'WhatsApp number for automated notifications'),
('google_spreadsheet_id', '', 'ID of the Google Sheet for lead storage')
ON CONFLICT (key) DO NOTHING;
