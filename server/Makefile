.PHONY: migrate dev test lint

migrate:
	@echo "Running database migrations..."
	go run internal/database/migrate/migrate.go

dev:
	go run cmd/main.go

frontend:
	cd ../client && npm run dev

test:
	go test -v ./...

lint:
	golangci-lint run
	go fmt ./...
