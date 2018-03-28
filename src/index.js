import api from './api/index.js';
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import initialize from './db';
import morgan from 'morgan';
import http from 'http';
import config from './config.json';

let app = express();
app.server = http.createServer(app);

// logger.
app.use(morgan('dev'));

// 3rd party middleware.
app.use(cors({
        exposeHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
        limit: config.bodyLimit
}));

// initialize.
initialize( db => {
    // Api router.
    app.use('/api', api({ config, db }));

    // Server start and listen.
    app.server.listen(process.env.PORT || config.port, () => {
        console.log(`Started on port ${app.server.address().port}`);
    });
})


export default app;
