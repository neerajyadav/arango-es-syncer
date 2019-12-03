#
# Builder stage.
# This state compile our TypeScript to get the JavaScript code
#
FROM node:11.13.0-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci --quiet

COPY ./src ./src
RUN npm run build

#
# Module stage.
# This state holds only production node modules.
#
FROM node:11.13.0-alpine AS moduler

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --quiet --only=production

#
# Final production stage.
# This state holds final production image.
#
FROM node:11.13.0-alpine
WORKDIR /app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=moduler /usr/src/app/node_modules ./node_modules
COPY arango.ca.pem ./

EXPOSE 8080

ENV NODE_ENV=production
# USER node
CMD ["node", "/app/dist/main.js"]