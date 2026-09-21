# Stage 1: Build binary
FROM golang:alpine AS builder

WORKDIR /app

ENV GOTOOLCHAIN=auto

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code and compile static binary for Linux
COPY . .
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server ./cmd/api

# Stage 2: Minimalist runtime image
FROM alpine:latest

# Install CA certificates for HTTPS (Midtrans API) & timezone data
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]