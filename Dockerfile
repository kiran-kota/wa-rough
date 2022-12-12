FROM node:slim

WORKDIR /app

COPY . .

RUN npm i

CMD ["node", "app.js"]