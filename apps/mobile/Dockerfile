FROM node:20-bullseye

ENV CI=1
WORKDIR /app

COPY package.json ./
RUN corepack enable && yarn install || npm install

COPY . .

ENV EXPO_PUBLIC_API_URL=http://localhost:4000/api
EXPOSE 8081

CMD ["yarn", "start:web"]
