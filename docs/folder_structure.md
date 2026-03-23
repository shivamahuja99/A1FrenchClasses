# Folder Structure

This document provides an overview of the directory structure for the A1FrenchClasses project.

## Root Directory
- `/client`: Frontend application (React + Vite).
- `/server`: Backend application (Go).
- `/rules`: Project-specific rules and documentation patterns.
- `/docs`: Project documentation (this folder).
- `README.md`: Basic project information and setup instructions.

## Frontend (`/client`)
- `/src`: Main source code.
    - `/assets`: Images, fonts, and other static assets.
    - `/components`: Reusable UI components.
    - `/config`: Configuration files (e.g., API endpoints).
    - `/controllers`: Custom hooks for data fetching and business logic (following MVC-like pattern).
    - `/hooks`: General React hooks.
    - `/services`: API client and external service integrations.
    - `/store`: State management (Redux/Zustand).
    - `/styles`: Global styles and CSS variables.
    - `/test`: Test utility files.
    - `/utils`: Helper functions and constants.
    - `/views`: Main page components.
- `public/`: Static files served directly.
    - `data/`: JSON files acting as models/mock data.

## Backend (`/server`)
- `/cmd`: Entry points and service handlers.
    - `main.go`: Main server initialization and routing.
    - `/services`: Domain-specific handlers (e.g., `payments`, `courses`, `users`).
- `/internal`: Private implementation details.
    - `/auth`: Authentication middleware and logic.
    - `/database`: Database connection and initialization.
    - `/middleware`: HTTP middleware (CORS, Auth).
    - `/models`: GORM database models.
    - `/paypal`: PayPal API client.
    - `/repository`: Data access layer (Postgres repositories).
- `go.mod` / `go.sum`: Go dependency management.
- `.env`: Environment variables.
