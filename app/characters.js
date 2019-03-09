/* Functions and routes for the manageCharacters view     */

var express = require('express');
var router = express.Router();

/* Helper functions */
// List of players for select menu --> context.players
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

// List of races for select menu. --> context.races
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

// List of classes for select menu --> context.classes
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

// List of classes belonging the individual character --> context.charClasses
function getCharClasses(req, res, mysql, context, complete) {
    var sql = 'SELECT CL.class_id AS classId, CL.class_name AS className, CC.levels AS level, CC.primary_class AS primaryClass FROM characters CH INNER JOIN characters_class CC ON CH.character_id = CC.character_id INNER JOIN class CL ON CL.class_id = CC.class_id WHERE CH.character_id = ?';
    mysql.pool.query(sql, [req.params.id], function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.charClasses = results;
        context.charClasses.forEach(element => {
            if (element.primaryClass == '0') { element.primaryClass = ''; }
            else { element.primaryClass = 'Yes'; }
        })
        complete();
    });
}

// List of characters to fill out READ table --> context.characters
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

// Single character for update page --> context.character
function getUpdateChar(req, res, mysql, context, complete) {
    sql = 'SELECT character_id AS characterId, player_id AS playerId, character_name AS characterName, race_id AS raceID, background AS background FROM characters WHERE character_id = ?';
    mysql.pool.query(sql, [req.params.id], function (error, results, fields) {
        if (error) {
            console.log(JSON.stringify(error));
            res.write(JSON.stringify(error));
            res.end();
        } else {
            context.character = results[0];
            complete();
        }
    })

}

// manageCharacters
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

// updateCharacters
router.get('/:id', function (req, res) {
    var context = {};
    var mysql = req.app.get('mysql');
    var callbackCount = 0;
    
    getUpdateChar(req, res, mysql, context, complete);
    getPlayers(res, mysql, context, complete);
    getRaces(res, mysql, context, complete);
    getClasses(res, mysql, context, complete);
    getCharClasses(req, res, mysql, context, complete);

    function complete() {
        callbackCount++;
        if (callbackCount >= 5) {
            res.render('updateCharacter', context);
        }
    }
})


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

// Commit updates to DB
router.put('/:id', function (req, res) {
    var mysql = req.app.get('mysql');
    let sql = 'SELECT character_name, player_id, race_id, background FROM characters WHERE character_id = ?';

    mysql.pool.query(sql, [req.params.id], function (error, results, fields) {
        if (error) {
            console.log(JSON.stringify(error));
            res.write(JSON.stringify(error));
            res.end();
        } else {
            var current = results[0];
            let sql = 'UPDATE characters SET character_name = ?, player_id = ?, race_id = ?, background = ? WHERE character_id = ?';
            var inserts = [req.body.character_name || current.character_name, req.body.player_select || current.player_id, req.body.race_select || current.race_id, req.body.background || current.background, req.params.id];

            mysql.pool.query(sql, inserts, function (error, results, fields) {
                if (error) {
                    console.log(JSON.stringify(error));
                    res.write(JSON.stringify(error));
                    res.end();
                } else {
                    console.log("-------");
                    console.log(req.body.class_id);
                    console.log(req.body.class_level);

                    // Update each of the classes
                    let sql = 'UPDATE characters_class SET levels = ?, primary_class = ? WHERE character_id = ? AND class_id = ?';
                    var max = Math.max(...req.body.class_level);
                    var primeCheck = 0;
                    req.body.class_id.forEach(function (element, index) {
                        var primary = '0';
                        if (primeCheck == 0 && req.body.class_level[index] == max) {
                            primary = '1';
                            primeCheck = 1;
                        }
                        var inserts = [req.body.class_level[index], primary, req.params.id, element];
                        console.log(inserts);
                        console.log("-----");
                        mysql.pool.query(sql, inserts, function(error, results, fields){
                            if (error) {
                                console.log(JSON.stringify(error));
                                res.write(JSON.stringify(error));
                                res.end();
                            } else{
                                res.status(200);
                                res.end();
                            }
                        });
                   });
                }
            });
        }
    });
});


router.delete('/:id', function (req, res) {
    var mysql = req.app.get('mysql');
    var sql = "DELETE FROM characters WHERE character_id= ?";
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