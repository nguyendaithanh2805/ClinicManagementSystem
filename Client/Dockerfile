FROM node:22 AS build-stage

WORKDIR /app

ARG VITE_API_URL
ARG VITE_IMAGE_URL
ARG VITE_API_URL_AI

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_IMAGE_URL=$VITE_IMAGE_URL
ENV VITE_API_URL_AI=$VITE_API_URL_AI

COPY Client/package*.json ./
RUN npm install

COPY Client/ .
RUN npm run build 

FROM nginx:alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html 
COPY Client/nginx/nginx.conf /etc/nginx/conf.d/default.conf 

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]