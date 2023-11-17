/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express, { Request } from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import { db } from './db';
import { cpuUsage } from './db/schema';
import { CpuRequest } from '@angular-monorepo/shared-types';

const app = express();

const jsonParser = bodyParser.json();

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(cors());
app.use(jsonParser);

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to api!' });
});

app.post(
  '/api',
  async (req: Request<undefined, string, { message: CpuRequest }>, res) => {
    // console.log('post');
    console.log(req.body.message);
    const result = await db.insert(cpuUsage).values(
      req.body.message.cpuUsage.map((x) => ({
        userId: req.body.message.userId,
        usage: x.cpuUsage,
        timestamp: new Date(x.timeStamp),
      }))
    );

    res.send(result.insertId);
  }
);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
