/* Functions and routes for the manageRaces view */

var express = require('express');
var router = express.Router();

// Helper funtions

function getRaces(res, mysql, context, complete) {
    mysql.pool.query('SELECT race_id as id, race_name as raceName, lifespan, height, weight, speed FROM race', function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.races = results;
        console.log(context.races);
        mysql.pool.query('SELECT race_special.race_id, race_special.special_id, special.special_name FROM race_special INNER JOIN special ON race_special.special_id = special.special_id', function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            //console.log(results);
            var raceSpecials = results;
            context.races.forEach( function (race) {
                race.specials = [];
                raceSpecials.forEach( function (special) {
                    if (race.id == special.race_id) {
                        race.specials.push(special.special_name);
                    }
                });
            });
            console.log(context.races);
        });
        complete();
    });
}

function getSpecials(res, mysql, context, complete) {
    mysql.pool.query('SELECT special_id AS specialId, special_name AS specialName FROM special', function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.specials = results;
        complete();
    });

}

router.get('/', function (req, res) {
    var mysql = req.app.get('mysql');
    var context = {};
    var callbackCount = 0;

    getRaces(res, mysql, context, complete);
    getSpecials(res, mysql, context, complete);
    function complete() {
        callbackCount++;
        if (callbackCount >= 2) {
            res.render('manageRaces', context)
        }
    }
});

router.post('/', function (req, res) {
    var context = {};
    var mysql = req.app.get('mysql');
    var sql = 'INSERT INTO race (race_name, lifespan, height, weight, speed) VALUES (?, ?, ?, ?, ?)';
    var inserts = [req.body.race_name, req.body.lifespan, req.body.height, req.body.weight, req.body.speed];
    mysql.pool.query(sql, inserts, function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        } else {
            sql = 'INSERT INTO race_special (race_id, special_id) VALUES (?, ?)';
            inserts = [results.insertId, req.body.special_select];
            mysql.pool.query(sql, inserts, function (error, results, fields) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                } else {
                    res.redirect('/manageRaces');
                }
            });
        }
    });

});

module.exports = router;