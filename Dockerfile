# the same as for gitlab-ci.yml
FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
COPY .yarnrc ./
#RUN yarn install
COPY . .
ARG NODE_ENV=test
RUN yarn run build
CMD yarn run test:integration