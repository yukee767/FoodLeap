FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY apps/search-service/package.json ./apps/search-service/
RUN npm install --workspace=@foodleap/search-service
COPY apps/search-service ./apps/search-service
RUN npm run build --workspace=@foodleap/search-service

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/search-service/dist ./dist
COPY --from=builder /app/apps/search-service/package.json ./
COPY --from=builder /app/node_modules ./node_modules
USER node
EXPOSE 3002
CMD ["node", "dist/main.js"]
