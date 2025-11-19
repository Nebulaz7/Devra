/*
  Warnings:

  - You are about to drop the column `cidHash` on the `Dataset` table. All the data in the column will be lost.
  - You are about to drop the column `encryption` on the `Dataset` table. All the data in the column will be lost.
  - Added the required column `fileEncryption` to the `Dataset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dataset" DROP COLUMN "cidHash",
DROP COLUMN "encryption",
ADD COLUMN     "cid" TEXT,
ADD COLUMN     "fileEncryption" JSONB NOT NULL,
ADD COLUMN     "tokenUri" TEXT,
ADD COLUMN     "verification" JSONB;
