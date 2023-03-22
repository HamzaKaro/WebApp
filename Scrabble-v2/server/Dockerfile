#stage 1

FROM node:16.13.2-alpine
WORKDIR /server
COPY package.json nodemon.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD npm run start

#run to build an image called serverapp : docker build -t serverapp:16.13.2 .