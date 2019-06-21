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
    .then(() => console.log("it worked"))
    .catch((err) => {console.log(err); throw err})
    .finally(() => knex.destroy());

    res.send("OKAY");

  });

  router.get("/:id", (req, res) => {

    knex
      .select("*")
      .from("submissions")
      .where('sub_id', '=', req.params.id)
      .then((row) => {
        let templateVars = {
          submission: row[0]
        };
        res.render("submission", templateVars);
      }).catch(() => {
        let templateVars = {
          err: "Invalid poll. Please confirm poll link or contact poll admin."
        };
        res.render("index", templateVars);
      })

  });

  return router;
}
