import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import * as middlewares from './middlewares';
import api from './api/controllers/authcontroller';
import api1 from './api/controllers/txncontroller';
import MessageResponse from './interfaces/MessageResponse';
import logging from './api/config/logging';
import bodyParser from 'body-parser';

require('dotenv').config();
const NAMESPACE = 'Server';
const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

/** Log the request || use witston js logger later if there is time*/
app.use((req, res, next) => {
    /** Log the req */
    logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        /** Log the res */
        logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    });

    next();
});

/** Parse the body of the request */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get<{}, MessageResponse>('/', (req, res) => {
    res.json({
        message: 'application is running'
    });
});

app.use('/api/v1', api.router);
app.use('/api/v1', api1.router);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
