//////////////////////////////////////////////////////
// Dependencies & Configs
//////////////////////////////////////////////////////
require('dotenv').config();
const mailgun = require('mailgun-js');

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
module.exports = (knex) => {
  return {
    sendMail: function (sendTo, templateData, ccAddresses) {
      const DOMAIN = process.env.MAILGUN_DOMAIN;
      const mg = mailgun({ apiKey: process.env.MAILGUN_KEY, domain: DOMAIN });
      const { emailVars, templateName } = templateData;
      const data = {
        from: `Room8 <postmaster@${DOMAIN}>`,
        to: sendTo,
        cc: (ccAddresses ? ccAddresses : []),
        subject: subjectMaker(templateName),
        template: templateName,
        "h:X-Mailgun-Variables": JSON.stringify(emailVars)
      }
      mg.messages().send(data, function (err, body) {
        if (err) {
          console.warn('Error occured while trying to send mail. Please see error stack below:\n', err);
        }
        console.log(body); // Log Mailgun API response
      })
    },
    weightRow: function (row) {
      if (!row) {
        return null;
      }
      const results = new Array();
      for (let i in row) {
        results[i] = row[i] / row.length;
      }
      return results;
    },
    doTheBorda: function (response) {
      for (var i in response){
        if (response[i].answers){
          var answerLength = response[i].answers.length
        }
      }
      let results = new Array(answerLength);
      const responded = {};
      // Seed results with 0s
      results.fill(0);
      for (let row of response) {
        let weighted = this.weightRow(row.answers);
        responded[row.id] = (weighted ? true : false);
        if (weighted) {
          for (let i in weighted) {
            results[i] += weighted[i];
          }
        }
      }
      // convert to percentages (4 sig-figs)
      let totalScore = 0;
      results.forEach( score => totalScore += score);
      results = results.map( x => Math.round((x / totalScore) * 10000) / 10000);
      return { "responses": responded, "scores": results };
    },
    getResults: function (poll_id, callback) {
      knex
        .select("answers", "id")
        .from("submissions")
        .where("poll_id", "=", poll_id)
        .then((res) => {
          if (res.length > 0) {
            let calculated;
            try{
              calculated = this.doTheBorda(res);
            }
            catch (err){
              console.log(err);
              // Shorter error logging for expected error (i.e. when the poll is created there are no answers yet)
              let reason = (res[0].answers === null ? "There are no answers yet!" : "An error occurred:\n" + err);
              console.warn('Failed to calculate results because ' + reason);
            }
            callback(calculated);
          } else {
            callback(`No results found for ${poll_id}`);
          }

        })
        .catch((err) => {
          console.warn(err);
        })
    },

    updatePollStatus: function (poll_id, still_active) {
      knex.select("answers")
      .from("submissions")
      .where("poll_id", "=", poll_id)
      .then( (rows) => {
        const completed = new Array();
        for (let row of rows) {
          completed.push(row.answers ? true : false);
        }
        active = !(completed.indexOf(false) === -1)
        knex("polls")
        .where("id", "=", poll_id)
        .update({"is_active": active})
        .then(() => {
          still_active = active;
          console.log('Poll is active: ', active)
        })
      })
    }
  }
}
