import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';
import schema from './Schema/Schema.js';
import AzureDb from './db/SecondDb.js';

dotenv.config();

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend's origin
  credentials: true
}));

app.use(express.json());
AzureDb();

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});