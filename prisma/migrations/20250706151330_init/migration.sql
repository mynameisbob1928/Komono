-- CreateTable
CREATE TABLE "Prefix" (
    "guildId" TEXT NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT 'k.',

    CONSTRAINT "Prefix_pkey" PRIMARY KEY ("guildId")
);
