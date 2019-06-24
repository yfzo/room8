"use strict";

const express = require('express');
const router  = express.Router();
const uuidv4  = require("uuid/v4");
const PORT    = process.env.PORT || 8080;

module.exports = (knex, room8) => {

  //new form submit
  router.post("/", (req, res) => {

    const templateVars = {};

    if (JSON.stringify(req.body) !== '{}') {

      let newPoll = {
        id: uuidv4(),
        question: req.body.question,
        description: req.body.description,
        options: req.body.options,
        email: req.body.email,
        links: [],
        answersProvided: [],
        err: ""
      };

      let valid = newPoll.question && (newPoll.description !== undefined) && (newPoll.options.length > 1);

      if (valid) {
        knex("polls")
          .insert({
            'id': newPoll.id,
            'question': newPoll.question,
            'description': newPoll.description,
            'options': newPoll.options,
            'email': newPoll.email,
            "is_active": true
          })
          .then(() => {
            // Create Submissions, inset into table
            // get hostname, add port if localhost
            const hostname = (req.hostname === 'localhost' ? `${req.hostname}:${PORT}` : req.hostname);
            const emailTo = newPoll.email;
            const mailerData = {
              templateName: "new_poll",
              emailVars: {
                pollName: newPoll.question,
                hostname: hostname, // hostname from req?
                pollID: newPoll.id,
                subLinks: []
              }
            }
            // Compile submission promies into an array to be called later
            let submissionPromises = []
            for (let i = 0; i < parseInt(req.body.numOfPeople); i++) {
              let subID = uuidv4();
              // Push a promise to insert a new submission for each sub requested by the user
              submissionPromises.push(knex("submissions")
                .insert({ id: subID, "poll_id": newPoll.id, "answers": null })
                .then(() => {
                  // Confirmation of successful insertion
                  mailerData.emailVars.subLinks.push(subID);
                  console.log('Inserted things ( ಠ ͜ʖಠ)');
                  //push sub id
                  newPoll.links.push(subID);
                  newPoll.answersProvided.push(false);
                })
              )
            }
            // Call all promises, send mail in .then() so all sub links are included
            Promise.all(submissionPromises)
              .then(() => { room8.sendMail(emailTo, mailerData); })
            templateVars.id = newPoll.id;
            res.json(templateVars);
            //res.redirect('/');
          })
          .catch((err) => {
            templateVars.err = err;
            console.warn(templateVars.err);
          })

        //res.render("results", templateVars);

      } else {
        templateVars.err = "Missing information, please validate."
        //res.render("new_poll", templateVars);
      }
    } else {
      let templateVars = {
        err: "No information entered into form, Please fill in all fields"
      }
      res.send("FAILED: NO INFORMATION ENTERED");
      // TODO - when res.render is implemented, flip the if and else blocks (i.e. body === {} instead of body !== {})
      //res.render("new_poll", templateVars).status(400);
    }
  });

  router.get("/new", (req, res) => {
    res.render("new_poll");
  });

  //route to get SCORES
  router.get("/:id/score", (req, res) => {
    room8.getResults(req.params.id , () => {
      knex("polls")
      .select("*")
      .from("polls")
      .where('polls.id', '=', req.params.id) //params is only passing an ID
      .then((row) => {

        //get submissions value
        room8.getResults(req.params.id , (results) => {
          const templateVars = {
            options: row[0].options,
            scores: (results ? results.scores : new Array(row[0].options.length).fill(0))
          };
          res.send(templateVars);
        });

      }).catch(() => {
        let templateVars = {
          err: "Invalid results link. Please confirm link."
        };
        res.render("index", templateVars);
      });
    });
  });


  //render admin page filtered based on poll id
  router.get("/:id", (req, res) => {

    const templateVars = {};

    //get information about the poll
    knex.select(knex.raw("polls.id, question, description, answers, is_active, options, submissions.id AS sub_id")).from('polls').join('submissions', 'polls.id', '=', 'submissions.poll_id')
      .where('polls.id', '=',req.params.id) //params is only passing an ID
      .then((row) => {

        templateVars["question"] = row[0].question;
        templateVars["description"] = row[0].description;
        templateVars["options"] = row[0].options;
        templateVars["is_active"] = row[0].is_active;

        let links = [];
        let answersProvided = [];
        for (let i = 0; i < row.length; i++){
          links.push(row[i].sub_id);

          if (row[i].answers !== null){
            answersProvided.push(true);
          } else {answersProvided.push(false);}
        }
        templateVars["links"] = links;
        templateVars["answersProvided"] = answersProvided;

        res.render("results", templateVars);

      }).catch(() => {
        let templateVars = {
          err: "Invalid results link. Please confirm link."
        };
        res.render("index", templateVars);
      });
  });
  return router;
}
