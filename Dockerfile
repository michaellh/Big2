# Stage 1: Build the frontend
FROM node:18.16.1 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json frontend/tsconfig*.json /app/frontend/
RUN npm install
COPY frontend /app/frontend
RUN npm run build

# Stage 2: Build the backend and serve the frontend static files
FROM node:18.16.1
WORKDIR /app

# Copy the backend source code and tsconfig
COPY backend/package*.json backend/tsconfig*.json /app/
COPY backend /app

# Copy the built frontend files from the previous stage
COPY --from=frontend-build /app/frontend/build /app/build

# Expose ports
EXPOSE 3001

# Start the backend server
CMD ["npm", "start"]
