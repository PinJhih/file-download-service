FROM node:23-bookworm-slim

WORKDIR /app
COPY . /app/

RUN npm install

EXPOSE 9000
CMD [ "node", "run", "start" ]
