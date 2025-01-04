/*
  Warnings:

  - You are about to alter the column `usageInMb` on the `usage_data` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_usage_data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subscriberId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "usageInMb" INTEGER NOT NULL,
    CONSTRAINT "usage_data_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "subscribers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_usage_data" ("date", "id", "subscriberId", "usageInMb") SELECT "date", "id", "subscriberId", "usageInMb" FROM "usage_data";
DROP TABLE "usage_data";
ALTER TABLE "new_usage_data" RENAME TO "usage_data";
CREATE UNIQUE INDEX "usage_data_subscriberId_date_key" ON "usage_data"("subscriberId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
