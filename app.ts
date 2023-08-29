import express from 'express';
import { moodleCreds } from './src/exports/creds';
import { moodleClientFactory } from './src/utils/moodle/factory';

export const app = express();
const port = 3000;

export const moodleClient = moodleClientFactory(moodleCreds);

const mainRouter = require('./src/routes/main.routes');
app.use('/', mainRouter);

const moodleRouter = require('./src/routes/moodle.routes');
app.use('/moodle', moodleRouter);

const databaseRouter = require('./src/routes/database.routes');
app.use('/database', databaseRouter);

const testRouter = require('./src/routes/test.routes');
app.use('/test', testRouter);

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});