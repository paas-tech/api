-- AlterTable
ALTER TABLE "deployments" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ssh_keys" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP NOT NULL;
