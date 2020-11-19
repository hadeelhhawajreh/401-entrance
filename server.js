'use strict';
// -------------------------
// Application Dependencies
// -------------------------
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');

// -------------------------
// Environment variables
// -------------------------
require('dotenv').config();
// const HP_API_URL = process.env.HP_API_URL;

// -------------------------
// Application Setup
// -------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));

// Application Middleware override
app.use(methodOverride('_method'));

// Specify a directory for static resources
app.use(express.static('public'));
app.use(express.static('./img'));

// Database Setup

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

// Set the view engine for server-side templating

app.set('view engine', 'ejs');




function Harry(obj) {
  this.image = obj.image;
  this.name = obj.name;
  this.patronus = obj.patronus;
  this.alive = obj.alive;
}
// ----------------------
// ------- Routes -------
// ----------------------
app.get('/home', homefun);
app.get('/house/:character', viewChar);
app.post('/my-character', addingToDB);
app.get('/my-character', readingFromDB);
app.get('/my-character/:id', showOne);
app.put('/my-character/:id', updating);
app.delete('/my-character/:id', deleting);

// --------------------------------
// ---- Pages Routes functions ----
// --------------------------------
function homefun(req, res) {
  res.render('home', { msg: 'inside home' });
}
function viewChar(req, res) {
  let houseName = req.params.character;
  //http://hp-api.herokuapp.com/api/characters/house/gryffindor
  superagent.get(`http://hp-api.herokuapp.com/api/characters/house/${houseName}`).then(data => {
    let arr = data.body.map(ele => {
      return new Harry(ele);
    });
    // res.send(arr);
    res.render('house', { house: arr });
  }).catch(err => {
    console.log(err);
  });
}

function addingToDB(req, res) {
 
  let sql = 'INSERT INTO potter (image,name, patronus, alive)VALUES ($1,$2,$3,$4) returning *;';
  let val = [req.body.image, req.body.name, req.body.patronus, req.body.alive];
  client.query(sql, val).then(data => {
    // res.send(data);
    res.redirect('/my-character');
  }).catch(err => {
    console.log(err);
  });
}

function readingFromDB(req, res) {
  let sql = 'select * from potter;';
  client.query(sql).then(data => {
    res.render('favorite', { dataAll: data.rows });
  }).catch(err => {
    console.log(err);
  });
}

function showOne(req, res) {
  let sql = 'select image, name ,patronus,alive from potter where id=$1;';
  let val = [req.params.id];
  client.query(sql, val).then(data => {
    res.render('details', { oneItem: data.rows[0] });

  }).catch(err => {
    console.log(err);
  });
}

function updating(req, res) {
  let sql = 'UPDATE potter SET name = $1,patronus = $2,alive = $3 WHERE id=$4;';
  let val = [req.body.name, req.body.patronus, req.body.alive, req.params.id];
  client.query(sql, val).then(data => {
    console.log('inside upadte');
    res.redirect('/my-character');
  }).catch(err => {
    console.log(err);
  });
}


function deleting(req, res) {

  let sql = 'DELETE FROM potter WHERE id=$4;';
  let val = [req.params.id];
  client.query(sql, val).then(data => {
    res.redirect('/my-character');
  }).catch(err => {
    console.log(err);
  });
}



// Express Runtime
client.connect().then(() => {
  app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
}).catch(error => console.log(`Could not connect to database\n${error}`));

//heroku pg:psql -f data/schema.sql --app book-app

