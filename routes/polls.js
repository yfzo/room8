"use strict";

const express = require('express');
const router  = express.Router();



module.exports = (knex) => {

    //submitting email for results
    router.put("/:id/email", (req,res) => {
      let templateVars = {
        email: req.body.email
      };
      console.log("template: ", templateVars)
      knex("polls")
      .where({"id": req.params.id})
      .update({
        "forward_emails": knex.raw('array_append(forward_emails, ?)', templateVars.email)
      }).then(() => {
        res.send("SENT EMAIL");
      })
    });

  //new form submit
  router.post("/", (req, res) => {

    const bodyContent = JSON.stringify(req.body)!== '{}'

    if (bodyContent) {

      console.log("body has content ", req.body);

      let templateVars = {
        id: req.body.id,
        question: req.body.question,
        description: req.body.description,
        options: req.body.options,
        email: req.body.email,
        err: ""
      };

      let valid = templateVars.question && templateVars.description && templateVars.options.length > 1 && templateVars.email;

      if (valid) {

        knex("polls")
        .insert({'id': templateVars.id, 'question': templateVars.question, 'description': templateVars.description, 'options': templateVars.options, 'email': templateVars.email, "is_active": true })
        .then((result) => console.log(result))
        .catch((err) => {console.log(err); throw err})
        .finally(() => {
          knex.destroy()
        });
        res.send("OKAY");
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
      //res.render("new_poll", templateVars).status(400);
    }
  });

  router.get("/new", (req, res) => {
    res.render("new_poll");
  });

  router.get("/:id", (req, res) => {

    knex
      .select("*")
      .from("polls")
      .where('id', '=', req.params.id)
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
