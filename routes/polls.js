"use strict";

const express = require('express');
const router = express.Router();
const uuidv4 = require("uuid/v4");



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
          .then((result) => {
            res.send("OKAY");
          })
          .catch((err) => {
            console.log(err);
            throw err
          });

        console.log('some shit: ', req.body.numOfPeople)
        //add submissions based on number of pollers allowed
        for (let i = 0; i < parseInt(req.body.numOfPeople); i++) {
          knex("submissions")
            .insert({
              id: uuidv4(),
              "poll_id": templateVars.id,
              "answers": null
            })
            .then(() => {
              console.log('Inserted things ( ಠ ͜ʖಠ)');
            })
        }
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

  //render admin page filtered based on poll id
  router.get("/:id", (req, res) => {

    //get information about the poll
    knex("polls")
      .select("*")
      .from("polls")
      .where('polls.id', '=', req.params.id)
      .then((row) => {

        //get submissions value
        room8.getResults('your_poll_id', (results) => {
          const templateVars = {
            question: row[0].question,
            description: row[0].description,
            options: row[0].options,
            data: results
          };

          res.render("results", templateVars);
        });
        //res.send("VALID POLL ID");
      }).catch(() => {
        let templateVars = {
          err: "Invalid results link. Please confirm link."
        };
        res.send(templateVars.err)
        //res.render("index", templateVars);
      })

  });

  return router;
}
