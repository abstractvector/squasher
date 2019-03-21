FROM node:latest

WORKDIR /usr/src

COPY package*.json ./

RUN npm install

COPY src/ src/

RUN npm run build

CMD ["npm", "start"];

EXPOSE 3000
