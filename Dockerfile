# Dockerfile
FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port (use the port your app listens on)
EXPOSE 5000

# Start the app
CMD ["node", "index.js"]