# Build Stage 1: Vue Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Build Stage 2: Go Backend
FROM golang:1.24-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/ .
# Use -mod=vendor to build using the vendored dependencies
RUN CGO_ENABLED=0 GOOS=linux go build -mod=vendor -o main cmd/server/main.go

# Build Stage 3: Final Image
FROM alpine:latest
RUN apk add --no-cache ca-certificates
WORKDIR /root/
COPY --from=backend-builder /app/backend/main .
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 3000

# Environment variables
ENV PORT=3000
ENV FRONTEND_DIST=./frontend/dist

CMD ["./main"]
