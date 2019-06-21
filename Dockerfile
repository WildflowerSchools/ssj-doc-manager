FROM node:11.15.0-alpine

RUN mkdir -p /app
COPY package.json package-lock.json /app/

WORKDIR /app

RUN npm install

COPY firebase.json .firebaserc .eslintrc.json .babelrc webpack* /app/

COPY src/ /app/src/

RUN npm run build && npm prune --production

COPY .data /app/

CMD node src/server/start.js

