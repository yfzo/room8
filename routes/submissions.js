"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {

  //submission submit
  router.post("/:id", (req, res) => {
    let templateVars = {
      answers: req.body.answers
    };
    knex("polls")
    .insert({'answers': templateVars.answers})
    .then(() => res.send("ANSWERS SENT"))
    .catch((err) => {console.log(err); throw err})
    .finally(() => knex.destroy());
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
