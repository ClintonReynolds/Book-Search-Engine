import express from 'express';
import path from 'node:path';
import db from './config/connection.js';
import type { Request, Response } from 'express'; 
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { authenticateToken } from './services/auth.js';
import { typeDefs, resolvers } from './schemas/index.js';

const app = express();
const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
});


const startServer = async () => {
  await server.start();
  await db; 

 app.use(express.urlencoded({ extended: false }));
 app.use(express.json());  
    // The `expressMiddleware` function takes an Apollo Server instance and returns
    // middleware that can be used with Express.
    app.use(
      '/graphql',
      expressMiddleware(server, {
        context: authenticateToken,
      }),
    );

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  }
  );  
}

app.listen(PORT, () => {
  console.log(`🌍 Now listening on localhost:${PORT}`);
  console.log(`GraphQL server is running on http://localhost:${PORT}/graphql`);
}
);
}
startServer()