FROM node:24

# Install git
RUN apt update && apt install -y git

# Create app directory
WORKDIR /app

# Copy files
COPY . .

# Run script
CMD ["node", "worker.js"]