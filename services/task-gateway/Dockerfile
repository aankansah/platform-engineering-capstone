FROM node:20-alpine AS builder

WORKDIR /app

# install deps and build
COPY package.json tsconfig.json ./
COPY src ./src

RUN npm install
RUN npm run build

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]
