require('dotenv').config();

const mailgun = require("mailgun-js");
const DOMAIN = "sandbox4e7f5cff7b4b4ae9be0f25564ca2b882.mailgun.org";
const mg = mailgun({apiKey: process.env.MAILGUN_KEY, domain: DOMAIN});


console.log(process.env.MAILGUN_KEY);

module.exports = {
  sendPollInfo: function(sendTo, pollId){
    const pollName; // TODO - getPollName(pollId) goes here
    const data = {
      from: 'Room8 <room8@sandbox4e7f5cff7b4b4ae9be0f25564ca2b882.mailgun.org>',
      to: sendTo,
      subject: `Your poll '${pollName}' has been created!`,
      text: 'Stuff goes here'
    }
    mg.messages().send(data, function(err, body) {
      console.log(body); // for testing
    })

  },

}