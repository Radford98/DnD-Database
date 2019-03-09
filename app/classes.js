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
        context.classes.forEach(function (element) {
            if (element.armor == null) { element.armor = "None" };
        });
        res.render('manageClasses', context);
    });
});

// updateClass view
router.get('/:id', function (req, res) {
    var context = {};
    var mysql = req.app.get('mysql');
    var sql = 'SELECT class_id, class_name, hit_die, armor, saving_throw_1, saving_throw_2 FROM class WHERE class_id = ?';

    mysql.pool.query(sql, [req.params.id], function (error, results, fields) {
        if (error) {
            console.log(JSON.stringify(error));
            res.write(JSON.stringify(error));
            res.end();
        } else {
            context = results[0];
            res.render('updateClass', context);
        }
    })
})

router.post('/', function (req, res) {
    var mysql = req.app.get('mysql');
    var sql = 'INSERT INTO class (class_name, hit_die, armor, saving_throw_1, saving_throw_2) VALUES (?,?,?,?,?)';
    // Change armor to null if needed
    if (req.body.armor_select == "0") { req.body.armor_select = null };
    var inserts = [req.body.class_name, req.body.hd_select, req.body.armor_select, req.body.saving_throw_1_select, req.body.saving_throw_2_select];
    mysql.pool.query(sql, inserts, function (error, results, fields) {
        if (error) {
            console.log(JSON.stringify(error));
            res.write(JSON.stringify(error));
            res.end();
        } else {
            res.redirect('/manageClasses');
        }
    });
});

// Update individual class
router.put('/:id', function (req, res) {
    var mysql = req.app.get('mysql');
    let sql = 'SELECT class_name, hit_die, armor, saving_throw_1, saving_throw_2 FROM class WHERE class_id = ?';

    mysql.pool.query(sql, [req.params.id], function (error, reseults, fields) {
        if (error) {
            console.log(JSON.stringify(error));
            res.write(JSON.stringify(error));
            res.end();
        } else {
            var current = results[0];
            let sql = 'UPDATE class SET class_name = ?, hit_die = ?, armor = ?, saving_throw_1 = ?, saving_throw_2 = ? WHERE class_id = ?';
            var inserts = [req.body.class_name || current.class_name, req.body.hd_select || current.hit_die, req.body.armor_select || current.armor, req.body.saving_throw_1_select || current.saving_throw_1, req.body.saving_throw_2_select || current.saving_throw_2, req.params.id];

            mysql.pool.query(sql, inserts, function (error, results, fields) {
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
    var sql = "DELETE FROM class WHERE class_id= ?";
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