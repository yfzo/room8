// Dependencies

require('dotenv').config();
const mailgun = require("mailgun-js");

subjectMaker = (template) => {
  switch (template){
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

module.exports = {
  sendMail: function(sendTo, templateData){
    const DOMAIN = process.env.MAILGUN_DOMAIN;
    const mg = mailgun({apiKey: process.env.MAILGUN_KEY, domain: DOMAIN});
    const { templateVars, templateName } = templateData;
    const data = {
      from: `Room8 <postmaster@${DOMAIN}>`,
      to: sendTo,
      subject: subjectMaker(templateName),
      template: templateName,
      "h:X-Mailgun-Variables": JSON.stringify(templateVars)
    }
    mg.messages().send(data, function(err, body) {
      if (err) throw err;
      console.log(body); // Log Mailgun API response
    })
  }

}