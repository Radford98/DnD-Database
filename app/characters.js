/* Functions and routes for the manageCharacters view     */

var express = require('express');
var router = express.Router();

/* Helper functions */
function getPlayers(res, mysql, context, complete) {
    mysql.pool.query('SELECT player_id AS playerId, CONCAT(player_first_name, " ", player_last_name) AS playerName FROM player', function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.players = results;
        complete();
    });
}

function getRaces(res, mysql, context, complete) {
    mysql.pool.query('SELECT race_id AS raceId, race_name AS raceName FROM race', function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.races = results;
        complete();
    });
}

function getClasses(res, mysql, context, complete) {
    mysql.pool.query('SELECT class_id AS classId, class_name AS className FROM class', function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.classes = results;
        complete();
    });
}

function getCharacters(res, mysql, context, complete) {
    sql = 'SELECT tbl1.character_id AS id, CONCAT(P.player_first_name, " ", P.player_last_name) AS playerName, tbl1.character_name AS characterName, R.race_name AS race, tbl2.class_name AS primaryClass, tbl1.Levels AS levels, tbl1.background AS background FROM (SELECT CH.character_id, CH.character_name, sum(CC.levels) AS Levels, CH.player_id, CH.race_id, CH.background FROM characters CH INNER JOIN characters_class CC ON CH.character_id = CC.character_id INNER JOIN class CL ON CL.class_id = CC.class_id GROUP BY CH.character_name) AS tbl1 INNER JOIN (SELECT CH.character_name, CL.class_name FROM characters CH INNER JOIN characters_class CC ON CH.character_id=CC.character_id INNER JOIN class CL ON CL.class_id = CC.class_id WHERE CC.primary_class = 1) AS tbl2 ON tbl1.character_name = tbl2.character_name INNER JOIN player P ON P.player_id = tbl1.player_id INNER JOIN race R on R.race_id = tbl1.race_id ORDER BY playerName ASC';
    mysql.pool.query(sql, function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.characters = results;
        complete();
    });
}


router.get('/', function (req, res) {
    var mysql = req.app.get('mysql');
    var callbackCount = 0;
    var context = {};
    getPlayers(res, mysql, context, complete);
    getRaces(res, mysql, context, complete);
    getClasses(res, mysql, context, complete);
    getCharacters(res, mysql, context, complete);


    function complete() {
        callbackCount++;
        if (callbackCount >= 4) {
            res.render('manageCharacters', context);
        }
    }
});

router.post('/', function (req, res) {
    var context = {};
    var mysql = req.app.get('mysql');
    // Add character's player, name, race, and background
    var sql = 'INSERT INTO characters (player_id, character_name, race_id, background) VALUES (?, ?, ?, ?)';
    var inserts = [req.body.player_select, req.body.character_name, req.body.race_select, req.body.background];
    mysql.pool.query(sql, inserts, function (error, results, fields) {
        if (error) {
            console.log(JSON.stringify(error));
            res.write(JSON.stringify(error));
            res.end();
        } else {    // Add a character's starting class
            sql = 'INSERT INTO characters_class (character_id, class_id, levels, primary_class) VALUES (?, ?, 1, 1)';
            inserts = [results.insertId, req.body.class_select];
            mysql.pool.query(sql, inserts, function (error, results, fields) {
                if (error) {
                    console.log(JSON.stringify(error));
                    res.write(JSON.stringify(error));
                    res.end();
                } else {
                    res.redirect('/manageCharacters');
                }
            });
        }
    });
});


module.exports = router;