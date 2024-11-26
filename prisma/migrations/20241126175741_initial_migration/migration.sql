-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "BTCPayServerStore" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "btcpayUrl" TEXT NOT NULL,
    "shopName" TEXT,
    "shop" TEXT NOT NULL,
    "btcpayStoreId" TEXT NOT NULL,
    "shopId" TEXT,
    "shopOwner" TEXT,
    "currency" TEXT,
    "country" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "BTCPayServerStore_shop_key" ON "BTCPayServerStore"("shop");
