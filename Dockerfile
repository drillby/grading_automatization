# https://nodejs.org/en/docs/guides/nodejs-docker-webapp
FROM node:latest

WORKDIR /app
COPY package.json ./

RUN npm i -g npm@latest
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "start"]
