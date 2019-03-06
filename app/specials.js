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

router.get('/:id', function (req, res) {
    var context = {};
    var mysql = req.app.get('mysql');

    mysql.pool.query('SELECT special_id, special_name, special_description FROM special WHERE special_id = ?', [req.params.id], function (error, results, fields) {
        if (error) {
            console.log(JSON.stringify(error));
            res.write(JSON.stringify(error));
            res.end();
        } else {
            context.special = results[0];
            res.render('updateSpecial', context.special);
        }
    })
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

router.put('/:id', function (req, res) {
    var mysql = req.app.get('mysql');
    var sql1 = "SELECT special_name, special_description FROM special WHERE special_id = ?";

    mysql.pool.query(sql1, [req.params.id], function (error, results, fields) {
        if (error) {
            console.log(JSON.stringify(error));
            res.write(JSON.stringify(error));
            res.end();
        } else {
            var current = results[0];
            var sql2 = "UPDATE special SET special_name = ?, special_description = ? WHERE special_id = ?";
            var inserts = [req.body.special_name || current.special_name, req.body.special_description || current.special_description, req.params.id];

            mysql.pool.query(sql2, inserts, function (error, results, fields) {
                if (error) {
                    console.log(JSON.stringify(error));
                    res.write(JSON.stringify(error));
                    res.end();
                } else {
                    res.status(200);
                    res.end();
                }
            });
        }
    });
});

router.delete('/:id', function (req, res) {
    var mysql = req.app.get('mysql');
    var sql = "DELETE FROM special WHERE special_id = ?";
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