FROM node:18

WORKDIR /app

# Copy package.json and package-lock.json
COPY ["package.json", "package-lock.json*", "./"]

# Install both production and development dependencies
RUN npm install

# Copy the rest of the app's files
COPY . .

# Build the TypeScript application
RUN npm run build

# Prune the development dependencies after the build
RUN npm prune --production

# Expose the application's port
EXPOSE 8000

# Command to run the server
CMD [ "node", "dist/src/index.js" ]
