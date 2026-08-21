FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY apps/api-main/package.json ./apps/api-main/
RUN npm install --workspace=@foodleap/api-main
COPY apps/api-main ./apps/api-main
RUN npm run build --workspace=@foodleap/api-main

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api-main/dist ./dist
COPY --from=builder /app/apps/api-main/package.json ./
COPY --from=builder /app/node_modules ./node_modules
USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]
