FROM node:18-alpine

WORKDIR /app

# Copy API package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy API code
COPY . .

# Expose the API port
EXPOSE 80

# Start the application
CMD ["npm", "start"]
