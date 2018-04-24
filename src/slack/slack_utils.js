import Slack from 'slack-node';
import Slackwebhook from 'slack-webhook';
import _ from 'lodash';
import Promise from 'bluebird';
import Util from '../utils.js';
import config from 'config';


var slackApi;
var slackWebhook;

(() => {
    slackApi = new Slack(config.get('slackToken'));
    slackWebhook = new Slackwebhook(config.get('slackwebhookUri'));
})();

const formatSlackInfoFromJSON = async ({ jsonMessage }) => {
    let _extractInfo = {
        sender: {
            name: '',
            slackIcon: ':ghost:',
        },
        recipient: {
            name: '',
            slackIcon: ':ghost:',
        },
        textToSlack: '',
    };

    try {
        // [TODO] : make this attribut call more secure.
        _extractInfo.sender.name = jsonMessage.sender.apiProfile.name.givenName;
        _extractInfo.recipient.name = jsonMessage.recipient.apiProfile.name.givenName;

        if (_extractInfo.sender.name) {
            let email = _extractInfo.sender.name.toLowerCase() + '@' + config.get('mailExtension');
            let _userSlack = await getUserByMail({ email });

            if (_userSlack) {
                _extractInfo.sender.slackIcon = _userSlack.status_emoji;
            }
        }

        let { event } = jsonMessage;
        let { updatedAt, event_type, url } = event;
        let postLink;

        if (event_type === 'post_mention') {
            postLink ="<" + url + "|click here to see the post>"
            _extractInfo.textToSlack = "`" + _extractInfo.recipient.name + "`" +
                ", you have been mentioned in this post ::: " + postLink + " --- At : " + Util.formatDate(updatedAt);
        } else {
            postLink ="<" + url + "|click here to see the content>"
            _extractInfo.textToSlack = "`" + _extractInfo.recipient.name + "`" +
                ", you have been mentioned in this content ::: " + postLink + " --- At : " + Util.formatDate(updatedAt);
        }
    } catch (err) {
        throw (' formatSlackInfoFromJSON ::: '.concat(err));
    }

    return _extractInfo;
}

const getUserByMail = async ({ email }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let slackUserCatalog = Util.cache.get('slackUserCatalog');

            if(!slackUserCatalog) {
                slackUserCatalog = await getUserList();
            }

            resolve(_.filter(slackUserCatalog, { email })[0]);
        } catch(err) {
            Util.log.error('An error has occured in function getUserByMail :::', err.path);
        }
    });
};

const getUserList = async () => {
    return new Promise((resolve, reject) => {
        let slackUserCatalog = Util.cache.get('slackUserCatalog');

        if (!slackUserCatalog) {
            slackApi.api("users.list", (error, response) => {
                // SlackUsers map on Users.
                let slackUserCatalog = _.map(response.members, 'profile');

                if (!error) {
                    Util.cache.set('slackUserCatalog', slackUserCatalog);
                    resolve(Util.cache.get('slackUserCatalog'));
                } else {
                    reject(error);
                }
            });
        } else {
            resolve(slackUserCatalog);
        }
    });
};

const postSlackMessage = async ({ notificationMessage }, channel = false) => {
    let _promise;

    try {
        if (!channel) {
            let _extractInfo = await formatSlackInfoFromJSON({ jsonMessage: notificationMessage });

            _promise = slackWebhook.send({
                channel: "@" + _extractInfo.recipient.name.toLowerCase(),
                username: _extractInfo.sender.name,
                text: _extractInfo.textToSlack,
                icon_emoji: _extractInfo.sender.slackIcon,
            });
        } else {
            _promise = slackWebhook.send({
                channel: "#testnotificationhook",
                username: 'nodeServerNotification',
                text: 'Succesfull set of the webhook !!',
                icon_emoji: ":ghost:",
            });
        }

        return _promise;
    } catch (err) {
        throw (' postSlackMessage ::: '.concat(err));
    }
}

const SlackUtil = {
    getUserByMail,
    getUserList,
    postSlackMessage,
};

export default SlackUtil;
