# Stage 1: Build the frontend
FROM arm64v8/node:18-bullseye-slim AS builder-fe

WORKDIR /app

# Copy package files and install dependencies first to leverage Docker cache
COPY kolder-app/package.json kolder-app/package-lock.json ./kolder-app/
RUN cd kolder-app && npm install

# Copy the rest of the frontend source code
COPY kolder-app/ ./kolder-app/

# --- DIAGNOSTIC STEP ---
# List the contents of the src directory to verify the correct files are copied.
RUN echo "--- Listing Frontend Source Files ---" && ls -laR kolder-app/src

# Build the frontend
RUN cd kolder-app && npm run build


# Stage 2: Build the backend
FROM arm64v8/node:18-bullseye-slim AS builder-be

WORKDIR /app
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm install


# Stage 3: Create the final production image
FROM arm64v8/node:18-bullseye-slim

# Install required shared libraries for onnxruntime on ARM64
RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6 \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend node_modules from the backend builder stage
COPY --from=builder-be /app/server/node_modules ./server/node_modules

# Copy server source code
COPY server/ ./server/

# Copy frontend build artifacts from the frontend builder stage
COPY --from=builder-fe /app/kolder-app/dist ./kolder-app/dist

# Expose the port the server runs on
EXPOSE 8448

# Command to run the application
CMD ["node", "server/server.js"]