BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "room_members" (
	"id"	TEXT NOT NULL UNIQUE,
	"room"	TEXT NOT NULL,
	"user"	TEXT NOT NULL UNIQUE,
	"redirection_key"	TEXT NOT NULL UNIQUE,
	"has_joined_game"	INTEGER NOT NULL,
	FOREIGN KEY("room") REFERENCES "rooms"("id"),
	PRIMARY KEY("user","id"),
	FOREIGN KEY("user") REFERENCES "users"
);
COMMIT;