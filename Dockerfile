FROM topcoder/topcoder-tco2018-base

RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY . /usr/app

RUN npm install

CMD ["npm", "start"]
