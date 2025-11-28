# Database migrations
## Create Migrations
```
migrate create -ext=sql -dir=internal/database/migrations -seq init_schema
``` 

## Apply migrations
```
migrate -path internal/database/migrations -database db_connection_string up
``` 

## Rollback migrations
```
migrate -path internal/database/migrations -database db_connection_string down
``` 


# Required Tables

## Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL, -- student, instructor, admin, employee
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```


## Courses
```sql
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration VARCHAR(255) NOT NULL,
    rating INT NULL,
    image_url VARCHAR(255) NOT NULL,
    difficulty VARCHAR(255) NULL,
    course_url VARCHAR(255) NOT NULL,
    instructor_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id),
);
```

## Payment Plan
```sql
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
```

## Reviews
```sql
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
```

## Payments
```sql
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
```

