/* Functions and routes for the manageRaces view */

var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    var context = {};
    var mysql = req.app.get('mysql');
    // Get the list of race ids
    var races = 'SELECT race_id FROM race';

    res.render('manageRaces');
});

module.exports = router;