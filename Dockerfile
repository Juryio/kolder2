# Stage 1: Build the frontend
FROM node:18-alpine AS builder-fe

WORKDIR /app
COPY kolder-app/package.json kolder-app/package-lock.json ./kolder-app/
RUN cd kolder-app && npm install

COPY kolder-app/ ./kolder-app/
RUN cd kolder-app && npm run build


# Stage 2: Build the backend
FROM node:18-alpine AS builder-be

WORKDIR /app
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm install


# Stage 3: Create the final production image
FROM node:18-alpine

WORKDIR /app

# Copy backend node_modules from the backend builder stage
COPY --from=builder-be /app/server/node_modules ./server/node_modules

# Copy server source code
COPY server/ ./server/

# Copy frontend build artifacts from the frontend builder stage
COPY --from=builder-fe /app/kolder-app/dist ./kolder-app/dist

# Expose the port the server runs on
EXPOSE 3001

# Command to run the application
CMD ["node", "server/server.js"]
