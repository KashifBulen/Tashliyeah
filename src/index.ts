import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import rolesRouter from './db/routes/rolesRouter';
import customerRouter from './db/routes/customerRouter';
import vendorsRouter from './db/routes/vendorRouter';
import ordersRouter from './db/routes/ordersRouter';
import vehiclesRouter from './db/routes/vehiclesRouter';
import partsRouter from './db/routes/partsRouter';
import requestsRouter from './db/routes/RequestsRouter';
import locationRouter from './db/routes/locationRouter';
import notificationRouter from './db/routes/notificationRouter';
import requests from "./db/models/Requests";
import cors from "cors";
import http from 'http';
import * as Boom from '@hapi/boom';
import handleConnections from './db/utils/socketHandler';
import cron from 'node-cron';
import { Op } from "sequelize";
import moment from "moment";
// import { verifyToken } from "./db/middleware/auth";



// Custom interface for error object
interface CustomError extends Error {
  errno?: string | number;
}

dotenv.config();


const app = express();

// Apply the token verification middleware to all routes that need authentication
// app.use(verifyToken);


const server = http.createServer(app);

handleConnections(server);

app.use(express.json());

app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  const date = new Date();
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  const formattedDate = `${day}/${month}/${year}`;
  console.log(`[${formattedDate}]-[${req.method}]-[${req.url}]`);
  next();
});

app.use('/api/role', rolesRouter);
app.use('/api/customer', customerRouter);
app.use('/api/vendor', vendorsRouter);
app.use('/api/order', ordersRouter);
app.use('/api/vehicle', vehiclesRouter);
app.use('/api/part', partsRouter);
app.use('/api/request', requestsRouter);
app.use('/api/location', locationRouter);
app.use('/api/notification', notificationRouter);



const PORT = process.env.PORT || 5000;

console.log("jwt secret ",process.env.JWT_SECRET_KEY)
// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (Boom.isBoom(err)) {
    res.status(err.output.statusCode).json({ error: err.output.payload });
  } else if ((err as CustomError)?.errno === 'ECONNREFUSED') {
    res.status(503).send('Connection was refused by the server');
  } else {
    res.status(500).send('Something went wrong!');
  }
  next();
});

// Schedule the cron job to run every hour
cron.schedule('0 * * * *', async () => {
  try {
    const currentTime = moment();
    const expiryTime = moment(currentTime).subtract(48, 'hours');

    // Find requests older than 48 hours
    const expiredRequests = await requests.findAll({
      where: {
        createdAt: { [Op.lt]: expiryTime }
      }
    });
    // Update biddingStatus to "Expired" for expired requests
    for (const request of expiredRequests) {
      request.biddingStatus = 'Closed';
      await request.save();
    }
    

    console.log('Cron job executed successfully.');
  } catch (error) {
    console.error('Error executing cron job:', error);
  }
}, {
  scheduled: true
});

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
