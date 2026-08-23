/*
  Warnings:

  - You are about to drop the `issueMapping` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "issueMapping" DROP CONSTRAINT "issueMapping_issueId_fkey";

-- DropForeignKey
ALTER TABLE "issueMapping" DROP CONSTRAINT "issueMapping_userId_fkey";

-- DropTable
DROP TABLE "issueMapping";

-- CreateTable
CREATE TABLE "IssueMapping" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,

    CONSTRAINT "IssueMapping_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IssueMapping" ADD CONSTRAINT "IssueMapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueMapping" ADD CONSTRAINT "IssueMapping_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
