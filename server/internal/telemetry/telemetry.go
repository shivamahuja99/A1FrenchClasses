package telemetry

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"time"

	"go.opentelemetry.io/contrib/bridges/otelslog"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
	"go.opentelemetry.io/otel/log/global"
	"go.opentelemetry.io/otel/sdk/log"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
)

const (
	serviceName    = "a1-french-classes-server"
	serviceVersion = "1.0.0"
)

var loggerProvider *log.LoggerProvider

// InitLogger initializes the OpenTelemetry LoggerProvider and sets up an OTLP exporter.
func InitLogger(ctx context.Context) (*slog.Logger, func(), error) {
	// Create resource
	res, err := resource.New(ctx,
		resource.WithAttributes(
			semconv.ServiceName(serviceName),
			semconv.ServiceVersion(serviceVersion),
			semconv.DeploymentEnvironment(os.Getenv("ENV")),
		),
	)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create OTel resource: %w", err)
	}

	// Prepare OTLP HTTP exporter options
	var exporterOpts []otlploghttp.Option

	// Handle Axiom specific configuration if present
	axiomToken := os.Getenv("AXIOM_API_TOKEN")
	axiomDataset := os.Getenv("AXIOM")

	if axiomToken != "" {
		headers := make(map[string]string)
		headers["Authorization"] = "Bearer " + axiomToken
		if axiomDataset != "" {
			headers["X-Axiom-Dataset"] = axiomDataset
		}
		exporterOpts = append(exporterOpts, otlploghttp.WithHeaders(headers))

		// Standard Axiom OTLP/HTTP configuration
		// If no endpoint is specified, default to Axiom's OTLP endpoint
		if os.Getenv("OTEL_EXPORTER_OTLP_LOGS_ENDPOINT") == "" && os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT") == "" {
			exporterOpts = append(exporterOpts, otlploghttp.WithEndpoint("api.axiom.co"))
			exporterOpts = append(exporterOpts, otlploghttp.WithURLPath("/v1/logs"))
		}
	}

	// Create OTLP exporter
	exporter, err := otlploghttp.New(ctx, exporterOpts...)
	if err != nil {
		// If exporter fails (e.g. no endpoint), we still want to log to stdout
		fmt.Fprintf(os.Stderr, "Warning: OTel exporter failed to initialize (logs will only go to stdout): %v\n", err)
		exporter = nil
	}

	// Create LoggerProvider
	var options []log.LoggerProviderOption
	options = append(options, log.WithResource(res))
	if exporter != nil {
		options = append(options, log.WithProcessor(log.NewBatchProcessor(exporter)))
	}

	loggerProvider = log.NewLoggerProvider(options...)
	global.SetLoggerProvider(loggerProvider)

	// Create slog logger with OTel bridge
	otellHandler := otelslog.NewHandler(serviceName)

	// Default slog handler for stdout (JSON or Text)
	var stdoutHandler slog.Handler
	if os.Getenv("ENV") == "production" {
		stdoutHandler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})
	} else {
		stdoutHandler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug})
	}

	// Use a fan-out handler to log to both
	combinedHandler := &fanOutHandler{
		handlers: []slog.Handler{stdoutHandler, otellHandler},
	}

	logger := slog.New(combinedHandler)
	slog.SetDefault(logger)

	shutdown := func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := loggerProvider.Shutdown(ctx); err != nil {
			fmt.Fprintf(os.Stderr, "Error shutting down LoggerProvider: %v\n", err)
		}
	}

	return logger, shutdown, nil
}

type fanOutHandler struct {
	handlers []slog.Handler
}

func (h *fanOutHandler) Enabled(ctx context.Context, level slog.Level) bool {
	for _, handler := range h.handlers {
		if handler.Enabled(ctx, level) {
			return true
		}
	}
	return false
}

func (h *fanOutHandler) Handle(ctx context.Context, record slog.Record) error {
	for _, handler := range h.handlers {
		if err := handler.Handle(ctx, record); err != nil {
			// Continue to other handlers even if one fails
			continue
		}
	}
	return nil
}

func (h *fanOutHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	newHandlers := make([]slog.Handler, len(h.handlers))
	for i, handler := range h.handlers {
		newHandlers[i] = handler.WithAttrs(attrs)
	}
	return &fanOutHandler{handlers: newHandlers}
}

func (h *fanOutHandler) WithGroup(name string) slog.Handler {
	newHandlers := make([]slog.Handler, len(h.handlers))
	for i, handler := range h.handlers {
		newHandlers[i] = handler.WithGroup(name)
	}
	return &fanOutHandler{handlers: newHandlers}
}
