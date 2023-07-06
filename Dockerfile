FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# install with devDependencies
RUN npm install --frozen-lockfile
COPY . .

RUN npm run build

# install without devDependencies for next stage
RUN rm -r node_modules/
RUN npm install --frozen-lockfile --production

FROM node:20-alpine

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "run", "start:migrate:prod"]

