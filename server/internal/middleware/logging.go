package middleware

import (
	"log/slog"
	"net/http"
	"time"

	"go.opentelemetry.io/otel/trace"
)

// responseWriter is a wrapper around http.ResponseWriter that captures the status code.
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

// LoggingMiddleware returns a middleware that logs each request.
func LoggingMiddleware(logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()

			// Wrap the ResponseWriter to capture the status code
			rw := &responseWriter{w, http.StatusOK}

			// Capture trace information if available
			span := trace.SpanFromContext(r.Context())
			var traceID string
			if span.SpanContext().HasTraceID() {
				traceID = span.SpanContext().TraceID().String()
			}

			// Process the request
			next.ServeHTTP(rw, r)

			// Log the request completion
			duration := time.Since(start)

			attrs := []slog.Attr{
				slog.String("method", r.Method),
				slog.String("path", r.URL.Path),
				slog.String("remote_addr", r.RemoteAddr),
				slog.Int("status", rw.statusCode),
				slog.Duration("duration", duration),
			}

			if traceID != "" {
				attrs = append(attrs, slog.String("trace_id", traceID))
			}

			logger.LogAttrs(r.Context(), slog.LevelInfo, "request completed", attrs...)
		})
	}
}
