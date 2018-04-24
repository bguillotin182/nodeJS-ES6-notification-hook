import 'babel-polyfill';
import api from './api/index.js';
import slack from './slack/index.js'
import bodyParser from 'body-parser';
import moment from 'moment';
import express from 'express';
// import Promise from 'bluebird';
import cors from 'cors';
import initialize from './db';
import http from 'http';
import config from 'config';
import Util from './utils';
import LRU from 'lru-cache';

const app = express();

// 3rd party middleware.
app.use(cors({
        exposeHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
        limit: config.bodyLimit
}));

// initialize.
app.start = async () => {
    initialize(async db => {
        Util.log.info(`Here is DB set result ::: ${db}`);

        let _port = process.env.PORT || config.get('port');
        let _host = process.env.HOST || config.get('host');

        // Api router.
        app.use('/api', api());
        // Slack router.
        app.use('/slack', slack())

        const server = http.createServer(app);

        server.on('listening', () => {
            const address = server.address();
            Util.log.info(`Server listening ${address.address}:${address.port}`)
        });

        server.on('error', error => {
            Util.log.info(`Server occured an error :: ${error}`)
            process.exit(1);
        });

        await Util.delay(100);
        server.listen(_port, _host);
    });
};


app.start().catch((err) => {
    Util.log.error(err);
});

export default app;
