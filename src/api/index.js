import { Router } from 'express';
import { version } from '../../package.json';
import Util from '../utils.js';
import config from 'config';
import SlackUtil from '../slack/slack_utils.js';

var webhookApi = () => {
    let api = Router();

    // TEST for application running.
    api.get('/', (req, res) => {
        res.json({ version });
    });

    // WEBHOOK post method.
    api.post('/webhook', async (req, res) => {
        let result;

        try {
            // Check if TOKEN is passed in request body.
            if (!req.body.token) {
                res.status(404).json({ error : "::: No Token in request body :::" }).end();
            }
            // Check if TOKEN is equal.
            if (req.body.token !== config.get("lsToken")) {
                res.status(404).json({ error : "::: Invalid token :::" }).end();
            }
            // Check if its a challenge request or not.
            if (!req.body.challenge) {
                result = await SlackUtil.postSlackMessage({ notificationMessage : req.body });
                res.status(200).json({ result });
            } else {
                result = await SlackUtil.postSlackMessage({ notificationMessage : req.body }, true);
                res.status(200).json({ challenge : req.body.challenge });
            }
        } catch(error) {
            Util.log.error(error);
            res.status(500).json({ error : 'Something went wrong with POST api/webhook ::: ' + error }).end();
        }
    });

    return api;
}

export default webhookApi;
