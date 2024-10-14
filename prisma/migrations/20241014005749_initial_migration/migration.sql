-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BTCPayServerStore" (
    "id" SERIAL NOT NULL,
    "btcpayUrl" TEXT NOT NULL,
    "shopName" TEXT,
    "shop" TEXT NOT NULL,
    "btcpayStoreId" TEXT NOT NULL,
    "shopId" TEXT,
    "shopOwner" TEXT,
    "currency" TEXT,
    "country" TEXT,

    CONSTRAINT "BTCPayServerStore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BTCPayServerStore_shop_key" ON "BTCPayServerStore"("shop");
