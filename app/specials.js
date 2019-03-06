/* Functions and routes for the manageSpecials view     */

var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    var context = {};
    var mysql = req.app.get('mysql');
    mysql.pool.query('SELECT special_id AS id, special_name AS specialName, special_description AS specialDescription FROM special', function (error, results, fields) {
        if (error) {
            console.log(JSON.stringify(error));
            res.write(JSON.stringify(error));
            res.end();
        }
        context.specials = results;
        res.render('manageSpecials', context);
    });
});

router.post('/', function (req, res) {
    var mysql = req.app.get('mysql');
    var sql = 'INSERT INTO special (special_name, special_description) VALUES (?,?)';
    var inserts = [req.body.special_name, req.body.special_description];
    mysql.pool.query(sql, inserts, function (error, results, fields) {
        if (error) {
            console.log(JSON.stringify(error));
            res.write(JSON.stringify(error));
            res.end();
        } else {
            res.redirect('/manageSpecials');
        }
    });
});

router.delete('/:id', function (req, res) {
    var mysql = req.app.get('mysql');
    var sql = "DELETE FROM special WHERE special_id = ?"
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