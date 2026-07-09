# Stage 1: Build Go static binary
FROM golang:1.22-alpine@sha256:1699c10032ca2582ec89a24a1312d986a3f094aed3d5c1147b19880afe40e052 AS builder
WORKDIR /app

# Copy dependency definition and source code
COPY go.mod ./
COPY main.go ./

# Build statically linked binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o it-asset-manager .

# Stage 2: Final runner image
FROM alpine:3.24.1@sha256:28bd5fe8b56d1bd048e5babf5b10710ebe0bae67db86916198a6eec434943f8b
RUN apk --no-cache add ca-certificates \
    && addgroup -S appgroup \
    && adduser -S appuser -G appgroup

WORKDIR /app

# Copy compiled binary, web-ui static files
COPY --from=builder --chown=appuser:appgroup /app/it-asset-manager .
COPY --chown=appuser:appgroup web-ui ./web-ui

# Create data directory and set permissions for appuser
RUN mkdir -p /app/data && chown -R appuser:appgroup /app/data

USER appuser

EXPOSE 8000

CMD ["./it-asset-manager"]
