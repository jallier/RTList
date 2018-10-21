FROM node:8-alpine

WORKDIR /usr/src/app

COPY package*.json ./

ARG REACT_APP_SERVER_HOST
ARG REACT_APP_SERVER_PORT

RUN npm install -g typescript
RUN npm install -g serve
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["serve", "-s", "build"]
