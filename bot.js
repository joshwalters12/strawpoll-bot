const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
const axios = require('axios');

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

const wait = (seconds) => {
    const waitTil = new Date(new Date().getTime() + seconds*1000);
    while(waitTil > new Date()) {}
}


const createPoll = (answers, channelID) => {
    const question = answers[0];
    answers.shift();
    axios.post('https://www.strawpoll.me/api/v2/polls', {
        "title": question,
        "options": answers,
    }).then(async (res) => {
        try {
            const id = res.data.id;

            bot.sendMessage({
                to: channelID,
                message: 'https://strawpoll.me/' + id
            })

            await new Promise(resolve => setTimeout(resolve, 30000));

            axios.get('https://www.strawpoll.me/api/v2/polls/'+id
            ).then((resultRes) => {
                const data = resultRes.data;
                logger.info(data);

                let resultString = 'Results';
                for (let i = 0; i < data.options.length; i++) {
                    resultString = resultString + '; ' + data.options[i] + ': ' + data.votes[i]
                }

                bot.sendMessage({
                    to: channelID,
                    message: resultString
                })
            })



        } catch (e) {
            logger.error(e);
        }
    }).catch((err) => {
        logger.info(err);
    })
}

const bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

bot.on('ready', (evt) => {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', (user, userID, channelID, message, evt) => {
    if (message.substring(0,5) == '/poll') {
        const args = message.substring(1).split('"');

        let inputs = [];
        
        for (let i = 1; i < args.length; i=i+2) {
            inputs.push(args[i]);
        }

        createPoll(inputs, channelID);
    }
});
