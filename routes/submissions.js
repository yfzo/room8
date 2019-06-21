"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {

  //submission submit to update to show answers have been submitted 
  router.put("/:id", (req, res) => {
    let templateVars = {
      answers: req.body.answers
    };
    knex("submissions")
    .insert({'answers': templateVars.answers, "id": req.params.id})
    .then(() => res.send("ANSWERS SENT"))
    .catch((err) => {console.log(err); throw err})
    .finally(() => knex.destroy());
  });

  //get submission form where knex filter is based on submission ID
  router.get("/:id", (req, res) => {

    knex
      .select("*")
      .from("submissions")
      .join("polls", "poll_id", "=", "polls.id")
      .where('submissions.id', '=', req.params.id)
      .then((row) => {
        console.log("ROOWWSSSS: ", row[0].question);
        if (row.length > 0) {
          let templateVars = {
            question: row[0].question,
            description: row[0].description,
            options: row[0].options,
          };
          res.send("LOAD POLL, CORRECT ID");
          //res.render("submission", templateVars);
        }else {
          let templateVars = {
            err: "Invalid poll. Please confirm poll link or contact poll admin."
          };
          res.send("LOAD INDEX, INVALID POLL ID");
          //res.render("index", templateVars);
        }
      }).catch((err) => {
        throw err;
      })
  });

  return router;
}
