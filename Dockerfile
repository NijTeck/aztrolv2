FROM node:18-alpine AS base
WORKDIR /app

# Copy package files and install dependencies
COPY azure-enterprise-manager/frontend/package*.json ./
RUN npm install

# Copy the rest of the application
COPY azure-enterprise-manager/frontend ./

# Build the application
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy necessary files from build stage
COPY --from=base /app/build ./build
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./package.json

# Install serve to run the application
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Set environment variables for Azure AD authentication
ENV REACT_APP_CLIENT_ID=dd0bb050-7cde-40de-b065-d9225ca4497e
ENV REACT_APP_TENANT_ID=c02e07f8-5785-4da1-b596-208d85c97500
ENV REACT_APP_REDIRECT_URI=http://localhost:3000

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"]
