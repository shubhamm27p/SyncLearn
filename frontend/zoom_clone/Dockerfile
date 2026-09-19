# ==========================================
# Stage 1: Build the Vite SPA
# ==========================================
FROM node:20-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies needed for the Vite build)
RUN npm ci

# Copy the rest of the frontend source code
COPY . .

# Build the Vite application for production
RUN npm run build

# ==========================================
# Stage 2: Serve the application using Nginx
# ==========================================
FROM nginx:alpine

# Copy the custom Nginx configuration to handle client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from the previous stage to Nginx's serving directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to the host
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
