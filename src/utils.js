import tracer from 'tracer';
import morgan from 'morgan';
import Promise from 'bluebird';
import LRU from 'lru-cache';
import moment from 'moment';

const log = (() => {
    const logger = tracer.colorConsole();
    logger.requestLogger = morgan('dev');
    return logger;
})();

const delay = time => new Promise((resolve) => {
    setTimeout(() => { resolve(); }, time);
});

var options = { max: 500,
                length: function (n, key) { return n * 2 + key.length },
                dispose: function (key, n) { n.close() },
                maxAge: 1000 * 60 * 60 };

const cache = (() => {
    const LRUcache = LRU(options);
    return LRUcache;
})();

const formatDate = timeStamp => moment(timeStamp).format("hh:mm:ss a");

var Util = {
    cache,
    delay,
    formatDate,
    log,
};

export default Util;
