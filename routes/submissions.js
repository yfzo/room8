"use strict";

const express = require('express');
const router  = express.Router();
const uuidv4 = require('uuid/v4');

module.exports = (knex) => {

  //sumitting a new poll
  router.post("/:id", (req, res) => {
    try {
      let templateVars = {
        answers: req.body.answers.map( ans => parseInt(ans)) //request answer is type string
      };

      knex("submissions")
      .where({"id": req.params.id})
      .update({'answers': templateVars.answers})
      .then((data) => {
        res.send("Thank you for the submission");
      })
      .catch((err) => {console.log(err); throw err});

    } catch (error) {
      console.log(error, "error: missing data");
    }

  });

//      STRETCH FOR ADDING A NEW URL
//   router.post("/:id", (req, res) => {
//     knex("submissions")
//     .insert({'answers': null, "id": uuidv4})
//     .then(() => res.send("ANSWERS SENT"))
//     .catch((err) => {console.log(err); throw err})
//   });


  //get submission form where knex filter is based on submission ID
  router.get("/:id", (req, res) => {
      knex
      .select("*")
      .from("submissions")
      .join("polls", "poll_id", "=", "polls.id")
      .where('submissions.id', '=', req.params.id)
      .then((row) => {
        let templateVars = {
          question: row[0].question,
          description: row[0].description,
          options: row[0].options,
          submissionId: req.params.id
        };

        //confirmation that poll has not been already completed
        if (row[0].answers === null) {
          res.render("submission", templateVars);
        } else {
          res.render("submission_received", templateVars);
        }
      })
      .catch((err) => {
        res.render("index", err);
      })
  });

  return router;
}
