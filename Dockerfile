# Build Stage 1: Vue Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Build Stage 2: Go Backend
FROM golang:1.23-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ .
# Copy frontend dist to backend for embedding if needed, 
# although our main.go serves it from ../frontend/dist by default.
# For Docker, we'll put it in a specific place.
RUN CGO_ENABLED=0 GOOS=linux go build -o main cmd/server/main.go

# Build Stage 3: Final Image
FROM alpine:latest
RUN apk add --no-cache ca-certificates
WORKDIR /root/
COPY --from=backend-builder /app/backend/main .
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 3008

# Environment variables
ENV PORT=3008
ENV FRONTEND_DIST=./frontend/dist

CMD ["./main"]
