FROM node:slim

ENV URL=https://whatsapp.roughcommerce.com

WORKDIR /app

COPY . .

RUN npm i

CMD ["node", "app.js"]