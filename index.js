import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import schema from './Schema/Schema.js';
import AzureDb from './db/SecondDb.js';

dotenv.config();

// Initialize the Express app
const app = express();

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend's origin
  credentials: true,
}));

// Parse JSON request body
app.use(bodyParser.json());

// Connect to Azure DB
AzureDb();

// Initialize Apollo Server
const server = new ApolloServer({
  schema,
  introspection: true, // Enable introspection for GraphiQL or Apollo Sandbox
});

// Start the Apollo Server and integrate with Express
const startServer = async () => {
  await server.start();
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => {
      // You can add context logic here, e.g., extracting a user from the token
      const token = req.headers.authorization || '';
      return { token };
    },
  }));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
};

startServer().catch(err => {
  console.error('Error starting server:', err);
});
