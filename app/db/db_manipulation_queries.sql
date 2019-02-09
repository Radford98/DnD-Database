-- Brad Powell and Aaron Ennis
-- CS340 Group 42
-- D&D Database

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
SELECT player_first_name AS "First Name", player_last_name AS "Last Name" FROM player;

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
SELECT P.player_first_name AS "Player", tbl1.character_name AS "Character", R.race_name AS "Race", tbl1.background AS "Background", tbl1.Levels, tbl2.class_name AS "Primary Class" FROM
(SELECT CH.character_name, sum(CC.levels) AS Levels, CH.player_id, CH.race_id, CH.background FROM characters CH INNER JOIN characters_class CC ON CH.character_id = CC.character_id INNER JOIN class CL ON CL.class_id = CC.class_id GROUP BY CH.character_name) AS tbl1
INNER JOIN (SELECT CH.character_name, CL.class_name FROM characters CH INNER JOIN characters_class CC ON CH.character_id=CC.character_id INNER JOIN class CL ON CL.class_id = CC.class_id WHERE CC.primary_class = 1) AS tbl2 ON tbl1.character_name = tbl2.character_name
INNER JOIN player P ON P.player_id = tbl1.player_id
INNER JOIN race R on R.race_id = tbl1.race_id
ORDER BY Player ASC;

-- add a character
INSERT INTO characters (player_id, character_name, race_id, background) VALUES (:player, :character, :race, :background);

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
