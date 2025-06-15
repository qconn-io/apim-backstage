FROM node:22-alpine

# Installing dependencies for sharp and other native modules
RUN apk update && apk add --no-cache \
    autoconf \
    automake \
    bash \
    build-base \
    curl \
    gcc \
    git \
    libpng-dev \
    nasm \
    vips-dev \
    zlib-dev

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (including dev dependencies for development)
RUN npm ci --silent && npm cache clean --force

# Copy source code (excluding node_modules via .dockerignore)
COPY . .

# Set ownership before switching to node user
RUN chown -R node:node /opt/app

# Switch to node user
USER node

# Build the admin panel
RUN npm run build

EXPOSE 1337
CMD ["npm", "run", "develop"]
