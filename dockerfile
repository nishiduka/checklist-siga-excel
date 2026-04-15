FROM node:25-alpine3.22

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

CMD ["node", "app.js"]