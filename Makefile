.PHONY: dev dev-client dev-server install migrate test lint

dev:
	@echo "Starting both frontend and backend..."
	@make -j 2 dev-client dev-server

dev-client:
	@echo "Starting frontend..."
	cd client && npm run dev

dev-server:
	@echo "Starting backend..."
	cd server && go run cmd/main.go

install:
	@echo "Installing dependencies..."
	cd client && npm install
	cd server && go mod download

migrate:
	@echo "Running migrations..."
	cd server && make migrate

test:
	@echo "Running all tests..."
	cd client && npm test
	cd server && make test

lint:
	@echo "Linting codebase..."
	cd client && npm run lint
	cd server && make lint
