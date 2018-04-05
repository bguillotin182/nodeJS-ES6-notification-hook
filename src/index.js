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
import { log, delay } from './utils';


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
    initialize(db => {
        let _port = process.env.PORT || config.get('port');
        let _host = process.env.HOST || config.get('host');

        let _slackWebhookUri = config.get('slackwebhookUri');
        let _slackToken = config.get('slackToken');
        // Api router.
        app.use('/api', api({ config, db }));
        // Slack router.
        app.use('/slack', slack({ webhookUri: _slackWebhookUri, token : _slackToken }))

        const server = http.createServer(app);

        server.on('listening', () => {
            const address = server.address();
            log.info(`Server listening ${address.address}:${address.port}`)
        });

        server.on('error', error => {
            log.info(`Server occured an error :: ${error}`)
            process.exit(1);
        });

        //log.info(`its now ${moment().format('YYYY-MM-dd HH:mm:ss')}`);

        delay(1000).then(() => {
            // Server start and listen.
            server.listen(_port, _host);

            //log.info(`its now ${moment().format('YYYY-MM-dd HH:mm:ss')}`);
        });

    });
};


app.start().catch((err) => {
    log.error(err);
});

export default app;
