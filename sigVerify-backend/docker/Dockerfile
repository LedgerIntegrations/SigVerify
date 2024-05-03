# Use the official Node.js 16 image as a base
FROM node:16

# Set the working directory in the container
WORKDIR /usr/app/

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# Use the node user from the base image
USER node

# Define the command to run your app using CMD
CMD ["npm", "run", "start"]
