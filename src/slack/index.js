//import slack from 'slack';
import { Router } from 'express';
import { log } from '../utils.js';
import { getUsers, getUser } from './slack_utils.js';


var slackApi = () => {
    let api = Router();

    api.get('/', (req, res) => {
        res.status(200).json({ response: 'OK'});
    });

    api.get('/users', async (req, res) => {
        let users;
        try {
            if (!req.query.email) {
                users = await getUsers();
                res.status(200).json({ users: users });
            } else {
                users = await getUser({email: req.query.email});
                res.status(200).json({ user: users });
            }
        } catch (err) {
            log.error(err);
            res.status(500).send('Something went wrong when sending the request ... ');
        }
    });

    return api;
};

export default slackApi;
