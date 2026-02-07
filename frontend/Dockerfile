# Build stage - Frontend
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install -q
COPY . .
RUN npm run build

# Production stage - Serve with Node
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV VITE_API_URL=http://localhost:3000

# Install serve to run the built app
RUN npm install -g serve -q

COPY --from=builder /app/dist ./dist

EXPOSE 5173
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5173 || exit 1

CMD ["serve", "-s", "dist", "-l", "5173"]
