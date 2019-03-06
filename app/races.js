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

router.delete('/:id', function (req, res) {
    var mysql = req.app.get('mysql');
    var sql = "DELETE FROM race WHERE race_id= ?";
    mysql.pool.query(sql, [req.params.id], function (error, results, fields) {
        if (error) {
            console.log(JSON.stringify(error));
            res.write(JSON.stringify(error));
            res.end();
        } else {
            res.status(202).end();
        }
    });
});

module.exports = router;