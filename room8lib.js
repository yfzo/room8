//////////////////////////////////////////////////////
// Dependencies & Configs
//////////////////////////////////////////////////////
require('dotenv').config();
const mailgun = require('mailgun-js');
const uuidv4 = require('uuid/v4');

//////////////////////////////////////////////////////
// Private functions
//////////////////////////////////////////////////////
subjectMaker = (template) => {
  switch (template) {
    case 'test_poll':
      return 'Test Email!';
    case 'new_poll':
      return 'Your new poll has been created!';
    case 'poll_ended':
      return 'Your poll has ended, check out the results!';
    default:
      return 'Mail from room8';
  }
}
//////////////////////////////////////////////////////
// Public Methods
//////////////////////////////////////////////////////
module.exports = {
  sendMail: function (sendTo, templateData) {
    const DOMAIN = process.env.MAILGUN_DOMAIN;
    const mg = mailgun({
      apiKey: process.env.MAILGUN_KEY,
      domain: DOMAIN
    });
    const {
      templateVars,
      templateName
    } = templateData;
    const data = {
      from: `Room8 <postmaster@${DOMAIN}>`,
      to: sendTo,
      subject: subjectMaker(templateName),
      template: templateName,
      "h:X-Mailgun-Variables": JSON.stringify(templateVars)
    }
    mg.messages().send(data, function (err, body) {
      if (err) throw err;
      console.log(body); // Log Mailgun API response
    })
  },

  uniqueId: function (knex, type) {
    let uniqueId;
    let found = 1;
    while (found) {
      uniqueId = uuidv4();
      knex
        .select('id')
        .from(type)
        .where('id', '=', uniqueId)
        .then((results) => {
          // sets found to number of rows, meaning if the Id doesnt exist yet, found === 0, and loop will stop
          found = results.rows.length;
        })
    }
    return uniqueId;
  }

}
