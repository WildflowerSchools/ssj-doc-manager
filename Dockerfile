FROM node:12.9.0-alpine

RUN mkdir -p /app
COPY package.json package-lock.json /app/

WORKDIR /app

RUN npm install

COPY firebase.json .eslintrc.json .babelrc webpack* /app/

COPY src/ /app/src/

ENV NODE_ENV production

# Need to run npm build at run time in order to load frontend scripts with ENV vars
CMD npm run build && npm prune --production && node src/server/start.js

