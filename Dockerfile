FROM alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN apk update && apk upgrade
RUN apk add npm

WORKDIR /lupauth
COPY . .
RUN npm install --save

EXPOSE 80

CMD ["npm", "run", "start"]
