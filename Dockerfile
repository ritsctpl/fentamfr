# --- STAGE 1: Build the app ---
    FROM node:18-alpine AS builder

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    
    COPY . .
    RUN npm run build
    # --- STAGE 2: Runtime ---
    FROM node:18-alpine AS runner
    
    WORKDIR /app
    
    # Install bash for entrypoint.sh
    RUN apk add --no-cache bash
    
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/package*.json ./
    COPY --from=builder /app/next.config.mjs ./next.config.mjs
    
    # Install only production deps
    RUN npm ci --only=production
    
    # Add your entrypoint
    COPY entrypoint.sh ./entrypoint.sh
    RUN chmod +x ./entrypoint.sh
    
    # Expose the app port
    EXPOSE 8686
    
    # Run your startup script
    ENTRYPOINT ["./entrypoint.sh"]

##### OLD FILE ####
# Step 1: Build the Next.js app
# FROM node:18 AS build
# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install dependencies
# RUN npm ci

# # Copy the rest of the app's source code
# COPY . .

# # Build the Next.js app
# RUN npm run build

# # Step 2: Create a lightweight runtime image
# FROM node:18-alpine AS runtime
# WORKDIR /app

# # Install runtime dependencies
# RUN apk add --no-cache bash

# # Copy everything from the build stage
# COPY --from=build /app /app

# # Add the config updater script and entrypoint script
# COPY entrypoint.sh /app/entrypoint.sh
# RUN chmod +x /app/entrypoint.sh

# # Expose the application port
# EXPOSE 8686

# # Use the entrypoint script to start the app
# ENTRYPOINT ["/app/entrypoint.sh"]
