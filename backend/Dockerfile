# Use a lightweight Node.js Alpine image for production
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Set NODE_ENV to production to optimize Node.js performance and suppress dev warnings
ENV NODE_ENV=production

# Copy package.json and package-lock.json first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Install only production dependencies
# This keeps the image size small and avoids installing dev tools
RUN npm ci --only=production

# Copy the rest of the backend source code
COPY . .

# Change ownership of the application files to the non-root node user
RUN chown -R node:node /app

# Switch to the non-root 'node' user for security
# This prevents the container from running as root, a key security best practice
USER node

# Expose the API port (Assuming 5000 based on standard Node backends, adjust if needed)
EXPOSE 5000

# Start the application using the start script defined in package.json
CMD ["npm", "start"]
