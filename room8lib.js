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
    sendMail: function (sendTo, templateData) {
      const DOMAIN = process.env.MAILGUN_DOMAIN;
      const mg = mailgun({
        apiKey: process.env.MAILGUN_KEY,
        domain: DOMAIN
      });
      const {
        emailVars,
        templateName
      } = templateData;
      const data = {
        from: `Room8 <postmaster@${DOMAIN}>`,
        to: sendTo,
        subject: subjectMaker(templateName),
        template: templateName,
        "h:X-Mailgun-Variables": JSON.stringify(emailVars)
      }
      mg.messages().send(data, function (err, body) {
        if (err) throw err;
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
    calculate: function (response) {
      let results = new Array(response[0].answers.length);
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
      return {
        "responses": responded,
        "scores": results
      };
    },

    getResults: function (poll_id, callback) {
      knex
        .select("answers", "id")
        .from("submissions")
        .where("poll_id", "=", poll_id)
        .then((res) => {
          if (res.length > 0) {
            const theThing = this.calculate(res);
            callback(theThing);
          } else {
            callback(`No results found for ${poll_id}`);
          }

        })
        .catch((err) => {
          console.warn(err);
        })
    }
    // TODO [stretch of stretches] - check uniqueness
    // findByUid: function (id, table, kCallback) {
    //   knex
    //     .select("*")
    //     .from(table)
    //     .where(knex.raw("poll_id::varchar(255)"), "=", id)
    //     .asCallback(kCallback)
    // },

    // uniqueId: function (table, callback) {
    //   const id = uuidv4().toString();

    //   this.findByUid(id, table, (err, result) => {
    //     console.log(result);
    //     if (result === []) {
    //       console.log('wtf')
    //       knex.destroy();
    //       return this.uniqueId(table, callback);

    //     }
    //     knex.destroy();
    //     return callback(id);

    //   });
    // }
  }
}
