FROM node:lts-alpine

# Create app directory
RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app
USER node

WORKDIR /usr/src/app

# Install app dependencies
COPY --chown=node:node package.json package-lock.json /usr/src/app/
RUN npm ci

# Bundle app source
COPY --chown=node:node . /usr/src/app

HEALTHCHECK --interval=5m --timeout=3s \
  CMD curl -f http://0.0.0.0:3000/ || exit 1

EXPOSE 3000
CMD [ "npm", "start" ]
