# Build the frontend app
FROM node:18-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend ./frontend
RUN cd frontend && npm run build

# Serve the built frontend in a lightweight container
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve@14
COPY --from=builder /app/frontend/dist ./dist
ENV PORT 3000
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:3000"]
