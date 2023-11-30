# Use the official Node.js 16 image as a base
FROM node:16

# Set the working directory in the container
WORKDIR /usr/app/

# Copy the current directory contents into the container at /usr/app/
COPY . .

# Install any needed packages specified in package.json
RUN npm install

# Use the node user from the base image
USER node

# Define the command to run your app using CMD
CMD ["npm", "run", "start"]