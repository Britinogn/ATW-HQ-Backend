# Start from a lightweight Node.js base image
# node:18-alpine is a smaller version of Node.js (alpine = minimal Linux)
#FROM node:18-alpine
FROM node:20

# Set the working directory inside the container
# All subsequent commands will run from this directory
WORKDIR /app

# Copy package.json and package-lock.json first
# We do this separately to take advantage of Docker's layer caching
# If these files don't change, Docker won't reinstall dependencies
COPY package*.json ./

# Copy TypeScript configuration file
# This is needed to compile TypeScript to JavaScript
COPY tsconfig.json ./

# Install all dependencies listed in package.json
# This includes TypeScript, @types packages, and all other dependencies
RUN npm install

# Copy all remaining application files into the container
# This includes your TypeScript source code (.ts files)
COPY . .

# Compile TypeScript to JavaScript
# This creates a /dist folder with compiled .js files
# The build script should be defined in package.json
RUN npm run build

# Tell Docker that the container will listen on port 5000
# This doesn't actually publish the port, just documents it
EXPOSE 5000

# The command to run when the container starts
# This runs the compiled JavaScript from the dist folder
#CMD ["npm", "start"]
CMD ["node", "dist/server.js"]
