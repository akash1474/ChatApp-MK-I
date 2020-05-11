const moment = require('moment');
const chats = [];

const generateMessage = (msg, username) => {
    const chat = {
        msg,
        time: moment().format('hh:mm a'),
        sent: true,
        username,
    };
    chats.push(chat);
    return chat;
};

const getAllChats = () => {
    return chats;
};

module.exports = {
    generateMessage,
    getAllChats,
};
