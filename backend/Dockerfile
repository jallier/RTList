FROM node:8-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g typescript
RUN npm install --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/"]
