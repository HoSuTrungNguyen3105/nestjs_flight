-- DropIndex
DROP INDEX `UserSession_token_key` ON `UserSession`;

-- AlterTable
ALTER TABLE `UserSession` MODIFY `token` TEXT NOT NULL;
