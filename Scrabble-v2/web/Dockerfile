#stage 1
FROM node:16.13.2 as node
WORKDIR /web
COPY . .
RUN npm install
RUN npm run build --prod
#stage 2
FROM nginx:alpine
COPY --from=node /web/dist/client /usr/share/nginx/html

#run to build an image called angularapp : docker build -t angularapp/angular-app:16.13.2 .