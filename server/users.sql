BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "users" (
	"id"	TEXT NOT NULL,
	"username"	TEXT NOT NULL UNIQUE,
	"password"	TEXT NOT NULL,
	"display_name"	TEXT NOT NULL,
	"description"	TEXT,
	"status"	INTEGER DEFAULT 0,
	"date_created"	DATETIME,
	"token"	TEXT UNIQUE,
	"validated"	INTEGER DEFAULT 0,
	PRIMARY KEY("id")
);
COMMIT;
