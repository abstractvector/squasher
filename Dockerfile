# Docker container to run the build scripts
FROM node:9.4 as builder

WORKDIR /usr/src

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "start"];

EXPOSE 3000