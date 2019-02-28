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
app.set('port', 4739);      // 4733 for master
app.set('mysql', mysql);

app.get('/', function(req, res) {
    res.render('home');
});

app.use('/manageClasses', require('./classes.js');

app.use('/manageSpecials', require('./specials.js'));

app.use('/manageCharacters', require('./characters.js'));


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




