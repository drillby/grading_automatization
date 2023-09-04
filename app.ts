import bodyParser from 'body-parser';
import cookkieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import path from 'path';
import { isProduction, moodleCreds } from './src/exports/creds';
import { rateLimiterMiddleware } from './src/middleware/rateLimiter';
import { moodleClientFactory } from './src/utils/moodle/factory';

export const app = express();
const port = 3000;

app.use(cors());

app.use(rateLimiterMiddleware);

app.use(cookkieParser());

app.use(bodyParser.urlencoded({ extended: false }));

app.set("views", path.join(__dirname, isProduction ? "dist" : "src", "views"));
app.set("view engine", "ejs");

export const moodleClient = moodleClientFactory(moodleCreds);

const mainRouter = require('./src/routes/main.routes');
app.use('/api', mainRouter);

const moodleRouter = require('./src/routes/moodle.routes');
app.use('/api/moodle', moodleRouter);

const databaseRouter = require('./src/routes/database.routes');
app.use('/api/database', databaseRouter);

const testRouter = require('./src/routes/test.routes');
app.use('/api/test', testRouter);

const viewsRouter = require('./src/routes/views.routes');
app.use('/', viewsRouter);

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});
