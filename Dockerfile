FROM node:8.9.3-alpine

MAINTAINER Kerin Cosford <kerin.cosford@digital.justice.gov.uk>

ENV EXPRESS_HOST "0.0.0.0"

WORKDIR /home/app

ADD package.json package.json
RUN npm install

ADD . ./

EXPOSE 3000

CMD ["/usr/local/bin/npm", "start"]
