/* Functions and routes for the managePlayers view */

var express = require('express');
var router = express.Router();

// Helper functions

function getPlayers(res, mysql, context, complete) {
    mysql.pool.query('SELECT P.player_id AS id, P.player_first_name AS firstName, P.player_last_name AS lastName, D.player_first_name AS dmName FROM player P INNER JOIN player D ON P.dm = D.player_id', function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.players = results;
        complete();
    });
}

function getDMs(res, mysql, context, complete) {
    mysql.pool.query('SELECT player_id AS dmId, CONCAT(player_first_name, " ", player_last_name) as dmName FROM player WHERE player_id = dm', function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.dms = results;
        complete();
    });
}

router.get('/', function (req, res) {
    var mysql = req.app.get('mysql');
    var context = {};
    var callbackCount = 0;

    getPlayers(res, mysql, context, complete);
    getDMs(res, mysql, context, complete);

    function complete() {
        callbackCount++;
        if(callbackCount >= 2) {
            res.render('managePlayers', context);
        }
    }
});

router.post('/', function (req, res) {
    var context = {};
    var mysql = req.app.get('mysql');
    var sql = 'INSERT INTO player (player_first_name, player_last_name, dm) VALUES (?, ?, ?)';
    var inserts = [req.body.first_name, req.body.last_name, req.body.dm_select];
    mysql.pool.query(sql, inserts, function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        } else {
            res.redirect('/managePlayers');
        }
    });
});

module.exports = router;
