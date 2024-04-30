var express = require('express');
var router = express.Router();
const pgp = require('pg-promise')();
const db = pgp('postgres://dbmasteruser:T+cxr1c-!oBO*h.72F;wO)*852TBz(3B@host:5432/database');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
