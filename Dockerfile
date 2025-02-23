FROM node:20.10.0-alpine

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start:prod"]