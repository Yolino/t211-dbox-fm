FROM node:lts-alpine AS build
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install -g next
RUN npm clean-install
COPY . .

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000
CMD ["npm", "run", "dev"]
