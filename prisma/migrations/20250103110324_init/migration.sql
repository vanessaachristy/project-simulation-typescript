-- CreateTable
CREATE TABLE "subscribers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phoneNumber" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    CONSTRAINT "subscribers_planId_fkey" FOREIGN KEY ("planId") REFERENCES "data_plan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "usage_data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subscriberId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "usageInMb" REAL NOT NULL,
    CONSTRAINT "usage_data_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "subscribers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "data_plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dataFreeInGb" REAL NOT NULL,
    "billingCycleInDays" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "excessChargePerMb" REAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_phoneNumber_key" ON "subscribers"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "usage_data_subscriberId_date_key" ON "usage_data"("subscriberId", "date");
