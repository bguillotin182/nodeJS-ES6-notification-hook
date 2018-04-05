import { version } from '../../package.json';
import { Router } from 'express';
//import { log } from '../utils'

export default ({ config, db}) => {
    let api = Router();

    api.get('/', (req, res) => {
        res.json({ version });
    });

    return api;
}
