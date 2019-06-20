"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {


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
