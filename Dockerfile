FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app code
COPY . .

# Expose port and start command
EXPOSE 5000
CMD ["node", "server.js"]