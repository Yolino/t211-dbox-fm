FROM node:22.14-alpine AS build
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm install
COPY . .

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
