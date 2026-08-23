/*
  Warnings:

  - The values [OWNER] on the enum `MembershipRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MembershipRole_new" AS ENUM ('MEMBER', 'ADMIN');
ALTER TABLE "public"."Membership" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Membership" ALTER COLUMN "role" TYPE "MembershipRole_new" USING ("role"::text::"MembershipRole_new");
ALTER TYPE "MembershipRole" RENAME TO "MembershipRole_old";
ALTER TYPE "MembershipRole_new" RENAME TO "MembershipRole";
DROP TYPE "public"."MembershipRole_old";
COMMIT;

-- AlterTable
ALTER TABLE "Membership" ALTER COLUMN "role" DROP DEFAULT;
