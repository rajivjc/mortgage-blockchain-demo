FROM node:6.11.1-alpine

RUN mkdir -p /usr/src/app
RUN chown -R node:node /usr/local/lib/node_modules
RUN chown -R node:node /usr/local/bin
WORKDIR /usr/src/app

RUN apk update && apk upgrade && \
    apk add --no-cache git g++ python make

USER node
RUN npm install -g truffle@3.2.1

USER root
RUN git clone https://github.com/rajivjc/mortgage-blockchain-demo.git

WORKDIR /usr/src/app/mortgage-blockchain-demo

RUN npm install && truffle build

EXPOSE 8080

CMD ["truffle","serve"]