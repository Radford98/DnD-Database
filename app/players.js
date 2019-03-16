/* Functions and routes for the managePlayers view */

var express = require('express');
var router = express.Router();

// Helper functions

// Get the list of players and their assigned DM
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

// Get a list of players who are also DMs
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

// Get a single player for the update view
function getUpdatePlayer(req, res, mysql, context, complete) {
    sql = 'SELECT player_id, player_first_name, player_last_name, dm FROM player WHERE player_id = ?';
    mysql.pool.query(sql, [req.params.id], function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.player = results[0];

        mysql.pool.query('SELECT player_id, CONCAT(player_first_name, " ", player_last_name) AS currentDM FROM player WHERE player_id = ?', [context.player.dm], function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.player.dm = results[0];
        });
        complete();
    });
}

// managePlayers view
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

// updatePlayer view
router.get('/:id', function (req, res) {
    var context = {};
    var mysql = req.app.get('mysql');
    var callbackCount = 0;

    getUpdatePlayer(req, res, mysql, context, complete);
    getDMs(res, mysql, context, complete);
    function complete() {
        callbackCount++;
        if (callbackCount >= 2) {
            // Remove the current player from the DM list if needed to avoid
            // duplication with "self" designator in the list
            context.dms = context.dms.filter(function (dm) {
                return dm.dmId !== context.player.player_id;
            });
            res.render('updatePlayer', context);
        }
    }

});

// Change a player's assigned DM

router.post('/:player_id', function (req, res) {
    var context = {};
    var mysql = req.app.get('mysql');
    var sql = 'UPDATE player SET dm = ? WHERE player_id = ?';
    if (req.body.dm_select == '') {
        req.body.dm_select = req.params.player_id;
    }
    var inserts = [req.body.dm_select, req.params.player_id];
    mysql.pool.query(sql, inserts, function(error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        } else {
            res.redirect('/managePlayers/' + req.params.player_id);
        }
    });
});

// Commit updates to the DB
router.put('/:player_id', function (req, res) {
    var mysql = req.app.get('mysql');
    let sql = 'SELECT player_id, player_first_name, player_last_name, dm FROM player WHERE player_id = ?';
    mysql.pool.query(sql, [req.params.player_id], function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        } else {
            var current = results[0];
            let sql = 'UPDATE player SET player_first_name = ?, player_last_name = ?, dm = ? WHERE player_id = ?';
            var inserts = [req.body.player_first_name || current.player_first_name, req.body.player_last_name || current.player_last_name, req.body.dm || current.dm, req.params.player_id];
            mysql.pool.query(sql, inserts, function (error, results, fields) {
                if (error) {
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

// Add a new player to the db
router.post('/', function (req, res) {
    var context = {};
    var mysql = req.app.get('mysql');
    var sql = 'INSERT INTO player (player_first_name, player_last_name, dm) VALUES (?, ?, ?)';
    if (req.body.dm_select == '') { req.body.dm_select = null;}     // Convert empty string to null if 'self' was selected as dm
    var inserts = [req.body.first_name, req.body.last_name, req.body.dm_select];
    mysql.pool.query(sql, inserts, function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        } else {
            if (req.body.dm_select == null) { // If self was selected as dm, need to update the dm field.
                sql = 'UPDATE player SET dm = ? WHERE player_id = ?';
                inserts = [results.insertId, results.insertId];
                mysql.pool.query(sql, inserts, function (error, results, fields) {
                    if (error) {
                        res.write(JSON.stringify(error));
                        res.end();
                    } else {
                        res.redirect('/managePlayers');
                    }
                });
            } else {
                res.redirect('/managePlayers');
            }
        }
    });
});

router.delete('/:id', function (req, res) {
    var mysql = req.app.get('mysql');
    var sql = 'DELETE FROM player WHERE player_id = ?';
    mysql.pool.query(sql, req.params.id, function (error, results, fields) {
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
