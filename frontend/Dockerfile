FROM node:lts-alpine AS build
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install -g @angular/cli
RUN npm clean-install
COPY . .

EXPOSE 4200
CMD ["ng", "serve", "--host", "0.0.0.0"]
