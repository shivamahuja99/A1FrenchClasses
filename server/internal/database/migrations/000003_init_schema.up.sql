CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Modify users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS type VARCHAR(255) NOT NULL DEFAULT 'student';

-- Changing ID to UUID
ALTER TABLE users DROP CONSTRAINT users_pkey CASCADE;
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE users ALTER COLUMN id TYPE UUID USING (gen_random_uuid());
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE users ADD PRIMARY KEY (id);

-- Modify courses table
ALTER TABLE courses RENAME COLUMN title TO name;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS rating INT NULL;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS difficulty VARCHAR(255) NULL;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_url VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_id UUID;

-- Handle courses ID
ALTER TABLE courses DROP CONSTRAINT courses_pkey CASCADE;
ALTER TABLE courses ALTER COLUMN id DROP DEFAULT;
ALTER TABLE courses ALTER COLUMN id TYPE UUID USING (gen_random_uuid());
ALTER TABLE courses ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE courses ADD PRIMARY KEY (id);

-- Create new tables
CREATE TABLE payment_plans (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    course_id UUID NOT NULL,
    duration VARCHAR(255) NOT NULL,
    discount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    course_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    transaction_amount DECIMAL(10, 2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    course_id UUID NOT NULL,
    transaction_method VARCHAR(255) NOT NULL,
    transaction_status VARCHAR(255) NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);