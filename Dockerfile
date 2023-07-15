FROM node:latest


# Create app directory
WORKDIR /upload-practice

COPY  . /upload-practice

RUN ["npm","i"]

EXPOSE  3000

CMD ["node","index.js"]


