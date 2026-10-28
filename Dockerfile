FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-scripts

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node_modules/.bin/astro check && node_modules/.bin/astro build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --ignore-scripts && yarn cache clean
COPY --from=build /app/dist ./dist
USER node
EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
