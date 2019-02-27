-- Brad Powell and Aaron Ennis
-- CS340 Group 42
-- D&D Database

-- Queries using data provided by the user is denoted with a colon :

-- ------ Manage Players ------ --

-- display table for Manage Players page
SELECT P.player_first_name AS "First Name", P.player_last_name AS "Last Name", D.player_first_name AS DM FROM player P INNER JOIN player D on P.dm = D.player_id;

-- drop down menu for selecting DM
SELECT player_first_name AS "First Name", player_last_name AS "Last Name" FROM player WHERE player_id = dm;

-- add a Player to the table
INSERT INTO player (player_first_name, player_last_name, dm) VALUES (:fname, :lname, :dm);

-- get a single player's data for the Update Player form
SELECT player_id, player_first_name, player_last_name, dm FROM player WHERE player_id = :selected_id;

-- drop down menu for selecting player to delete
SELECT player_first_name AS fname, player_last_name AS lname FROM player;

-- delete player
DELETE FROM player WHERE player_id = :selected_id;

-- update player
UPDATE player SET player_first_name = :fname, player_last_name = :lname, dm = :dm WHERE player_id = :selected_id

-- add a new DM to the table
INSERT INTO player (player_first_name, player_last_name, dm) VALUES ("Jimmy", "john", NULL);
UPDATE player SET dm = LAST_INSERT_ID() WHERE player_id = LAST_INSERT_ID();


-- ------ Manage Characters ------ --

-- display table for Manage Characters page
-- most of the complexity (namely the two subqueries) is to display the character's level and primary class.
SELECT tbl1.character_id AS id, P.player_first_name AS playerName, tbl1.character_name AS characterName, R.race_name AS race, tbl1.background AS background, tbl1.Levels, tbl2.class_name AS primaryClass FROM
(SELECT CH.character_id, CH.character_name, sum(CC.levels) AS Levels, CH.player_id, CH.race_id, CH.background FROM characters CH INNER JOIN characters_class CC ON CH.character_id = CC.character_id INNER JOIN class CL ON CL.class_id = CC.class_id GROUP BY CH.character_name) AS tbl1
INNER JOIN (SELECT CH.character_name, CL.class_name FROM characters CH INNER JOIN characters_class CC ON CH.character_id=CC.character_id INNER JOIN class CL ON CL.class_id = CC.class_id WHERE CC.primary_class = 1) AS tbl2 ON tbl1.character_name = tbl2.character_name
INNER JOIN player P ON P.player_id = tbl1.player_id
INNER JOIN race R on R.race_id = tbl1.race_id
ORDER BY playerName ASC;

-- display the drop down menus for selecting a player, race, and class when adding a Character
SELECT player_id AS playerId, player_first_name AS playerName FROM player;
SELECT race_id AS raceId, race_name AS raceName FROM race;
SELECT class_id AS classId, class_name AS className FROM class;

-- add a character
INSERT INTO characters (player_id, character_name, race_id, background) VALUES (:player, :character, :race, :background);
INSERT INTO characters_class (character_id, class_id, levels, primary_class) VALUES (:results.insertId, :class_id, 1, 1);

-- get a single character's data for the Update Character form
SELECT C.character_id, P.player_first_name AS "Player", C.player_id, C.character_name, R.race_name AS "Race", C.race_id, C.background FROM characters C INNER JOIN race R ON C.race_id = R.race_id INNER JOIN player P ON P.player_id = C.player_id ORDER BY Player ASC;

-- update character
UPDATE characters SET player_id = :selected_player_id, character_name = :name, race_id = :race, background = :background WHERE character_id = :selected_character_id;

-- delete character
DELETE FROM characters WHERE character_id = :selected_id;

-- display character-class relationship
SELECT CH.character_name AS "Character", CL.class_name AS "Class", CC.levels AS "Levels", CC.primary_class AS "Primary Class" FROM characters CH INNER JOIN characters_class CC ON CH.character_id = CC.character_id INNER JOIN class CL ON CL.class_id = CC.class_id;

-- drop down menu for updating classes that the character already has
SELECT class_name FROM class C INNER JOIN characters_class CC ON C.class_id = CC.class_id WHERE CC.character_id = :selected_id;

-- update character levels
UPDATE characters_class SET levels = (levels+:value) WHERE character_id = :selected_character_id AND class_id = :selected_class_id;

-- drop down menu for adding new classes to a character
SELECT class_name FROM class WHERE class_id NOT IN (SELECT C.class_id FROM class C INNER JOIN characters_class CC ON C.class_id = CC.class_id WHERE CC.character_id = :selected_id);

-- add new class levels to a character
INSERT INTO characters_class (character_id, class_id, levels) VALUES (:selected_character_id, :selected_class_id, :levels);

-- delete a class from a character
DELETE FROM characters_class WHERE character_id = :selected_character_id AND class_id = :selected_class_id;


-- ------ Manage Races ------ --

-- display table for Manage Races page
SELECT race_name AS "Race", lifespan AS "Lifespan (avg, years)", height as "Height (avg, meters)", weight AS "Weight (avg, kg)", speed AS "Speed (m/s)" FROM race;

-- add a race
INSERT INTO race (race_name, lifespan, height, weight, speed) VALUES (:race, :life, :ht, :wt);

-- display a single class for the update class form
SELECT race_id, race_name, lifespan, height, weight, speed FROM race WHERE race_id = :selected_id;

-- update race values
UPDATE race
SET race_name = :race, lifespan = :life, height = :ht, weight = :wt, speed = :spd
WHERE race_id = :selected_id;

-- display race and specials
SELECT race_name AS "Race", special_name AS "Special", special_description AS "Special Description" FROM race R
INNER JOIN race_special RS ON R.race_id = RS.race_id
INNER JOIN special S ON S.special_id = RS.special_id;

-- assign a special to a race
INSERT INTO race_special VALUES (:race, :special);


-- ------ Manage Classes ------ --

-- display table for Manage Classes page
SELECT class_name AS "Class", hit_die AS "Hit Die", armor AS "Armor", saving_throw_1 AS "Saving Throw", saving_throw_2 AS "Saving Throw" FROM class;

-- add a class
INSERT INTO class (class_name, hit_die, armor, saving_throw_1, saving_throw_2) VALUES (:class, :die, :arm, :st1, :st2);

-- get data for single class for update form
SELECT class_id, class_name, hit_die, armor, saving_throw_1, saving_throw_2 FROM class WHERE class_id = :selected_id;

-- update a class
UPDATE class
SET class_name = :class, hit_die = :die, armor = :arm, saving_throw_1 = :st1, saving_throw_2 = :st2
WHERE class_id = :selected_id;


-- ------ Manage Specials ------ --

-- display table for the Manage Special Attributes page
SELECT special_id AS id, special_name AS specialName, special_description AS specialDescription FROM special;

-- add a special
INSERT INTO special (special_name, special_description) VALUES (:special, :description);

-- display a single special for update form
SELECT special_id, special_name, special_description FROM special WHERE special = :selected_id;

-- update a special
UPDATE special
SET special_name = :special, special_description = :desc
WHERE special_id = :selected_id;