FROM node:18

ENV NODE_ENV=production

WORKDIR /app

# Copy package.json and package-lock.json
COPY ["package.json", "package-lock.json*", "./"]

# Install production dependencies only
RUN npm install --production

# Copy the rest of the app's files
COPY . .

# Build the TypeScript application
RUN npm run build

# Expose the application's port
EXPOSE 8000

# Command to run the server
CMD [ "node", "dist/index.js" ]
