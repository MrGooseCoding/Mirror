BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "room_members" (
	"room"	TEXT NOT NULL,
	"user"	TEXT NOT NULL UNIQUE,
	"redirection_key"	TEXT NOT NULL UNIQUE,
	FOREIGN KEY("room") REFERENCES "rooms"("id"),
	FOREIGN KEY("user") REFERENCES "users"("id"),
	PRIMARY KEY("user")
);
COMMIT;