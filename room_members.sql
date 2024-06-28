BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "room_members" (
    "room" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "voted_game" INTEGER,
    FOREIGN KEY ("room") REFERENCES "room"("id")
);
COMMIT;