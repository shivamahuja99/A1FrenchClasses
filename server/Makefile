.PHONY: migrate dev test lint

migrate:
	@echo "Running database migrations..."
	go run internal/database/migrate/migrate.go

dev:
	go run cmd/main.go

test:
	go test -v ./...

lint:
	golangci-lint run
	go fmt ./...
