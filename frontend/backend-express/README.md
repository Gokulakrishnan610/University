# Sales Agent API

This is the backend Express server for the Sales Agent application, built with TypeScript, Express, and Prisma.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up the database:
   ```
   npx prisma migrate dev --name init
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Available Scripts

- `npm run build`: Build the TypeScript code
- `npm run start`: Start the production server
- `npm run dev`: Start the development server with hot-reloading

## API Endpoints

- `GET /`: Welcome message
- `GET /api/health`: Health check endpoint

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
DATABASE_URL="file:./dev.db"
``` 