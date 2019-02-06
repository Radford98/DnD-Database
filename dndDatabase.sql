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
hit_die tinyint NOT NULL,
armor varchar(6) DEFAULT NULL,
saving_throw_1 varchar(15),
saving_throw_2 varchar(15),
PRIMARY KEY (class_id),
UNIQUE KEY (class_name)
) ENGINE=InnoDB;
-- Populate class table
LOCK TABLES class WRITE;
INSERT INTO class (class_name, hit_die, armor, saving_throw_1, saving_throw_2) VALUES ("Fighter", 10, "Heavy", "Strength", "Constitution"), ("Wizard", 6, NULL, "Intelligence", "Wisdom");
UNLOCK TABLES;