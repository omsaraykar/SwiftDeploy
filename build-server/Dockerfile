FROM ubuntu:noble

RUN apt update && apt install -y git curl

RUN curl -sL https://deb.nodesource.com/setup_24.x | bash -
RUN apt install -y nodejs

WORKDIR /app

COPY . .

CMD ["node", "worker.js"]
