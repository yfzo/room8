"use strict";

const express = require('express');
const router  = express.Router();
const uuidv4 = require('uuid/v4');

module.exports = (knex) => {

  //submission submit
  router.post("/:id", (req, res) => {
    let templateVars = {
      answers: req.body.answers
    };
    knex("submissions")
    .insert({"id": uuidv4(), 'answers': templateVars.answers, "poll_id": req.params.id})
    .then(() => console.log("it worked"))
    .catch((err) => {console.log(err); throw err})
    .finally(() => knex.destroy());

    res.send("ANSWERS SENT");

  });
  
  //tmp: testing submitted view
  router.get("/submitted", (req, res) => {
    res.render("submission_received");
  });
  
  router.get("/:id", (req, res) => {

    knex
      .select("*")
      .from("submissions")
      .where('id', '=', req.params.id)
      .then((row) => {
        if (row.length > 0) {
          let templateVars = {
            submission: row[0]
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
