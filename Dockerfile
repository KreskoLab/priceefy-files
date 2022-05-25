FROM node:16

WORKDIR /app

COPY . .

RUN npm install --platform=linux --arch=x64 sharp

ENV PORT 7000
EXPOSE 80

CMD [ "npm", "run", "start" ]