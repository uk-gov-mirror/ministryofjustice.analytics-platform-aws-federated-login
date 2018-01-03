FROM node:8.9.3-alpine

MAINTAINER Kerin Cosford <kerin.cosford@digital.justice.gov.uk>

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

ENV EXPRESS_HOST "0.0.0.0"

WORKDIR /home/app

RUN apk add --no-cache yarn

ADD package.json yarn.lock ./
RUN yarn install

ADD . ./

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/node"]
CMD ["bin/www"]
