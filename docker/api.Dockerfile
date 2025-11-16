FROM node:20-bullseye

WORKDIR /app

COPY package.json yarn.lock* tsconfig.json tsconfig.nest.json ./
COPY prisma ./prisma

RUN corepack enable && yarn install

COPY src ./src

ENV API_PORT=4000
EXPOSE 4000

CMD ["yarn", "api:dev"]
