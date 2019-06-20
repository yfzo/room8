"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

// Seperated Routes for each Resource
const pollsRoutes = require("./routes/polls");
const submissionRoutes = require("./routes/submissions");

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes
app.use("/polls", pollsRoutes(knex));
app.use("/submissions", submissionRoutes(knex));

// Home page
app.get("/", (req, res) => {
  res.render("index");
});


//show poll for voter page
app.get("/submissions/:id", (req, res) => {

  let templateVars = {
    //poll: submissions[req.params.id], // pass poll based on ID
    err: "submission link is invalid, provide valid link, or contact poll admin"
  };

  if (req.params.id === submissions.sub_Id){
    res.render("submission", templateVars);
  } else {
    res.render("index", templateVars); //prompt top bander for illegal entry
  }
})

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
