FROM ubuntu:noble

RUN apt update && apt install -y git

RUN curl -sL https://deb.nodesource.com/setup_24.x | bash -
RUN apt install -y nodejs

WORKDIR /app

COPY . .

RUN chmod +x script.sh

CMD ["node worker.js"]
