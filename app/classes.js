/* Functions and routes for the manageClasses view  */

var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    var context = {};
    var mysql = req.app.get('mysql');
    var sql = 'SELECT class_id AS id, class_name AS className, hit_die AS hitDie, armor AS armor, saving_throw_1 AS savingThrow1, saving_throw_2 AS savingThrow2 FROM class';
    mysql.pool.query(sql, function (error, results, fields) {
        if (error) {
            console.log(JSON.stringify(error));
            res.write(JSON.stringify(error));
            res.end();
        }
        context.classes = results;
        res.render('manageClasses', context);
    });
});

router.post('/', function (req, res) {
    var mysql = req.app.get('mysql');
    var sql = 'INSERT INTO class (class_name, hit_die, armor, saving_throw_1, saving_throw_2) VALUES (?,?,?,?,?)';
    // Change armor to null if needed
    if (req.body.armor_select == "0") { req.body.armor_select = NULL };
    var inserts = [req.body.class_name, req.body.hd_select, req.body.armor_select, req.body.saving_throw_1_select, req.body.saving_throw_2_select];
    mysql.pool.query(sql, inserts, function (error, results, fields) {
        if (error) {
            console.log(JSON.stringify(error));
            res.write(JSON.stringify(error));
            res.end();
        } else {
            res.redirect('/');
        }
    });
});

module.exports = router;