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
