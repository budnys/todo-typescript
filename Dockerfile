# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy source code
COPY src/ ./src/

# Copy environment variables
COPY .env* ./

# Build TypeScript code
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
