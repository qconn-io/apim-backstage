FROM node:22-alpine
# Installing libvips-dev for sharp Compatibility
RUN apk update && apk add --no-cache autoconf automake bash build-base curl gcc git libpng-dev nasm vips-dev zlib-dev

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm ci --only=production --silent && npm cache clean --force
ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .
RUN chown -R node:node /opt/app
USER node

# Build the admin panel
RUN ["npm", "run", "build"]

EXPOSE 1337
CMD ["npm", "run", "develop"]
