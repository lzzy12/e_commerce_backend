FROM node:14-alpine

COPY ./package.json .
ENV DATA_STORAGE_LOCATION=/data/uploads
RUN adduser -D serveruser && \
    npm install && \
    mkdir -p $DATA_STORAGE_LOCATION && \
    chown -R serveruser $DATA_STORAGE_LOCATION
USER serveruser
COPY . .


CMD ["node", "index.js"]