/* Functions and routes for the manageRaces view */

var express = require('express');
var router = express.Router();

// Helper funtions

// Get the list of races and their special attributes
function getRaces(res, mysql, context, complete) {
    mysql.pool.query('SELECT race_id as id, race_name as raceName, lifespan, height, weight, speed FROM race', function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.races = results;

        mysql.pool.query('SELECT race_special.race_id, race_special.special_id, special.special_name FROM race_special INNER JOIN special ON race_special.special_id = special.special_id', function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            var raceSpecials = results;

            /* The following takes the races returned from the database as an
             * object, adds a property called "specials" as an array, then
             * adds the specials for that race to its specials property
             */
            context.races.forEach( function (race) {
                race.specials = [];
                raceSpecials.forEach( function (special) {
                    if (race.id == special.race_id) {
                        race.specials.push(special.special_name);
                    }
                });
            });

        });
        complete();
    });
}

// Get the list of specials for populating the specials selection dropdown list
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

// Get a single race data for the update view
function getUpdateRace(req, res, mysql, context, complete) {
    sql = 'SELECT race_id, race_name, lifespan, height, weight, speed FROM race WHERE race_id = ?';
    mysql.pool.query(sql, [req.params.id], function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.race = results[0];
        
        mysql.pool.query('SELECT race_special.race_id, race_special.special_id, special.special_name FROM race_special INNER JOIN special ON race_special.special_id = special.special_id', function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            var raceSpecials = results;
            context.race.raceSpecials = [];
            raceSpecials.forEach (function (special) {
                if (context.race.race_id == special.race_id) {
                    context.race.raceSpecials.push(special.special_name);
                }
            });
        });

        complete();
    });
}

// manageRaces view
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

// updateRace view
router.get('/:id', function (req, res) {
    var context = {};
    var mysql = req.app.get('mysql');
    var callbackCount = 0;

    getUpdateRace(req, res, mysql, context, complete);
    getRaces(res, mysql, context, complete);
    getSpecials(res, mysql, context, complete);

    function complete() {
        callbackCount++;
        if (callbackCount >= 3) {
            res.render('updateRace', context);
        }
    }
});

// Add a new special attribute to an existing race
router.post('/:race_id', function (req, res) {
    var context = {};
    var mysql = req.app.get('mysql');
    var sql = 'INSERT INTO race_special (race_id, special_id) VALUES (?,?)';
    var inserts = [req.params.race_id, req.body.special_select];
    mysql.pool.query(sql, inserts, function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        } else {
            res.redirect('/manageRaces/' + req.params.race_id);
        }
    });
});

// Commit updates to DB
router.put ('/:race_id', function (req, res) {
    var mysql = req.app.get('mysql');
    let sql = 'SELECT race_id, race_name, lifespan, height, weight, speed FROM race WHERE race_id = ?';
    mysql.pool.query(sql, [req.params.id], function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        } else {
            var current = results[0];
            let sql = 'UPDATE race SET race_name = ?, lifespan = ?, height = ?, weight = ?, speed = ? WHERE race_id = ?';
            var inserts = [req.body.race_name || current.race_name, 
                           req.body.lifespan || current.lifespan,
                           req.body.height || current.height,
                           req.body.weight || current.weight,
                           req.body.speed || current.speed,
                           req.params.race_id];

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


// Add a new race to the db
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