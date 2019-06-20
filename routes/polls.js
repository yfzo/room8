"use strict";

const express = require('express');
const router  = express.Router();



module.exports = (knex) => {

  //new form submit
  router.post("/", (req, res) => {

    if (req.body) {

      let templateVars = {
        question: req.body.question,
        description: req.body.description,
        options: req.body.options,
        email: req.body.email,
        err: ""
      };

      let valid = templateVars.question && templateVars.description && templateVars.options.length > 1 && templateVars.email

      if (valid) {

        knex("polls")
        .insert({'question': templateVars.question, 'description': templateVars.description, 'options': templateVars.options, 'email': templateVars.email })
        .then(() => console.log("it worked"))
        .catch((err) => {console.log(err); throw err})
        .finally(() => knex.destroy());

        res.render("results", templateVars).status(200);

      } else {

        templateVars.err = "Missing information, please validate."
        res.render("new_poll", templateVars).status(400);
      }
    } else {
      let templateVars = {
        err: "No information entered into form, Please fill in all fields"
      }
      res.render("new_poll", templateVars).status(400);
    }
  });

  router.get("/new", (req, res) => {
    res.render("new_poll");
  });

  router.get("/:id", (req, res) => {

    knex
      .select("*")
      .from("polls")
      .where('poll_id', '=', req.params.id)
      .then((results) => {
        let templateVars = {
          polls: results
        };
        res.render("results", templateVars);
      }).catch(() => {
        let templateVars = {
          err: "Invalid results link. Please confirm link."
        };
        res.render("index", templateVars);
      })

  });

  return router;
}
