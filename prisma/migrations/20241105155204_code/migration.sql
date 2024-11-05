-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NikkeCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT
);
INSERT INTO "new_NikkeCode" ("code", "id") SELECT "code", "id" FROM "NikkeCode";
DROP TABLE "NikkeCode";
ALTER TABLE "new_NikkeCode" RENAME TO "NikkeCode";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
