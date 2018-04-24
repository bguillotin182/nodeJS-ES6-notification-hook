import { Router } from 'express';
import Util from '../utils.js';
import SlackUtil  from './slack_utils.js';

var slackApi = () => {
    let api = Router();

    api.get('/', (req, res) => {
        res.status(200).json({ response: 'OK'});
    });

    api.get('/users', async (req, res) => {
        try {
            if (!req.body.email) {
                let users = await SlackUtil.getUserList();
                res.status(200).json({ users });
            } else {
                let user = await SlackUtil.getUserByMail({ email: req.body.email });
                res.status(200).json({ user });
            }
        } catch (err) {
            Util.log.error(err);
            res.status(500).send('Something went wrong when sending the request slackApi ... ');
        }
    });

    return api;
};

export default slackApi;
