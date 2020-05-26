FROM node:14-alpine

COPY ./package.json .
RUN adduser -D serveruser && npm install
USER serveruser
COPY . .


CMD ["node", "index.js"]