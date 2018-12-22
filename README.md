# RTList - Real Time List

## What is it?
A simple shopping list that syncs all data between connected clients in real time. Useful for dividing and conquering when doing the shopping with multiple people.

### Technologies Used

This project uses typescript on the frontend and the backend. It also uses the following libraries:
* React
* Material-UI
* Socket.io
* Express.js
* Sequelize.js
* Mysql
* Docker

## How Do I Run It?

RTList can be run using docker, or started manually if you want to avoid docker. The frontend and backend are separated and run as separate processes. 

### Docker

Each service contains a dockerfile to build a container for it, and a docker-compose file to start them + the mysql container. You can build the containers by running:
```
docker build -t <tagname>:latest backend/
docker build -t <tagname>:latest --build-arg REACT_APP_SERVER_HOST=<hostname of backend> frontend/
```
where tagname is a tag for each container (eg. jallier/rtfront) and hostname is the url of the backend.
Once this is done, run:
```
docker-compose -up -d
```
to start the 3 containers running. You will have to edit the images in the compose file to ensure that they match the tag names given when building the container.

### Without Docker

The frontend can be run simply using:
```
npm build
npm install -g serve
serve build/ PORT
```

The backend can be run using:
```
npm build
node build/index.js
```
This will also require a mysql/mariadb server running with the correct user.

### Dev environment

In one terminal, in the frontend folder, run:
```
npm start
```
which will start the dev server with hot reloading

In another terminal, in the backend folder, run:
```
npm run dev
```
which will start the typescript compiler, and nodemon to reload on changes.

Finally, to start the mysql container run:
```
docker-compose up maria -d
```
which will start the container in the background. 

You can also run mysql installed locally, but you will have to ensure the databse and usernames are set up correctly.