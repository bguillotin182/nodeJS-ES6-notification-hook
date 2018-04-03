import tracer from 'tracer';
import morgan from 'morgan';
import Promise from 'bluebird';

export const log = (() => {
    const logger = tracer.colorConsole();
    logger.requestLogger = morgan('dev');
    return logger;
})();

export const delay = time => new Promise((resolve) => {
    setTimeout(() => { resolve(); }, time);
})
