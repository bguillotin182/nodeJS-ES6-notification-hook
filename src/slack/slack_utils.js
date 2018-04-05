import Slack from 'slack-node';
import _ from 'lodash';
import Promise from 'bluebird';
import { log } from '../utils.js';
import config from 'config';

var slackUserCatalog;
var slackApi;

var slackUtil = (() => {
    let _slackToken = config.get('slackToken');

    slackApi = new Slack(_slackToken);
})();


export const getUser = async ({ email }) => {
    return new Promise((resolve, reject) => {
        if(!slackUserCatalog) {
            getUsers().then(function(response) {
                resolve(_.filter(slackUserCatalog, { email: email})[0]);
            });
        }
        resolve(_.filter(slackUserCatalog, { email: email})[0]);
    })
};

export const getUsers = async () => {
    return new Promise((resolve, reject) => {
        if (!slackUserCatalog) {
            slackApi.api("users.list", function(err, response) {
                if (!err) {
                    slackUserCatalog = _.map(response.members, 'profile');
                    resolve(slackUserCatalog);
                } else {
                    reject('error');
                }
            });
        } else {
            resolve(slackUserCatalog);
        }
    });
};

export default slackUtil;
