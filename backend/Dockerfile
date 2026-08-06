FROM golang:1.23.10-alpine AS builder
# Set working directory
WORKDIR /app

ENV GIN_MODE=release
ENV SERVE_PORT=8080

# Copy the source code into the container
COPY go.mod go.sum ./
ENV GOPROXY=https://proxy.golang.org,direct
# Download dependencies
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the application
RUN go build -o server ./main.go

# -----
FROM alpine:3.22.0 AS runner
WORKDIR /app

# Copy the built binary from builder
COPY --from=builder /app/server .

# Expose the port
EXPOSE 8080

# Run the binaryÊ
CMD ["./server"]
