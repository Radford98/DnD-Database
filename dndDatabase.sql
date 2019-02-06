-- Group 42
-- Aaron Ennis and Brad Powell
-- D&D 5th Edition Database


-- Create the player table
DROP TABLE IF EXISTS player;
CREATE TABLE player (
player_id smallint NOT NULL AUTO_INCREMENT,
player_first_name varchar(100) NOT NULL,
player_last_name varchar(100) NOT NULL,
dm smallint,
PRIMARY KEY (player_id),
FOREIGN KEY (dm) REFERENCES player(player_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDb;
-- Populate player table
LOCK TABLES player WRITE;
INSERT INTO player (player_first_name, player_last_name, dm) VALUES ("Brad", "Powell", 1), ("Aaron", "Ennis", 1), ("John", "Doe", 1), ("Jane", "Doe", 4);
UNLOCK TABLES;

-- Create class table
DROP TABLE IF EXISTS class;
CREATE TABLE class (
class_id smallint NOT NULL AUTO_INCREMENT,
class_name varchar(20) NOT NULL,
hit_die tinyint NOT NULL CHECK (hit_die=6 OR hit_die=8 OR hit_die=10 OR hit_die=12),
armor varchar(6) DEFAULT NULL CHECK(armor="Light" OR armor="Medium" OR armor="Heavy" OR armor=NULL),
saving_throw_1 varchar(15),
saving_throw_2 varchar(15),
PRIMARY KEY (class_id),
UNIQUE KEY (class_name)
) ENGINE=InnoDB;
-- Populate class table
LOCK TABLES class WRITE;
INSERT INTO class (class_name, hit_die, armor, saving_throw_1, saving_throw_2) VALUES
    ("Barbarian", 12, "Medium", "Strength", "Constitution"),
    ("Bard", 8, "Light", "Dexterity", "Charisma"),
    ("Cleric", 8, "Medium", "Wisdom", "Charisma"),
    ("Druid", 8, "Medium", "Intelligence", "Wisdom"),
    ("Fighter", 10, "Heavy", "Strength", "Constitution"),
    ("Monk", 8, NULL, "Strength", "Dexterity"),
    ("Paladin", 10, "Heavy", "Wisdom", "Charisma"),
    ("Ranger", 10, "Medium", "Strength", "Dexterity"),
    ("Rogue", 8, "Light", "Dexterity", "Intelligence"),
    ("Sorcerer", 6, NULL, "Constitution", "Charisma"),
    ("Warlock", 8, "Light", "Wisdom", "Charisma"),
    ("Wizard", 6, NULL, "Intelligence", "Wisdom");
UNLOCK TABLES;

-- Create race table
DROP TABLE IF EXISTS race;
CREATE TABLE race (
race_id smallint NOT NULL AUTO_INCREMENT,
race_name varchar(10) NOT NULL,
lifespan smallint NOT NULL,
height float NOT NULL,
weight float NOT NULL,
speed float NOT NULL,
PRIMARY KEY (race_id),
UNIQUE KEY (race_name)
) ENGINE=InnoDb;
-- Populate race table
LOCK TABLES race WRITE;
INSERT INTO race (race_name, lifespan, height, weight, speed) VALUES ("Human," 80, 1.7, 90.72, 9.1), ("Elf", 700, 1.7, 49.9, 9.1), ("Dwarf", 350, 1.37, 68.04, 7.62), ("Halfling", 150, .91, 18.14, 7.62);
UNLOCK TABLES;

-- Create racial abilities table
DROP TABLE IF EXISTS special;
CREATE TABLE special (
special_id smallint NOT NULL AUTO_INCREMENT,
special_name varchar(50) NOT NULL,
special_description varchar(255) NOT NULL,
PRIMARY KEY (special_id),
UNIQUE KEY (special_name)
) ENGINE=InnoDb;
-- Populate special table
LOCK TABLES special WRITE;
INSERT INTO special (special_name, special_description) VALUES ("Darkvision", "Out to 60 ft treat dim light as bright light and darkness as dim. Cannot discern colors in darkness."), ("Fey Ancestry", "You have advantage on saving throws against being charmed, and magic can't put you to sleep."), ("Dwarven Resilience", "You have advantage on saving throws against poison, and you have resistance against poison damage.") ("Lucky", "When you roll a 1 on an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll.");
UNLOCK TABLES;

-- Create the Race_Special table for the M:M relationship.
DROP TABLE IF EXISTS race_special;
CREATE TABLE race_special(
race_id smallint NOT NULL,
special_id smallint NOT NULL,
PRIMARY KEY (race_id, special_id),
FOREIGN KEY (race_id) REFERENCES race(race_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
FOREIGN KEY (special_id) REFERENCES special(special_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDb;
-- Populate race_special table
LOCK TABLES race_special WRITE;
INSERT INTO race_special VALUES (2, 1), (2, 2), (3, 1), (3, 3), (4, 4);
UNLOCK TABLES;

-- Create the character table
DROP TABLE IF EXISTS characters;
CREATE TABLE characters(
character_id smallint NOT NULL AUTO_INCREMENT,
player_id smallint NOT NULL,
character_name varchar(100) NOT NULL,
race_id smallint NOT NULL,
background varchar(100) NOT NULL,
PRIMARY KEY (character_id),
FOREIGN KEY (player_id) REFERENCES player(player_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
FOREIGN KEY (race_id) REFERENCES race(race_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDb;
-- Populate character table
LOCK TABLES characters WRITE;
INSERT INTO characters (player_id, character_name, race_id, background) VALUES (2, "Nairo", 2, "Sailor"), (3, "Drulak", 3, "Hermit"), (2, "Steve", 1, "Folk Hero");
UNLOCK TABLES;

-- Create the characters_class table for the M:M relationship
DROP TABLE IF EXISTS characters_class;
CREATE TABLE characters_class(
character_id smallint NOT NULL,
class_id smallint NOT NULL,
levels tinyint NOT NULL DEFAULT 1,
primary_class tinyint(1) NOT NULL DEFAULT 0,
PRIMARY KEY (character_id, class_id),
FOREIGN KEY (character_id) REFERENCES characters(character_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
FOREIGN KEY (class_id) REFERENCES class(class_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDb;
-- Populate characters_class table
LOCK TABLES characters_class WRITE;
INSERT INTO characters_class VALUES (1, 12, 10, 1), (2, 3, 8, 1), (2, 8, 2, 0), (3, 5, 1, 0), (3, 7, 4, 0), (3, 12, 12, 1);
UNLOCK TABLES;