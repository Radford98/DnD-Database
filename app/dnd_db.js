/*
    Aaron Ennis & Brad Powell
    Oregon State University
    CS 340 Introduction to Databases
    Group Project - D&D Database
*/

/***************************************************************************** 
    Add all the Node modules we will use in this project.
    Express and Express-Handlebars for our templating engine.
    BodyParser to handle POST requests from form entries.
 *****************************************************************************/
var express = require('express')
var mysql = require('./dbcon.js');

var app = express();    // create the app
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');


/* App configuration */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('files')); // For non-templated items (css, scripts...)

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 4738);      // 4733 for master
app.set('mysql', mysql);

app.get('/', function(req, res) {
    res.render('home');
});

app.get('/manageClasses', function (req, res) {
       res.render('manageClasses');
});

app.get('/manageSpecials', function (req, res) {
    var context = {};
    mysql.pool.query('SELECT special_id AS id, special_name AS specialName, special_description AS specialDescription FROM special', function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.specials = results;
        res.render('manageSpecials', context);
    });
});

app.post('/manageSpecials', function (req, res) {
    var sql = "INSERT INTO special (special_name, special_description) VALUES (?,?)";
    var inserts = [req.body.special_name, req.body.special_description];
    mysql.poo.query(sql, inserts, function (error, results, fields) {
        if (error) {
            console.log(JSON.stringify(error));
            res.write(JSON.stringify(error));
            res.end();
        } else {
            res.redirect('/manageSpecials');
        }
    })
});

app.get('/manageCharacters', function (req, res) {
    var context = {};
    sql = 'SELECT tbl1.character_id AS id, P.player_first_name AS playerName, tbl1.character_name AS characterName, R.race_name AS race, tbl2.class_name AS primaryClass, tbl1.Levels AS levels, tbl1.background AS background FROM (SELECT CH.character_id, CH.character_name, sum(CC.levels) AS Levels, CH.player_id, CH.race_id, CH.background FROM characters CH INNER JOIN characters_class CC ON CH.character_id = CC.character_id INNER JOIN class CL ON CL.class_id = CC.class_id GROUP BY CH.character_name) AS tbl1 INNER JOIN (SELECT CH.character_name, CL.class_name FROM characters CH INNER JOIN characters_class CC ON CH.character_id=CC.character_id INNER JOIN class CL ON CL.class_id = CC.class_id WHERE CC.primary_class = 1) AS tbl2 ON tbl1.character_name = tbl2.character_name INNER JOIN player P ON P.player_id = tbl1.player_id INNER JOIN race R on R.race_id = tbl1.race_id ORDER BY playerName ASC';
    mysql.pool.query(sql, function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.characters = results;
        res.render('manageCharacters', context);
    });
});

app.get('/managePlayers', function(req, res, next) {
    var context = {};
    
// This context entry is for demo purposes. Actual context data will
// be supplied from the db
    context.players = 
        [
            {
                id: 1,
                first_name: "Edwin",
                last_name: "Tulmer",
                dm: "Bardo the Just"
            },
            {
                id: 2,
                first_name: "Dustin",
                last_name: "DeWind",
                dm: "Bardo the Just"
            }
        ];
    context.dm =
        [
            {
                dmId: "dm_1", 
                dm: "Edwin Tulmer"
            },
            {
                dmId: "dm_2",
                dm: "Bardo the Just"
            }
        ];
// End of demo data

    res.render('managePlayers', context);
});

app.get('/manageRaces', function(req, res) {
    res.render('manageRaces');
});

app.get('/updateCharacter', function(req, res) {
    res.render('updateCharacter');
});

app.get('/updateClass', function(req, res) {
    res.render('updateClass');
});

app.get('/updatePlayer', function(req, res) {
    res.render('updatePlayer');
});

app.get('/updateRace', function(req, res) {
    res.render('updateRace');
});

app.get('/updateSpecial', function(req, res) {
    res.render('updateSpecial');
});

// Handle 404 messages
app.use(function(req, res) {
    res.status(404);
    res.render('404');
});

// Handle server errors
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function() {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});




