FROM node:20-slim

# Set working directory
WORKDIR /usr/src/app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy application source
COPY src ./src

# Expose app port
ENV NODE_ENV=production
ENV PORT=3009
EXPOSE 3009

# Run migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]

