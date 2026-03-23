# Implementation Details

This document provides technical details about the A1FrenchClasses implementation.

## Tech Stack

### Frontend
- **Framework**: React 19+
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (and CSS Modules)
- **State Management**: React `useState` / `useEffect` (Redux/Zustand if applicable).
- **Routing**: `react-router-dom` v7+

### Backend
- **Language**: Go 1.24+
- **Router**: `gorilla/mux`
- **ORM**: `gorm.io/gorm` with Postgres driver.
- **Database**: PostgreSQL (Supabase/Railway).
- **Authentication**: JWT and Google OAuth.
- **Payment Gateway**: PayPal.

## Architecture

### Frontend (MVC-like)
- **Model**: Data stored in `public/data/` (mock/JSON) or fetched from backend models.
- **View**: React components in `src/views/` and `src/components/`.
- **Controller**: Custom hooks in `src/controllers/` that handle business logic and data fetching.

### Backend (Layered Architecture)
- **Handlers**: Located in `server/cmd/services/`. Responsible for HTTP request parsing and calling repositories.
- **Repository**: Located in `server/internal/repository/`. Responsible for database interactions via GORM.
- **Models**: Located in `server/internal/models/`. GORM structs defining the database schema.
- **Internal**: Shared logic like Auth, Database connection, and External Clients (PayPal) in `server/internal/`.

## Core Logic

### Authentication
- Google OAuth for single-click signup/login.
- Email/Password login.
- JWT-based session management with refresh tokens.

### Data Fetching
- Frontend uses custom hooks to fetch data from either the backend API or local JSON files (for static content).

### Error Handling
- Consistent error responses from the backend.
- Frontend components handle loading, error, and empty states.
