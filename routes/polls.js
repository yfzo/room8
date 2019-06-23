"use strict";

const express = require('express');
const router  = express.Router();
const uuidv4  = require("uuid/v4");
const PORT    = process.env.PORT || 8080;



module.exports = (knex) => {


  const room8 = require("../room8lib")(knex);

  //new form submit
  router.post("/", (req, res) => {

    if (JSON.stringify(req.body) !== '{}') {

      let templateVars = {
        id: uuidv4(),
        question: req.body.question,
        description: req.body.description,
        options: req.body.options,
        email: req.body.email,
        err: ""
      };

      let valid = templateVars.question && (templateVars.description !== undefined) && (templateVars.options.length > 1);

      if (valid) {
        knex("polls")
          .insert({
            'id': templateVars.id,
            'question': templateVars.question,
            'description': templateVars.description,
            'options': templateVars.options,
            'email': templateVars.email,
            "is_active": true
          })
          .then(() => {
            // Create Submissions, inset into table
            // get hostname, add port if localhost
            const hostname = (req.hostname === 'localhost' ? `${req.hostname}:${PORT}` : req.hostname);
            const emailTo = templateVars.email;
            const mailerData = {
              templateName: "new_poll",
              emailVars: {
                pollName: templateVars.question,
                hostname: hostname, // hostname from req?
                pollID: templateVars.id,
                subLinks: []
              }
            }
            // Compile submission promies into an array to be called later
            let submissionPromises = []
            for (let i = 0; i < parseInt(req.body.numOfPeople); i++) {
              let subID = uuidv4();

              submissionPromises.push(knex("submissions")
                .insert({
                  id: subID,
                  "poll_id": templateVars.id,
                  "answers": null
                })
                .then(() => {
                  // Confirmation of successful insertion
                  mailerData.emailVars.subLinks.push(subID);
                  console.log('Inserted things ( ಠ ͜ʖಠ)');
                })
              )
            }
            // Call all promises, send mail in .then() so all sub links are included
            Promise.all(submissionPromises)
              .then(() => {
                room8.sendMail(emailTo, mailerData);
              })
            // send email

            res.send("OKAY");
          })
          .catch((err) => {
            console.log(err);
            throw err
          });

        //res.render("results", templateVars);

      } else {
        templateVars.err = "Missing information, please validate."
        res.send("FAILED: MISSING INFORMATION");
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
    room8.getResults(req.params.id , (results) => {
      knex("polls")
      .select("*")
      .from("polls")
      .where('polls.id', '=', req.params.id) //params is only passing an ID
      .then((row) => {

        //get submissions value
        room8.getResults(req.params.id , (results) => {
          const templateVars = {
            options: row[0].options,
            scores: results.scores
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
    knex.select(knex.raw("polls.id, question, description, answers, options, submissions.id AS sub_id")).from('polls').join('submissions', 'polls.id', '=', 'submissions.poll_id')
      .where('polls.id', '=',req.params.id) //params is only passing an ID
      .then((row) => {

        //get submissions value
        room8.getResults(req.params.id, (results) => {

          templateVars["question"] = row[0].question;
          templateVars["description"] = row[0].description;
          templateVars["options"] = row[0].options;
          templateVars["data"] = results.scores;

          let links = [];
          let answersProvided = [];
          for (let i = 0; i < row.length; i++){
            links.push(row[i].sub_id);

            if (row[i].answers !== null){
              answersProvided.push(true);
            } else {answersProvided.push(false);}

            console.log("ROWS ANSWER IS ", row[i].answers)
            console.log(links[i], " has an ", answersProvided[i], "link!!!!")
          }
          templateVars["links"] = links;
          templateVars["answersProvided"] = answersProvided;

          res.render("results", templateVars);
        });

      }).catch((err) => {
        console.log("RESPONSE: ", err);
        let templateVars = {
          err: "Invalid results link. Please confirm link."
        };
        res.render("index", templateVars);
      });
  });


  return router;
}
